import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { useMediTrack } from '../../context/MediTrackContext'
import {
  QrCode,
  Copy,
  CheckCircle,
  Share2,
  Trash2,
  ShieldCheck,
  UserPlus,
  Lock
} from 'lucide-react'

interface ShareInviteModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ShareInviteModal: React.FC<ShareInviteModalProps> = ({ isOpen, onClose }) => {
  const { caregivers, addCaregiver, revokeCaregiver, medicalId } = useMediTrack()
  const [copiedCode, setCopiedCode] = useState(false)
  const [newCgName, setNewCgName] = useState('')
  const [newCgContact, setNewCgContact] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  if (!isOpen) return null

  const inviteCode = '748-912'

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCgName) return
    addCaregiver(newCgName, newCgContact || 'caregiver@meditrack.internal')
    setNewCgName('')
    setNewCgContact('')
    setIsAdding(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Caregiver Sharing & Remote Visibility"
      description="Family members and caregivers can monitor adherence in real-time without modifying your schedule."
      maxWidth="2xl"
    >
      <div className="space-y-6 text-left">
        {/* QR Code & 6-Digit Share Code */}
        <div className="p-5 rounded-3xl bg-teal-500/10 border border-teal-500/25 flex flex-col sm:flex-row items-center gap-5">
          {/* Simulated QR Code */}
          <div className="p-3.5 bg-white rounded-2xl shadow-md shrink-0 flex flex-col items-center justify-center">
            <div className="w-28 h-28 bg-slate-900 rounded-xl p-2 flex items-center justify-center text-white">
              <QrCode className="w-24 h-24 text-teal-400" />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 mt-1.5">
              Scan with MediTrack
            </span>
          </div>

          {/* Share Code Details */}
          <div className="space-y-2 text-center sm:text-left flex-1">
            <span className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider block">
              Patient 6-Digit Link Code
            </span>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-3xl font-black font-mono tracking-widest text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                {inviteCode}
              </span>
              <button
                onClick={handleCopy}
                className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm cursor-pointer"
                title="Copy Link Code"
              >
                {copiedCode ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Share this code with your daughter, son, or home aide to link their caregiver dashboard.
            </p>
          </div>
        </div>

        {/* Connected Caregivers List (Consent Management) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Connected Caregivers ({caregivers.length})</span>
            </h4>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite New</span>
            </button>
          </div>

          {isAdding && (
            <form
              onSubmit={handleAddSubmit}
              className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3 mb-3 animate-in fade-in"
            >
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                Invite New Caregiver
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Caregiver Name (e.g. Rahul)"
                  value={newCgName}
                  onChange={e => setNewCgName(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
                <input
                  type="text"
                  placeholder="Email or Phone"
                  value={newCgContact}
                  onChange={e => setNewCgContact(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold"
                >
                  Send Invite
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
            {caregivers.map(cg => (
              <div key={cg.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: cg.avatarColor || '#0d9488' }}
                  >
                    {cg.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">{cg.name}</h5>
                    <p className="text-slate-500 font-mono text-[11px]">
                      {cg.emailOrPhone} • Linked since {cg.linkedSince}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium text-[10px]">
                    Read-Only Access
                  </span>
                  <button
                    onClick={() => revokeCaregiver(cg.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Revoke caregiver access"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
          <Lock className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
          <p>
            <strong>Consent First:</strong> Caregivers only see adherence statistics and timestamps.
            They cannot alter prescription doses or delete your medications. You can revoke access at
            any time.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  )
}
