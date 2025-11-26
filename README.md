# PocketRescue: Field Action Card Generator

**🚀 [Try it now](https://pocket-rescue.netlify.app/)** | [GitHub](https://github.com/PavloICSA/pocket-rescue) | [License](LICENSE)

---

## Quick Pitch

Turn one field photo into an actionable Field Action Card in seconds. PocketRescue uses client-side image processing to compute vegetation health indices, fetches a 3-day weather forecast, and generates science-backed intervention recommendations—all without sending your photos to any server.

## Elevator Pitch

PocketRescue is a Progressive Web App that empowers farmers and agronomists to make data-driven field decisions instantly. Capture a photo, select your crop type, and get a personalized Field Action Card with vegetation health scores, risk assessments, and prioritized interventions—all processed locally on your device for complete privacy.

---

## Features

- **Client-side processing**: All image processing happens locally on your device—no backend, no database, no photo transmission
- **Vegetation health analysis**: Computes ExG and NDVI-proxy indices with visual heatmap overlay
- **Weather integration**: Fetches 3-day forecast from Open-Meteo API to assess drought, flood, or stress risk
- **Crop-specific guidance**: Provides 3 prioritized interventions tailored to crop type (wheat, barley, maize, sunflower, potato, vegetables, orchard) and risk level
- **Shareable cards**: Generate printable PDFs or share via URL-encoded state (no server storage)
- **Offline-capable**: Works offline with cached sample data; service worker caches static assets
- **Privacy-first**: Photos never leave the device; only geolocation sent to weather API

---

## Try It Now!

Try [PocketRescue](https://pocket-rescue.netlify.app/) and make data-driven intelligent plant care decisions!

## Privacy Statement & Data Security

**Your photos are never sent to any remote server.** All image processing occurs locally on your device using the Canvas 2D API. The only data transmitted to external services is:

- **Latitude and longitude** to Open-Meteo API for weather forecasting
- **Shareable URL state** (base64url-encoded) when you explicitly choose to share a card

When you share a card via URL, the encoded state contains:
- Photo dataURI (base64-encoded image)
- Crop type, vegetation indices, geolocation, and timestamp
- **NOT** the original photo file or any other sensitive data

You can verify this by opening your browser's Network tab and observing that:
1. No photo data is sent to any external API
2. Only lat/lon coordinates are sent to `api.open-meteo.com`
3. All processing happens in your browser

---

## Getting Started

### Prerequisites

- Node.js 16+ and npm 7+
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Camera or file access for photo input (optional—sample images provided for demo)

### Installation

```bash
# Clone the repository
git clone https://github.com/PavloICSA/pocket-rescue.git
cd pocket-rescue

# Install dependencies
npm install
```

### Running Locally

```bash
# Start development server (opens at http://localhost:5173)
npm run dev

# Run tests
npm test

# Run tests once (CI mode)
npm run test:run

# Lint code
npm run lint

# Format code
npm run format
```

### Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build locally
npm run preview

# Output: dist/ directory with minified JS, CSS, and assets
```

The production bundle is optimized for size:
- JavaScript bundle: < 400 KB (minified and gzipped)
- Vendor chunk: React, React-DOM
- CSS: TailwindCSS utilities
- Static assets: Images, manifest, PWA icons

---

## Deployment

### GitHub Pages

1. Update `package.json` with your repository URL:
   ```json
   "homepage": "https://yourusername.github.io/pocket-rescue"
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Deploy to GitHub Pages:
   ```bash
   # Option 1: Manual push to gh-pages branch
   git subtree push --prefix dist origin gh-pages

   # Option 2: Use GitHub Actions (create .github/workflows/deploy.yml)
   ```

4. Enable GitHub Pages in repository settings:
   - Go to Settings → Pages
   - Select "Deploy from a branch"
   - Choose `gh-pages` branch and `/root` folder

5. Access your app at: `https://yourusername.github.io/pocket-rescue`

### Other Hosting Platforms

PocketRescue can be deployed to any static hosting service:
- **Vercel**: Connect GitHub repo, auto-deploys on push
- **Netlify**: Drag-and-drop `dist/` folder or connect GitHub
- **AWS S3 + CloudFront**: Upload `dist/` to S3, configure CloudFront
- **Firebase Hosting**: `firebase deploy` after building

---

## Science Notes

### Vegetation Indices

PocketRescue computes two vegetation health indices from RGB pixel data:

#### ExG (Excess Green)

**Formula:**
```
ExG = (2·G - R - B) / (2·G + R + B + ε)
```

Where:
- R, G, B = Red, Green, Blue channel values (0–255)
- ε = 0.0001 (small constant to avoid division by zero)
- Result range: [−1, 1]

**Interpretation:**
- ExG > 0.35: Healthy vegetation (green)
- 0.05 ≤ ExG < 0.35: Fair vegetation (yellow)
- ExG < 0.05: Poor vegetation (red)

**Source:** Woebbecke et al. (1995). "Color Indices for Weed Identification Under Various Soil, Residue, and Lighting Conditions." *Transactions of the ASAE*, 38(1), 259–269.

#### NDVI-proxy (Normalized Difference Vegetation Index Approximation)

**Formula:**
```
NDVI-proxy = (G - R) / (G + R + ε)
```

Where:
- R, G = Red and Green channel values (0–255)
- ε = 0.0001 (small constant to avoid division by zero)
- Result range: [−1, 1]

**Interpretation:**
- NDVI-proxy > 0.35: Healthy vegetation (green)
- 0.05 ≤ NDVI-proxy < 0.35: Fair vegetation (yellow)
- NDVI-proxy < 0.05: Poor vegetation (red)

**Note:** This is an approximation of the true NDVI, which requires near-infrared (NIR) data. The NDVI-proxy uses only RGB channels and provides a reasonable proxy for vegetation health assessment.

**Source:** Gitelson et al. (2002). "Remote Estimation of Crop and Grass Chlorophyll and Nitrogen Content Using Multi-Angle Vegetation Indices." *Remote Sensing of Environment*, 112(8), 3437–3449.

### Risk Assessment Thresholds

Risk levels are computed based on vegetation index and 3-day precipitation forecast:

| Condition | Vegetation Index | Precipitation | Risk Level | Interpretation |
|-----------|------------------|----------------|-----------|-----------------|
| Critical stress | < 0.05 | Any | **HIGH** | Immediate intervention required |
| Drought risk | < 0.18 | < 5 mm | **HIGH** | Severe water deficit; irrigation critical |
| Flood/stress risk | < 0.18 | > 40 mm | **HIGH** | Waterlogging or excessive moisture stress |
| Moderate stress | 0.18–0.35 | Any | **MEDIUM** | Monitor closely; preventive measures recommended |
| Healthy | > 0.35 | Any | **LOW** | Routine management; continue monitoring |

### Intervention Heuristics

Interventions are selected based on crop type, vegetation index, and risk level. Each intervention includes:
- **Action**: Specific management practice
- **Timing**: When to implement (immediately, within 2 days, etc.)
- **Reasoning**: Scientific basis for the recommendation

**Supported crops:**
- Wheat
- Barley
- Maize
- Sunflower
- Potato
- Vegetables (tomato, lettuce, cabbage, etc.)
- Orchard (apple, citrus, stone fruits)

**Sources for intervention mappings:**
- FAO Crop Water Information (Wheat, Barley, Maize, Sunflower, Potato)
- USDA Integrated Pest Management (IPM) Guidelines
- University Extension Services: Crop Management Best Practices
- CGIAR Research Program on Climate Change, Agriculture and Food Security (CCAFS)
- International Maize and Wheat Improvement Center (CIMMYT)
- International Potato Center (CIP)

See `src/heuristics.json` for complete intervention mappings and reasoning.

---

## Demo Script (30–60 seconds)

### Setup
- Open PocketRescue in a web browser
- Ensure camera/file access is enabled (or use sample images)

### Steps

1. **Landing Screen** (5 sec)
   - App displays: "PocketRescue — Field Action Card Generator"
   - Logo visible in header (top-left)
   - "How it works?" link in header (top-right)
   - Footer with developer info, Privacy Policy, and Terms of Use

2. **Sample Image Selection** (5 sec)
   - Click "Load sample image" button
   - Modal shows 3 sample images: wheat, maize, potato
   - Click "Select" on any image (e.g., wheat)

3. **Crop Selection** (5 sec)
   - Dropdown appears with crop types: wheat, barley, maize, sunflower, potato, vegetables, orchard
   - Crop is pre-selected based on sample image
   - Click "Capture field photo" button

4. **Geolocation** (5 sec)
   - App requests geolocation or offers manual entry
   - For demo, use default coordinates or enter manually
   - Click "Confirm"

5. **Processing** (3 sec)
   - Progress indicator shows: "Downsample → Compute indices → Generate heatmap"
   - Heatmap overlay appears with color-coded vegetation health
   - Score meter animates from 0 to final score (e.g., 65/100)

6. **Field Action Card** (10 sec)
   - Card displays:
     - Thumbnail photo (top-left)
     - Score badge + meter (top-right, color-coded)
     - 3-line risk summary (center)
     - 3 prioritized interventions with timing (middle)
     - QR code (bottom-right)

7. **Export & Share** (10 sec)
   - Click "Download PDF" → PDF downloads to device (includes QR code)
   - Click "Download PNG" → PNG downloads to device (includes QR code)
   - Click "Share URL" → URL copied to clipboard
   - Click "Explain" → Modal shows heuristic thresholds and decision logic
   - Open shared URL in another browser → Card reconstructs identically

8. **Offline Demo** (optional, 10 sec)
   - Turn off network (or use browser DevTools to simulate offline)
   - Refresh app → "Demo mode (cached forecast)" banner appears
   - Process another image → Indices computed, cached forecast used
   - Verify no network requests in DevTools Network tab

9. **Footer Navigation** (5 sec)
   - Click "How it works" → Modal with feature explanation
   - Click "Privacy Policy" → Modal with privacy guarantees
   - Click "Terms of Use" → Modal with terms and agricultural disclaimer
   - Developer contact info visible in footer

---

## Project Structure

```
pocket-rescue/
├── src/
│   ├── components/              # React UI components
│   │   ├── Landing.jsx          # Landing screen + crop selector
│   │   ├── Camera.jsx           # Camera/file input
│   │   ├── SampleImageSelector.jsx
│   │   ├── Processing.jsx       # Processing UI + heatmap display
│   │   ├── Card.jsx             # Field Action Card display
│   │   ├── ExplainModal.jsx     # Heuristic explanation modal
│   │   └── OfflineBanner.jsx    # Offline/demo mode indicator
│   ├── processor/               # Image processing logic
│   │   └── index.js             # Downsample, ExG, NDVI-proxy, heatmap
│   ├── weather/                 # Weather API integration
│   │   └── openMeteo.js         # Fetch forecast + fallback sample JSON
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # React entry point
│   ├── index.css                # Global styles
│   ├── sw.js                    # Service worker (offline caching)
│   ├── actionPlanner.js         # Map index + weather to interventions
│   ├── share.js                 # Encode/decode URL state, QR generation
│   ├── export.js                # html2canvas + jsPDF for PDF/PNG export
│   ├── heuristics.json          # Intervention mappings and thresholds
│   ├── sampleForecast.json      # Offline fallback forecast data
│   ├── PRIVACY.md               # Privacy policy and data security
│   └── TERMS.md                 # Terms of use and disclaimers
├── public/
│   ├── manifest.json            # PWA manifest
│   ├── icon.png                 # App logo
│   ├── icon-192.png             # PWA icon (192×192)
│   ├── icon-512.png             # PWA icon (512×512)
│   └── assets/
│       └── samples/             # Sample images for demo workflow
│           ├── wheat.JPG
│           ├── maize.jpg
│           └── potato.JPG
├── dist/                        # Production build (generated)
├── index.html                   # HTML entry point
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── vitest.config.js             # Vitest configuration
├── .eslintrc.json               # ESLint configuration
├── .prettierrc.json             # Prettier configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

---

## Technology Stack

- **Framework**: React 18.2.0 with JSX
- **Build tool**: Vite 5.0.8 (ESM-native, fast HMR)
- **Styling**: TailwindCSS 3.3.6 with PostCSS
- **Image export**: html2canvas 1.4.1 + jsPDF 2.5.1
- **QR codes**: qrcode.react 3.1.0
- **Testing**: Vitest 1.0.4 + fast-check 3.14.0 (property-based testing)
- **Linting**: ESLint 8.54.0 with React plugin
- **Formatting**: Prettier 3.1.0

---

## Testing

### Unit Tests

Run unit tests with Vitest:

```bash
# Watch mode
npm test

# Run once (CI mode)
npm run test:run
```

Unit tests cover:
- Image processing (ExG, NDVI-proxy, heatmap)
- Geolocation validation
- Risk assessment
- Intervention selection
- URL state encoding/decoding
- Forecast fallback

### Property-Based Tests

Property-based tests verify universal properties using fast-check:

```bash
npm run test:run -- --reporter=verbose
```

Properties tested:
1. ExG index computation correctness
2. NDVI-proxy index computation correctness
3. Global score aggregation
4. Heatmap color mapping
5. Geolocation validation
6. Risk score computation
7. Intervention selection determinism
8. Share URL state encoding round trip
9. Share URL reconstruction
10. Offline image processing
11. Offline forecast fallback
12. Privacy: no photo transmission
13. PDF export completeness
14. QR code validity
15. Processing performance
16. Bundle size constraint

---

## Performance Targets

- **Bundle size**: < 400 KB (minified and gzipped)
- **Image processing**: < 3 seconds on typical smartphone
- **Initial load**: < 2 seconds on 4G connection
- **PDF export**: < 5 seconds

---

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

MIT License. See LICENSE file for details.

---

## Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Check the FAQ in the app's "How it works" modal
- Review the science notes above for technical details

---

## Acknowledgments

- **FAO** (Food and Agriculture Organization) for crop water information
- **USDA** for Integrated Pest Management guidelines
- **CIMMYT** (International Maize and Wheat Improvement Center) for crop management research
- **CIP** (International Potato Center) for potato management expertise
- **University Extension Services** for crop management best practices
- **Open-Meteo** for free, open-source weather API

---

## Repository

**GitHub**: https://github.com/PavloICSA/pocket-rescue

Clone the repository:
```bash
git clone https://github.com/PavloICSA/pocket-rescue.git
cd pocket-rescue
```

---

## Changelog

### Version 1.0.0 (2024-11-26)

**Features:**
- Support for 7 crop types (wheat, barley, maize, sunflower, potato, vegetables, orchard)
- ExG and NDVI-proxy vegetation indices with visual heatmap overlay
- 3-day weather forecast integration from Open-Meteo API
- Shareable URL-encoded cards with QR code generation
- PDF and PNG export with html2canvas + jsPDF
- Offline capability with cached sample data and service worker
- PWA installability with manifest and icons
- Property-based testing suite with fast-check
- Modern landing page with logo, footer, and documentation links
- Privacy Policy and Terms of Use modals
- Developer contact information and attribution

**UI/UX Improvements:**
- Responsive design for mobile and desktop
- Professional footer with developer info and links
- Error boundaries for graceful error handling
- Toast notifications for user feedback
- Modal dialogs for policies and explanations
- Accessible ARIA labels and semantic HTML

**Technical:**
- React 18.2.0 with functional components and hooks
- Vite 5.0.8 for fast development and optimized builds
- TailwindCSS 3.3.6 for utility-first styling
- Vitest 1.0.4 for unit and property-based testing
- ESLint and Prettier for code quality
- Service worker for offline caching
- Privacy monitoring to prevent unauthorized data transmission

---

**Last updated**: November 26, 2024

