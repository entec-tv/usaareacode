/**
 * Real corporate profile, contact data, and operational telemetry for ENTEC.
 * Powers the Header, Footer, SEO JSON-LD structured data, and Analytics Dashboard.
 */

export const COMPANY = {
  // Core Identity
  name: "ENTEC",
  legalName: "ENTEC LLC",
  tradeName: "ENTEC Data Solutions",
  brand: "ENTEC Phone Intelligence Hub",
  tagline: "Authoritative North American Numbering Plan & Phone Intelligence",
  description:
    "Real-time North American Numbering Plan (NANP) intelligence, live timezone mapping, TCPA calling windows, carrier insights, and robocall fraud mitigation engineered by ENTEC.",

  // Headquarters & Operations
  address: "United States & Canada (Digital Operations Portal)",
  street: "",
  city: "Nationwide",
  state: "United States",
  stateAbbr: "US",
  zip: "",
  country: "United States",
  countryCode: "US",

  // Contact Channels
  phone: "",
  phoneRaw: "",
  email: "info@entec.store",
  supportEmail: "info@entec.store",
  businessHours: "Monday - Friday: 9:00 AM - 5:00 PM EST",

  // Online Presence & URLs
  url: "https://usaareacodea.com",
  logoUrl: "https://usaareacodea.com/entec-logo.webp",
  canonicalDomain: "usaareacodea.com",

  // Social & Registry Profiles
  social: {
    twitter: "https://twitter.com/entec",
    linkedin: "https://linkedin.com/company/entec",
    github: "https://github.com/bandarwardi/tele-intel-hub",
  },

  // Regulatory & Sourcing Partners
  regulatorySources: [
    { name: "NANPA (Somos)", url: "https://www.nanpa.com", note: "Official NANP Administrator" },
    { name: "FCC", url: "https://www.fcc.gov", note: "Federal Communications Commission" },
    { name: "CRTC", url: "https://crtc.gc.ca", note: "Canadian Radio-television & Telecommunications" },
    { name: "FTC", url: "https://www.ftc.gov", note: "Consumer Protection & Do Not Call Registry" },
  ],

  // Schema.org JSON-LD Objects for SEO
  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://usaareacodea.com/#organization",
        "name": "ENTEC",
        "legalName": "ENTEC LLC",
        "url": "https://usaareacodea.com",
        "logo": "https://usaareacodea.com/entec-logo.webp",
        "email": "info@entec.store",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "info@entec.store",
          "availableLanguage": ["English", "Arabic"],
          "hoursAvailable": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "09:00",
            "closes": "17:00",
          },
        },
      },
      {
        "@type": "WebApplication",
        "@id": "https://usaareacodea.com/#webapp",
        "name": "USA Area Code Lookup & Phone Intelligence Hub",
        "url": "https://usaareacodea.com",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "author": {
          "@id": "https://usaareacodea.com/#organization",
        },
        "description":
          "Instantly identify locations, timezones, and valid area codes for US and Canada. Reverse lookup, bulk processing, and smart extraction tools by ENTEC.",
      },
    ],
  },
} as const;
