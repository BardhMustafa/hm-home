import { UpdatePasswordForm } from "./form";
import { AuthShell } from "@/components/auth/shell";

export const metadata = { title: "Fjalëkalim i ri — HM Home" };

export default function UpdatePasswordPage() {
  return (
    <AuthShell eyebrow="Llogaria" title="Vendos fjalëkalim të ri.">
      <UpdatePasswordForm />
    </AuthShell>
  );
}
