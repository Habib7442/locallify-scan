import { TaskChooseOrganization } from "@clerk/nextjs";
import { AuthShell } from "@/components/owner/AuthShell";
import { auth as copy } from "@/content/owner";

// Hosts Clerk's `choose-organization` session task (Membership required).
// New owners create their cafe here; invited staff accept their invite.
export default function CreateCafePage() {
  return (
    <AuthShell title={copy.signUpTitle} line={copy.signUpLine}>
      <TaskChooseOrganization redirectUrlComplete="/onboarding" />
    </AuthShell>
  );
}
