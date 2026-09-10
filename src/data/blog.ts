export interface Post {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  readMins: number;
  author: string;
  body: string[];
}

export const CATEGORIES = ["Compliance", "Fraud", "Numbering", "Operations", "Data"];

export const POSTS: Post[] = [
  {
    slug: "area-code-overlays-explained",
    title: "Area Code Overlays Explained: Why 10-Digit Dialing Took Over",
    category: "Numbering",
    excerpt:
      "Overlay relief keeps existing numbers intact but forces mandatory 10-digit dialing. Here is how NANPA decides between a split and an overlay.",
    date: "2026-08-18",
    readMins: 7,
    author: "ENTEC Research Team",
    body: [
      "When an area code approaches exhaust, the North American Numbering Plan Administrator (NANPA) files a relief plan with the state regulator. There are two classic remedies: a geographic split, which carves the region in half and reassigns half the subscribers to a new NPA, and an overlay, which layers a second NPA on top of the same geography.",
      "Splits were dominant through the 1990s because they preserved 7-digit dialing. They also forced hundreds of thousands of businesses to reprint stationery, rebrand vehicles and update directory listings. Regulators increasingly judged that cost unacceptable.",
      "Overlays trade that pain for mandatory 10-digit dialing. Because two different subscribers in the same neighborhood can hold the same 7-digit line number under different NPAs, the switch can no longer resolve a 7-digit dial string unambiguously.",
      "The 2021 nationwide 988 Suicide & Crisis Lifeline transition accelerated this: every NPA that used 988 as a valid central office code had to move to mandatory 10-digit dialing regardless of overlay status.",
      "Operationally, overlays matter for dialer configuration. If your CRM stores 7-digit legacy numbers for an overlay region, those records are undialable and should be normalized to E.164 before your next campaign.",
    ],
  },
  {
    slug: "wangiri-one-ring-fraud",
    title: "Wangiri: How One-Ring Caribbean Scams Bill You Hundreds",
    category: "Fraud",
    excerpt:
      "473, 876, 284 and friends look domestic but sit outside US rate plans. Understanding premium revenue sharing is the only durable defense.",
    date: "2026-07-30",
    readMins: 6,
    author: "ENTEC Research Team",
    body: [
      "Wangiri — Japanese for 'one ring and cut' — relies on a structural quirk of the North American Numbering Plan: several Caribbean nations share the +1 country code while charging international premium rates.",
      "A caller sees a missed call from 473 (Grenada) or 876 (Jamaica) and assumes it is a domestic number. Returning the call routes internationally, and the fraudster's terminating carrier shares premium revenue with them for every minute you stay on hold.",
      "The FTC and FCC have issued repeated consumer alerts on this pattern. The defense is procedural, not technical: never return a missed call from an unfamiliar +1 Caribbean NPA, and ask your carrier to block international dialing on lines that never need it.",
      "For contact centers, the risk is inverted: dialing these NPAs by accident from a scrubbed list produces expensive per-minute charges. Our bulk extractor flags Caribbean NPAs in the validation pass so they can be quarantined before upload.",
    ],
  },
  {
    slug: "tcpa-calling-hours",
    title: "TCPA Calling Hours: The 8AM–9PM Rule Nobody Reads Carefully",
    category: "Compliance",
    excerpt:
      "The window is measured at the called party's local time — not yours, and not the area code's billing address. Here is how to model it.",
    date: "2026-07-12",
    readMins: 8,
    author: "ENTEC Research Team",
    body: [
      "The Telephone Consumer Protection Act restricts telemarketing calls to between 8:00 AM and 9:00 PM at the called party's location. Many state statutes are stricter, and some prohibit Sunday calling entirely.",
      "Determining 'the called party's location' with a mobile number is genuinely hard. Number portability means an NPA-NXX assignment is evidence of original assignment geography, not current residence.",
      "Prudent operations teams treat the NPA-derived timezone as a first-pass filter and layer consent-time zip codes on top. Our Smart Calling Window indicator implements the courteous 9:00 AM – 8:00 PM band by default, one hour tighter than the statutory maximum on each side.",
      "Daylight saving transitions cause the most incidents. Arizona (excluding the Navajo Nation) and Saskatchewan do not observe DST, so a dialer that hardcodes a UTC offset drifts by an hour for half the year.",
    ],
  },
  {
    slug: "npa-nxx-central-office",
    title: "NPA-NXX: Reading a Phone Number Like a Switch Does",
    category: "Numbering",
    excerpt:
      "The first six digits carry the routing intelligence. Central office code blocks are what make city-level attribution possible at all.",
    date: "2026-06-24",
    readMins: 9,
    author: "ENTEC Research Team",
    body: [
      "A 10-digit NANP number decomposes into NPA (area code), NXX (central office code) and the 4-digit line number. Routing decisions historically happened at the NPA-NXX level, which is why public datasets attribute numbers to rate centers rather than to street addresses.",
      "Rate centers are geographic billing polygons, not cities. A rate center named 'Malvern' may cover several municipalities, which is why our city field lists representative localities rather than a single definitive city.",
      "Thousands-block pooling, introduced to slow NPA exhaust, subdivides an NXX into ten 1,000-number blocks assignable to different carriers. This is why carrier attribution at the NXX level is approximate unless you query LERG or a real-time LRN dip.",
      "For most analytics workloads, NPA-level attribution is sufficient and dramatically cheaper. Reserve LRN dips for the moment of dial.",
    ],
  },
  {
    slug: "cleaning-crm-phone-data",
    title: "Cleaning CRM Phone Data: A Repeatable Five-Pass Pipeline",
    category: "Data",
    excerpt:
      "Extraction, normalization, validation, deduplication, enrichment. Skip any pass and your connect rate quietly degrades.",
    date: "2026-06-02",
    readMins: 10,
    author: "ENTEC Research Team",
    body: [
      "Pass one is extraction: pull candidate digit runs out of free text with a permissive regex, because real CRM exports hide numbers inside comments, signatures and pasted email threads.",
      "Pass two is normalization to E.164. Strip punctuation, drop a leading 1 on 10-digit strings, and reject anything that cannot resolve to a valid NANP pattern of [2-9]XX[2-9]XXXXXX.",
      "Pass three is validation. An NPA that does not exist in NANPA's assignment table is a typo, not a lead. A number whose NXX is 555 is a placeholder.",
      "Pass four is deduplication on the E.164 key, retaining the record with the richest adjacent metadata rather than the first occurrence.",
      "Pass five is enrichment: attach state, timezone and calling window so the dialer can sequence campaigns by local hour instead of by list order.",
    ],
  },
  {
    slug: "canada-numbering-differences",
    title: "Canada in the NANP: Same Country Code, Different Rulebook",
    category: "Operations",
    excerpt:
      "The CRTC, not the FCC, governs Canadian numbering. CASL consent rules also differ sharply from US TCPA practice.",
    date: "2026-05-19",
    readMins: 6,
    author: "ENTEC Research Team",
    body: [
      "Canada shares +1 with the United States but is regulated by the CRTC, with the Canadian Numbering Administrator handling NPA relief. Ontario alone now carries eight overlaid NPAs across the Greater Toronto Area.",
      "Consent rules diverge: Canada's Anti-Spam Legislation requires express or implied consent with documented provenance, and penalties scale to the organization rather than per-call.",
      "Saskatchewan does not observe daylight saving time, and Newfoundland runs a half-hour offset — two edge cases that break naive scheduling code every spring and autumn.",
    ],
  },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
