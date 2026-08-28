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

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'med-1',
    name: 'Metformin Hydrochloride',
    dosageAmount: '500',
    dosageUnit: 'mg',
    form: 'tablet',
    color: '#0d9488', // teal
    shape: 'oval',
    instructions: 'with_food',
    notes: 'Take right after meals to avoid stomach upset. For blood sugar management.',
    totalQuantity: 60,
    remainingQuantity: 42,
    lowStockThreshold: 14,
    isCritical: true,
    isActive: true,
    category: 'Diabetes',
    createdAt: '2026-08-01'
  },
  {
    id: 'med-2',
    name: 'Lisinopril',
    dosageAmount: '10',
    dosageUnit: 'mg',
    form: 'tablet',
    color: '#f97316', // orange/coral
    shape: 'round',
    instructions: 'before_food',
    notes: 'Take in the morning with a full glass of water. For blood pressure.',
    totalQuantity: 30,
    remainingQuantity: 8, // triggers low stock warning!
    lowStockThreshold: 10,
    isCritical: true,
    isActive: true,
    category: 'Blood Pressure',
    createdAt: '2026-08-01'
  },
  {
    id: 'med-3',
    name: 'Atorvastatin',
    dosageAmount: '20',
    dosageUnit: 'mg',
    form: 'tablet',
    color: '#8b5cf6', // purple
    shape: 'round',
    instructions: 'after_food',
    notes: 'Best taken in the evening or at bedtime for cholesterol.',
    totalQuantity: 30,
    remainingQuantity: 22,
    lowStockThreshold: 7,
    isCritical: false,
    isActive: true,
    category: 'Lipids',
    createdAt: '2026-08-05'
  },
  {
    id: 'med-4',
    name: 'Vitamin D3 & Calcium',
    dosageAmount: '2000',
    dosageUnit: 'units',
    form: 'capsule',
    color: '#eab308', // gold
    shape: 'capsule',
    instructions: 'with_food',
    notes: 'Dietary supplement for bone health.',
    totalQuantity: 60,
    remainingQuantity: 45,
    lowStockThreshold: 10,
    isCritical: false,
    isActive: true,
    category: 'Supplements',
    createdAt: '2026-08-10'
  },
  {
    id: 'med-5',
    name: 'Salbutamol / Albuterol',
    dosageAmount: '100',
    dosageUnit: 'mcg',
    form: 'inhaler',
    color: '#0284c7', // sky blue
    shape: 'inhaler',
    instructions: 'anytime',
    notes: '1-2 puffs as needed for wheezing or acute shortness of breath.',
    totalQuantity: 200,
    remainingQuantity: 140,
    lowStockThreshold: 40,
    isCritical: true,
    isActive: true,
    category: 'Respiratory',
    createdAt: '2026-08-12'
  }
]

export const INITIAL_SCHEDULES: Schedule[] = [
  {
    id: 'sch-1',
    medicineId: 'med-1',
    frequency: 'daily',
    times: ['08:00', '20:00'],
    startDate: '2026-08-01'
  },
  {
    id: 'sch-2',
    medicineId: 'med-2',
    frequency: 'daily',
    times: ['08:00'],
    startDate: '2026-08-01'
  },
  {
    id: 'sch-3',
    medicineId: 'med-3',
    frequency: 'daily',
    times: ['21:30'],
    startDate: '2026-08-05'
  },
  {
    id: 'sch-4',
    medicineId: 'med-4',
    frequency: 'daily',
    times: ['13:00'],
    startDate: '2026-08-10'
  },
  {
    id: 'sch-5',
    medicineId: 'med-5',
    frequency: 'as_needed',
    times: [],
    startDate: '2026-08-12'
  }
]

