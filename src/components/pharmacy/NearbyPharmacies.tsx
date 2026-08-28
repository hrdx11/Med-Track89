import React, { useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { useMediTrack } from '../../context/MediTrackContext'
import { PharmacyShop } from '../../types'
import {
  MapPin,
  PhoneCall,
  Navigation,
  MessageSquare,
  Clock,
  Star,
  CheckCircle2,
  Package,
  ShoppingBag,
  Sparkles,
  Search,
  ExternalLink,
  Percent,
  Truck,
  RotateCcw
} from 'lucide-react'
import { Modal } from '../ui/Modal'

export const NearbyPharmacies: React.FC = () => {
  const { pharmacies, medicines, medicalId } = useMediTrack()

  const [searchQuery, setSearchQuery] = useState('')
  const [filter24Hours, setFilter24Hours] = useState(false)
  const [selectedPharmacyForOrder, setSelectedPharmacyForOrder] = useState<PharmacyShop | null>(null)
  const [selectedMedsToOrder, setSelectedMedsToOrder] = useState<string[]>(
    medicines.filter(m => (m.remainingQuantity ?? 0) <= (m.lowStockThreshold ?? 7)).map(m => m.id)
  )

  const filteredPharmacies = pharmacies.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matches24 = !filter24Hours || p.isOpen24Hours
    return matchesSearch && matches24
  })

  const handleOpenOrderModal = (pharmacy: PharmacyShop) => {
    setSelectedPharmacyForOrder(pharmacy)
  }

  const handleSendWhatsAppOrder = () => {
    if (!selectedPharmacyForOrder) return

    const orderItems = medicines
      .filter(m => selectedMedsToOrder.includes(m.id))
      .map(m => `• ${m.name} (${m.dosageAmount} ${m.dosageUnit}) - 1 Box`)
      .join('\n')

    const message = `👋 Hello ${selectedPharmacyForOrder.name},
I would like to place an urgent home delivery prescription order:

*Patient Name:* ${medicalId.patientName}
*Delivery Address:* ${medicalId.homeAddress}
*Phone:* ${medicalId.primaryDoctorPhone || '+91 98100 12345'}

*Prescription Medicines Needed:*
${orderItems || '• Metformin Hydrochloride 500mg - 1 Strip\n• Lisinopril 10mg - 1 Strip'}

Please confirm availability and dispatch time. Thank you!`

    const phone = selectedPharmacyForOrder.whatsapp.replace(/[^0-9]/g, '')
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
    setSelectedPharmacyForOrder(null)
  }

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>Location: Civil Lines, Delhi NCR (Detected)</span>
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-teal-600" />
            <span>Nearby 24/7 Pharmacies & Medical Stores</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Locate open chemist shops, check distance, get directions, and order prescription refills in 1-tap.
          </p>
        </div>
      </div>

      {/* Search & Quick Filter Chips */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search chemist name, area, or address..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter24Hours(!filter24Hours)}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              filter24Hours
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Open 24/7 Only</span>
          </button>
        </div>
      </div>

      {/* Pharmacies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPharmacies.map(pharmacy => (
          <GlassCard
            key={pharmacy.id}
            className="flex flex-col justify-between hover:border-teal-500/40 transition-all shadow-md group"
          >
            <div className="space-y-3">
              {/* Header: Name, Rating, Open Status */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 font-mono">
                      {pharmacy.brand}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      {pharmacy.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-800 dark:text-amber-300 shrink-0">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{pharmacy.rating}</span>
                    <span className="text-[10px] text-slate-400">({pharmacy.reviewCount})</span>
                  </div>
                </div>

                {/* Distance & Status tags */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-800 dark:text-teal-300 text-xs font-bold">
                    <Navigation className="w-3 h-3" />
                    <span>{pharmacy.distanceKm} ({pharmacy.walkTimeMinutes} min walk)</span>
                  </span>

                  {pharmacy.isOpen24Hours ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                      <Clock className="w-3 h-3" />
                      <span>Open 24/7</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                      <span>{pharmacy.openStatus}</span>
                    </span>
                  )}

                  {pharmacy.hasHomeDelivery && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-800 dark:text-sky-300 text-xs font-bold">
                      <Truck className="w-3 h-3" />
                      <span>{pharmacy.deliveryTimeMins} min delivery</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Address details */}
              <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{pharmacy.address}</span>
              </div>

              {/* Special Offer */}
              {pharmacy.discountOffer && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Percent className="w-3.5 h-3.5" />
                  <span>{pharmacy.discountOffer}</span>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 grid grid-cols-3 gap-2">
              {/* Call Chemist */}
              <a
                href={`tel:${pharmacy.phone}`}
                className="py-2.5 px-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-1 hover:opacity-90 transition-opacity cursor-pointer text-center"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Store</span>
              </a>

              {/* Google Maps Directions */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy.name + ' ' + pharmacy.address)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer text-center"
              >
                <Navigation className="w-3.5 h-3.5 text-teal-600" />
                <span>Directions</span>
              </a>

              {/* 1-Click Order Refill on WhatsApp */}
              <button
                onClick={() => handleOpenOrderModal(pharmacy)}
                className="py-2.5 px-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer text-center"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Order Refill</span>
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Refill Purchase & WhatsApp Order Modal */}
      <Modal
        isOpen={!!selectedPharmacyForOrder}
        onClose={() => setSelectedPharmacyForOrder(null)}
        title={`Order Refill from ${selectedPharmacyForOrder?.name}`}
        description="Select the medicines you need to purchase. We will generate a direct WhatsApp prescription order."
        maxWidth="lg"
      >
        <div className="space-y-4 text-left">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Select Medications to Order:
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {medicines.map(med => {
                const isSelected = selectedMedsToOrder.includes(med.id)
                return (
                  <div
                    key={med.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedMedsToOrder(selectedMedsToOrder.filter(id => id !== med.id))
                      } else {
                        setSelectedMedsToOrder([...selectedMedsToOrder, med.id])
                      }
                    }}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500/10 text-teal-900 dark:text-teal-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by parent div click
                        className="w-4 h-4 text-teal-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-sm block">{med.name}</span>
                        <span className="text-slate-500 font-mono">
                          {med.dosageAmount} {med.dosageUnit} • ({med.remainingQuantity ?? 0} pills remaining)
                        </span>
                      </div>
                    </div>

                    <span className="font-bold text-xs text-teal-700 dark:text-teal-300">
                      1 Bottle / Strip
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Delivery Address Review */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Delivery to Home Address:
            </span>
            <p className="text-slate-600 dark:text-slate-400">{medicalId.homeAddress}</p>
          </div>

          {/* Footer CTA */}
          <div className="pt-2 flex justify-end gap-2.5">
            <button
              onClick={() => setSelectedPharmacyForOrder(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSendWhatsAppOrder}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Order on WhatsApp</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
