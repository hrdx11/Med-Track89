import React from 'react'
import { GlassCard } from '../ui/GlassCard'
import { useMediTrack } from '../../context/MediTrackContext'
import { useNotifications } from '../../context/NotificationContext'
import { playReminderSound } from '../../lib/audio'
import {
  Bell,
  Volume2,
  Mic,
  Moon,
  Clock,
  ShieldAlert,
  Type,
  Database,
  RotateCcw,
  Sparkles,
  CheckCircle2
} from 'lucide-react'

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    accessibilityMode,
    toggleAccessibilityMode,
    theme,
    toggleTheme
  } = useMediTrack()

  const { requestPermission, permissionState } = useNotifications()

  const handleTestSound = (soundTheme: typeof settings.soundTheme) => {
    updateSettings({ soundTheme })
    playReminderSound(soundTheme)
  }

  const handleExportData = () => {
    const backup = {
      medicines: localStorage.getItem('meditrack_medicines_v2'),
      schedules: localStorage.getItem('meditrack_schedules_v2'),
      doseLogs: localStorage.getItem('meditrack_doselogs_v2'),
      emergencyContacts: localStorage.getItem('meditrack_emergency_contacts_v2'),
      medicalId: localStorage.getItem('meditrack_medical_id_v2'),
      timestamp: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meditrack-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all MediTrack data to defaults?')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Bell className="w-6 h-6 text-teal-600" />
          <span>Reminder & Accessibility Settings</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure notification alarms, audio chimes, quiet hours, and elderly accessibility.
        </p>
      </div>

      {/* 1. Browser Push Notifications & Permissions */}
      <GlassCard className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-600" />
              <span>Native Browser Desktop / Mobile Notifications</span>
            </h3>
            <p className="text-xs text-slate-500">
              Receive reminder popups directly on your OS lock-screen without opening the web page.
            </p>
          </div>

          <button
            onClick={requestPermission}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              permissionState === 'granted'
                ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
            }`}
          >
            {permissionState === 'granted' ? '✓ Notifications Enabled' : 'Enable Native Notifications'}
          </button>
        </div>
      </GlassCard>

      {/* 2. Audio Chimes & Spoken Reminders */}
      <GlassCard className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-teal-600" />
          <span>Sound Profile & Spoken Reminders</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
              Gentle Reminder Chime
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'zen_chime', label: 'Zen Harmonic' },
                { id: 'marimba', label: 'Warm Marimba' },
                { id: 'crystal_bell', label: 'Crystal Bell' },
                { id: 'gentle_pulse', label: 'Soft Pulse' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTestSound(item.id as typeof settings.soundTheme)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                    settings.soundTheme === item.id
                      ? 'border-teal-500 bg-teal-500/15 text-teal-900 dark:text-teal-200'
                      : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.label}</span>
                  <Volume2 className="w-3.5 h-3.5 opacity-70" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/70 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Spoken Voice Reminders (Text-to-Speech)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.voiceEnabled}
                  onChange={e => updateSettings({ voiceEnabled: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Speaks medicine name, dosage, and food instructions clearly aloud when dose time arrives.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 3. Snooze & Grace Period */}
      <GlassCard className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-600" />
          <span>Snooze Duration & Missed-Dose Grace Window</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Default Snooze Length
            </label>
            <select
              value={settings.snoozeMinutes}
              onChange={e => updateSettings({ snoozeMinutes: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold"
            >
              <option value="5">5 Minutes</option>
              <option value="10">10 Minutes</option>
              <option value="15">15 Minutes (Default)</option>
              <option value="30">30 Minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Grace Window Before Caregiver Escalation
            </label>
            <select
              value={settings.gracePeriodMinutes}
              onChange={e => updateSettings({ gracePeriodMinutes: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold"
            >
              <option value="30">30 Minutes</option>
              <option value="45">45 Minutes (Recommended)</option>
              <option value="60">60 Minutes</option>
            </select>
            <span className="text-[11px] text-slate-500 mt-1 block">
              If not acknowledged within this time, linked caregivers receive an alert.
            </span>
          </div>
        </div>
      </GlassCard>

      {/* 4. Quiet Hours & Critical Override */}
      <GlassCard className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Moon className="w-4 h-4 text-indigo-600" />
          <span>Quiet Hours (Sleep Mode)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Quiet Hours Start
              </label>
              <input
                type="time"
                value={settings.quietHoursStart}
                onChange={e => updateSettings({ quietHoursStart: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Quiet Hours End
              </label>
              <input
                type="time"
                value={settings.quietHoursEnd}
                onChange={e => updateSettings({ quietHoursEnd: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20">
            <input
              type="checkbox"
              id="critOver"
              checked={settings.criticalOverride}
              onChange={e => updateSettings({ criticalOverride: e.target.checked })}
              className="w-4 h-4 text-rose-600 rounded mt-0.5 cursor-pointer"
            />
            <label htmlFor="critOver" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              <strong>Critical Medication Override:</strong> Always ring even during quiet hours for life-important medicines (e.g. Insulin, Cardiac).
            </label>
          </div>
        </div>
      </GlassCard>

      {/* 5. Elderly Accessibility Mode */}
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-teal-600" />
              <span>Elderly-Friendly Accessibility Mode</span>
            </h3>
            <p className="text-xs text-slate-500">
              Scales typography by +25%, eliminates background blur for maximum crispness, and raises contrast to 95%.
            </p>
          </div>

          <button
            onClick={toggleAccessibilityMode}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs shadow-sm cursor-pointer transition-colors ${
              accessibilityMode
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            {accessibilityMode ? 'Disable Large Text' : 'Enable Large Text (+25%)'}
          </button>
        </div>
      </GlassCard>

      {/* 6. Data Backup & Reset */}
      <GlassCard className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-500" />
          <span>Local Storage & Backup</span>
        </h3>
        <p className="text-xs text-slate-500">
          MediTrack stores all your prescriptions, logs, and emergency contacts securely on this device.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Export Data Backup (.json)</span>
          </button>

          <button
            onClick={handleResetData}
            className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </GlassCard>
    </div>
  )
}
