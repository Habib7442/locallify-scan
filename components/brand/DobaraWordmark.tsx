import { Repeat2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { mark: string; icon: string; name: string; by: string }> = {
  sm: { mark: "size-6 rounded-[7px]", icon: "size-3.5", name: "text-[15px]", by: "text-[10px]" },
  md: { mark: "size-8 sm:size-9 rounded-[10px]", icon: "size-4 sm:size-5", name: "text-[17px] sm:text-[19px]", by: "text-[10px] sm:text-[11px]" },
  lg: { mark: "size-11 rounded-[13px]", icon: "size-6", name: "text-[26px]", by: "text-[12px]" },
};

/**
 * Dobara brand lockup: mark + "Dobara" + small "by Locallify".
 * Brand rule (PRODUCT.md): Dobara always carries "by Locallify" in small text.
 */
export function DobaraWordmark({ size = "md", className }: { size?: Size; className?: string }) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className={cn(
          "inline-flex shrink-0 items-center justify-center bg-gradient-to-br from-[#54e0ff] to-[#29adff] text-[#18181a] shadow-[0_6px_16px_rgba(84,224,255,0.25)]",
          s.mark,
        )}
      >
        <Repeat2 className={cn("stroke-[2.5]", s.icon)} />
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn("font-semibold tracking-[-0.03em] text-white", s.name)}>Dobara</span>
        <span className={cn("mt-1 font-light tracking-[0.02em] text-[#7a7a83]", s.by)}>by Locallify</span>
      </span>
    </span>
  );
}
