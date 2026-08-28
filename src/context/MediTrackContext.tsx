import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  CaregiverLink,
  DoseLog,
  DoseStatus,
  EmergencyContact,
  HospitalDirectoryItem,
  MedicalIdProfile,
  Medicine,
  NotificationSettings,
  PharmacyShop,
  Schedule,
  SimulatedTimeState,
  UserProfile,
  ViewTab
} from '../types'
import {
  getInitialCaregivers,
  getInitialDoseLogs,
  getInitialEmergencyContacts,
  getInitialHospitals,
  getInitialMedicalId,
  getInitialMedicines,
  getInitialPharmacies,
  getInitialSchedules,
  getInitialSettings,
  getInitialUser,
  KEYS,
  saveStoredData
} from '../lib/storage'
import { playSuccessChime } from '../lib/audio'
import confetti from 'canvas-confetti'

interface MediTrackContextType {
  // User Auth & Account Center
  user: UserProfile
  login: (email: string, role?: 'patient' | 'caregiver', name?: string) => void
  logout: () => void
  register: (name: string, email: string, role: 'patient' | 'caregiver', phone: string) => void
  updateUserProfile: (updates: Partial<UserProfile>) => void
  isAuthModalOpen: boolean
  setIsAuthModalOpen: (open: boolean) => void

  // Mobile App Install / PWA
  isInstallPromptOpen: boolean
  setIsInstallPromptOpen: (open: boolean) => void
  installApp: () => void
  canInstall: boolean

  // Medicines & Schedules
  medicines: Medicine[]
  schedules: Schedule[]
  addMedicine: (medicine: Omit<Medicine, 'id' | 'createdAt'>, schedule: Omit<Schedule, 'id' | 'medicineId'>) => void
  updateMedicine: (id: string, updates: Partial<Medicine>) => void
  deleteMedicine: (id: string) => void
  refillMedicine: (id: string, amount: number) => void
  toggleMedicineActive: (id: string) => void
  
  // Dose Logs & Family Auto-Notification
  doseLogs: DoseLog[]
  markDose: (logId: string, status: DoseStatus, skipReason?: string, loggedVia?: DoseLog['loggedVia']) => void
  logAsNeededDose: (medicineId: string) => void
  lastFamilyToast: { message: string; contactName: string; phone: string } | null
  dismissFamilyToast: () => void
  
  // Nearby Pharmacies & Refill Ordering
  pharmacies: PharmacyShop[]
  
  // Emergency & SOS
  emergencyContacts: EmergencyContact[]
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void
  updateEmergencyContact: (id: string, updates: Partial<EmergencyContact>) => void
  deleteEmergencyContact: (id: string) => void
  setPrimaryEmergencyContact: (id: string) => void
  hospitals: HospitalDirectoryItem[]
  medicalId: MedicalIdProfile
  updateMedicalId: (profile: Partial<MedicalIdProfile>) => void
  
  // Caregivers
  caregivers: CaregiverLink[]
  addCaregiver: (name: string, emailOrPhone: string) => void
  revokeCaregiver: (id: string) => void
  caregiverMode: boolean
  setCaregiverMode: (isCaregiver: boolean) => void

  // Settings & Accessibility
  settings: NotificationSettings
  updateSettings: (updates: Partial<NotificationSettings>) => void
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  accessibilityMode: boolean
  toggleAccessibilityMode: () => void
  
  // Navigation & Simulated Clock
  activeTab: ViewTab
  setActiveTab: (tab: ViewTab) => void
  simulatedTime: SimulatedTimeState
  setSimulatedTime: (state: SimulatedTimeState) => void
  resetSimulatedTime: () => void
  
  // SOS Modal trigger
  isSosModalOpen: boolean
  setIsSosModalOpen: (open: boolean) => void
}

const MediTrackContext = createContext<MediTrackContextType | undefined>(undefined)

