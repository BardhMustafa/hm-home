import Link from "next/link";
import { RegisterForm } from "./form";
import { AuthShell } from "@/components/auth/shell";

export const metadata = { title: "Regjistrohu — HM Home" };

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Llogaria"
      title="Krijo një llogari."
      footer={
        <>
          Ke tashmë llogari?{" "}
          <Link href="/auth/login" style={{ color: "var(--gold)" }}>
            Hyr
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
