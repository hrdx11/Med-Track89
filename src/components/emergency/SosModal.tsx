import React, { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { useMediTrack } from '../../context/MediTrackContext'
import { playCountdownTick, playEmergencySiren } from '../../lib/audio'
import {
  PhoneCall,
  ShieldAlert,
  MapPin,
  HeartPulse,
  UserCheck,
  AlertOctagon,
  Volume2,
  VolumeX,
  Share2,
  CheckCircle,
  Copy
} from 'lucide-react'

export const SosModal: React.FC = () => {
  const { isSosModalOpen, setIsSosModalOpen, emergencyContacts, medicalId, medicines } = useMediTrack()
  const [countdown, setCountdown] = useState<number>(3)
  const [isCountingDown, setIsCountingDown] = useState<boolean>(true)
  const [soundActive, setSoundActive] = useState<boolean>(true)
  const [copiedMsg, setCopiedMsg] = useState<boolean>(false)

  const primaryContact = emergencyContacts.find(c => c.isPrimarySos) || emergencyContacts[0]
  const criticalMeds = medicines.filter(m => m.isCritical && m.isActive).map(m => `${m.name} (${m.dosageAmount}${m.dosageUnit})`).join(', ')

  // Start siren & countdown when opened
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (isSosModalOpen) {
      setCountdown(3)
      setIsCountingDown(true)
      if (soundActive) {
        playEmergencySiren(3)
      }

      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            setIsCountingDown(false)
            // Trigger automatic dial to 112/108
            window.location.href = 'tel:112'
            return 0
          }
          playCountdownTick()
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isSosModalOpen, soundActive])

  if (!isSosModalOpen) return null

  const handleCancelCountdown = () => {
    setIsCountingDown(false)
    setCountdown(0)
  }

  const sosBroadcastMessage = `🚨 *MEDICAL EMERGENCY ALERT* 🚨
Patient: ${medicalId.patientName} (Age: ${medicalId.age}, Blood: ${medicalId.bloodGroup})
Location: ${medicalId.homeAddress}
Allergies: ${medicalId.allergies.join(', ') || 'None'}
Critical Meds: ${criticalMeds || 'None'}
Doctor: ${medicalId.primaryDoctorName} (${medicalId.primaryDoctorPhone})
Emergency Note: ${medicalId.emergencyNote}`

  const handleCopyBroadcast = () => {
    navigator.clipboard.writeText(sosBroadcastMessage)
    setCopiedMsg(true)
    setTimeout(() => setCopiedMsg(false), 3000)
  }

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(sosBroadcastMessage)
    const phone = primaryContact ? primaryContact.phoneNumber.replace(/[^0-9]/g, '') : ''
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
  }

  return (
    <Modal
      isOpen={isSosModalOpen}
      onClose={() => setIsSosModalOpen(false)}
      maxWidth="xl"
      showCloseButton={false}
    >
      <div className="text-center">
        {/* Siren Alert Header */}
        <div className="relative inline-flex items-center justify-center p-4 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 mb-3 animate-sos-pulse">
          <ShieldAlert className="w-14 h-14" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
          EMERGENCY SOS TRIGGERED
        </h2>

        {/* 3-Second Countdown Banner */}
        {isCountingDown ? (
          <div className="mt-4 p-5 rounded-2xl bg-rose-500/10 border-2 border-rose-500/30">
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl sm:text-5xl font-black text-rose-600 dark:text-rose-400 animate-pulse">
                {countdown}
              </span>
              <div className="text-left">
                <p className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                  Auto-dialing National Emergency (112)...
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Accidental click? You can cancel the countdown below.
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-3 justify-center">
              <button
                onClick={handleCancelCountdown}
                className="px-6 py-2.5 rounded-xl font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 shadow-md transition-transform active:scale-95 text-sm cursor-pointer"
              >
                Cancel Auto-Dial
              </button>
              <button
                onClick={() => setSoundActive(!soundActive)}
                className="px-4 py-2.5 rounded-xl font-medium border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2 cursor-pointer"
              >
                {soundActive ? <Volume2 className="w-4 h-4 text-rose-500" /> : <VolumeX className="w-4 h-4" />}
                {soundActive ? 'Mute Siren' : 'Unmute'}
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Select an emergency action below or speak with first responders.
          </p>
        )}

        {/* Quick Emergency Direct Call Buttons */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
          {/* Call National Emergency */}
          <a
            href="tel:112"
            className="p-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg hover:shadow-rose-500/30 flex items-center justify-between transition-transform active:scale-98 group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-white/20 rounded-xl">
                <PhoneCall className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold opacity-90">Unified Helpline</span>
                <h4 className="text-lg font-bold">Call 112 (Police / Med)</h4>
              </div>
            </div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">24/7 Toll-Free</span>
          </a>

          {/* Call Ambulance 108 */}
          <a
            href="tel:108"
            className="p-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg hover:shadow-amber-500/30 flex items-center justify-between transition-transform active:scale-98 group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-white/20 rounded-xl">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold opacity-90">Ambulance & EMT</span>
                <h4 className="text-lg font-bold">Call 108 (Ambulance)</h4>
              </div>
            </div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">Free Dispatch</span>
          </a>

          {/* Call Primary Caregiver Contact */}
          {primaryContact && (
            <a
              href={`tel:${primaryContact.phoneNumber}`}
              className="p-4 rounded-2xl bg-teal-600 text-white shadow-lg hover:shadow-teal-500/30 flex items-center justify-between transition-transform active:scale-98 group cursor-pointer sm:col-span-2"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-white/20 rounded-xl">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
                    Primary Emergency Contact ({primaryContact.relationship})
                  </span>
                  <h4 className="text-lg font-bold">
                    Call {primaryContact.name} ({primaryContact.phoneNumber})
                  </h4>
                </div>
              </div>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">Instant Call</span>
            </a>
          )}
        </div>

        {/* Broadcast / Location Share Options */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
              <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Current Registered Address</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyBroadcast}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
              >
                {copiedMsg ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedMsg ? 'Copied' : 'Copy Info'}
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-600 text-white flex items-center gap-1.5 hover:bg-emerald-700 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                WhatsApp SOS
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {medicalId.homeAddress}
          </p>
        </div>

        {/* First Responder Medical ID Sheet */}
        <div className="mt-4 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-left">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wider mb-2">
            <AlertOctagon className="w-4 h-4" />
            <span>Paramedic / First Responder Reference</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block">Patient</span>
              <span className="font-bold text-slate-900 dark:text-white">{medicalId.patientName}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block">Blood Group</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{medicalId.bloodGroup}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block">Allergies</span>
              <span className="font-bold text-slate-900 dark:text-white truncate block">
                {medicalId.allergies.join(', ') || 'None'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block">Doctor</span>
              <span className="font-bold text-slate-900 dark:text-white truncate block">
                {medicalId.primaryDoctorName}
              </span>
            </div>
          </div>
        </div>

        {/* Dismiss Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setIsSosModalOpen(false)}
            className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm cursor-pointer"
          >
            Close SOS Screen
          </button>
        </div>
      </div>
    </Modal>
  )
}
