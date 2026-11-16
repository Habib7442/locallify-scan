"use client";

import { useState } from "react";
import Image from "next/image";
import { X, CheckCircle, ShieldCheck, Loader2, Package, Plus, Minus, FileText } from "lucide-react";
import { InvoiceModal, type InvoiceData } from "./InvoiceModal";

type OrderPrintedQrModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pageId?: string;
  slug: string;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export function OrderPrintedQrModal({
  isOpen,
  onClose,
  pageId,
  slug,
}: OrderPrintedQrModalProps) {
  const [standQty, setStandQty] = useState(1);
  const [stickerQty, setStickerQty] = useState(0);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [stateName, setStateName] = useState("");
  const [gstin, setGstin] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [completedInvoice, setCompletedInvoice] = useState<InvoiceData | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  if (!isOpen) return null;

  const totalBasePrice = standQty * 499 + stickerQty * 299;
  const isSilchar = city.trim().toLowerCase().includes("silchar") || pincode.trim().startsWith("788");
  const shippingFee = totalBasePrice > 0 ? (isSilchar ? 0 : 50) : 0;
  const subtotal = totalBasePrice + shippingFee;
  const gstAmount = Math.round(subtotal * 0.18 * 100) / 100;
  const totalAmount = subtotal + gstAmount;

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (standQty <= 0 && stickerQty <= 0) {
      setErrorMsg("Please select at least 1 item to proceed.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMsg("Failed to load Razorpay payment SDK. Please check your network.");
        setLoading(false);
        return;
      }

      // Selected items payload
      const selectedItems: Array<{ name: string; qty: number; unitPrice: number }> = [];
      if (standQty > 0) {
        selectedItems.push({ name: "Acrylic Desktop Stand", qty: standQty, unitPrice: 499 });
      }
      if (stickerQty > 0) {
        selectedItems.push({ name: "Waterproof Vinyl Sticker", qty: stickerQty, unitPrice: 299 });
      }

      // Step 1: Create Official Razorpay Invoice & Order on Server
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "printed_qr_bundle",
          baseAmount: totalBasePrice,
          city,
          fullName,
          phone,
          gstin,
          slug,
          items: selectedItems,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.order_id) {
        setErrorMsg(orderData.error || "Failed to create order.");
        setLoading(false);
        return;
      }

      // Step 2: Open Razorpay Standard Checkout Modal
      const options = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Locallify Scan",
        description: `Printed QR Bundle (${standQty} Stands, ${stickerQty} Stickers) - ${slug}`,
        image: `${window.location.origin}/logo-icon.png`,
        order_id: orderData.order_id,
        prefill: {
          name: fullName,
          contact: phone,
        },
        theme: {
          color: "#54E0FF",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async function (response: any) {
          try {
            // Step 3: Verify Payment Signature on Server
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id || orderData.order_id,
                razorpay_invoice_id: response.razorpay_invoice_id || orderData.invoice_id,
                razorpay_invoice_status: response.razorpay_invoice_status,
                razorpay_signature: response.razorpay_signature,
                client_order_id: orderData.order_id,
                page_id: pageId,
                amount: totalAmount,
                shipping_address: {
                  fullName,
                  phone,
                  address,
                  city,
                  state: stateName,
                  pincode,
                  items: selectedItems,
                  razorpay_invoice_url: orderData.invoice_url,
                },
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              const invoiceObj: InvoiceData = {
                invoiceNo: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
                date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                paymentRef: response.razorpay_payment_id,
                shippingAddress: {
                  fullName,
                  phone,
                  address,
                  city,
                  state: stateName,
                  pincode,
                  gstin: gstin.trim() || undefined,
                },
                items: selectedItems,
                shippingFee,
                gstAmount,
                totalAmount,
                isSilchar,
                razorpayInvoiceUrl: orderData.invoice_url,
              };
              setCompletedInvoice(invoiceObj);
              setIsInvoiceOpen(true);
            } else {
              setErrorMsg(verifyData.error || "Payment signature verification failed.");
            }
          } catch (err) {
            console.error(err);
            setErrorMsg("Error verifying payment signature.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpayObj = new window.Razorpay(options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      razorpayObj.on("payment.failed", function (response: any) {
        setErrorMsg(response.error?.description || "Payment failed.");
        setLoading(false);
      });

      razorpayObj.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment error occurred";
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
        <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[24px] bg-[#1e1e20] border border-white/15 p-5 sm:p-6 shadow-2xl text-left my-auto custom-scrollbar">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>

          {completedInvoice ? (
            <div className="py-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
                <CheckCircle className="size-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h3>
              <p className="text-sm text-gray-300 max-w-sm mb-6 leading-relaxed">
                Your physical QR code order has been placed successfully. Habib will print and ship it to your address shortly!
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => setIsInvoiceOpen(true)}
                  className="w-full px-5 py-3 rounded-xl bg-[#54e0ff] text-[#18181a] font-bold text-sm hover:bg-[#29adff] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <FileText className="size-4" />
                  <span>View Tax Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full px-5 py-3 rounded-xl bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3.5 mb-4 pr-8">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-white/20 shrink-0 shadow-md">
                  <Image
                    src="/qr_acrylic_stand.png"
                    alt="Printed QR Code"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">Order Printed QR Code</h3>
                  <p className="text-xs text-[#7a7a83]">Shipped to your doorstep with express delivery</p>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handlePayment} className="space-y-4">
                {/* Product Selection with Quantity Controls */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Select Items &amp; Quantity
                  </label>

                  <div className="space-y-2.5">
                    {/* Item 1: Acrylic Desktop Stand */}
                    <div className="p-3.5 rounded-2xl border border-[#33373b] bg-[#18181a] flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold block text-white">Acrylic Desktop Stand</span>
                        <span className="text-[11px] text-[#a1a1aa] block">Clear tabletop standee • ₹499/pc</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 bg-black/40 p-1.5 rounded-xl border border-white/10">
                        <button
                          type="button"
                          onClick={() => setStandQty((q) => Math.max(0, q - 1))}
                          className="size-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white font-mono">{standQty}</span>
                        <button
                          type="button"
                          onClick={() => setStandQty((q) => q + 1)}
                          className="size-7 rounded-lg bg-[#54e0ff]/20 hover:bg-[#54e0ff]/30 text-[#54e0ff] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Item 2: Waterproof Vinyl Sticker */}
                    <div className="p-3.5 rounded-2xl border border-[#33373b] bg-[#18181a] flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold block text-white">Waterproof Vinyl Sticker</span>
                        <span className="text-[11px] text-[#a1a1aa] block">Adhesive decal for glass/tables • ₹299/pc</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 bg-black/40 p-1.5 rounded-xl border border-white/10">
                        <button
                          type="button"
                          onClick={() => setStickerQty((q) => Math.max(0, q - 1))}
                          className="size-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white font-mono">{stickerQty}</span>
                        <button
                          type="button"
                          onClick={() => setStickerQty((q) => q + 1)}
                          className="size-7 rounded-lg bg-[#54e0ff]/20 hover:bg-[#54e0ff]/30 text-[#54e0ff] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="space-y-3 pt-1">
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Shipping Address
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full rounded-[10px] bg-[#18181a] border border-[#33373b] px-3 py-2 text-xs text-white focus:border-[#54e0ff] outline-none"
                    />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="w-full rounded-[10px] bg-[#18181a] border border-[#33373b] px-3 py-2 text-xs text-white focus:border-[#54e0ff] outline-none"
                    />
                  </div>

                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street Address / Shop Name"
                    className="w-full rounded-[10px] bg-[#18181a] border border-[#33373b] px-3 py-2 text-xs text-white focus:border-[#54e0ff] outline-none"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full rounded-[10px] bg-[#18181a] border border-[#33373b] px-3 py-2 text-xs text-white focus:border-[#54e0ff] outline-none"
                    />
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="State"
                      className="w-full rounded-[10px] bg-[#18181a] border border-[#33373b] px-3 py-2 text-xs text-white focus:border-[#54e0ff] outline-none"
                    />
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Pincode"
                      className="w-full rounded-[10px] bg-[#18181a] border border-[#33373b] px-3 py-2 text-xs text-white focus:border-[#54e0ff] outline-none"
                    />
                  </div>

                  <input
                    type="text"
                    maxLength={15}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="GSTIN Number (Optional — for Business Tax Credit)"
                    className="w-full rounded-[10px] bg-[#18181a] border border-[#33373b] px-3 py-2 text-xs text-white focus:border-[#54e0ff] outline-none font-mono uppercase"
                  />
                </div>

                {/* Price Breakdown with 18% GST & Dynamic Shipping */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="text-white font-mono">₹{totalBasePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>
                      {isSilchar ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          🚚 Silchar Local Delivery
                        </span>
                      ) : (
                        "Pan-India Courier Shipping"
                      )}
                    </span>
                    <span className={`font-mono ${isSilchar ? "text-emerald-400 font-bold" : "text-white"}`}>
                      {isSilchar ? "FREE (₹0.00)" : `₹${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span className="text-white font-mono">₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold text-sm text-white">
                    <span>Total Amount</span>
                    <span className="text-[#54e0ff] font-mono">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || totalBasePrice <= 0}
                  className="w-full py-3.5 rounded-2xl bg-white hover:bg-gray-100 text-[#18181a] font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Package className="size-4 text-[#18181a]" />
                      <span>Pay ₹{totalAmount.toFixed(2)} with Razorpay</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 text-[11px] text-[#7a7a83] pt-1">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="size-3.5 text-[#54e0ff]" />
                    Secure 256-bit SSL
                  </span>
                  <span>•</span>
                  <span>Express Doorstep Delivery</span>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {completedInvoice && (
        <InvoiceModal
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
          invoice={completedInvoice}
        />
      )}
    </>
  );
}
