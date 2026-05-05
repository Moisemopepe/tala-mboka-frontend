# Tala Mboka Crisis Web

React + Vite web client for Tala Mboka Crisis.

## Features

- Public crisis response homepage.
- Category-first damage report form with photo upload, GPS/map selection, infrastructure classification, damage level, debris, modular UNDP questions, and optional reporter follow-up details.
- Offline web queue for failed submissions.
- Public live map and reports.
- Hidden admin area at `/admin/login`.
- Admin dashboard with overview, live map, reports, validation, exports, staff users, audit trail, full report detail, reporter metadata, duplicate/version fields, and report editing.

## Admin privacy model

Reporter contact details and submission metadata are visible only in the authenticated admin dashboard. Public map responses do not expose reporter contact, user IDs, device IDs, or IP data.

## Build

```bash
npm install
npm run build
```

## UNDP alignment

The web app is designed for community-sourced post-crisis damage assessment: photo capture, description, damage classification, geolocation, validation, map display, and CSV/GeoJSON export.
