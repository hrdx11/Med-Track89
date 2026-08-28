import React, { useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { useMediTrack } from '../../context/MediTrackContext'
import { EmergencyContact } from '../../types'
import {
  PhoneCall,
  ShieldAlert,
  HeartPulse,
  Plus,
  Trash2,
  Star,
  Building2,
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Modal } from '../ui/Modal'

export const EmergencyDirectory: React.FC = () => {
  const {
    hospitals,
    emergencyContacts,
    addEmergencyContact,
    deleteEmergencyContact,
    setPrimaryEmergencyContact,
    setIsSosModalOpen
  } = useMediTrack()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Form state
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [notes, setNotes] = useState('')

  const handleCopy = (id: string, num: string) => {
    navigator.clipboard.writeText(num)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phoneNumber) return

    addEmergencyContact({
      name,
      relationship: relationship || 'Family',
      phoneNumber,
      isPrimarySos: emergencyContacts.length === 0,
      canEscalate: true,
      notes
    })

    setName('')
    setRelationship('')
    setPhoneNumber('')
    setNotes('')
    setIsAddModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with big SOS button */}
      <GlassCard className="border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-red-500/5 to-orange-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Emergency & SOS Response
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300">
                1-Tap Call
              </span>
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Direct emergency numbers for Ambulance (108/112), Police, Hospitals, and Personal Contacts.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSosModalOpen(true)}
          className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-lg shadow-rose-500/25 transition-transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer animate-pulse-glow"
        >
          <PhoneCall className="w-5 h-5" />
          <span>TRIGGER SOS NOW</span>
        </button>
      </GlassCard>

      {/* Section 1: Government & National Emergency Services */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>National & Hospital Emergency Helplines</span>
          </h4>
          <span className="text-xs text-slate-500">24/7 Verified Toll-Free</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hospitals.map(item => (
            <GlassCard key={item.id} className="flex flex-col justify-between hover:border-teal-500/40">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/30">
                    {item.badge}
                  </span>
                  <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                    {item.number}
                  </span>
                </div>

                <h5 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                  {item.name}
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2">
                <a
                  href={`tel:${item.number}`}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                  <span>Call {item.number}</span>
                </a>
                <button
                  onClick={() => handleCopy(item.id, item.number)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                  title="Copy Phone Number"
                >
                  {copiedId === item.id ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Section 2: Personal Emergency Contacts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span>Personal Emergency Contacts & Family</span>
            </h4>
            <p className="text-xs text-slate-500">Notified instantly during SOS or missed dose escalation</p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emergencyContacts.map(contact => (
            <GlassCard
              key={contact.id}
              className={`relative flex flex-col justify-between ${
                contact.isPrimarySos ? 'border-teal-500/50 bg-teal-500/5' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {contact.relationship}
                  </span>
                  {contact.isPrimarySos ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400">
                      <Star className="w-3.5 h-3.5 fill-teal-500 text-teal-500" />
                      Primary SOS
                    </span>
                  ) : (
                    <button
                      onClick={() => setPrimaryEmergencyContact(contact.id)}
                      className="text-xs text-slate-400 hover:text-teal-600 transition-colors cursor-pointer"
                      title="Set as Primary SOS"
                    >
                      Set Primary
                    </button>
                  )}
                </div>

                <h5 className="font-bold text-slate-900 dark:text-white text-base">
                  {contact.name}
                </h5>
                <p className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
                  {contact.phoneNumber}
                </p>
                {contact.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                    "{contact.notes}"
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
                <a
                  href={`tel:${contact.phoneNumber}`}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call {contact.name.split(' ')[0]}</span>
                </a>

                {emergencyContacts.length > 1 && (
                  <button
                    onClick={() => deleteEmergencyContact(contact.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Add Contact Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Emergency Contact"
        description="Add a family member, caregiver, or doctor for 1-tap SOS assistance."
      >
        <form onSubmit={handleSaveContact} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ananya Sharma, Dr. Menon"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Relationship
              </label>
              <input
                type="text"
                placeholder="e.g. Daughter, Family Physician"
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 98765 43210"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Has spare key, lives nearby"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md cursor-pointer"
            >
              Save Contact
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
