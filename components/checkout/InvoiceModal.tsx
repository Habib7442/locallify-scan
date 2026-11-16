"use client";

import { X, Printer, CheckCircle, Package, ExternalLink } from "lucide-react";

export type InvoiceData = {
  invoiceNo: string;
  date: string;
  paymentRef: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gstin?: string;
  };
  items: Array<{
    name: string;
    qty: number;
    unitPrice: number;
  }>;
  shippingFee: number;
  gstAmount: number;
  totalAmount: number;
  isSilchar?: boolean;
  razorpayInvoiceUrl?: string;
};

type InvoiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData;
};

export function InvoiceModal({ isOpen, onClose, invoice }: InvoiceModalProps) {
  if (!isOpen || !invoice) return null;

  const baseSubtotal = invoice.items.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          html, body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          /* Hide non-printable elements */
          header, main, footer, nav, button, .print\\:hidden {
            display: none !important;
          }
          /* Reset modal backdrop during print */
          .fixed.inset-0 {
            position: static !important;
            background: #ffffff !important;
            padding: 0 !important;
            overflow: visible !important;
            display: block !important;
          }
          .relative.max-h-\\[92vh\\] {
            max-height: none !important;
            overflow: visible !important;
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          #invoice-printable-wrapper {
            background-color: #ffffff !important;
            color: #000000 !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
          }
          #invoice-printable-wrapper * {
            color: #000000 !important;
            background-color: transparent !important;
            border-color: #d1d5db !important;
          }
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto print:bg-white print:p-0 print:static">
        <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[24px] bg-[#1e1e20] border border-white/15 p-5 sm:p-6 shadow-2xl text-left my-auto print:max-h-none print:border-none print:shadow-none print:bg-white print:p-0">
          
          {/* Controls Bar (Hidden during print) */}
          <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-white/10 print:hidden">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center size-8 rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle className="size-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">Tax Invoice &amp; Order Receipt</h3>
                <p className="text-xs text-[#7a7a83]">Official GST Invoice</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {invoice.razorpayInvoiceUrl && (
                <a
                  href={invoice.razorpayInvoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#54e0ff] text-[#18181a] font-bold text-xs hover:bg-[#29adff] transition-colors cursor-pointer shadow-md"
                >
                  <ExternalLink className="size-3.5" />
                  <span>Razorpay Hosted Invoice ↗</span>
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Container */}
          <div
            id="invoice-printable-wrapper"
            className="bg-[#18181a] border border-white/10 rounded-[20px] p-6 sm:p-8 text-gray-200 print:bg-white print:text-black print:border-none print:p-0"
          >
            
            {/* Header & Locallify Business Details */}
            <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-white/10 print:border-gray-300">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-bold text-white print:text-black">Locallify Scan</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#54e0ff]/10 text-[#54e0ff] border border-[#54e0ff]/20 font-mono uppercase print:border-gray-400 print:text-black">
                    TAX INVOICE
                  </span>
                </div>
                <div className="text-xs text-gray-400 print:text-gray-700 leading-relaxed">
                  <p className="font-semibold text-gray-300 print:text-black">Locallify Digital Solutions</p>
                  <p>Silchar, Cachar, Assam — 788001</p>
                  {process.env.NEXT_PUBLIC_LOCALLIFY_GSTIN && (
                    <p className="font-mono text-emerald-400 print:text-black font-semibold mt-0.5">
                      GSTIN: {process.env.NEXT_PUBLIC_LOCALLIFY_GSTIN}
                    </p>
                  )}
                  <p>Email: support@locallifyagency.com</p>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs space-y-1">
                <p className="font-mono text-sm text-white print:text-black font-bold">
                  Invoice No: <span className="text-[#54e0ff] print:text-black">{invoice.invoiceNo}</span>
                </p>
                <p className="text-gray-400 print:text-gray-700">Date: {invoice.date}</p>
                <p className="text-gray-400 print:text-gray-700">
                  Payment Ref: <span className="font-mono text-gray-300 print:text-black">{invoice.paymentRef}</span>
                </p>
                <p className="text-emerald-400 font-semibold print:text-emerald-800">Status: PAID ✓</p>
              </div>
            </div>

            {/* Customer Billed & Shipped To */}
            <div className="py-5 border-b border-white/10 print:border-gray-300">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 print:text-gray-600">
                Billed &amp; Shipped To:
              </h4>
              <div className="text-sm font-medium text-white print:text-black leading-relaxed">
                <p className="font-bold text-base">{invoice.shippingAddress.fullName}</p>
                <p className="text-gray-300 print:text-gray-800">{invoice.shippingAddress.address}</p>
                <p className="text-gray-300 print:text-gray-800">
                  {invoice.shippingAddress.city}, {invoice.shippingAddress.state} — {invoice.shippingAddress.pincode}
                </p>
                <p className="text-xs text-gray-400 print:text-gray-700 mt-0.5">Phone: {invoice.shippingAddress.phone}</p>
                {invoice.shippingAddress.gstin && (
                  <p className="text-xs font-mono text-[#54e0ff] print:text-black font-semibold mt-0.5">
                    Buyer GSTIN: {invoice.shippingAddress.gstin}
                  </p>
                )}
              </div>
            </div>

            {/* Itemized Table */}
            <div className="py-5 border-b border-white/10 print:border-gray-300">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider print:border-gray-300 print:text-gray-700">
                    <th className="pb-2 font-semibold">Item Description</th>
                    <th className="pb-2 font-semibold text-center">Qty</th>
                    <th className="pb-2 font-semibold text-right">Unit Price</th>
                    <th className="pb-2 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-gray-200">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="text-sm">
                      <td className="py-2.5 font-medium text-white print:text-black flex items-center gap-2">
                        <Package className="size-4 text-[#54e0ff] print:hidden shrink-0" />
                        <span>{item.name}</span>
                      </td>
                      <td className="py-2.5 text-center text-gray-300 print:text-black font-mono">{item.qty}</td>
                      <td className="py-2.5 text-right text-gray-300 print:text-black font-mono">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-bold text-white print:text-black font-mono">
                        ₹{(item.qty * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="pt-5 flex justify-end">
              <div className="w-full max-w-xs space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-400 print:text-gray-700">
                  <span>Items Subtotal</span>
                  <span className="font-mono text-white print:text-black">₹{baseSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400 print:text-gray-700">
                  <span>Shipping &amp; Delivery</span>
                  <span className={`font-mono ${invoice.isSilchar ? "text-emerald-400 font-bold print:text-black" : "text-white print:text-black"}`}>
                    {invoice.isSilchar ? "FREE (Silchar)" : `₹${invoice.shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400 print:text-gray-700">
                  <span>GST (18%)</span>
                  <span className="font-mono text-white print:text-black">₹{invoice.gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 print:border-gray-300 pt-2 font-bold text-base text-white print:text-black">
                  <span>Total Amount Paid</span>
                  <span className="text-[#54e0ff] print:text-black font-mono">₹{invoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-6 pt-4 border-t border-white/10 print:border-gray-300 text-center text-[11px] text-gray-500 print:text-gray-600">
              Thank you for ordering with Locallify Scan! Computer-generated Tax Invoice. Support: support@locallifyagency.com
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
