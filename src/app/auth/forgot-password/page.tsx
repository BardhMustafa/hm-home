import Link from "next/link";
import { ForgotPasswordForm } from "./form";
import { AuthShell } from "@/components/auth/shell";

export const metadata = { title: "Rivendos fjalëkalimin — HM Home" };

type Search = Promise<{ sent?: string }>;

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { sent } = await searchParams;

  return (
    <AuthShell
      eyebrow="Llogaria"
      title="Rivendos fjalëkalimin."
      footer={
        <>
          E mbajte mend?{" "}
          <Link href="/auth/login" style={{ color: "var(--gold)" }}>
            Hyr
          </Link>
        </>
      }
    >
      {sent ? (
        <div
          style={{
            padding: "10px 12px",
            border: "1px solid var(--gold-deep)",
            color: "var(--gold)",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          Nëse ekziston një llogari me këtë email, do të merrni një link për të
          rivendosur fjalëkalimin. Kontrolloni edhe dosjen Spam.
        </div>
      ) : (
        <ForgotPasswordForm />
      )}
    </AuthShell>
  );
}
