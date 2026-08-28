import React from 'react'
import { Modal } from '../ui/Modal'
import { useMediTrack } from '../../context/MediTrackContext'
import {
  Download,
  CheckCircle2,
  Bell,
  ShieldAlert,
  Share2,
  PlusSquare
} from 'lucide-react'

export const InstallAppBanner: React.FC = () => {
  const { isInstallPromptOpen, setIsInstallPromptOpen, installApp, canInstall } = useMediTrack()

  if (!isInstallPromptOpen) return null

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

  return (
    <Modal
      isOpen={isInstallPromptOpen}
      onClose={() => setIsInstallPromptOpen(false)}
      maxWidth="md"
      showCloseButton={true}
    >
      <div className="text-center space-y-5">
        {/* ══════ BRAND LOGO — Full rectangular logo with M + MediTrack text ══════ */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-full rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-teal-500/10 p-4 sm:p-6">
            <img
              src="/logo-full.png"
              alt="MediTrack — Track • Manage • Live Better"
              className="w-full max-w-xs sm:max-w-sm mx-auto object-contain"
            />
          </div>

          <span className="px-3 py-1 rounded-full bg-teal-500/15 text-teal-800 dark:text-teal-300 font-bold text-xs border border-teal-500/30 uppercase tracking-wider">
            Mobile & Desktop App Available
          </span>
        </div>

        <div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Install MediTrack on Your Device
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
            Get instant offline reminders, lock-screen alarms, and 1-tap SOS dialing right from your home screen.
          </p>
        </div>

        {/* Benefits */}
        <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-2.5 text-xs">
          <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Reliable offline alarms even with low connectivity</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 font-semibold">
            <Bell className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Direct Mark Taken / Snooze buttons on notification</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 font-semibold">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
            <span>1-Tap Emergency SOS Auto-Dialer on lockscreen</span>
          </div>
        </div>

        {/* Install Action */}
        {isIOS ? (
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/25 text-left text-xs space-y-2">
            <span className="font-bold text-teal-900 dark:text-teal-200 block">
              How to install on iPhone / iPad (Safari):
            </span>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span>1. Tap the</span>
              <Share2 className="w-4 h-4 text-teal-600 inline" />
              <span className="font-bold">Share</span>
              <span>button in Safari toolbar.</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span>2. Scroll and select</span>
              <PlusSquare className="w-4 h-4 text-teal-600 inline" />
              <span className="font-bold">"Add to Home Screen"</span>.
            </div>
          </div>
        ) : (
          <div className="pt-1">
            <button
              onClick={installApp}
              className="w-full py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer animate-pulse-glow"
            >
              <Download className="w-5 h-5" />
              <span>INSTALL MEDITRACK APP NOW</span>
            </button>
          </div>
        )}

        <div>
          <button
            onClick={() => setIsInstallPromptOpen(false)}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold underline underline-offset-2 cursor-pointer"
          >
            Continue using in web browser
          </button>
        </div>
      </div>
    </Modal>
  )
}
