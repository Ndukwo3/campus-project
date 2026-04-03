# Campus MVP Tasks

## Phase 1 — Foundation Setup

- [x] Project Initialization
  - [x] Initialize Next.js project
  - [x] Setup Supabase project and client
  - [x] Configure environment variables (Supabase, AI API keys)
  - [x] Setup Vercel deployment
  - [x] Identify official logo file (`icon-192x192.jpg`)
  - [x] Update `AuthLogo.tsx` to use the image logo and restore brand text
  - [x] Verify the change across different pages (Feed, Login)
- [x] Database Design & Setup
  - [x] Core tables (`users`, `universities`, `departments`, `profiles`, `posts`, `messages`, `groups`, `group_members`, `reports`)
  - [x] Seed `universities` and `departments` (prevent duplicates)
  - [ ] Storage setup (profile avatars only, enforced size/type limits)
  - [ ] Row Level Security (RLS) policies basics
- [ ] Authentication
  - [x] Email signup/login via Supabase Auth
  - [x] Basic onboarding flow (Select university, department, level)
  - [x] Profile creation

## Phase 2 — User System

- [x] Student Profiles
  - [x] Display Username, Bio, Department, Level, University badge
  - [x] Profile image upload (avatar only)
- [x] User Discovery
  - [x] View students in the same university
  - [x] Filter by department
  - [x] Basic search functionality

## Phase 3 — Social Feed

- [ ] University Feed
  - [x] Create text-only posts
  - [x] Like and comment on posts
  - [x] Realtime updates via Supabase Realtime
- [ ] Moderation System
  - [ ] Basic reporting mechanism for MVP text feed

## Phase 4 — Messaging System

- [x] Realtime Chat
  - [x] One-to-one messaging
  - [x] Conversation list with timestamps
  - [x] Basic online status

## Phase 5 — Study Groups

- [x] Group Management
  - [x] Create and join academic groups
  - [x] Group member list
  - [x] Realtime group chat

## Phase 6 — AI Academic Assistant

- [x] AI Integration
  - [x] Create `src/components/LibraryAiAssistant.tsx`
  - [x] Update `src/app/library/page.tsx` to pass `course_code`
  - [x] Update `src/components/PdfViewer.tsx` with AI trigger and panel
  - [x] Verify AI assistant UI and "flow up" animation
  - [x] Integrate external AI API (using secure server-side env vars)
  - [x] Interface for asking academic questions
  - [x] Support generating explanations, study summaries, and quick revision help

## Phase 7 — Multi‑University Scaling

- [ ] Platform Structure & Security
  - [ ] Enforce data isolation per university using RLS
  - [ ] University-based content filtering

## Phase 8 — MVP Polish & Launch

- [ ] Performance & Security
  - [ ] Optimize queries and loading states
  - [ ] Finalize Supabase RLS policies and protected routes
- [ ] UX Improvements
  - [ ] Mobile responsiveness
  - [ ] Clean onboarding and navigation refinement
- [x] Fix hydration mismatch in layout.tsx (suppressHydrationWarning)
