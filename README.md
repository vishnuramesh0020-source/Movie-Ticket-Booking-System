# VS Cinemas - Movie Ticket Booking System & Analytics Dashboard

A modern, high-performance cinema ticketing management and movie catalog web application built with React 19, Vite, Tailwind CSS v4, and third-party movie APIs (The Movie Database - TMDB & TVMaze).

## 🚀 Key Modules & Features

### 🎬 Module 3: Movie Listing & Explorer (TMDB Integrated)
- **Third-Party API Integration**: Live movie data synchronized directly with The Movie Database (TMDB) API with fallback resiliency.
- **Dedicated Movie Listing Page (`/movies`)**: Full-width catalog with real-time filters and search.
- **Each Movie Displays All 9 Required Attributes**:
  1. **Poster**: High-definition poster with format tag (IMAX 3D, Dolby Cinema) and hover zoom.
  2. **Movie Name**: Bold title linking directly to the Movie Detail Page.
  3. **Genre**: Genre category pills (Action, Sci-Fi, Drama, etc.).
  4. **Language**: Visible language tag with icon (English, Hindi, Tamil, Telugu, Spanish, etc.).
  5. **Duration**: Runtime badge with clock icon (e.g. `2h 25m`).
  6. **Rating**: Vibrant gold star rating pill (e.g. `★ 7.9/10`).
  7. **Release Date**: Formatted theatrical debut date (e.g. `Jul 29, 2026`).
  8. **Description**: Concise storyline synopsis.
  9. **Trailer Button (UI Only)**: Dedicated trailer button that launches the high-definition Theatrical Trailer modal player.
- **Dedicated Movie Detail Page (`/movies/:id`)**:
  - High-resolution cinematic hero banner with backdrop image and vignette effects.
  - Comprehensive metadata: Title, Tagline, Rating, Vote Count, Runtime, Release Date, Language, Spoken Languages, Director, Budget, and Revenue.
  - Top Billed Cast gallery with actor photos and character names.
  - Multiplex theatre venue selection and live showtime booking buttons.
- **Search Movies**: Real-time debounced search bar with instant clear button.
- **Filter by Genre**: Dropdown supporting all TMDB genres (Action, Adventure, Animation, Comedy, Crime, Drama, Fantasy, Horror, Mystery, Romance, Sci-Fi, Thriller).
- **Filter by Language**: Dropdown supporting English, Hindi, Tamil, Telugu, Malayalam, Spanish, French, Japanese, Korean, German.
- **Filter by Rating**: Filter options for 8.0+ Blockbusters, 7.0+ Highly Rated, 6.0+ Good, and 5.0+ Average.
- **Sort by Release Date**: Multi-dimensional sorting: Newest First, Oldest First, Rating (High to Low), Popularity, Title (A-Z).
- **Pagination**: Complete page navigation bar with Previous, Next, page numbers, and total movie counter.
- **Loading & Error Handling**:
  - Animated shimmer skeleton cards during API fetches.
  - API Connectivity Notice banner with instant "Retry" action.
  - Empty search/filter state with "Reset Filters" action.

### 📈 Module 9: Reports & Analytics (`/reports`)
- **Total Bookings & Total Revenue KPIs**: Live box office calculation combining `localStorage` bookings and benchmark sales records with dynamic monthly growth metrics.
- **Most Booked Movie**: Real-time highlight card and ranking table showcasing the top box-office titles with tickets sold, gross revenue, and occupancy share.
- **Most Popular Theatre**: Venue-level analytics ranking multiplexes by total hosted bookings, capacity utilization percentage, and daily show counts.
- **Seat Occupancy Rate Deep-Dive**: Segmented occupancy breakdowns across Seating Tiers (Premium, Executive, Standard) and Showtime Windows (Morning, Matinee, Evening Prime, Late Night).
- **Daily Booking Trends & Velocity**: Interactive SVG trend chart and daily timeline visualizer with timeframe filters (7 Days, 14 Days, 30 Days), weekend surge analysis (+68%), and hover inspection tooltips.
- **Multi-Format Revenue Charts (Dummy Data)**: Multi-month stacked revenue comparisons (IMAX Laser, Dolby Cinema, 4DX Sensory, Standard) and projection yield distribution.
- **Dashboard Statistics Hub**: Granular, searchable data tables for Top Movies, Multiplex Theatres, and Live Booking Transactions.
- **Executive Export & Print Ready**: 1-click full CSV report export (`VS_Cinemas_Analytics_Report.csv`) and formatted print summary (`window.print()`).

### 📊 Module 2: Executive Analytics Dashboard
- **5 Responsive Metric Cards**: Total Movies, Total Theatres, Total Bookings, Available Shows, and Today's Bookings.
- **Revenue & Profit Analytics**:
  - Dual-pillar monthly bar comparison chart (IMAX vs Dolby Cinema) with quarter filters (All, Q1, Q2) and tooltip inspection.
  - Smooth cubic bezier profit vs occupancy spline chart with interactive data points.
  - Screen format sales share breakdown with live distribution bars.
- **Interactive Ticket Booking Engine**: Modal-based real-time seat selector (Rows A-E, Seats 1-8) and instant price calculation in Indian Rupees (₹).
- **Digital Cinema E-Ticket**: Instant booking pass generation with QR code, auditorium details, and direct print functionality (`window.print()`).
- **Multiplex Theatre Network**: Real-time listing of auditorium formats, sound systems, daily show schedules, and amenities.
- **Recent Bookings Feed**: Complete transaction registry with customer details, seat assignments, and confirmed status.

### 🔐 Module 1: Authentication & Layout
- **Vintage Projector Aesthetic**: Authentic yellow projector beam layout with responsive floating forms.
- **Full Auth Flow**: Login with 1-click Demo Auto-Fill, Sign Up with password confirmation validation, and Password Reset.
- **Route Protection**: Protected application routes with session persistence in `localStorage`.

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
