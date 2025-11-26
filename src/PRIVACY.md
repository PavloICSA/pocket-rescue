# PocketRescue Privacy and Data Security Documentation

## Privacy Guarantee

**Photos processed locally. No data leaves your device unless you explicitly share the card URL.**

## Core Privacy Principles

### 1. Image Processing (Requirement 10.1)

**Guarantee**: All image processing uses Canvas 2D API (no external ML models or remote processing)

- **Module**: `src/processor/index.js`
- **Functions**:
  - `downsampleImage()` - Uses Canvas 2D API only
  - `computeExG()` - Pure local computation
  - `computeNDVIProxy()` - Pure local computation
  - `generateHeatmap()` - Uses Canvas 2D API only
  - `computeGlobalScore()` - Pure local computation
- **External Dependencies**: None for image processing
- **Data Transmission**: Zero bytes sent to any external service
- **Offline Capability**: Fully functional offline

### 2. Weather API (Requirement 10.2)

**Guarantee**: Only latitude and longitude are sent to Open-Meteo API (no photo data)

- **Module**: `src/weather/openMeteo.js`
- **API**: Open-Meteo (https://open-meteo.com)
- **Data Sent**:
  - `latitude` - User's field location
  - `longitude` - User's field location
  - `daily` - Request for daily forecast data
  - `timezone` - For local time conversion
- **Data NOT Sent**:
  - Photo or photo dataURI
  - Crop type
  - Vegetation indices
  - User email or identity
  - Device information
  - Browsing history
- **API Privacy**: Open-Meteo is privacy-respecting and does not track users
  - See: https://open-meteo.com/en/features#privacy
- **Fallback**: If API unavailable, uses cached sample forecast (no data transmission)

### 3. Share URL Encoding (Requirement 10.4)

**Guarantee**: Share URLs encode only photo dataURI, indices, and metadata (not original photo file)

- **Module**: `src/share.js`
- **Data Included in Share URL**:
  - Photo dataURI (thumbnail, base64-encoded)
  - Crop type
  - Vegetation indices (ExG, NDVI-proxy)
  - Global score
  - Geolocation (lat/lon)
  - Timestamp
- **Data NOT Included**:
  - Original photo file
  - User identity or email
  - Device information
  - Browsing history
  - Any other sensitive data
- **Storage**: Share URLs are stored in the browser URL bar only
  - No server-side storage
  - No tracking or analytics
  - User has full control over sharing
- **Encoding**: Base64url encoding (reversible but not encrypted)
  - For sensitive use cases, users should use HTTPS and secure channels

### 4. Privacy Monitoring (Requirement 10.1, 10.2)

**Guarantee**: Network monitoring detects and prevents unauthorized data transmission

- **Module**: `src/privacyMonitor.js`
- **Functionality**:
  - Intercepts all fetch requests
  - Verifies only whitelisted APIs are called
  - Validates Open-Meteo requests contain only lat/lon
  - Blocks requests to non-whitelisted domains
  - Logs all network activity (development mode only)
- **Whitelisted APIs**:
  - `api.open-meteo.com` - Weather data only
- **Blocked Requests**:
  - Any request to non-whitelisted external domains
  - Any request containing photo data
  - Any request containing user identity information

## Data Flow Diagram

```
User Device (Browser)
├── Photo Input
│   └── Stored locally in memory (not transmitted)
├── Image Processing
│   ├── Canvas 2D API (local computation)
│   ├── ExG computation (local)
│   ├── NDVI-proxy computation (local)
│   └── Heatmap generation (local)
├── Geolocation
│   ├── Browser API (user permission required)
│   └── Manual entry (user-provided)
├── Weather API Call
│   └── Open-Meteo: latitude + longitude ONLY
├── Risk Assessment
│   └── Local computation (no external calls)
├── Card Generation
│   └── Local DOM rendering
├── Export
│   ├── PDF: html2canvas + jsPDF (local)
│   └── PNG: html2canvas (local)
└── Share URL
    └── Base64url encoding (local, no server storage)
```

## Compliance Checklist

- [x] All image processing uses Canvas 2D API (no external ML models)
- [x] Only lat/lon sent to Open-Meteo API (no photo data)
- [x] Privacy statement displayed to users
- [x] Share URLs contain only safe data (no original photo file)
- [x] Network monitoring prevents unauthorized data transmission
- [x] Offline capability with cached sample data
- [x] No backend server or database
- [x] No user tracking or analytics
- [x] No third-party cookies or trackers
- [x] All computation occurs locally on user's device

## Testing Privacy Guarantees

### Manual Testing

1. **Image Processing**: Open browser DevTools → Network tab → Process image → Verify no external requests
2. **Weather API**: Open browser DevTools → Network tab → Confirm geolocation → Verify only lat/lon sent to api.open-meteo.com
3. **Share URL**: Copy share URL → Inspect URL → Verify no photo data in query parameter
4. **Offline Mode**: Disable network → Process image → Verify indices computed locally

### Automated Testing

- **Property-Based Tests**:
  - Property 10: Offline Image Processing
  - Property 11: Offline Forecast Fallback
  - Property 12: Privacy - No Photo Transmission

## User Privacy Controls

1. **Camera Permission**: Users can deny camera access and use sample images or file picker
2. **Geolocation Permission**: Users can deny geolocation and enter coordinates manually
3. **Sharing**: Users explicitly choose to share URLs (no automatic sharing)
4. **Export**: Users explicitly choose to download PDFs/PNGs (no automatic uploads)
5. **Offline Mode**: Users can use app offline with cached data (no forced API calls)

## Third-Party Dependencies

- **React**: UI framework (no data collection)
- **Vite**: Build tool (no data collection)
- **TailwindCSS**: Styling (no data collection)
- **html2canvas**: Local export (no data transmission)
- **jsPDF**: Local export (no data transmission)
- **qrcode.react**: QR code generation (local, no data transmission)
- **fast-check**: Testing library (no data collection)
- **Vitest**: Testing framework (no data collection)

## Security Recommendations

1. **HTTPS Only**: Deploy app on HTTPS to prevent man-in-the-middle attacks
2. **Content Security Policy**: Implement CSP headers to prevent XSS attacks
3. **Subresource Integrity**: Use SRI for CDN-hosted dependencies
4. **Regular Updates**: Keep dependencies updated for security patches
5. **Code Review**: Review all network requests before deployment

## References

- Open-Meteo Privacy: https://open-meteo.com/en/features#privacy
- Canvas 2D API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- Web Privacy Best Practices: https://www.w3.org/TR/privacy-principles/

