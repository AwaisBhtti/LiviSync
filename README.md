# LiviSync — Roommate Finder & Hostel Directory

LiviSync is a modern, premium web application designed to help students find compatible roommates and discover verified hostel listings. It features lifestyle compatibility scoring, search filters, connection requests, safety reporting, administrative verification, and real-time chat.

---

## Repository Structure

The repository is divided into two main components:
* **/livisync**: Vite + React frontend powered by Redux Toolkit, Tailwind-inspired Vanilla CSS, Lucide icons, and the Supabase Realtime Client.
* **/livisyncbackend**: FastAPI backend powered by SQLAlchemy ORM, PostgreSQL database, PyJWT (jose) authentication, and Brevo SMTP mailer.

---

## Features

### 1. Hostel Directory
* Search, filter, and view detailed hostel listings.
* View room details, availability, sharing options, and capacity restrictions.
* Check utility configurations (e.g. if electricity bills are included).
* Log hostel phone number views.

### 2. Roommate Finder
* Compatibility scoring based on lifestyle preferences (sleep schedule, cleanliness, smoking policies, pets, guest tolerance).
* Send, accept, decline, and cancel roommate connection requests.
* Reciprocal blocklist to hide blocked users in directories and restrict connection actions.

### 3. Safety Reports & Moderation
* Submit safety reports directly from roommate profile cards.
* Administrator dashboard to verify listings, suspend/activate user profiles, and resolve reports.
* Automated email notifications for warning letters, account suspension notices, and account reactivation alerts.

### 4. Real-time Messaging
* FastAPI REST API for chat history query and message insertion.
* Supabase Realtime integration to broadcast new messages instantly over authenticated WebSocket channels (Option B - RLS protected).

---

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd livisyncbackend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # On Windows
   source .venv/bin/activate  # On macOS/Linux
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `livisyncbackend/` folder and populate the configuration:
   ```ini
   DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<dbname>"
   JWT_SECRET="your-fastapi-jwt-signing-secret"
   JWT_ALGORITHM="HS256"
   ACCESS_TOKEN_EXPIRE_MINUTES="10080"

   # Brevo/SMTP Mailer Configurations
   SMTP_HOST="smtp-relay.brevo.com"
   SMTP_PORT="587"
   SMTP_USER="your-smtp-username"
   SMTP_PASSWORD="your-smtp-password"
   SMTP_FROM="no-reply@livisync.me"

   # Cloudflare R2 Configurations
   R2_ACCOUNT_ID="your-r2-account-id"
   R2_ACCESS_KEY_ID="your-r2-access-key"
   R2_SECRET_ACCESS_KEY="your-r2-secret-key"
   R2_BUCKET_NAME="your-r2-bucket-name"
   R2_PUBLIC_CUSTOM_DOMAIN="https://pub-...r2.dev"

   # Supabase Realtime Configurations (Option B)
   SUPABASE_URL="https://your-project-ref.supabase.co"
   SUPABASE_ANON_KEY="your-supabase-public-anon-key"
   SUPABASE_JWT_SECRET="your-supabase-project-jwt-secret-from-dashboard"
   ```
5. Run the backend server:
   ```bash
   python -m app.main
   ```

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd livisync
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `livisync/` folder and populate it:
   ```ini
   VITE_API_URL=http://127.0.0.1:8000
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-public-anon-key
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```

---

## Technologies Used

* **Frontend**: React, TypeScript, Redux Toolkit, React Router DOM, `@supabase/supabase-js`, Lucide Icons.
* **Backend**: FastAPI, SQLAlchemy, PostgreSQL, PyJWT, `smtplib`, `bcrypt`.
* **Infrastructure**: Supabase (Database & Realtime WebSockets), Cloudflare R2 (Image hosting).
