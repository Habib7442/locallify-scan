"use client";

import { useState } from "react";
import { Package, Clock, CheckCircle2, Truck, FileText, ChevronRight } from "lucide-react";
import { InvoiceModal, type InvoiceData } from "@/components/checkout/InvoiceModal";

export type OrderRecord = {
  id: string;
  page_id: string;
  owner_clerk_id: string;
  status: "pending" | "printed" | "shipped" | "cancelled";
  shipping_address: string | Record<string, unknown>;
  price: number;
  currency: string;
  payment_reference: string;
  created_at: string;
  shipped_at: string | null;
};

export function OrdersTab({ orders }: { orders: OrderRecord[] }) {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);

  function parseShipping(raw: string | Record<string, unknown>) {
    if (typeof raw === "object" && raw !== null) return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return { fullName: "Customer", address: String(raw), phone: "", city: "", state: "", pincode: "" };
    }
  }

  function openInvoice(order: OrderRecord) {
    const parsed = parseShipping(order.shipping_address);

    const dateFormatted = new Date(order.created_at).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const isSilchar = parsed.city && String(parsed.city).toLowerCase().includes("silchar");

    // Items reconstruction
    const items = parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0
      ? parsed.items
      : [{ name: parsed.productType === "sticker" ? "Waterproof Vinyl Sticker" : "Acrylic Desktop Stand", qty: 1, unitPrice: parsed.productType === "sticker" ? 299 : 499 }];

    const baseSubtotal = items.reduce((acc: number, item: { qty: number; unitPrice: number; name?: string }) => {
      const price = item.unitPrice || (item.name?.includes("Sticker") ? 299 : 499);
      return acc + (item.qty || 1) * price;
    }, 0);

    const shippingFee = isSilchar ? 0 : 50;
    const gstAmount = Math.round((baseSubtotal + shippingFee) * 0.18 * 100) / 100;

    const invoiceObj: InvoiceData = {
      invoiceNo: `INV-${order.id.substring(0, 8).toUpperCase()}`,
      date: dateFormatted,
      paymentRef: order.payment_reference || "N/A",
      shippingAddress: {
        fullName: parsed.fullName || "Customer",
        phone: parsed.phone || "",
        address: parsed.address || "",
        city: parsed.city || "",
        state: parsed.state || "",
        pincode: parsed.pincode || "",
      },
      items,
      shippingFee,
      gstAmount: Math.max(0, gstAmount),
      totalAmount: Number(order.price),
      isSilchar,
      razorpayInvoiceUrl: parsed.razorpay_invoice_url || undefined,
    };

    setSelectedInvoice(invoiceObj);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Your Orders</h2>
          <p className="text-xs text-[#7a7a83]">Track physical QR print orders &amp; download tax invoices</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[18px] border border-dashed border-[#33373b] p-10 flex flex-col items-center text-center gap-3 bg-white/[0.01]">
          <div className="w-12 h-12 rounded-full bg-[#54e0ff]/10 border border-[#54e0ff]/20 flex items-center justify-center text-[#54e0ff]">
            <Package className="size-6" />
          </div>
          <p className="text-sm font-semibold text-white">No physical QR orders yet</p>
          <p className="text-xs text-[#7a7a83] max-w-sm">
            Order printed acrylic table stands or vinyl stickers from the <strong>Share &amp; QR</strong> tab and they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const parsed = parseShipping(order.shipping_address);
            const dateStr = new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={order.id}
                className="rounded-[18px] border border-[#33373b] bg-white/[0.02] p-5 flex flex-col gap-4 transition-colors hover:border-[#454951]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#54e0ff] font-bold">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </span>
                    <span className="text-xs text-[#7a7a83]">({dateStr})</span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {order.status === "pending" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                        <Clock className="size-3.5" />
                        Pending Fulfillment
                      </span>
                    )}
                    {order.status === "printed" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                        <CheckCircle2 className="size-3.5" />
                        Printed &amp; Packed
                      </span>
                    )}
                    {order.status === "shipped" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                        <Truck className="size-3.5" />
                        Shipped &amp; Out for Delivery
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Shipping Address:</p>
                    <p className="text-sm font-semibold text-white">{parsed.fullName || "Customer"}</p>
                    <p className="text-xs text-[#a1a1aa] leading-relaxed">
                      {parsed.address}, {parsed.city}, {parsed.state} - {parsed.pincode}
                    </p>
                    <p className="text-xs text-[#7a7a83]">Ref: {order.payment_reference}</p>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                    <span className="text-lg font-bold text-white font-mono">₹{Number(order.price).toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => openInvoice(order)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      <FileText className="size-3.5 text-[#54e0ff]" />
                      <span>View Invoice</span>
                      <ChevronRight className="size-3.5 text-[#7a7a83]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedInvoice && (
        <InvoiceModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          invoice={selectedInvoice}
        />
      )}
    </div>
  );
}
