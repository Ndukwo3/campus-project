# Campus MVP Tasks

## Phase 1 — Foundation Setup

- [ ] Project Initialization
  - [x] Initialize Next.js project
  - [x] Setup Supabase project and client
  - [x] Configure environment variables (Supabase, AI API keys)
  - [ ] Setup Vercel deployment
- [ ] Database Design & Setup
  - [x] Core tables (`users`, `universities`, `departments`, `profiles`, `posts`, `messages`, `groups`, `group_members`, `reports`)
  - [ ] Seed `universities` and `departments` (prevent duplicates)
  - [ ] Storage setup (profile avatars only, enforced size/type limits)
  - [ ] Row Level Security (RLS) policies basics
- [ ] Authentication
  - [ ] Email signup/login via Supabase Auth
  - [ ] Basic onboarding flow (Select university, department, level)
  - [ ] Profile creation

## Phase 2 — User System

- [ ] Student Profiles
  - [ ] Display Username, Bio, Department, Level, University badge
  - [ ] Profile image upload (avatar only)
- [ ] User Discovery
  - [ ] View students in the same university
  - [ ] Filter by department
  - [ ] Basic search functionality

## Phase 3 — Social Feed

- [ ] University Feed
  - [ ] Create text-only posts
  - [ ] Like and comment on posts
  - [ ] Realtime updates via Supabase Realtime
- [ ] Moderation System
  - [ ] Basic reporting mechanism for MVP text feed

## Phase 4 — Messaging System

- [ ] Realtime Chat
  - [ ] One-to-one messaging
  - [ ] Conversation list with timestamps
  - [ ] Basic online status

## Phase 5 — Study Groups

- [ ] Group Management
  - [ ] Create and join academic groups
  - [ ] Group member list
  - [ ] Realtime group chat

## Phase 6 — AI Academic Assistant

- [ ] AI Integration
  - [ ] Integrate external AI API (using secure server-side env vars)
  - [ ] Interface for asking academic questions
  - [ ] Support generating explanations, study summaries, and quick revision help

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