export const INITIAL_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'ec-1',
    name: 'Ananya Sharma',
    relationship: 'Daughter & Primary Caregiver',
    phoneNumber: '+91 98765 43210',
    isPrimarySos: true,
    canEscalate: true,
    notes: 'Lives 10 minutes away. Has house spare key.'
  },
  {
    id: 'ec-2',
    name: 'Dr. Rajiv Menon',
    relationship: 'Family Physician & Cardiologist',
    phoneNumber: '+91 98111 22334',
    isPrimarySos: false,
    canEscalate: false,
    notes: 'Consulting doctor for hypertension and diabetes.'
  },
  {
    id: 'ec-3',
    name: 'Rahul Sharma',
    relationship: 'Son',
    phoneNumber: '+91 98222 33445',
    isPrimarySos: false,
    canEscalate: true,
    notes: 'Secondary emergency contact.'
  }
]

export const INITIAL_HOSPITAL_DIRECTORY: HospitalDirectoryItem[] = [
  {
    id: 'hosp-1',
    name: 'National Emergency Response System',
    type: 'ambulance',
    number: '112',
    badge: 'Govt 24/7',
    description: 'Unified emergency number for Ambulance, Police, and Fire across India & internationally.',
    isGovt: true
  },
  {
    id: 'hosp-2',
    name: 'Emergency Medical & Ambulance (CAT/EMRI)',
    type: 'ambulance',
    number: '108',
    badge: 'Toll-Free Ambulance',
    description: 'Free 24/7 state ambulance dispatch with trained emergency EMTs & life support.',
    isGovt: true
  },
  {
    id: 'hosp-3',
    name: 'General Medical Ambulance Service',
    type: 'ambulance',
    number: '102',
    badge: 'Maternal & Senior',
    description: 'National ambulance service for general patient transport and hospital transfers.',
    isGovt: true
  },
  {
    id: 'hosp-4',
    name: 'Elder Line - Senior Citizen National Helpline',
    type: 'senior_helpline',
    number: '14567',
    badge: 'Senior Helpline',
    description: 'Dedicated government helpline for elderly support, medical aid, and emergency rescue.',
    isGovt: true
  },
  {
    id: 'hosp-5',
    name: 'Apollo Hospital & Emergency Trauma ICU',
    type: 'hospital',
    number: '+91 11 2659 8666',
    badge: '24/7 Level 1 Trauma',
    description: 'Preferred hospital with advanced cardiac cath lab and stroke unit (1.8 km away).',
    isGovt: false
  },
  {
    id: 'hosp-6',
    name: 'National Poison Information Centre (AIIMS)',
    type: 'poison_control',
    number: '1800-116-117',
    badge: 'Poison Control',
    description: '24/7 emergency clinical toxicologist assistance for accidental drug overdose or poisoning.',
    isGovt: true
  }
]

export const INITIAL_MEDICAL_ID: MedicalIdProfile = {
  patientName: 'Devendra Sharma',
  age: 68,
  gender: 'Male',
  bloodGroup: 'B Positive (B+)',
  allergies: ['Penicillin (Hives / Rash)', 'Sulfa Antibiotics'],
  chronicConditions: ['Type 2 Diabetes Mellitus', 'Hypertension (Stage 1)'],
  primaryDoctorName: 'Dr. Rajiv Menon (MD Cardiology)',
  primaryDoctorPhone: '+91 98111 22334',
  preferredHospital: 'Apollo Emergency Trauma Center, Delhi NCR',
  homeAddress: 'Flat 402, Shanti Niketan Apartments, Civil Lines',
  emergencyNote: 'Carries glucometer and emergency glucose tablets. In case of fainting or disorientation, check blood sugar or call 108 immediately.'
}

export const INITIAL_CAREGIVERS: CaregiverLink[] = [
  {
    id: 'cg-1',
    name: 'Ananya Sharma',
    emailOrPhone: 'ananya.care@meditrack.internal',
    code: '748-912',
    status: 'accepted',
    role: 'view',
    linkedSince: '2026-08-01',
    lastViewedAt: '2026-08-28 21:40',
    avatarColor: '#0d9488'
  },
  {
    id: 'cg-2',
    name: 'Rahul Sharma',
    emailOrPhone: 'rahul.s@meditrack.internal',
    code: '319-804',
    status: 'accepted',
    role: 'view',
    linkedSince: '2026-08-15',
    lastViewedAt: '2026-08-27 18:15',
    avatarColor: '#6366f1'
  }
]

