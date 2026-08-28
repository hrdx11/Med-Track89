import React, { useEffect, useState } from 'react'
import { useMediTrack } from '../../context/MediTrackContext'
import { ViewTab } from '../../types'
import {
  Pill,
  Sun,
  Moon,
  Type,
  Users,
  ShieldAlert,
  Calendar,
  Layers,
  Settings,
  HeartPulse,
  Clock,
  PhoneCall,
  ShoppingBag,
  User,
  Download
} from 'lucide-react'
import { formatTime12h } from '../../lib/notifications'

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    accessibilityMode,
    toggleAccessibilityMode,
    caregiverMode,
    setCaregiverMode,
    simulatedTime,
    setIsSosModalOpen,
    setIsAuthModalOpen,
    setIsInstallPromptOpen,
    user
  } = useMediTrack()

  const [realClock, setRealClock] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const d = new Date()
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      setRealClock(formatTime12h(`${hh}:${mm}`))
    }
    updateTime()
    const interval = setInterval(updateTime, 10000)
    return () => clearInterval(interval)
  }, [])

  const displayTime = simulatedTime.isSimulated
    ? formatTime12h(simulatedTime.simulatedTimeStr)
    : realClock

  const navItems: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'today', label: 'Today', icon: <Calendar className="w-4 h-4" /> },
    { id: 'medicines', label: 'Medicines', icon: <Layers className="w-4 h-4" /> },
    { id: 'history', label: 'Adherence', icon: <HeartPulse className="w-4 h-4" /> },
    { id: 'pharmacies', label: 'Nearby Chemist', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'emergency', label: 'Emergency & SOS', icon: <PhoneCall className="w-4 h-4" /> },
    { id: 'caregiver', label: 'Caregiver View', icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ]

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-white/75 dark:bg-slate-900/80 border-b border-white/40 dark:border-slate-800/60 shadow-sm transition-colors no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-3">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('today')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-teal-500/25 group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight font-heading text-slate-900 dark:text-white">
                  MediTrack
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/30">
                  Care
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Reminder & Dosage Tracker
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            {navItems.map(item => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Install App Popup Trigger */}
            <button
              onClick={() => setIsInstallPromptOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Install MediTrack Mobile & Desktop App"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install App</span>
            </button>

            {/* Account Center Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 hover:bg-slate-100 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 cursor-pointer shadow-sm"
              title="Open Account Center / Sign In"
            >
              <div
                className="w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0"
                style={{ backgroundColor: user.avatarColor || '#0d9488' }}
              >
                {user.name.charAt(0)}
              </div>
              <span className="hidden md:inline">{user.name.split(' ')[0]}</span>
            </button>

            {/* Accessibility Large Text Toggle */}
            <button
              onClick={toggleAccessibilityMode}
              className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                accessibilityMode
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                  : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
              title="Elderly Accessibility: Large Text & High Contrast Mode"
            >
              <Type className="w-4 h-4" />
              <span className="hidden lg:inline">{accessibilityMode ? 'Large: ON' : 'Large Text'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Pulsing Emergency SOS Button */}
            <button
              onClick={() => setIsSosModalOpen(true)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-500/30 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer animate-sos-pulse"
              title="Trigger Emergency SOS with auto-dial"
            >
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>SOS</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
