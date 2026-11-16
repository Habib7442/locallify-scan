import { scanMessages } from "@/messages/scan";

export default function ScanNotFound() {
  const t = scanMessages();
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-[#18181a] px-6 text-center text-white">
      <h1 className="text-[24px] font-semibold tracking-[-0.03em]">{t.notFoundTitle}</h1>
      <p className="mt-2 max-w-[32ch] text-[16px] text-[#9a9aa3]">{t.notFoundLine}</p>
      <p className="mt-8 text-[13px] text-[#8b8b94]">{t.poweredBy}</p>
    </main>
  );
}