export const MediTrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth State
  const [user, setUser] = useState<UserProfile>(getInitialUser)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Install Banner / PWA state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [isInstallPromptOpen, setIsInstallPromptOpen] = useState(false)

  // Core App States
  const [medicines, setMedicines] = useState<Medicine[]>(getInitialMedicines)
  const [schedules, setSchedules] = useState<Schedule[]>(getInitialSchedules)
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>(getInitialDoseLogs)
  const [pharmacies] = useState<PharmacyShop[]>(getInitialPharmacies)
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(getInitialEmergencyContacts)
  const [hospitals] = useState<HospitalDirectoryItem[]>(getInitialHospitals)
  const [medicalId, setMedicalId] = useState<MedicalIdProfile>(getInitialMedicalId)
  const [caregivers, setCaregivers] = useState<CaregiverLink[]>(getInitialCaregivers)
  const [settings, setSettings] = useState<NotificationSettings>(getInitialSettings)
  
  const [lastFamilyToast, setLastFamilyToast] = useState<{ message: string; contactName: string; phone: string } | null>(null)

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem(KEYS.THEME) as 'light' | 'dark') || 'light'
  })
  
  const [accessibilityMode, setAccessibilityMode] = useState<boolean>(() => {
    return localStorage.getItem(KEYS.ACCESSIBILITY) === 'true'
  })

  const [caregiverMode, setCaregiverMode] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<ViewTab>('today')
  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false)

  // Simulated Time
  const now = new Date()
  const currentHH = String(now.getHours()).padStart(2, '0')
  const currentMM = String(now.getMinutes()).padStart(2, '0')
  const currentYYYYMMDD = now.toISOString().split('T')[0]

  const [simulatedTime, setSimulatedTimeState] = useState<SimulatedTimeState>({
    isSimulated: false,
    simulatedTimeStr: `${currentHH}:${currentMM}`,
    simulatedDateStr: currentYYYYMMDD
  })

  // Capture PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
      // Automatically show install banner on mobile visit after 2 seconds
      setTimeout(() => {
        setIsInstallPromptOpen(true)
      }, 1500)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Also pop install modal once on fresh visit
    const hasSeenInstall = sessionStorage.getItem('meditrack_install_prompt_seen')
    if (!hasSeenInstall) {
      setTimeout(() => {
        setIsInstallPromptOpen(true)
        sessionStorage.setItem('meditrack_install_prompt_seen', 'true')
      }, 2000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setCanInstall(false)
      }
      setDeferredPrompt(null)
    }
    setIsInstallPromptOpen(false)
  }

  // Theme & Accessibility CSS binding
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(KEYS.THEME, theme)
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    if (accessibilityMode) {
      root.classList.add('accessibility-mode')
    } else {
      root.classList.remove('accessibility-mode')
    }
    localStorage.setItem(KEYS.ACCESSIBILITY, String(accessibilityMode))
  }, [accessibilityMode])

  // Sync to storage
  useEffect(() => { saveStoredData(KEYS.MEDICINES, medicines) }, [medicines])
  useEffect(() => { saveStoredData(KEYS.SCHEDULES, schedules) }, [schedules])
  useEffect(() => { saveStoredData(KEYS.DOSE_LOGS, doseLogs) }, [doseLogs])
  useEffect(() => { saveStoredData(KEYS.EMERGENCY_CONTACTS, emergencyContacts) }, [emergencyContacts])
  useEffect(() => { saveStoredData(KEYS.MEDICAL_ID, medicalId) }, [medicalId])
  useEffect(() => { saveStoredData(KEYS.CAREGIVERS, caregivers) }, [caregivers])
  useEffect(() => { saveStoredData(KEYS.SETTINGS, settings) }, [settings])
  useEffect(() => { saveStoredData(KEYS.USER, user) }, [user])

  // User Auth methods
  const login = (email: string, role: 'patient' | 'caregiver' = 'patient', name: string = 'HRDX') => {
    const updatedUser: UserProfile = {
      ...user,
      name,
      email,
      role,
      isLoggedIn: true
    }
    setUser(updatedUser)
    if (role === 'caregiver') {
      setCaregiverMode(true)
    } else {
      setCaregiverMode(false)
    }
    setIsAuthModalOpen(false)
  }

  const logout = () => {
    setUser(prev => ({ ...prev, isLoggedIn: false }))
  }

  const register = (name: string, email: string, role: 'patient' | 'caregiver', phone: string) => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name,
      email,
      phone,
      role,
      isLoggedIn: true,
      avatarColor: '#0d9488',
      joinedDate: new Date().toISOString().split('T')[0]
    }
    setUser(newUser)
    if (role === 'caregiver') {
      setCaregiverMode(true)
    }
    setIsAuthModalOpen(false)
  }

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }))
  }

  // Medicines Actions
  const addMedicine = (medData: Omit<Medicine, 'id' | 'createdAt'>, schData: Omit<Schedule, 'id' | 'medicineId'>) => {
    const newMedId = `med-${Date.now()}`
    const newMedicine: Medicine = {
      ...medData,
      id: newMedId,
      createdAt: new Date().toISOString().split('T')[0]
    }

    const newSchedule: Schedule = {
      ...schData,
      id: `sch-${Date.now()}`,
      medicineId: newMedId
    }

    setMedicines(prev => [newMedicine, ...prev])
    setSchedules(prev => [newSchedule, ...prev])

    const todayStr = simulatedTime.isSimulated ? simulatedTime.simulatedDateStr : new Date().toISOString().split('T')[0]
    if (newSchedule.times.length > 0) {
      const newLogs: DoseLog[] = newSchedule.times.map((t, idx) => ({
        id: `log-new-${Date.now()}-${idx}`,
        scheduleId: newSchedule.id,
        medicineId: newMedId,
        scheduledDate: todayStr,
        scheduledTime: t,
        status: 'pending'
      }))
      setDoseLogs(prev => [...newLogs, ...prev])
    }
  }

  const updateMedicine = (id: string, updates: Partial<Medicine>) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))
  }

  const deleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id))
    setSchedules(prev => prev.filter(s => s.medicineId !== id))
  }

  const refillMedicine = (id: string, amount: number) => {
    setMedicines(prev => prev.map(m => {
      if (m.id === id) {
        const currentRemaining = m.remainingQuantity ?? 0
        const currentTotal = m.totalQuantity ?? amount
        return {
          ...m,
          remainingQuantity: currentRemaining + amount,
          totalQuantity: Math.max(currentTotal, currentRemaining + amount)
        }
      }
      return m
    }))
  }

  const toggleMedicineActive = (id: string) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m))
  }

  // Dose Logging & Family Auto-Notification
  const markDose = (logId: string, status: DoseStatus, skipReason?: string, loggedVia: DoseLog['loggedVia'] = 'app') => {
    setDoseLogs(prev => prev.map(log => {
      if (log.id === logId) {
        const isTaken = status === 'taken' || status === 'taken_late'
        return {
          ...log,
          status,
          skipReason: skipReason || log.skipReason,
          takenAt: isTaken ? new Date().toISOString() : undefined,
          loggedVia
        }
      }
      return log
    }))

    if (status === 'taken' || status === 'taken_late') {
      const targetLog = doseLogs.find(l => l.id === logId)
      const targetMed = targetLog ? medicines.find(m => m.id === targetLog.medicineId) : null

      if (targetMed && targetMed.remainingQuantity !== undefined) {
        setMedicines(prev => prev.map(m => {
          if (m.id === targetMed.id && m.remainingQuantity !== undefined) {
            return { ...m, remainingQuantity: Math.max(0, m.remainingQuantity - 1) }
          }
          return m
        }))
      }

      playSuccessChime()

      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#0d9488', '#2dd4bf', '#10b981', '#38bdf8']
        })
      } catch {
        // ignore
      }

      // Auto-notify family / caregiver on WhatsApp / SMS if enabled
      if (settings.autoNotifyFamilyOnTaken && targetMed) {
        const primaryCg = emergencyContacts.find(c => c.isPrimarySos) || emergencyContacts[0]
        const caregiverName = primaryCg ? primaryCg.name : 'Ananya (Daughter)'
        const caregiverPhone = primaryCg ? primaryCg.phoneNumber : '+91 98765 43210'
        const timeNow = `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}`

        setLastFamilyToast({
          message: `✅ Update Sent to ${caregiverName}: "${medicalId.patientName || 'Dad'} took ${targetMed.name} ${targetMed.dosageAmount}${targetMed.dosageUnit} on-time (${timeNow})!"`,
          contactName: caregiverName,
          phone: caregiverPhone
        })
      }
    }
  }

  const dismissFamilyToast = () => {
    setLastFamilyToast(null)
  }

  const logAsNeededDose = (medicineId: string) => {
    const todayStr = simulatedTime.isSimulated ? simulatedTime.simulatedDateStr : new Date().toISOString().split('T')[0]
    const nowHHMM = simulatedTime.isSimulated ? simulatedTime.simulatedTimeStr : `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
    
    const newLog: DoseLog = {
      id: `prn-log-${Date.now()}`,
      scheduleId: 'prn',
      medicineId,
      scheduledDate: todayStr,
      scheduledTime: nowHHMM,
      status: 'taken',
      takenAt: new Date().toISOString(),
      loggedVia: 'app'
    }

    setDoseLogs(prev => [newLog, ...prev])
    
    setMedicines(prev => prev.map(m => {
      if (m.id === medicineId && m.remainingQuantity !== undefined) {
        return { ...m, remainingQuantity: Math.max(0, m.remainingQuantity - 1) }
      }
      return m
    }))

    playSuccessChime()
  }

  // Emergency & SOS Actions
  const addEmergencyContact = (contact: Omit<EmergencyContact, 'id'>) => {
    const newContact: EmergencyContact = { ...contact, id: `ec-${Date.now()}` }
    setEmergencyContacts(prev => [...prev, newContact])
  }

  const updateEmergencyContact = (id: string, updates: Partial<EmergencyContact>) => {
    setEmergencyContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const deleteEmergencyContact = (id: string) => {
    setEmergencyContacts(prev => prev.filter(c => c.id !== id))
  }

  const setPrimaryEmergencyContact = (id: string) => {
    setEmergencyContacts(prev => prev.map(c => ({ ...c, isPrimarySos: c.id === id })))
  }

  const updateMedicalId = (profile: Partial<MedicalIdProfile>) => {
    setMedicalId(prev => ({ ...prev, ...profile }))
  }

  // Caregivers
  const addCaregiver = (name: string, emailOrPhone: string) => {
    const randomCode = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`
    const colors = ['#0d9488', '#6366f1', '#ec4899', '#f59e0b', '#06b6d4']
    const newCg: CaregiverLink = {
      id: `cg-${Date.now()}`,
      name,
      emailOrPhone,
      code: randomCode,
      status: 'accepted',
      role: 'view',
      linkedSince: new Date().toISOString().split('T')[0],
      avatarColor: colors[Math.floor(Math.random() * colors.length)]
    }
    setCaregivers(prev => [newCg, ...prev])
  }

  const revokeCaregiver = (id: string) => {
    setCaregivers(prev => prev.filter(c => c.id !== id))
  }

  const updateSettings = (updates: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light')
  }

  const toggleAccessibilityMode = () => {
    setAccessibilityMode(prev => !prev)
  }

  const setSimulatedTime = (state: SimulatedTimeState) => {
    setSimulatedTimeState(state)
  }

  const resetSimulatedTime = () => {
    const realNow = new Date()
    const hh = String(realNow.getHours()).padStart(2, '0')
    const mm = String(realNow.getMinutes()).padStart(2, '0')
    setSimulatedTimeState({
      isSimulated: false,
      simulatedTimeStr: `${hh}:${mm}`,
      simulatedDateStr: realNow.toISOString().split('T')[0]
    })
  }

  return (
    <MediTrackContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        updateUserProfile,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isInstallPromptOpen,
        setIsInstallPromptOpen,
        installApp,
        canInstall,
        medicines,
        schedules,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        refillMedicine,
        toggleMedicineActive,
        doseLogs,
        markDose,
        logAsNeededDose,
        lastFamilyToast,
        dismissFamilyToast,
        pharmacies,
        emergencyContacts,
        addEmergencyContact,
        updateEmergencyContact,
        deleteEmergencyContact,
        setPrimaryEmergencyContact,
        hospitals,
        medicalId,
        updateMedicalId,
        caregivers,
        addCaregiver,
        revokeCaregiver,
        caregiverMode,
        setCaregiverMode,
        settings,
        updateSettings,
        theme,
        setTheme: setThemeState,
        toggleTheme,
        accessibilityMode,
        toggleAccessibilityMode,
        activeTab,
        setActiveTab,
        simulatedTime,
        setSimulatedTime,
        resetSimulatedTime,
        isSosModalOpen,
        setIsSosModalOpen
      }}
    >
      {children}
    </MediTrackContext.Provider>
  )
}

export const useMediTrack = () => {
  const context = useContext(MediTrackContext)
  if (!context) {
    throw new Error('useMediTrack must be used within a MediTrackProvider')
  }
  return context
}
