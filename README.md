# 🎯 JobTrack — Job Application Tracker

A modern, full-stack job application tracking system built with Next.js 16 and Supabase. Track every application with a clean dashboard, a drag-and-drop kanban, and quick notes so you always know what’s next.

**🌐 Live Demo: [jobapplytracker.com](https://jobapplytracker.com)**

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss)

## 👀 Product Preview

<p align="center">
  <img src="public/hero_preview_light.png" alt="JobTrack dashboard preview" width="960" />
</p>

<p align="center">
  <video src="public/kanban_light.webm" controls muted loop playsinline width="960"></video>
</p>

<p align="center">
  <video src="public/apply_detail_light.webm" controls muted loop playsinline width="960"></video>
</p>

> Dark mode assets are included (`public/hero_preview_dark.png`, `public/kanban_dark.webm`, `public/apply_detail_dark.webm`).

## ✨ Features

### 🔐 Authentication

- **Email/Password Authentication** - Secure sign up and sign in
- **Password Reset** - Email-based recovery flow
- **OAuth Integration** - Google and GitHub social login
- **Protected Routes** - Middleware-based route protection
- **Row Level Security** - Each user can only access their own data

### 📋 Application Management

- **CRUD Operations** - Create, read, update, and delete applications
- **Status Tracking** - Track applications through 8 different stages:
  - Applied → Test Case → HR Interview → Technical Interview → Management Interview → Offer → Accepted/Rejected
- **Kanban Board** - Drag and drop applications across stages
- **Pin Important Applications** - Keep critical applications at the top
- **Quick Notes** - Add notes directly from the detail view
- **Contact Management** - Store recruiter and interviewer contact information
- **Notes & Cover Letters** - Keep detailed notes for each application

### 🔍 Search & Filter

- **Real-time Search** - Instant search across company names and positions
- **Multi-filter Support** - Filter by status, work type, source, and more
- **Sort Options** - Sort by date, company name, or status
- **URL State Management** - Filters persist in URL for easy sharing

### 🌍 Internationalization

- **Multi-language Support** - English and Turkish translations
- **Dynamic Language Switching** - Change language without page reload

### 🎨 UI/UX

- **Dark/Light Mode** - System-aware theme with manual toggle
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Modern UI Components** - Built with shadcn/ui and Radix primitives
- **Toast Notifications** - Real-time feedback for user actions
- **SEO-first Landing** - Marketing homepage at `/`

## 🛠️ Tech Stack

### Frontend

| Technology          | Purpose                         |
| ------------------- | ------------------------------- |
| **Next.js 16**      | React framework with App Router |
| **React 19**        | UI library with latest features |
| **TypeScript**      | Type-safe development           |
| **Tailwind CSS 4**  | Utility-first styling           |
| **shadcn/ui**       | Accessible component library    |
| **Radix UI**        | Headless UI primitives          |
| **Zustand**         | Lightweight state management    |
| **React Hook Form** | Performant form handling        |
| **Zod**             | Schema validation               |

### Backend & Database

| Technology             | Purpose                 |
| ---------------------- | ----------------------- |
| **Supabase**           | Backend as a Service    |
| **PostgreSQL**         | Relational database     |
| **Row Level Security** | Data isolation per user |
| **Supabase Auth**      | Authentication system   |

### Other Libraries

| Library          | Purpose              |
| ---------------- | -------------------- |
| **next-intl**    | Internationalization |
| **next-themes**  | Theme management     |
| **date-fns**     | Date formatting      |
| **nuqs**         | URL query state      |
| **Lucide React** | Icon library         |
| **Sonner**       | Toast notifications  |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/berkinduz/job-apply-tracker.git
   cd job-apply-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Set up Supabase database**

   Run the SQL schema in your Supabase SQL Editor:

   ```bash
   # The schema is available in supabase-schema.sql
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   - Landing: [http://localhost:3000](http://localhost:3000)
   - App: [http://localhost:3000/applications](http://localhost:3000/applications)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── applications/       # Application CRUD pages
│   ├── auth/              # Auth callback handler
│   ├── login/             # Authentication page
│   └── settings/          # User settings
├── components/
│   ├── applications/      # Application-related components
│   ├── layout/            # Header, navigation, theme toggle
│   ├── providers/         # Context providers
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── supabase/          # Supabase client & services
│   └── utils.ts           # Utility functions
├── messages/              # i18n translation files
├── store/                 # Zustand state management
└── types/                 # TypeScript type definitions
```

## 🗄️ Database Schema

```sql
-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  status TEXT NOT NULL,
  work_type TEXT NOT NULL,
  -- ... more fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);
```

## 🎯 Why I Built This

As a developer actively searching for new opportunities, I found myself struggling to keep track of all my job applications across different platforms. Spreadsheets felt limiting, and existing tools didn't quite fit my workflow.

This project solves a real problem I faced while also serving as a demonstration of my full-stack development capabilities:

- **Modern React Patterns** - Server components, streaming, suspense
- **Type Safety** - End-to-end TypeScript with Zod validation
- **Authentication** - Implementing secure auth flows with multiple providers
- **Database Design** - PostgreSQL with proper RLS policies
- **State Management** - Combining server state with client-side stores
- **Internationalization** - Building for a global audience
- **Responsive Design** - Mobile-first approach with Tailwind CSS

## 🔮 Future Enhancements

- [ ] Analytics dashboard with application statistics
- [ ] Email reminders for follow-ups
- [ ] Calendar integration for interview scheduling
- [ ] Resume/CV attachment storage
- [ ] AI-powered job matching suggestions
- [ ] Export data to CSV/PDF
- [ ] Browser extension for quick adding

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Berkin Duz**

- Website: [berkinduz.com](https://berkinduz.com)
- GitHub: [@berkinduz](https://github.com/berkinduz)

---

<div align="center">
  <p>If you found this project helpful, please consider giving it a ⭐️</p>
</div>
