import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/owner/AuthShell";
import { auth as copy } from "@/content/owner";

export default function SignUpPage() {
  return (
    <AuthShell title={copy.signUpTitle} line={copy.signUpLine}>
      <SignUp />
    </AuthShell>
  );
}
