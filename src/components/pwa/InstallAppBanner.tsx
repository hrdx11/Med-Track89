import React from 'react'
import { Modal } from '../ui/Modal'
import { useMediTrack } from '../../context/MediTrackContext'
import {
  Download,
  CheckCircle2,
  Bell,
  ShieldAlert,
  Share2,
  PlusSquare,
  Sparkles
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
      <div className="text-center space-y-4">
        {/* ══════ Full MED_11 Brand Card ══════ */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md p-3 sm:p-4 overflow-hidden">
          <img
            src="/MED_11.png"
            alt="MediTrack — Track • Manage • Live Better"
            className="w-full max-h-48 object-contain mx-auto"
          />
        </div>

        {/* ══════ App Icon Preview ══════ */}
        <div className="flex items-center justify-center gap-3 bg-teal-500/10 dark:bg-teal-950/30 p-2.5 rounded-2xl border border-teal-500/20 text-xs text-left">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-teal-500/40 p-1 shadow-sm flex items-center justify-center shrink-0">
            <img
              src="/logo-512.png"
              alt="MediTrack App Icon"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-bold text-teal-950 dark:text-teal-200 block text-xs">
              Home Screen & Desktop App Icon
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Custom 3D MediTrack emblem with offline reminder support
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Install MediTrack on Your Device
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            Never miss a dose. Get instant offline reminders, lock-screen alarms, and 1-tap SOS emergency access.
          </p>
        </div>

        {/* Benefits List */}
        <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
          <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Reliable offline alarms without needing internet</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 font-semibold">
            <Bell className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Actionable notifications: Mark Taken directly</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 font-semibold">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
            <span>1-Tap Emergency SOS Auto-Dialer & Medical ID</span>
          </div>
        </div>

        {/* Action Button: Native PWA Install vs iOS Instructions */}
        {isIOS ? (
          <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/25 text-left text-xs space-y-2">
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
              className="w-full py-3 px-6 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer animate-pulse-glow"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>INSTALL MEDITRACK APP NOW</span>
            </button>
          </div>
        )}

        <div>
          <button
            onClick={() => setIsInstallPromptOpen(false)}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold underline underline-offset-2 cursor-pointer"
          >
            Continue in web browser
          </button>
        </div>
      </div>
    </Modal>
  )
}
