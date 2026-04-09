
# Vehicular (Frontend)

![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=0B1320)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38BDF8?logo=tailwindcss&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.x-764ABC?logo=redux&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-client-4.x-010101?logo=socketdotio&logoColor=white)

**A Privacy-First Vehicle Parking Communication System.**

Vehicular solves a real-world problem: contacting a vehicle owner (blocked driveway, lights left on, minor incident) **without exposing phone numbers**. Vehicle owners register their vehicles and place a generated QR code on the windshield. Anyone can scan it and instantly open an **anonymous, real-time** chat with the owner.

This repository contains the **frontend** (React + Vite).

> **Backend Repository (Node/Express):**
> ### 👉 https://github.com/arnav852963/vehicular

---

## Why this exists

- **Privacy-first**: guests never see the owner’s phone number.
- **Street-friendly UX**: mobile-first interface designed to be readable and fast when someone is in a hurry.
- **Real-time**: Socket.io enables instant messaging and “incoming alert” notifications.

---

## Key Features

### Owner flow (authenticated)
- Register and manage vehicles.
- Generate and view a printable **QR** per vehicle.
- “Command Center” dashboard loads user context + vehicle and chat data.
- Background WebSocket connection to receive **incoming alerts** (scan events) and show actionable toast notifications.

### Guest flow (unauthenticated / ephemeral)
- Scan landing page `(/scan/:qrId)` displays vehicle context and quick preset actions.
- Chat session begins without requiring account creation.
- UI prevents creep: guests use a quick-action message format; chat input can be restricted based on owner reply rules.

### Real-time chat engine
- Single chat experience for both Owner and Guest using Socket.io rooms.
- Optimistic rendering for fast perceived performance.
- Message styling clearly differentiates **me vs them** and supports **sent/delivered/read** UI.

---

## Tech Stack

- **React 19** (Vite)
- **React Router DOM**
- **Redux Toolkit** + **React Redux**
- **Socket.io-client**
- **Axios** (`withCredentials`) for API calls
- **Tailwind CSS v4** (dark-mode-first)
- **React Toastify** for actionable alerts
- **Firebase Auth** (Google + Email/Password) used as an identity provider, then exchanged with backend

---

## Project Structure

> Based on the current repository structure.

```text
vehicularFrontend/
  index.html
  vite.config.js
  eslint.config.js
  package.json
  assets/
	logo.png
  src/
	App.jsx
	main.jsx
	index.css
	connection.js
	api/
	  api.js
	  auth.js
	  user.js
	  vehicle.js
	  chat...js
	firebaseConfig/
	  firebase.js
	store/
	  authStore.js
	  authSlice.js
	  vehicleSlice.js
	  scanSlice.js
	components/
	  Header/Header.jsx
	  bottomtabs/BottomTabs.jsx
	  AddVehicle.jsx
	  Button.jsx
	  Chat.jsx
	  Container.jsx
	  GuestScan.jsx
	  Input.jsx
	  Logo.jsx
	  Message.jsx
	  MyVehicles.jsx
	  Notification.jsx
	  ProfileComponent.jsx
	  Qr.jsx
	  Select.jsx
	  Signup.jsx
	  UpdateProfile.jsx
	  VehicleImage.jsx
	  VehicleInfo.jsx
	pages/
	  Home.jsx
	  Vehicles.jsx
	  VehicleStatus.jsx
	  MyChats.jsx
	  Chat.jsx
	  ScanQr.jsx
	  Signup.jsx
	  Profile.jsx
```

---

## Getting Started

### 1) Install

```bash
npm install
```

### 2) Environment Variables

Create a `.env` file in the project root (`vehicularFrontend/vehicularFrontend/.env`).

This app reads the following Vite environment variables:

