import Link from "next/link";
import { LoginForm } from "./form";
import { AuthShell } from "@/components/auth/shell";

export const metadata = { title: "Hyr — HM Home" };

type Search = Promise<{ next?: string; registered?: string; reset?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { next, registered, reset } = await searchParams;

  return (
    <AuthShell
      eyebrow="Llogaria"
      title="Mirë se erdhët."
      footer={
        <>
          Ende pa llogari?{" "}
          <Link href="/auth/register" style={{ color: "var(--gold)" }}>
            Krijo një
          </Link>
        </>
      }
    >
      {registered && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 12px",
            border: "1px solid var(--gold-deep)",
            color: "var(--gold)",
            fontSize: 13,
          }}
        >
          Llogaria u krijua. Kontrollo email-in për konfirmim, pastaj hyr.
        </div>
      )}
      {reset && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 12px",
            border: "1px solid var(--gold-deep)",
            color: "var(--gold)",
            fontSize: 13,
          }}
        >
          Fjalëkalimi u ndryshua. Hyr me fjalëkalimin e ri.
        </div>
      )}
      <LoginForm next={next ?? "/account"} />
    </AuthShell>
  );
}
