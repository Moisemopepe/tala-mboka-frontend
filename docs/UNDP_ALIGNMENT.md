# UNDP Challenge Alignment

Tala Mboka Crisis is an open-source crisis mapping MVP for rapid community-generated damage assessment.

## Implemented

- Photo, description, crisis type, infrastructure type, damage level, debris, and modular impact questions.
- Web and mobile reporting against the same backend.
- Offline queue on web/mobile with offline-created and synced metadata.
- Public map and admin live map.
- Admin validation, editing, deletion, staff access, suspension, and audit trail.
- Admin-only reporter metadata before and after validation.
- CSV and GeoJSON exports with coordinates, images, status, duplicates, version, source/channel, and building footprint references.
- MongoDB indexes for crisis scale: `crisisId`, `createdAt`, `collectionTime`, `location`, `assetId`, `buildingFootprint.id`, `duplicateOf`, `crisisType`, and `damageLevel`.
- 6 UN language codes supported in the data model, with English/French/Spanish operational UI and safe fallback for Arabic/Chinese/Russian.

## Recommended production additions

- Real building footprint layer from OSM/Overpass or official shapefiles per deployment area.
- AI-assisted photo classification and automatic translation.
- WhatsApp intake channel.
- Shapefile export worker for heavy GIS export.

## Demo flow

1. Submit a mobile report with photo, classification, description, and GPS.
2. Demonstrate offline save and later sync.
3. Open admin, view reporter metadata and duplicate/version info.
4. Verify the report.
5. Show it on the live map.
6. Export CSV and GeoJSON.
