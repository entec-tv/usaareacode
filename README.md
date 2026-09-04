# Area Code Compass

Build a modern, state-of-the-art, and ultra-responsive Telecommunications Portal & Utility Web Application named "USA Area Code Lookup & Phone Intelligence Hub", operated by "ENTEC".

### 1. Visual Aesthetics & Design System
- Theme: Sleek, high-converting Dark Mode with Glassmorphism accents, neon-cyan/blue primaries (#38bdf8), indigo secondaries, subtle gradients, and crisp slate backgrounds (#0f172a / #1e293b).
- Typography: Inter or Outfit from Google Fonts with clean hierarchy and micro-animations.
- Fully responsive across desktop, tablet, and mobile with an installable PWA manifest and service worker.
- Multilingual support: Instant English/Arabic toggle with full RTL/LTR dynamic layout switching.

### 2. Core Functional Tools & Components (SPA Architecture)
1. Unified Instant Lookup:
   - Auto-detects input type: 3-digit Area Code, 7/10-digit Phone Number, City name, or US/Canadian State.
   - Outputs: State, City, Telecom carrier, Timezone, Live local time clock (with seconds), and direct interactive map link.
   - Smart Calling Window Indicator: Displays green/yellow/red badge indicating whether it is legal and courteous for call centers/sales teams to call right now based on local timezone hours (9 AM - 8 PM).
   - High-Risk Scam Alert: Highlights Caribbean/Wangiri toll fraud codes (e.g., 473, 876, 284) with high-visibility warning banners.

2. Comprehensive Browse & Filter Database:
   - Complete built-in dataset of all 50 US states, territories (PR, GU, VI, AS, MP), and 13 Canadian provinces/territories with 400+ area codes.
   - Quick filters: Country toggle (US vs Canada), state selector chips, code search, and instant sort.
   - One-click export to Excel (.xlsx via SheetJS) and CSV.

3. Smart Bulk Extractor & Cleanser Tool:
   - Drag-and-drop file upload supporting CSV, TXT, Excel (.xlsx), and Word (.docx).
   - Intelligent Regex extraction that isolates phone numbers, formats them into standard formats ((XXX) XXX-XXXX, E.164), and extracts adjacent customer names and comments.
   - Live dashboard: Total items, valid vs invalid numbers, deduplicated count, and distinct area codes count.
   - Data table preview with search filter, column visibility toggles, and multi-format export (Excel, CSV, JSON, formatted clipboard copy).

4. Interactive Timezone Map:
   - Vector SVG map covering Eastern, Central, Mountain, Pacific, Alaska, and Hawaii-Aleutian time zones.
   - Live synchronised clocks for each timezone. Hovering or clicking a region highlights its active area codes.

5. Code Comparison Tool:
   - Compare two or more area codes side-by-side: overlay relationships, split history, time differences, and demographic coverage.

6. Recents & Favorites:
   - Persistent search history and favorited codes saved in localStorage.

### 3. Full Multi-Page Structure & E-E-A-T Content
- Home (index.html): Main SPA hosting all tools, live hero stats, and E-E-A-T expert byline.
- About Us (about.html): Transparent mission, executive team profiles (Marcus Vance, Dr. Elena Rostova), regulatory source citations (NANPA, FCC, CRTC, FTC), and corporate governance card.
- Data Methodology (methodology.html): In-depth architectural explanation of the automated data pipeline, NXX Central Office mapping, atomic clock synchronization, and anti-scam logic.
- Cited FAQ (faq.html): 32+ accordion FAQ items with structured schema covering telecom definitions, overlays, and calling rules.
Build a modern, state-of-the-art, and ultra-responsive Telecommunications Portal & Utility Web Application named "USA Area Code Lookup & Phone Intelligence Hub", operated by "ENTEC".

### 1. Visual Aesthetics & Design System
- Theme: Sleek, high-converting Dark Mode with Glassmorphism accents, neon-cyan/blue primaries (#38bdf8), indigo secondaries, subtle gradients, and crisp slate backgrounds (#0f172a / #1e293b).
- Typography: Inter or Outfit from Google Fonts with clean hierarchy and micro-animations.
- Fully responsive across desktop, tablet, and mobile with an installable PWA manifest and service worker.
- Multilingual support: Instant English/Arabic toggle with full RTL/LTR dynamic layout switching.

### 2. Core Functional Tools & Components (SPA Architecture)
1. Unified Instant Lookup:
   - Auto-detects input type: 3-digit Area Code, 7/10-digit Phone Number, City name, or US/Canadian State.
   - Outputs: State, City, Telecom carrier, Timezone, Live local time clock (with seconds), and direct interactive map link.
   - Smart Calling Window Indicator: Displays green/yellow/red badge indicating whether it is legal and courteous for call centers/sales teams to call right now based on local timezone hours (9 AM - 8 PM).
   - High-Risk Scam Alert: Highlights Caribbean/Wangiri toll fraud codes (e.g., 473, 876, 284) with high-visibility warning banners.

2. Comprehensive Browse & Filter Database:
   - Complete built-in dataset of all 50 US states, territories (PR, GU, VI, AS, MP), and 13 Canadian provinces/territories with 400+ area codes.
   - Quick filters: Country toggle (US vs Canada), state selector chips, code search, and instant sort.
   - One-click export to Excel (.xlsx via SheetJS) and CSV.

3. Smart Bulk Extractor & Cleanser Tool:
   - Drag-and-drop file upload supporting CSV, TXT, Excel (.xlsx), and Word (.docx).
   - Intelligent Regex extraction that isolates phone numbers, formats them into standard formats ((XXX) XXX-XXXX, E.164), and extracts adjacent customer names and comments.
   - Live dashboard: Total items, valid vs invalid numbers, deduplicated count, and distinct area codes count.
   - Data table preview with search filter, column visibility toggles, and multi-format export (Excel, CSV, JSON, formatted clipboard copy).

4. Interactive Timezone Map:
   - Vector SVG map covering Eastern, Central, Mountain, Pacific, Alaska, and Hawaii-Aleutian time zones.
   - Live synchronised clocks for each timezone. Hovering or clicking a region highlights its active area codes.

5. Code Comparison Tool:
   - Compare two or more area codes side-by-side: overlay relationships, split history, time differences, and demographic coverage.

6. Recents & Favorites:
   - Persistent search history and favorited codes saved in localStorage.

### 3. Full Multi-Page Structure & E-E-A-T Content
- Home (index.html): Main SPA hosting all tools, live hero stats, and E-E-A-T expert byline.
- About Us (about.html): Transparent mission, executive team profiles (Marcus Vance, Dr. Elena Rostova), regulatory source citations (NANPA, FCC, CRTC, FTC), and corporate governance card.
- Data Methodology (methodology.html): In-depth architectural explanation of the automated data pipeline, NXX Central Office mapping, atomic clock synchronization, and anti-scam logic.
- Cited FAQ (faq.html): 32+ accordion FAQ items with structured schema covering telecom definitions, overlays, and calling rules.
- Blog & Dynamic Reader (blog.html & article.html): Filterable blog grid with category tags and dedicated reader with related-post recommendations.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
