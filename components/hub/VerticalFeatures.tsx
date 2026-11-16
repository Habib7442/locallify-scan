"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  Sparkles,
  Tag,
  BedDouble,
  MessageSquare,
  CheckCircle,
  X,
  Send,
  Image as ImageIcon,
  Copy,
  ChevronRight,
} from "lucide-react";

export type VerticalConfig = {
  // Restaurant
  openTime?: string; // e.g. "09:00"
  closeTime?: string; // e.g. "22:00"
  orderUrl?: string;
  restaurantMsg?: string;

  // Clinic
  doctorPhone?: string; // e.g. "919707370886"
  doctorTitle?: string;
  specialty?: string;

  // Retail
  offerActive?: boolean;
  offerText?: string;
  offerCode?: string;

  // Salon
  galleryImages?: string[];

  // Hotel
  hotelPhone?: string;
  roomTypes?: string[];
};

export function VerticalFeatures({
  vertical,
  config = {},
  accentColor = "#54e0ff",
}: {
  vertical: string | null;
  config?: VerticalConfig;
  accentColor?: string;
}) {
  const [isOpenNow, setIsOpenNow] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<"clinic" | "hotel" | "restaurant_prebook" | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [guests, setGuests] = useState("2");
  const [roomType, setRoomType] = useState("Deluxe Room");

  // Check restaurant hours logic
  useEffect(() => {
    if (vertical === "restaurant" && config.openTime && config.closeTime) {
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();

      const [openH, openM] = config.openTime.split(":").map(Number);
      const [closeH, closeM] = config.closeTime.split(":").map(Number);

      const openMin = openH * 60 + (openM || 0);
      const closeMin = closeH * 60 + (closeM || 0);

      if (closeMin > openMin) {
        setIsOpenNow(currentMin >= openMin && currentMin <= closeMin);
      } else {
        // Overnight hours (e.g. 6 PM to 2 AM)
        setIsOpenNow(currentMin >= openMin || currentMin <= closeMin);
      }
    }
  }, [vertical, config.openTime, config.closeTime]);

  if (!vertical || vertical === "generic") return null;

  // 1. RETAIL OFFER BANNER
  if (vertical === "retail") {
    if (config.offerActive === false) return null;
    const text = config.offerText || "🔥 Today's Special Offer: 15% OFF on all purchases!";
    const code = config.offerCode || "LOCALLIFY15";

    const copyPromo = () => {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    };

    return (
      <div
        className="w-full rounded-2xl p-4 mb-4 border transition-all shadow-lg text-left relative overflow-hidden"
        style={{
          backgroundColor: `${accentColor}12`,
          borderColor: `${accentColor}40`,
        }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="size-4 animate-pulse text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Limited Time Deal</span>
        </div>
        <p className="text-sm font-semibold text-white leading-snug mb-3">{text}</p>

        <div className="flex items-center justify-between gap-2 bg-black/40 rounded-xl p-2 border border-white/10">
          <div className="flex items-center gap-2">
            <Tag className="size-4 text-gray-400" />
            <span className="text-xs font-mono font-bold text-white tracking-widest">{code}</span>
          </div>
          <button
            type="button"
            onClick={copyPromo}
            className="px-3 py-1 rounded-lg text-xs font-bold text-black transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
            style={{ backgroundColor: accentColor }}
          >
            {copiedCode ? <CheckCircle className="size-3.5" /> : <Copy className="size-3.5" />}
            <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. RESTAURANT HOURS-AWARE BUTTON
  if (vertical === "restaurant") {
    const openText = config.openTime ? `Open Today (${config.openTime} - ${config.closeTime || "22:00"})` : "Open Now";
    const targetUrl = config.orderUrl || "#";

    return (
      <div className="w-full mb-4 space-y-2">
        {isOpenNow ? (
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 rounded-2xl font-bold text-sm text-black flex items-center justify-between transition-transform active:scale-[0.98] shadow-lg cursor-pointer"
            style={{ backgroundColor: accentColor }}
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span>Order Online Now</span>
            </div>
            <span className="text-xs opacity-80 font-mono font-semibold">{openText} →</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setShowModal("restaurant_prebook")}
            className="w-full p-4 rounded-2xl font-bold text-sm text-white bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-rose-500"></span>
              <span>Closed Now — Pre-Book Table</span>
            </div>
            <span className="text-xs text-gray-400 font-mono font-normal">View Hours & Pre-Book →</span>
          </button>
        )}

        {/* Pre-book modal */}
        {showModal === "restaurant_prebook" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm text-left">
            <div className="relative w-full max-w-sm rounded-2xl bg-[#1e1e20] border border-white/15 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="size-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">We are currently closed</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="p-1 rounded-full bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Our business hours are <strong>{config.openTime || "10:00 AM"}</strong> to{" "}
                <strong>{config.closeTime || "10:00 PM"}</strong>. Leave a pre-order or reservation message below!
              </p>

              <a
                href={`https://wa.me/${(config.doctorPhone || "919707370886").replace(/\D/g, "")}?text=${encodeURIComponent(
                  "Hello, I would like to pre-book a table / place an order for tomorrow!"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageSquare className="size-4" />
                <span>Pre-Book via WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. CLINIC APPOINTMENT FORM
  if (vertical === "clinic") {
    const doctorPhone = config.doctorPhone || "919707370886";

    const sendAppointment = (e: React.FormEvent) => {
      e.preventDefault();
      const msg = `Hello ${config.doctorTitle || "Doctor"},\nI would like to request an appointment:\n• Name: ${name}\n• Phone: ${phone}\n• Preferred Date: ${date}\n• Preferred Time: ${time}\n• Reason: ${reason || "General Consultation"}`;
      window.open(`https://wa.me/${doctorPhone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
      setShowModal(null);
    };

    return (
      <div className="w-full mb-4">
        <button
          type="button"
          onClick={() => setShowModal("clinic")}
          className="w-full p-4 rounded-2xl font-bold text-sm text-black flex items-center justify-between transition-transform active:scale-[0.98] shadow-lg cursor-pointer"
          style={{ backgroundColor: accentColor }}
        >
          <div className="flex items-center gap-2.5">
            <Calendar className="size-5" />
            <span>Book Appointment</span>
          </div>
          <span className="text-xs font-semibold opacity-80">Instant WhatsApp Booking →</span>
        </button>

        {showModal === "clinic" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm text-left">
            <div className="relative w-full max-w-md rounded-2xl bg-[#1e1e20] border border-white/15 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Book Appointment</h3>
                  <p className="text-xs text-gray-400">{config.doctorTitle || "Dr. Consultation"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="p-1 rounded-full bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={sendAppointment} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#54e0ff]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#54e0ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Preferred Date *</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#54e0ff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Preferred Time *</label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 10:30 AM or Morning slot"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#54e0ff]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Reason for Visit</label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Regular checkup, Fever, Consultation..."
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#54e0ff]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
                >
                  <Send className="size-4" />
                  <span>Send Request to WhatsApp</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. SALON GALLERY
  if (vertical === "salon") {
    const images = config.galleryImages && config.galleryImages.length > 0 ? config.galleryImages : [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop",
    ];

    return (
      <div className="w-full mb-4 text-left">
        <div className="flex items-center gap-2 mb-2">
          <ImageIcon className="size-4 text-pink-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-pink-400">Work &amp; Style Gallery</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {images.map((imgUrl, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/15 bg-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 5. HOTEL ROOM ENQUIRY
  if (vertical === "hotel") {
    const hotelPhone = config.hotelPhone || "919707370886";

    const sendHotelEnquiry = (e: React.FormEvent) => {
      e.preventDefault();
      const msg = `Hello Hotel Desk,\nI would like to enquire about room availability:\n• Guest Name: ${name}\n• Check-in Date: ${date}\n• Guests: ${guests}\n• Room Type: ${roomType}`;
      window.open(`https://wa.me/${hotelPhone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
      setShowModal(null);
    };

    return (
      <div className="w-full mb-4">
        <button
          type="button"
          onClick={() => setShowModal("hotel")}
          className="w-full p-4 rounded-2xl font-bold text-sm text-black flex items-center justify-between transition-transform active:scale-[0.98] shadow-lg cursor-pointer"
          style={{ backgroundColor: accentColor }}
        >
          <div className="flex items-center gap-2.5">
            <BedDouble className="size-5" />
            <span>Enquire Room Availability</span>
          </div>
          <span className="text-xs font-semibold opacity-80">WhatsApp Reservation →</span>
        </button>

        {showModal === "hotel" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm text-left">
            <div className="relative w-full max-w-md rounded-2xl bg-[#1e1e20] border border-white/15 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white">Room Availability Enquiry</h3>
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="p-1 rounded-full bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={sendHotelEnquiry} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Smith"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#54e0ff]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Check-in Date *</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#54e0ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Number of Guests</label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#54e0ff]"
                    >
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4+">4+ Guests</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Preferred Room Type</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#54e0ff]"
                  >
                    <option value="Standard Room">Standard Room</option>
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="Executive Suite">Executive Suite</option>
                    <option value="Family Suite">Family Suite</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
                >
                  <MessageSquare className="size-4" />
                  <span>Send Enquiry via WhatsApp</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