export const INITIAL_SETTINGS: NotificationSettings = {
  browserNotifications: true,
  soundEnabled: true,
  soundTheme: 'zen_chime',
  voiceEnabled: true,
  snoozeMinutes: 15,
  gracePeriodMinutes: 45,
  quietHoursStart: '23:00',
  quietHoursEnd: '06:30',
  criticalOverride: true,
  autoNotifyFamilyOnTaken: true
}

export const INITIAL_USER: UserProfile = {
  id: 'usr-1',
  name: 'Devendra Sharma',
  email: 'devendra.sharma@example.com',
  phone: '+91 98100 12345',
  role: 'patient',
  isLoggedIn: true,
  avatarColor: '#0d9488',
  joinedDate: '2026-08-01'
}

export const INITIAL_PHARMACIES: PharmacyShop[] = [
  {
    id: 'pharm-1',
    name: 'Apollo Pharmacy 24/7 (Civil Lines)',
    brand: 'Apollo Healthcare',
    rating: 4.8,
    reviewCount: 342,
    address: 'Shop 14-15, Main Market, Near Metro Gate 2, Civil Lines',
    distanceKm: '0.4 km',
    walkTimeMinutes: 5,
    isOpen24Hours: true,
    openStatus: 'Open 24 Hours • Ready for Dispatch',
    phone: '+91 11 4150 7890',
    whatsapp: '+919811122334',
    hasHomeDelivery: true,
    deliveryTimeMins: 15,
    discountOffer: 'Flat 15% Off on Chronic Prescriptions',
    coords: { lat: 28.6782, lng: 77.2238 }
  },
  {
    id: 'pharm-2',
    name: 'MedPlus Chemist & Wellness Store',
    brand: 'MedPlus',
    rating: 4.7,
    reviewCount: 198,
    address: 'Plot 88, Commercial Complex, Sector 4, Opposite Apollo Hospital',
    distanceKm: '0.9 km',
    walkTimeMinutes: 11,
    isOpen24Hours: true,
    openStatus: 'Open 24/7 • Free Express Delivery',
    phone: '+91 11 2398 5642',
    whatsapp: '+919876543210',
    hasHomeDelivery: true,
    deliveryTimeMins: 20,
    discountOffer: 'Buy 2 Get Extra 10% Off + Free Home Drop',
    coords: { lat: 28.6745, lng: 77.2291 }
  },
  {
    id: 'pharm-3',
    name: 'Guardian Pharmacy & Senior Healthcare',
    brand: 'Guardian Care',
    rating: 4.9,
    reviewCount: 156,
    address: 'Ground Floor, Shanti Niketan Arcade, Mall Road',
    distanceKm: '1.2 km',
    walkTimeMinutes: 15,
    isOpen24Hours: false,
    openStatus: 'Open until 11:30 PM • Rapid Delivery',
    phone: '+91 11 2765 4321',
    whatsapp: '+919822233445',
    hasHomeDelivery: true,
    deliveryTimeMins: 25,
    discountOffer: 'Senior Citizen 20% Special Discount',
    coords: { lat: 28.6811, lng: 77.2185 }
  },
  {
    id: 'pharm-4',
    name: 'Sanjivani 24-Hour Emergency Medicals',
    brand: 'Sanjivani',
    rating: 4.6,
    reviewCount: 89,
    address: 'Gate 3 Emergency Wing, AIIMS Road, Civil Square',
    distanceKm: '1.8 km',
    walkTimeMinutes: 22,
    isOpen24Hours: true,
    openStatus: 'Open 24 Hours • Full Insulin & Cardiac Stocks',
    phone: '+91 11 2659 4444',
    whatsapp: '+919999910808',
    hasHomeDelivery: true,
    deliveryTimeMins: 30,
    discountOffer: '100% Genuine Prescription Guaranteed',
    coords: { lat: 28.6698, lng: 77.2344 }
  }
]


