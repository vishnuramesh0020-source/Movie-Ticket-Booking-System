# VS Cinemas - Movie Ticket Booking System & Analytics Dashboard

A modern, high-performance cinema ticketing management web application built with React 19, Vite, Tailwind CSS v4, and third-party movie APIs.

## 🚀 Key Features

- **Projector & Cinema Auth**: Vintage movie projector visual theme for Login, Registration, and Password Reset.
- **Executive Analytics Dashboard**:
  - **5 Responsive Metric Cards**: Total Movies, Total Theatres, Total Bookings, Available Shows, and Today's Bookings with segmented indicators and percentage trends.
  - **Live Cinema Catalog**: Filter by *Now Playing* and *Upcoming* releases powered by TMDB and TVMaze third-party APIs.
  - **Interactive Ticket Booking Engine**: Modal-based real-time seat selector, screening format picker, and instant calculation in Indian Rupees (₹).
  - **Digital Cinema E-Ticket**: Instant booking pass generation with QR code, auditorium details, and direct print functionality.
  - **Interactive Revenue & Profit Analytics**:
    - Dual-pillar monthly bar comparison chart (IMAX vs Dolby Cinema) with quarter filters (All, Q1, Q2) and tooltip inspection.
    - Smooth cubic bezier profit vs occupancy spline chart with interactive data points.
    - Screen format sales share breakdown with live distribution bars.
  - **Multiplex Theatre Network**: Real-time listing of auditorium formats, sound systems, daily show schedules, and amenities.
  - **Recent Bookings Feed**: Complete transaction registry with customer details, seat assignments, and confirmed status.

## 🛠️ Tech Stack

- **Framework**: React 19 & React DOM 19
- **Build Tool**: Vite 8 & React Compiler
- **Styling**: Tailwind CSS v4 with custom cinema themes
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form
- **Routing**: React Router v7
- **Notifications**: React Toastify (custom dark glassmorphic styling)
- **Code Quality**: Oxlint (0 warnings, 0 errors)

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

### 4. Run Linter
```bash
npm run lint
```
