import "server-only";
import { Resend } from "resend";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

// Lazy singleton — only constructed if a key is configured, so the app runs
// fine locally / in CI without Resend set up.
let client: Resend | null = null;
function resend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  client ??= new Resend(key);
  return client;
}

const FROM = process.env.ORDER_FROM_EMAIL ?? `${SITE_NAME} <onboarding@resend.dev>`;
const ALERT_TO = process.env.ORDER_ALERT_EMAIL;

export type OrderEmailLine = {
  name: string;
  quantity: number;
  line_total: number;
};

export type OrderEmailData = {
  orderId: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  notes?: string | null;
  lines: OrderEmailLine[];
  total: number;
};

const money = (n: number) => `${n.toFixed(2)} €`;
const esc = (s: string) =>
  s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!);

function itemsTable(lines: OrderEmailLine[]): string {
  const rows = lines
    .map(
      (l) =>
        `<tr>
          <td style="padding:6px 0;border-bottom:1px solid #eee">${esc(l.name)} × ${l.quantity}</td>
          <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right">${money(l.line_total)}</td>
        </tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>`;
}

// Sends the owner alert + the customer confirmation. Best-effort: any failure
// is logged and swallowed so a flaky mail provider never fails an order. Skips
// silently if Resend isn't configured.
export async function sendOrderEmails(d: OrderEmailData): Promise<void> {
  const r = resend();
  if (!r) return;

  const shortId = d.orderId.slice(0, 8);
  const orderUrl = `${SITE_URL}/checkout/success/${d.orderId}`;
  const addressBlock = `${esc(d.address)}, ${esc(d.city)}, ${esc(d.country)}`;

  // 1) Owner alert — so the store knows to phone the customer.
  if (ALERT_TO) {
    try {
      await r.emails.send({
        from: FROM,
        to: ALERT_TO,
        replyTo: d.email,
        subject: `Porosi e re #${shortId} — ${money(d.total)}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:560px;color:#1a1a1a">
            <h2 style="margin:0 0 4px">Porosi e re #${shortId}</h2>
            <p style="margin:0 0 16px;color:#666">Kontaktoni klientin për të konfirmuar pagesën dhe dorëzimin.</p>
            <p style="margin:0 0 4px"><strong>Klienti:</strong> ${esc(d.fullName)}</p>
            <p style="margin:0 0 4px"><strong>Telefon:</strong> <a href="tel:${esc(d.phone)}">${esc(d.phone)}</a></p>
            <p style="margin:0 0 4px"><strong>Email:</strong> ${esc(d.email)}</p>
            <p style="margin:0 0 16px"><strong>Adresa:</strong> ${addressBlock}</p>
            ${d.notes ? `<p style="margin:0 0 16px"><strong>Shënime:</strong> ${esc(d.notes)}</p>` : ""}
            ${itemsTable(d.lines)}
            <p style="margin:16px 0 0;font-size:16px"><strong>Totali: ${money(d.total)}</strong></p>
            <p style="margin:16px 0 0"><a href="${orderUrl}">Shiko porosinë në panel</a></p>
          </div>`,
      });
    } catch (e) {
      console.error("[email] owner alert failed", e);
    }
  }

  // 2) Customer confirmation — fulfils the on-form promise.
  try {
    await r.emails.send({
      from: FROM,
      to: d.email,
      subject: `Porosia juaj te ${SITE_NAME} u pranua #${shortId}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;color:#1a1a1a">
          <h2 style="margin:0 0 8px">Faleminderit, ${esc(d.fullName)}!</h2>
          <p style="margin:0 0 16px;line-height:1.6">
            Porosia juaj <strong>#${shortId}</strong> u pranua. Stafi ynë do t'ju
            kontaktojë me telefon në <strong>${esc(d.phone)}</strong> për të
            konfirmuar pagesën dhe detajet e dorëzimit.
          </p>
          ${itemsTable(d.lines)}
          <p style="margin:16px 0 0;font-size:16px"><strong>Totali: ${money(d.total)}</strong></p>
          <p style="margin:24px 0 0;color:#666;font-size:13px">${SITE_NAME} · Kosovë</p>
        </div>`,
    });
  } catch (e) {
    console.error("[email] customer confirmation failed", e);
  }
}
