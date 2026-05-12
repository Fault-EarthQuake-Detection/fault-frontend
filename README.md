# GeoValid - Fault & Earthquake Detection Frontend

**GeoValid** is a web-based frontend application built with Next.js that visualizes active geological faults and provides earthquake impact analysis. It features an interactive map, real-time data analysis, a built-in chatbot, and secure user authentication using Supabase.

## 🚀 Features

* **Interactive Maps:** Visualizes active fault lines using GeoJSON data (`patahan_aktif.geojson`).
* **Impact Analysis:** Built-in tools to assess and calculate the potential impact of seismic activities.
* **AI Chatbot Assistant:** Integrated chatbot (`ChatBot.tsx`, `ChatFab.tsx`) to assist users with geological data queries.
* **Secure Authentication:** User login and session management powered by Supabase.
* **Role-Based Dashboards:** Dedicated views for users and administrators (including role editing and feedback management).
* **Location Search:** Easily search and pinpoint specific geographical locations via the internal API.

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (via PostCSS)
* **Backend/BaaS:** Supabase (Authentication & Database)
* **Deployment:** Vercel (Ready)

## 📂 Project Structure

* `src/app/`: Contains all Next.js App Router pages and API routes.
    * `/api/`: Backend API routes (e.g., location search).
    * `/auth/`: Authentication pages (Login, Callback).
    * `/dashboard/`: Protected dashboard views including maps, detection, and admin panels.
* `src/components/`: Reusable UI components (Dashboard layout, Maps, Chatbot, etc.).
* `src/utils/`: Utility functions including `supabase` clients and `impactAnalysis.ts`.
* `public/`: Static assets including GeoValid logos and geological GeoJSON data.

## ⚙️ Getting Started

### Prerequisites
* Node.js (LTS version recommended)
* npm, yarn, or pnpm
* A Supabase project (for environment variables)

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your environment variables. Create a `.env.local` file and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 🧑‍💻 Developer

**Fikal Alif Al Amin**

## 📄 License

This project is open-source and available for development and learning purposes.
README.md
Menampilkan README.md.
