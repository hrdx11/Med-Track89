import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { useMediTrack } from '../../context/MediTrackContext'
import {
  User,
  Mail,
  Lock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Users,
  KeyRound,
  Sparkles,
  ArrowRight
} from 'lucide-react'

export const AuthModal: React.FC = () => {
  const {
    user,
    login,
    logout,
    register,
    isAuthModalOpen,
    setIsAuthModalOpen,
    caregivers
  } = useMediTrack()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'patient' | 'caregiver'>('patient')

  if (!isAuthModalOpen) return null

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    login(email, role, name || (email.includes('ananya') ? 'Ananya Sharma' : 'HRDX'))
  }

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !name) return
    register(name, email, role, phone || '+91 98100 12345')
  }

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      title={user.isLoggedIn ? 'Account Center' : mode === 'login' ? 'Sign In to MediTrack' : 'Create an Account'}
      description={
        user.isLoggedIn
          ? 'Manage your patient/caregiver identity and profile security.'
          : 'Sync prescriptions, adherence reports, and linked family caregivers.'
      }
      maxWidth="md"
    >
      {user.isLoggedIn ? (
        /* Logged-In Profile Sheet */
        <div className="space-y-5 text-left">
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-md"
              style={{ backgroundColor: user.avatarColor || '#0d9488' }}
            >
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  {user.name}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-800 dark:text-teal-200 capitalize">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">{user.email}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Phone: {user.phone}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Account Type:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                {user.role} Mode
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Linked Caregivers:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {caregivers.length} Family Members
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Member Since:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{user.joinedDate}</span>
            </div>
          </div>

          {/* Quick switch between Patient & Caregiver Demo login */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Switch Quick Demo Profile:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => login('hrdx11@gmail.com', 'patient', 'HRDX')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>👴 HRDX (Patient)</span>
              </button>
              <button
                type="button"
                onClick={() => login('ananya.care@example.com', 'caregiver', 'Ananya Sharma')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>👩‍⚕️ Daughter (Caregiver)</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-between">
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        /* Login / Register Form */
        <div className="space-y-4 text-left">
          {/* Quick Demo Sign-In Buttons */}
          <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20">
            <span className="text-[11px] font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider flex items-center gap-1 mb-2">
              <Sparkles className="w-3 h-3 text-teal-600" />
              <span>1-Click Instant Demo Login:</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => login('hrdx11@gmail.com', 'patient', 'HRDX')}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 hover:bg-teal-50 cursor-pointer"
              >
                <span>👨‍🦳 Sign in as Patient (HRDX)</span>
              </button>
              <button
                type="button"
                onClick={() => login('ananya.care@example.com', 'caregiver', 'Ananya Sharma')}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 hover:bg-indigo-50 cursor-pointer"
              >
                <span>👩‍⚕️ Sign in as Caregiver (Ananya)</span>
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
                mode === 'login'
                  ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
                mode === 'register'
                  ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Register New Account
            </button>
          </div>

          <form onSubmit={mode === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. HRDX"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="hrdx11@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Phone Number (for SMS & SOS)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Primary Account Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                    role === 'patient'
                      ? 'border-teal-500 bg-teal-500/15 text-teal-900 dark:text-teal-200'
                      : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  👴 Patient (Taking Meds)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('caregiver')}
                  className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                    role === 'caregiver'
                      ? 'border-indigo-500 bg-indigo-500/15 text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  👩‍⚕️ Family Caregiver
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-98"
              >
                <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  )
}