/**
 * Generate historical sample logs for adherence heatmap (past 28 days)
 */
export function generateInitialDoseLogs(): DoseLog[] {
  const logs: DoseLog[] = []
  const today = new Date()
  
  // Create history for past 21 days
  for (let i = 21; i >= 1; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]

    // Morning doses (Metformin + Lisinopril)
    // mostly taken, occasionally late or skipped
    const isSkipDay = i === 12
    const isLateDay = i === 5 || i === 18

    logs.push({
      id: `log-past-${i}-1`,
      scheduleId: 'sch-1',
      medicineId: 'med-1',
      scheduledDate: dateStr,
      scheduledTime: '08:00',
      status: isSkipDay ? 'skipped' : isLateDay ? 'taken_late' : 'taken',
      takenAt: isSkipDay ? undefined : `${dateStr}T${isLateDay ? '09:42' : '08:08'}:00`,
      skipReason: isSkipDay ? 'Fasting for blood test' : undefined,
      loggedVia: 'app'
    })

    logs.push({
      id: `log-past-${i}-2`,
      scheduleId: 'sch-2',
      medicineId: 'med-2',
      scheduledDate: dateStr,
      scheduledTime: '08:00',
      status: isSkipDay ? 'skipped' : 'taken',
      takenAt: isSkipDay ? undefined : `${dateStr}T08:10:00`,
      loggedVia: 'notification'
    })

    // Afternoon Vitamin D3
    if (i <= 14) {
      logs.push({
        id: `log-past-${i}-3`,
        scheduleId: 'sch-4',
        medicineId: 'med-4',
        scheduledDate: dateStr,
        scheduledTime: '13:00',
        status: i === 7 ? 'missed' : 'taken',
        takenAt: i === 7 ? undefined : `${dateStr}T13:15:00`,
        loggedVia: 'notification'
      })
    }

    // Night doses (Metformin + Atorvastatin)
    logs.push({
      id: `log-past-${i}-4`,
      scheduleId: 'sch-1',
      medicineId: 'med-1',
      scheduledDate: dateStr,
      scheduledTime: '20:00',
      status: 'taken',
      takenAt: `${dateStr}T20:05:00`,
      loggedVia: 'app'
    })

    logs.push({
      id: `log-past-${i}-5`,
      scheduleId: 'sch-3',
      medicineId: 'med-3',
      scheduledDate: dateStr,
      scheduledTime: '21:30',
      status: i === 3 ? 'missed' : 'taken',
      takenAt: i === 3 ? undefined : `${dateStr}T21:35:00`,
      loggedVia: 'notification'
    })
  }

  // Today's logs
  const todayStr = today.toISOString().split('T')[0]
  
  // Morning doses (taken)
  logs.push({
    id: `log-today-1`,
    scheduleId: 'sch-1',
    medicineId: 'med-1',
    scheduledDate: todayStr,
    scheduledTime: '08:00',
    status: 'taken',
    takenAt: `${todayStr}T08:04:00`,
    loggedVia: 'notification'
  })

  logs.push({
    id: `log-today-2`,
    scheduleId: 'sch-2',
    medicineId: 'med-2',
    scheduledDate: todayStr,
    scheduledTime: '08:00',
    status: 'taken',
    takenAt: `${todayStr}T08:05:00`,
    loggedVia: 'notification'
  })

  // Afternoon dose (pending)
  logs.push({
    id: `log-today-3`,
    scheduleId: 'sch-4',
    medicineId: 'med-4',
    scheduledDate: todayStr,
    scheduledTime: '13:00',
    status: 'pending'
  })

  // Night doses (pending)
  logs.push({
    id: `log-today-4`,
    scheduleId: 'sch-1',
    medicineId: 'med-1',
    scheduledDate: todayStr,
    scheduledTime: '20:00',
    status: 'pending'
  })

  logs.push({
    id: `log-today-5`,
    scheduleId: 'sch-3',
    medicineId: 'med-3',
    scheduledDate: todayStr,
    scheduledTime: '21:30',
    status: 'pending'
  })

  return logs
}
