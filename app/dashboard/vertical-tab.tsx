"use client";

import { useState } from "react";
import { Sparkles, Clock, Calendar, Tag, Image as ImageIcon, BedDouble, Save, CheckCircle } from "lucide-react";
import type { VerticalConfig } from "@/components/hub/VerticalFeatures";

export function VerticalTab({
  vertical,
  onVerticalChange,
  config,
  onConfigChange,
}: {
  vertical: string | null;
  onVerticalChange: (v: string) => void;
  config: VerticalConfig;
  onConfigChange: (newConfig: VerticalConfig) => void;
}) {
  const [saved, setSaved] = useState(false);

  const verticalsList = [
    { id: "generic", label: "Generic Profile", icon: Sparkles, desc: "Standard link-in-bio hub" },
    { id: "restaurant", label: "Restaurant / Cafe", icon: Clock, desc: "Hours-aware online ordering & table pre-booking" },
    { id: "clinic", label: "Clinic / Doctor", icon: Calendar, desc: "Direct patient appointment requests via WhatsApp" },
    { id: "retail", label: "Retail Shop", icon: Tag, desc: "Today's special offer announcement banner" },
    { id: "salon", label: "Salon & Spa", icon: ImageIcon, desc: "Work showcase image gallery" },
    { id: "hotel", label: "Hotel & Resort", icon: BedDouble, desc: "Room availability enquiry via WhatsApp" },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h2 className="text-lg font-bold text-white">Business Vertical &amp; Signature Features</h2>
        <p className="text-xs text-[#7a7a83]">Select your vertical to unlock high-converting business tools</p>
      </div>

      {/* Vertical Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {verticalsList.map((v) => {
          const Icon = v.icon;
          const isSelected = (vertical || "generic") === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onVerticalChange(v.id)}
              className={`p-4 rounded-[18px] border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#54e0ff]/10 border-[#54e0ff] text-white shadow-lg"
                  : "bg-white/[0.02] border-[#33373b] hover:border-white/20 text-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${isSelected ? "bg-[#54e0ff] text-black" : "bg-white/10 text-white"}`}>
                  <Icon className="size-5" />
                </div>
                {isSelected && (
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-[#54e0ff]/20 text-[#54e0ff] border border-[#54e0ff]/30">
                    ACTIVE
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-0.5">{v.label}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{v.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Configuration Panel for Active Vertical */}
      {vertical && vertical !== "generic" && (
        <div className="rounded-[20px] border border-white/15 bg-white/[0.02] p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="size-4 text-[#54e0ff]" />
              <span>Configure Signature Feature Settings</span>
            </h3>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-[#54e0ff] text-[#18181a] font-bold text-xs hover:bg-[#29adff] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {saved ? <CheckCircle className="size-4" /> : <Save className="size-4" />}
              <span>{saved ? "Saved!" : "Save Settings"}</span>
            </button>
          </div>

          {/* Restaurant Settings */}
          {vertical === "restaurant" && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Daily Opening Time</label>
                  <input
                    type="time"
                    value={config.openTime || "09:00"}
                    onChange={(e) => onConfigChange({ ...config, openTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#54e0ff]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Daily Closing Time</label>
                  <input
                    type="time"
                    value={config.closeTime || "22:00"}
                    onChange={(e) => onConfigChange({ ...config, closeTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#54e0ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Online Ordering Link (Swiggy, Zomato, or Direct)</label>
                <input
                  type="url"
                  value={config.orderUrl || ""}
                  onChange={(e) => onConfigChange({ ...config, orderUrl: e.target.value })}
                  placeholder="https://order.myrestaurant.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#54e0ff]"
                />
              </div>
            </div>
          )}

          {/* Clinic Settings */}
          {vertical === "clinic" && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Doctor / Clinic Title</label>
                  <input
                    type="text"
                    value={config.doctorTitle || "Dr. Alex Smith — Dental Specialist"}
                    onChange={(e) => onConfigChange({ ...config, doctorTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#54e0ff]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Appointment WhatsApp Number</label>
                  <input
                    type="tel"
                    value={config.doctorPhone || ""}
                    onChange={(e) => onConfigChange({ ...config, doctorPhone: e.target.value })}
                    placeholder="e.g. 919707370886"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#54e0ff]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Retail Settings */}
          {vertical === "retail" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="offerToggle"
                  checked={config.offerActive !== false}
                  onChange={(e) => onConfigChange({ ...config, offerActive: e.target.checked })}
                  className="size-4 accent-[#54e0ff] rounded cursor-pointer"
                />
                <label htmlFor="offerToggle" className="text-sm font-semibold text-white cursor-pointer">
                  Display Today's Special Offer Banner on Hub
                </label>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Offer Announcement Text</label>
                <input
                  type="text"
                  value={config.offerText || "🔥 Today's Special Offer: 15% OFF on all items!"}
                  onChange={(e) => onConfigChange({ ...config, offerText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#54e0ff]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Promo Code</label>
                <input
                  type="text"
                  value={config.offerCode || "SAVE15"}
                  onChange={(e) => onConfigChange({ ...config, offerCode: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#54e0ff]"
                />
              </div>
            </div>
          )}

          {/* Salon Settings */}
          {vertical === "salon" && (
            <div className="space-y-4 text-xs">
              <label className="block text-gray-300 font-medium mb-1">Gallery Image URLs (one per line)</label>
              <textarea
                rows={4}
                value={(config.galleryImages || []).join("\n")}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    galleryImages: e.target.value.split("\n").filter((url) => url.trim().length > 0),
                  })
                }
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#54e0ff]"
              />
            </div>
          )}

          {/* Hotel Settings */}
          {vertical === "hotel" && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Reservation Desk WhatsApp Number</label>
                <input
                  type="tel"
                  value={config.hotelPhone || ""}
                  onChange={(e) => onConfigChange({ ...config, hotelPhone: e.target.value })}
                  placeholder="e.g. 919707370886"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#54e0ff]"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
