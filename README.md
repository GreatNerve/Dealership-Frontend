# Dealership frontend (API tester)

Vite + React + TypeScript + Tailwind v4 + shadcn/ui. Not part of the backend repo scope; use it to exercise the Spring API locally.

App icon PNGs: [Icons8 Fluency — garage](https://icons8.com/icon/9999/garage) (`public/icons/`, `favicon-32.png`). Profile avatars: [DiceBear](https://www.dicebear.com/) Thumbs API (`user.id` / `customerId` as seed).

## Prereqs

- Backend on `http://localhost:8080` (`make run` in `dealership` with `dev` profile for demo users).

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to port 8080.

Auth: `/login`, `/register` (chooser), `/register/customer`, `/register/dealership` (shop name/address/timezone + `POST /dealerships`). Signed-in users open **Profile** (`/profile`, `GET /api/v1/me`) for account, customer, or home dealership details. HTTP client is **axios** with unwrap of the backend `ApiResponse.data` envelope. **Customers** book (pick a vehicle or add one in the create dialog), reschedule, and cancel appointments; **My vehicles** is still available for managing the list. **Staff** manage the **Customers** directory (search, add customer), handle **appointments** (reschedule/cancel, reminders, mark complete), and view **My dealership** only — staff do not book for customers or add vehicles on their behalf.

Optional: set `VITE_API_BASE` in `.env` if the API is on another host (then configure CORS on the backend).

## Demo logins

| Email | Password | Role |
|-------|----------|------|
| `staff@demo.local` | `password` | Staff (customer directory, appointments, reminders) |
| `customer@demo.local` | `password` | Customer (own appointments, vehicles) |