```bash
# Backend base URL (used by Axios)
VITE_BACKEND_URL=http://localhost:5000

# Socket.io server URL
VITE_SOCKET_URL=http://localhost:5000

# Firebase config as JSON string
# Example:
# VITE_FIREBASE={"apiKey":"...","authDomain":"...","projectId":"...","appId":"..."}
VITE_FIREBASE={}
```

Notes:
- `VITE_FIREBASE` is parsed via `JSON.parse()` in `src/firebaseConfig/firebase.js`, so it **must be valid JSON**.
- API requests are configured with `withCredentials: true` in `src/api/api.js`. Your backend should send/accept cookies accordingly.

### 3) Run Dev Server

```bash
npm run dev
```

### 4) Production Build / Preview

```bash
npm run build
npm run preview
```

---

## Scripts

From `package.json`:

- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview the build
- `npm run lint` – run ESLint

---

## Routing (high-level)

This frontend uses React Router. Pages live in `src/pages/` and shared UI/components in `src/components/`.

Key screens:
- **Home** (dashboard)
- **Vehicles** (list)
- **VehicleStatus / VehicleInfo** (single vehicle details, QR, images)
- **MyChats** (owner’s chat history)
- **Chat** (owner + guest)
- **ScanQr / GuestScan** (guest entry)
- **Signup/Signin** + **Profile**

---

## State Management (Redux Toolkit)

Redux store is configured in:
- `src/store/authStore.js`

Slices:
- `authSlice.js` – stores `isAuthenticated` + `userInfo`
- `vehicleSlice.js` – vehicles domain state (list/data)
- `scanSlice.js` – scan/guest-session related state

### Auth bootstrapping & guard behavior

`src/App.jsx` performs an app-level session bootstrap on mount:

1. Calls `userApi.getUser()` to hydrate the current user.
2. Calls `userApi.refreshUserToken()` to refresh/extend the session.
3. On failure, it redirects to sign-up/sign-in and dispatches `logout()`.

This ensures authenticated routes don’t render until user context is validated.

---

## API Layer (Axios)

Axios instance:
- `src/api/api.js` sets `baseURL = import.meta.env.VITE_BACKEND_URL` and `withCredentials: true`.

Domain APIs:
- `src/api/user.js` – profile, avatar update (multipart), logout, and chat list
- `src/api/vehicle.js` – vehicle CRUD + QR endpoints + scan endpoint
- `src/api/auth.js` – exchanges Firebase ID token with backend

---

## Socket Architecture (Socket.io-client)

Socket connection helper:
- `src/connection.js`

```js
connectSocket(auth) => io(VITE_SOCKET_URL, { auth })
```

In practice:
- The client joins/communicates through rooms to support **1-on-1** owner/guest sessions.
- Owner receives an “incoming alert” style event to trigger a persistent toast/notification.

> Recommended next step (optional): move socket lifecycle into a dedicated Redux middleware so the socket instance persists across route changes without re-renders.

---

## UI/UX Theme

- Dark-mode-first UI using **zinc/slate** backgrounds.
- High-contrast semantic accents:
  - **Urgent**: `rose-500`
  - **Warning**: `amber-400`
  - **Positive/Reply**: `emerald-500`
  - **Primary/Action**: `sky/cyan`
- Mobile-first layout with large tap targets, bottom navigation, and fast feedback.

---

## PWA Readiness

The codebase is structured in a way that is friendly for future PWA conversion (Vite app shell, centralized routing, and clear domain separation). Adding offline caching and a web manifest can be done later without re-architecting the UI.

---

## Security & Privacy Notes

- QR codes identify vehicles via a short `qrId` and do not expose personal contact details.
- Sensitive long-lived data (like `refreshToken`) should remain server-side.
- The frontend does not persist QR images in localStorage (RAM/state only).

---

## Contributing

PRs are welcome. Keep changes:
- mobile-first,
- dark-mode-first,
- and aligned with the privacy-first UX.

---

## License

Add a license that matches your intended usage (MIT/Apache-2.0/etc.).

