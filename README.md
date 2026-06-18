# SMYLODENT - Dental Student Supplies Store

**SMYLODENT** is a premium, professional full-stack e-commerce and learning support platform tailored for dental students (1st, 2nd, 3rd, and 4th academic years) in Libya (with a focus on Tripoli University Faculty of Dentistry).

The storefront features an interactive multi-language UI (Arabic & English) with automatic RTL/LTR page alignments, seamless Light/Dark mode transitions, guest checkouts, invoice PDF generators, and order trackers. It also includes a robust, secure **Admin Dashboard** allowing admins to fully manage products, categories, banner sliders, settings, invoices, and inbox inquiries.

---

## 🚀 Key Features

*   **Bilingual & Adaptive RTL/LTR Layout**: Change layout direction dynamically between Arabic and English.
*   **Aesthetic Theme System**: Light and Dark mode options saved in local storage.
*   **Dual Checkout System**:
    *   **Guest Checkout (Default)**: Users submit checkouts with fullname, phone, university, and college details. No account is required.
    *   **Student Account (Optional)**: Users sign up optionally to save favorites, review purchases, and track order histories.
*   **Visual Order Timeline Tracker**: Enter order numbers and phone credentials to track packages across 6 steps (New, Review, Accepted, Preparing, Out for Delivery, Delivered).
*   **Auto-Generated Invoices**: PDF-formatted receipt sheets ready for browser printing or saving.
*   **Comprehensive Admin Dashboard**:
    *   **Metrics**: Track total sales, order metrics, product tallies, and messages.
    *   **Orders Panel**: Update order statuses, print invoices, and audit student details.
    *   **Products CRUD**: Add/edit items, manage comparison prices, set temporary discounts, edit inventory, and bind year levels and subjects.
    *   **Subjects CRUD**: Manage academic courses (e.g. Restorative, Endodontics) and link them to years.
    *   **Inbox/Banners Panel**: Review contact inquiries, toggle messages as read, and adjust slider carousels.
*   **Resilient Prototyping (Mock Database Fallback)**: Runs out of the box using a local-storage-backed database emulator if Supabase keys are not provided.

---

## 🛠️ Tech Stack

*   **Frontend**: React (Vite)
*   **Icons**: Lucide Icons
*   **Styles**: Vanilla CSS Design Tokens (Cairo + Outfit google fonts)
*   **Backend & Database**: Supabase (PostgreSQL + Auth + Storage)

---

## 📂 Folder Structure

```
smylodent/
├── index.html
├── package.json
├── vite.config.js
├── supabase_schema.sql         # Execute inside Supabase SQL editor
├── README.md                   # Setup guide
└── src/
    ├── main.jsx                # Router & Theme wrappers mounting
    ├── App.jsx                 # Routes and layouts mapping
    ├── index.css               # Main HSL theme values and animations
    ├── supabaseClient.js       # Client credentials and mock DB fallback logic
    ├── translations/           # Language dictionaries
    │   ├── ar.json             # Arabic translations
    │   └── en.json             # English translations
    ├── context/                # Global states
    │   ├── ThemeContext.jsx    # Dark/Light selector
    │   ├── LanguageContext.jsx # Arabic LTR/RTL translation engine
    │   ├── CartContext.jsx     # Cart counts, math, checkout clearance
    │   └── AuthContext.jsx     # Signins, profiles, and admin guards
    ├── components/             # Common elements
    │   ├── Logo.jsx            # Adaptive inline SVG brand logo
    │   ├── Navbar.jsx          # Sticky responsive header with drawer
    │   ├── Footer.jsx          # Copyright and coverage grids
    │   ├── ProductCard.jsx     # Card listing prices and favorites
    │   ├── ReviewSection.jsx   # 5-star comments system
    │   ├── InvoiceView.jsx     # Printable bill template
    │   ├── QRModal.jsx         # free API QR Code generator
    │   └── SkeletonLoader.jsx  # Pulse loaders
    └── pages/                  # Route views
        ├── Home.jsx            # Banner slide & year grids
        ├── YearPage.jsx        # Subject selections
        ├── SubjectPage.jsx     # Product collections with filters
        ├── ProductDetails.jsx  # Gallery, zoom, video frame, reviews
        ├── CartPage.jsx        # Count adjustment rows
        ├── CheckoutPage.jsx    # preset checkout selectors
        ├── OrderTracking.jsx   # timeline tracking charts
        ├── Favorites.jsx       # Saved tools
        ├── StaticPages.jsx     # About, FAQ, Returns
        ├── ContactPage.jsx     # Inbox contact submission form
        ├── SignInPage.jsx      # Login and admin fallbacks
        ├── ProfilePage.jsx     # Profiles and invoice histories
        ├── SearchPage.jsx      # keyword searches
        ├── InvoicePage.jsx     # Dedicated receipt pages
        └── admin/              # Dashboard pages
            ├── AdminLayout.jsx # Route guards and drawers
            ├── Dashboard.jsx   # Statistics overview charts
            ├── Orders.jsx      # Status updater overlays
            ├── Products.jsx    # Complete product CRUD fields
            ├── Subjects.jsx    # Categories mappings
            ├── Banners.jsx     # Slides carousels CRUD
            ├── Settings.jsx    # Rates and WhatsApp links
            └── Messages.jsx    # Inbox logs
```

---

## ⚡ Setup Instructions

### 1. Local Project Startup

1.  Open your terminal inside the project directory:
    ```bash
    cd smylodent
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open the local address printed in the terminal (usually `http://localhost:5173`).
    *   *Note: If no `.env` file is present, the app automatically runs in **Mock Database Mode**, seeded with 4 years, subjects, default settings, and sample products. You can log in using `admin@smylodent.com` and `admin123` to test the Admin Dashboard.*

---

### 2. Supabase Backend Integration

To link the application to your live Supabase cloud workspace:

#### Step A: Database Tables & RLS Policies
1.  Log in to your **Supabase Dashboard** and create a new project.
2.  Navigate to the **SQL Editor** tab in the sidebar.
3.  Click **New Query** and copy-paste the entire contents of the [supabase_schema.sql](file:///C:/Users/Taha/.gemini/antigravity/scratch/smylodent/supabase_schema.sql) file.
4.  Click **Run** to execute the script. This creates all 14 tables, configures performance indexes, establishes user-role triggers, sets up Row-Level Security (RLS) policies, and inserts basic seed data (4 years, subjects, settings, and banners).

#### Step B: Storage Buckets Configuration
1.  Navigate to the **Storage** tab in your Supabase dashboard.
2.  Click **New Bucket** and name it `smylodent-assets`.
3.  Make sure to set the bucket access type to **Public** (allowing anonymous read requests so images load instantly on the storefront).
4.  (Optional) Inside this bucket, create folders for `products/`, `instructions/`, `banners/`, and `site/`.

#### Step C: Environment Variables Setup
1.  Create a file named `.env` in the root of the `smylodent` directory.
2.  Add the following lines (replacing values with your project credentials found under **Settings > API** in Supabase):
    ```env
    VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
    ```
3.  Restart your local development server (`npm run dev`). The app will detect these keys and connect to your live database.

---

## 🔐 Administrative Access & fallbacks

*   **Designating Admins**: The admin dashboard is guarded in `AdminLayout.jsx` by checking if the user's role in the database is `'admin'`.
*   **Cloud Signup**: When deploying to production, register a new account through the `/signin` screen. Then, navigate to the **Table Editor** on your Supabase dashboard, select the `profiles` table, locate your record, and change the `role` column value from `'student'` to `'admin'`. This grants you full access to all CRUD functions.
