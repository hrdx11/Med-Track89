import React from 'react'
import { MediTrackProvider, useMediTrack } from './context/MediTrackContext'
import { NotificationProvider } from './context/NotificationContext'
import { Navbar } from './components/layout/Navbar'
import { BottomNav } from './components/layout/BottomNav'
import { TodayDashboard } from './components/today/TodayDashboard'
import { MedicineList } from './components/medicines/MedicineList'
import { AdherenceView } from './components/adherence/AdherenceView'
import { NearbyPharmacies } from './components/pharmacy/NearbyPharmacies'
import { EmergencyDirectory } from './components/emergency/EmergencyDirectory'
import { MedicalIdCard } from './components/emergency/MedicalIdCard'
import { CaregiverDashboard } from './components/caregiver/CaregiverDashboard'
import { SettingsView } from './components/settings/SettingsView'
import { NotificationSimulator } from './components/notification/NotificationSimulator'
import { EscalationBanner } from './components/notification/EscalationBanner'
import { TimeTravelWidget } from './components/notification/TimeTravelWidget'
import { SosModal } from './components/emergency/SosModal'
import { InstallAppBanner } from './components/pwa/InstallAppBanner'
import { AuthModal } from './components/auth/AuthModal'
import { FamilyNotificationToast } from './components/today/FamilyNotificationToast'

const MainContent: React.FC = () => {
  const { activeTab, caregiverMode } = useMediTrack()

  return (
    <div className="min-h-screen flex flex-col justify-between pb-24 sm:pb-16">
      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {caregiverMode ? (
            <CaregiverDashboard />
          ) : (
            <>
              {activeTab === 'today' && <TodayDashboard />}
              {activeTab === 'medicines' && <MedicineList />}
              {activeTab === 'history' && <AdherenceView />}
              {activeTab === 'pharmacies' && <NearbyPharmacies />}
              {activeTab === 'emergency' && (
                <div className="space-y-8">
                  <EmergencyDirectory />
                  <MedicalIdCard />
                </div>
              )}
              {activeTab === 'caregiver' && <CaregiverDashboard />}
              {activeTab === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-500 dark:text-slate-400 no-print border-t border-slate-200/50 dark:border-slate-800/50 mt-12">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          MediTrack — Medicine Reminder, Adherence, Chemist & SOS Tracker
        </p>
        <p className="mt-1">
          PWA Enabled • Auto-Family WhatsApp Notifications • 24/7 Chemist Refills • 1-Tap SOS Safety.
        </p>
      </footer>

      {/* Floating Global Overlays, Modals, and Notifications */}
      <BottomNav />
      <NotificationSimulator />
      <EscalationBanner />
      <TimeTravelWidget />
      <SosModal />
      <InstallAppBanner />
      <AuthModal />
      <FamilyNotificationToast />
    </div>
  )
}

export function App() {
  return (
    <MediTrackProvider>
      <NotificationProvider>
        <MainContent />
      </NotificationProvider>
    </MediTrackProvider>
  )
}

export default App
