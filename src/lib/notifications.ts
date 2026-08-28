import { DoseLog, Medicine, NotificationSettings } from '../types'
import { playReminderSound, speakReminderText } from './audio'

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications')
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission()
  }

  return 'denied'
}

export interface ActiveDoseAlert {
  id: string
  doseLogId: string
  medicine: Medicine
  scheduledTime: string
  instructions: string
  isGracePeriod: boolean
  isEscalated: boolean
  timestamp: number
}

/**
 * Fire both native OS notification (if granted) and trigger in-app actionable toast/modal
 */
export function triggerDoseNotification(
  medicine: Medicine,
  scheduledTime: string,
  doseLogId: string,
  settings: NotificationSettings,
  onAction?: (action: 'taken' | 'snooze' | 'skip', logId: string) => void
): ActiveDoseAlert {
  const instructionMap: Record<string, string> = {
    with_food: 'Take with food or right after meal',
    before_food: 'Take on an empty stomach (30 mins before food)',
    after_food: 'Take after eating food',
    empty_stomach: 'Take with a full glass of water on empty stomach',
    anytime: 'Can be taken with or without food'
  }
  const instructionText = instructionMap[medicine.instructions] || 'Take as prescribed'

  // 1. Play gentle audio chime
  if (settings.soundEnabled) {
    playReminderSound(settings.soundTheme)
  }

  // 2. Play spoken voice announcement
  if (settings.voiceEnabled) {
    const voiceMsg = `Reminder: Time to take ${medicine.name}, ${medicine.dosageAmount} ${medicine.dosageUnit}. ${instructionText}.`
    setTimeout(() => {
      speakReminderText(voiceMsg)
    }, 400)
  }

  // 3. Fire real browser desktop/mobile push notification
  if (settings.browserNotifications && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(`⏰ MediTrack: Time for ${medicine.name}`, {
        body: `${medicine.dosageAmount} ${medicine.dosageUnit} • ${instructionText}\nTap to Mark Taken, Snooze, or Skip.`,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230d9488"><circle cx="12" cy="12" r="10"/></svg>',
        tag: `meditrack-${medicine.id}-${scheduledTime}`,
        requireInteraction: true, // Keep notification on screen until user interacts
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
        if (onAction) {
          onAction('taken', doseLogId)
        }
      }
    } catch (e) {
      console.warn('Native notification trigger failed, fallback to in-app modal:', e)
    }
  }

  return {
    id: `alert-${Date.now()}-${Math.random()}`,
    doseLogId,
    medicine,
    scheduledTime,
    instructions: instructionText,
    isGracePeriod: false,
    isEscalated: false,
    timestamp: Date.now()
  }
}

/**
 * Format minutes remaining until dose or time elapsed
 */
export function getTimeDifferenceDescription(scheduledTimeStr: string, currentTimeStr?: string): {
  isPast: boolean
  diffMinutes: number
  label: string
} {
  const [schH, schM] = scheduledTimeStr.split(':').map(Number)
  
  let nowH: number, nowM: number
  if (currentTimeStr) {
    const [h, m] = currentTimeStr.split(':').map(Number)
    nowH = h
    nowM = m
  } else {
    const now = new Date()
    nowH = now.getHours()
    nowM = now.getMinutes()
  }

  const schTotal = schH * 60 + schM
  const nowTotal = nowH * 60 + nowM
  const diff = schTotal - nowTotal

  if (diff === 0) {
    return { isPast: false, diffMinutes: 0, label: 'Due now' }
  } else if (diff > 0) {
    if (diff < 60) {
      return { isPast: false, diffMinutes: diff, label: `In ${diff}m` }
    } else {
      const hrs = Math.floor(diff / 60)
      const mins = diff % 60
      return { isPast: false, diffMinutes: diff, label: `In ${hrs}h ${mins > 0 ? `${mins}m` : ''}` }
    }
  } else {
    const absDiff = Math.abs(diff)
    if (absDiff < 60) {
      return { isPast: true, diffMinutes: absDiff, label: `${absDiff}m ago` }
    } else {
      const hrs = Math.floor(absDiff / 60)
      return { isPast: true, diffMinutes: absDiff, label: `${hrs}h ago` }
    }
  }
}

/**
 * Categorize dose time into Morning, Afternoon, Evening, Night
 */
export function getTimeOfDayGroup(timeStr: string): 'morning' | 'afternoon' | 'evening' | 'night' {
  const [hour] = timeStr.split(':').map(Number)
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

/**
 * Format 24-hour time to 12-hour time with AM/PM
 */
export function formatTime12h(timeStr: string): string {
  if (!timeStr) return ''
  const [hourStr, minStr] = timeStr.split(':')
  const hour = parseInt(hourStr, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${minStr} ${ampm}`
}
