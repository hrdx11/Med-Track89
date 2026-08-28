import React, { createContext, useContext, useEffect, useState } from 'react'
import { DoseLog, Medicine } from '../types'
import { useMediTrack } from './MediTrackContext'
import {
  ActiveDoseAlert,
  requestNotificationPermission,
  triggerDoseNotification
} from '../lib/notifications'

interface NotificationContextType {
  activeAlert: ActiveDoseAlert | null
  activeEscalation: {
    medicine: Medicine
    scheduledTime: string
    patientName: string
    elapsedMinutes: number
  } | null
  dismissAlert: () => void
  dismissEscalation: () => void
  handleNotificationAction: (action: 'taken' | 'snooze' | 'skip', logId: string, snoozeMinutes?: number) => void
  triggerTestNotification: (customMedicine?: Medicine, customTime?: string) => void
  triggerSimulatedEscalation: () => void
  isLockScreenOpen: boolean
  setIsLockScreenOpen: (open: boolean) => void
  requestPermission: () => Promise<NotificationPermission>
  permissionState: NotificationPermission
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    medicines,
    schedules,
    doseLogs,
    markDose,
    settings,
    simulatedTime,
    medicalId
  } = useMediTrack()

  const [activeAlert, setActiveAlert] = useState<ActiveDoseAlert | null>(null)
  const [activeEscalation, setActiveEscalation] = useState<{
    medicine: Medicine
    scheduledTime: string
    patientName: string
    elapsedMinutes: number
  } | null>(null)
  
  const [isLockScreenOpen, setIsLockScreenOpen] = useState<boolean>(false)
  const [permissionState, setPermissionState] = useState<NotificationPermission>(() => {
    return 'Notification' in window ? Notification.permission : 'denied'
  })

  const requestPermission = async (): Promise<NotificationPermission> => {
    const perm = await requestNotificationPermission()
    setPermissionState(perm)
    return perm
  }

  const dismissAlert = () => {
    setActiveAlert(null)
  }

  const dismissEscalation = () => {
    setActiveEscalation(null)
  }

  const handleNotificationAction = (
    action: 'taken' | 'snooze' | 'skip',
    logId: string,
    snoozeMinutes: number = settings.snoozeMinutes
  ) => {
    if (action === 'taken') {
      markDose(logId, 'taken', undefined, 'notification')
      setActiveAlert(null)
    } else if (action === 'skip') {
      markDose(logId, 'skipped', 'Skipped from notification prompt', 'notification')
      setActiveAlert(null)
    } else if (action === 'snooze') {
      // Re-trigger alert after snooze interval
      setActiveAlert(null)
      const targetLog = doseLogs.find(l => l.id === logId)
      const targetMed = targetLog ? medicines.find(m => m.id === targetLog.medicineId) : null
      
      if (targetMed && targetLog) {
        setTimeout(() => {
          triggerDoseNotification(targetMed, targetLog.scheduledTime, logId, settings)
          setActiveAlert({
            id: `alert-snooze-${Date.now()}`,
            doseLogId: logId,
            medicine: targetMed,
            scheduledTime: targetLog.scheduledTime,
            instructions: 'Snoozed dose reminder',
            isGracePeriod: true,
            isEscalated: false,
            timestamp: Date.now()
          })
        }, snoozeMinutes * 1000 * 60) // in real execution; for testing, also can trigger on demo toolbar
      }
    }
  }

  const triggerTestNotification = (customMed?: Medicine, customTime?: string) => {
    const med = customMed || medicines[0]
    if (!med) return

    const time = customTime || '08:00'
    const logId = `test-alert-${Date.now()}`

    const alert = triggerDoseNotification(med, time, logId, settings, (act, id) => {
      handleNotificationAction(act, id)
    })

    setActiveAlert(alert)
    setIsLockScreenOpen(true)
  }

  const triggerSimulatedEscalation = () => {
    const med = medicines[0] || {
      id: 'med-1',
      name: 'Metformin Hydrochloride',
      dosageAmount: '500',
      dosageUnit: 'mg',
      form: 'tablet',
      color: '#0d9488',
      shape: 'oval',
      instructions: 'with_food',
      isCritical: true,
      isActive: true,
      createdAt: '2026-08-01'
    }

    setActiveEscalation({
      medicine: med,
      scheduledTime: '08:00',
      patientName: medicalId.patientName || 'HRDX',
      elapsedMinutes: 52
    })
  }

  // Routine check against wall clock or simulated clock
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date()
      const nowHH = String(now.getHours()).padStart(2, '0')
      const nowMM = String(now.getMinutes()).padStart(2, '0')
      const currentTimeStr = simulatedTime.isSimulated ? simulatedTime.simulatedTimeStr : `${nowHH}:${nowMM}`
      const currentDateStr = simulatedTime.isSimulated ? simulatedTime.simulatedDateStr : now.toISOString().split('T')[0]

      // Find any pending dose for right now that hasn't fired an alert yet
      const pendingTodayLogs = doseLogs.filter(
        l => l.scheduledDate === currentDateStr && l.status === 'pending'
      )

      pendingTodayLogs.forEach(log => {
        if (log.scheduledTime === currentTimeStr && (!activeAlert || activeAlert.doseLogId !== log.id)) {
          const med = medicines.find(m => m.id === log.medicineId)
          if (med && med.isActive) {
            const alert = triggerDoseNotification(med, log.scheduledTime, log.id, settings, (act, id) => {
              handleNotificationAction(act, id)
            })
            setActiveAlert(alert)
          }
        }
      })
    }

    const timer = setInterval(checkSchedule, 15000)
    return () => clearInterval(timer)
  }, [simulatedTime, doseLogs, medicines, settings, activeAlert])

  return (
    <NotificationContext.Provider
      value={{
        activeAlert,
        activeEscalation,
        dismissAlert,
        dismissEscalation,
        handleNotificationAction,
        triggerTestNotification,
        triggerSimulatedEscalation,
        isLockScreenOpen,
        setIsLockScreenOpen,
        requestPermission,
        permissionState
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
