import {
  CaregiverLink,
  DoseLog,
  EmergencyContact,
  HospitalDirectoryItem,
  MedicalIdProfile,
  Medicine,
  NotificationSettings,
  PharmacyShop,
  Schedule,
  UserProfile
} from '../types'
import {
  generateInitialDoseLogs,
  INITIAL_CAREGIVERS,
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_HOSPITAL_DIRECTORY,
  INITIAL_MEDICAL_ID,
  INITIAL_MEDICINES,
  INITIAL_PHARMACIES,
  INITIAL_SCHEDULES,
  INITIAL_SETTINGS,
  INITIAL_USER
} from './initialData'

const KEYS = {
  MEDICINES: 'meditrack_medicines_v2',
  SCHEDULES: 'meditrack_schedules_v2',
  DOSE_LOGS: 'meditrack_doselogs_v2',
  EMERGENCY_CONTACTS: 'meditrack_emergency_contacts_v2',
  HOSPITALS: 'meditrack_hospitals_v2',
  MEDICAL_ID: 'meditrack_medical_id_v2',
  CAREGIVERS: 'meditrack_caregivers_v2',
  SETTINGS: 'meditrack_settings_v2',
  THEME: 'meditrack_theme_v2',
  ACCESSIBILITY: 'meditrack_accessibility_v2',
  USER: 'meditrack_user_v2',
  PHARMACIES: 'meditrack_pharmacies_v2'
}

export function loadStoredData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key)
    if (!item) return fallback
    return JSON.parse(item) as T
  } catch (e) {
    console.warn(`Error reading ${key} from storage:`, e)
    return fallback
  }
}

export function saveStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn(`Error saving ${key} to storage:`, e)
  }
}

export function getInitialMedicines(): Medicine[] {
  return loadStoredData(KEYS.MEDICINES, INITIAL_MEDICINES)
}

export function getInitialSchedules(): Schedule[] {
  return loadStoredData(KEYS.SCHEDULES, INITIAL_SCHEDULES)
}

export function getInitialDoseLogs(): DoseLog[] {
  return loadStoredData(KEYS.DOSE_LOGS, generateInitialDoseLogs())
}

export function getInitialEmergencyContacts(): EmergencyContact[] {
  return loadStoredData(KEYS.EMERGENCY_CONTACTS, INITIAL_EMERGENCY_CONTACTS)
}

export function getInitialHospitals(): HospitalDirectoryItem[] {
  return loadStoredData(KEYS.HOSPITALS, INITIAL_HOSPITAL_DIRECTORY)
}

export function getInitialMedicalId(): MedicalIdProfile {
  return loadStoredData(KEYS.MEDICAL_ID, INITIAL_MEDICAL_ID)
}

export function getInitialCaregivers(): CaregiverLink[] {
  return loadStoredData(KEYS.CAREGIVERS, INITIAL_CAREGIVERS)
}

export function getInitialSettings(): NotificationSettings {
  return loadStoredData(KEYS.SETTINGS, INITIAL_SETTINGS)
}

export function getInitialUser(): UserProfile {
  return loadStoredData(KEYS.USER, INITIAL_USER)
}

export function getInitialPharmacies(): PharmacyShop[] {
  return loadStoredData(KEYS.PHARMACIES, INITIAL_PHARMACIES)
}

export { KEYS }
