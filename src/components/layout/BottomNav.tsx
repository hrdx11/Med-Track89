import React from 'react'
import { useMediTrack } from '../../context/MediTrackContext'
import { ViewTab } from '../../types'
import {
  Calendar,
  Layers,
  HeartPulse,
  PhoneCall,
  ShoppingBag,
  User
} from 'lucide-react'

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsAuthModalOpen } = useMediTrack()

  const tabs: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'today', label: 'Today', icon: <Calendar className="w-5 h-5" /> },
    { id: 'medicines', label: 'Meds', icon: <Layers className="w-5 h-5" /> },
    { id: 'pharmacies', label: 'Chemist', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'history', label: 'History', icon: <HeartPulse className="w-5 h-5" /> },
    { id: 'emergency', label: 'SOS', icon: <PhoneCall className="w-5 h-5 text-rose-500" /> }
  ]

  return (
    <div className="xl:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/85 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1 shadow-lg no-print">
      <div className="flex items-center justify-around">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-teal-600 dark:text-teal-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
