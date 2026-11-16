import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/owner/AuthShell";
import { auth as copy } from "@/content/owner";

export default function SignInPage() {
  return (
    <AuthShell title={copy.signInTitle} line={copy.signInLine}>
      <SignIn />
    </AuthShell>
  );
}
