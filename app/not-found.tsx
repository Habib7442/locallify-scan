import Link from "next/link";

// Shown for any route that doesn't exist (including pages removed in the UI reset).
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <p className="text-sm font-medium text-primary">Dobara by Locallify</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">This page is being rebuilt</h1>
      <p className="mt-3 max-w-md text-muted-foreground">It&apos;ll be back soon. Meanwhile, head to the home page.</p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Go to home
      </Link>
    </main>
  );
}
