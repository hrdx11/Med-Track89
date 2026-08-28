export type DoseStatus = 'taken' | 'missed' | 'skipped' | 'taken_late' | 'pending'

export type MedicineForm = 
  | 'tablet' 
  | 'capsule' 
  | 'liquid' 
  | 'injection' 
  | 'inhaler' 
  | 'drops' 
  | 'patch'

export type FoodInstruction = 
  | 'with_food' 
  | 'before_food' 
  | 'after_food' 
  | 'empty_stomach' 
  | 'anytime'

export type DosageUnit = 'mg' | 'mcg' | 'ml' | 'drops' | 'puffs' | 'units' | 'tablets' | 'capsules' | 'g'

export interface Medicine {
  id: string
  name: string
  dosageAmount: string
  dosageUnit: DosageUnit
  form: MedicineForm
  color: string
  shape: 'round' | 'oval' | 'capsule' | 'square' | 'bottle' | 'inhaler'
  instructions: FoodInstruction
  notes?: string
  totalQuantity?: number
  remainingQuantity?: number
  lowStockThreshold?: number
  priceEstimate?: string
  isCritical: boolean
  isActive: boolean
  category?: string
  createdAt: string
}

export type FrequencyType = 'daily' | 'specific_days' | 'interval' | 'as_needed'

export interface Schedule {
  id: string
  medicineId: string
  frequency: FrequencyType
  daysOfWeek?: number[] // 0 (Sun) - 6 (Sat)
  intervalDays?: number
  times: string[] // ["08:00", "20:00"]
  startDate: string
  endDate?: string
}

export interface DoseLog {
  id: string
  scheduleId: string
  medicineId: string
  scheduledDate: string // YYYY-MM-DD
  scheduledTime: string // HH:mm
  status: DoseStatus
  takenAt?: string // ISO timestamp
  skipReason?: string
  loggedVia?: 'notification' | 'app' | 'caregiver' | 'lockscreen'
}

export interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phoneNumber: string
  isPrimarySos: boolean
  canEscalate: boolean
  notes?: string
}

export interface HospitalDirectoryItem {
  id: string
  name: string
  type: 'ambulance' | 'hospital' | 'police' | 'poison_control' | 'senior_helpline'
  number: string
  badge: string
  description: string
  isGovt: boolean
}

export interface MedicalIdProfile {
  patientName: string
  age: number
  gender: string
  bloodGroup: string
  allergies: string[]
  chronicConditions: string[]
  primaryDoctorName: string
  primaryDoctorPhone: string
  preferredHospital: string
  homeAddress: string
  emergencyNote: string
}

export interface CaregiverLink {
  id: string
  name: string
  emailOrPhone: string
  code: string
  status: 'accepted' | 'pending'
  role: 'view' | 'edit'
  linkedSince: string
  lastViewedAt?: string
  avatarColor: string
}

export interface PharmacyShop {
  id: string
  name: string
  brand: string
  rating: number
  reviewCount: number
  address: string
  distanceKm: string
  walkTimeMinutes: number
  isOpen24Hours: boolean
  openStatus: string
  phone: string
  whatsapp: string
  hasHomeDelivery: boolean
  deliveryTimeMins: number
  discountOffer: string
  coords: { lat: number; lng: number }
}

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  role: 'patient' | 'caregiver'
  isLoggedIn: boolean
  avatarColor?: string
  joinedDate: string
}

export interface NotificationSettings {
  browserNotifications: boolean
  soundEnabled: boolean
  soundTheme: 'zen_chime' | 'marimba' | 'crystal_bell' | 'gentle_pulse'
  voiceEnabled: boolean
  snoozeMinutes: number
  gracePeriodMinutes: number
  quietHoursStart: string
  quietHoursEnd: string
  criticalOverride: boolean
  autoNotifyFamilyOnTaken: boolean
}

export interface SimulatedTimeState {
  isSimulated: boolean
  simulatedTimeStr: string // "08:00"
  simulatedDateStr: string // "2026-08-29"
}

export type ViewTab = 'today' | 'medicines' | 'history' | 'pharmacies' | 'emergency' | 'caregiver' | 'settings' | 'account'
