// Single source of truth for site-wide SEO: canonical URL, brand strings,
// the business NAP (name / address / phone) used in structured data, and
// reusable JSON-LD builders. Keep the contact details here in sync with
// what's shown in the footer / visit page.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://hmhomeks.com";

export const SITE_NAME = "HM Home";

export const SITE_DESCRIPTION =
  "Mobilje të zgjedhura me dorë nga punëtoritë më të mira europiane. Komoditet i pakrahasueshëm, dizajn që zgjat një jetë.";

// Open Graph locale. Albanian language; Facebook's supported Albanian locale
// is sq_AL, so we keep it for share compatibility while html lang stays "sq".
export const OG_LOCALE = "sq_AL";

// Business contact / location — drives the LocalBusiness structured data.
// We publish country-level location only (Kosovë); no street/city is exposed.
export const BUSINESS = {
  name: SITE_NAME,
  phone: "+38349741566",
  phoneDisplay: "+383 49 741 566",
  country: "XK", // Kosovo — ISO 3166-1 alpha-2
  countryName: "Kosovë",
  currency: "EUR",
  priceRange: "€€",
  logo: `${SITE_URL}/assets/logo.png`,
} as const;

const businessAddress = () => ({
  "@type": "PostalAddress",
  addressCountry: BUSINESS.country,
});

// FurnitureStore is a LocalBusiness subtype — best fit for local-pack SEO.
// The stable @id lets other nodes (e.g. Offer.seller) reference this entity.
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    "@id": `${SITE_URL}/#business`,
    name: BUSINESS.name,
    url: SITE_URL,
    image: BUSINESS.logo,
    logo: BUSINESS.logo,
    telephone: BUSINESS.phone,
    priceRange: BUSINESS.priceRange,
    currenciesAccepted: BUSINESS.currency,
    address: businessAddress(),
    areaServed: { "@type": "Country", name: BUSINESS.countryName },
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "sq",
    publisher: { "@id": `${SITE_URL}/#business` },
  };
}

// items: ordered [{ name, url }] from home → current page.
export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

// Render a JSON-LD <script>. Spread into JSX: {jsonLd(organizationLd())}
export function jsonLd(data: unknown) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
