# CareNote

CareNote is a responsive clinical notes workspace prototype for hospital care teams.

## What is included

- Patient roster, search, status, allergy, room, and encounter context
- Structured clinical note editor with draft and signed states
- Responsive desktop and mobile layouts
- Firebase Authentication helpers and typed Firestore repository
- Hospital tenant and clinician role security rules
- Firestore indexes and local emulator configuration
- UI tests for patient search, selection, and note creation

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

The interface uses safe demo data when Firebase variables are not configured.

## Firebase setup

1. Create a Firebase project and web app.
2. Enable Email/Password authentication.
3. Create Firestore in production mode.
4. Add the web app values to `.env.local`.
5. Assign `hospitalId` and `role` custom claims to each clinician account through a trusted admin service.
6. Deploy rules and indexes with `firebase deploy --only firestore`.

Use the local emulators with `VITE_USE_FIREBASE_EMULATORS=true`.

## Clinical safety boundary

This repository is a product prototype, not a production electronic health record. Before real patient data is used, complete a formal threat model, HIPAA or applicable regional compliance review, business associate agreements, retention policy, immutable server-side audit logging, disaster recovery, clinical validation, and integration testing with the hospital identity and ADT systems.
