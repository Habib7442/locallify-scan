"use client";

import dynamic from "next/dynamic";

// The board reads per-device preferences (started / sound) from localStorage
// on first render, so it renders on the client only — no hydration mismatch.
export const BoardClient = dynamic(() => import("./LiveBoard").then((m) => m.LiveBoard), {
  ssr: false,
  loading: () => <div className="min-h-[60vh]" aria-busy="true" />,
});
