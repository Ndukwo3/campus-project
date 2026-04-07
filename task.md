# Campus MVP Tasks

## Phase 1 — Foundation Setup

- [x] Project Initialization
  - [x] Initialize Next.js project
  - [x] Setup Supabase project and client
  - [x] Contribute Page Overhaul
    - [x] Implement dynamic hierarchy fetching (Universities, Colleges, Faculties)
    - [x] Update form state with new dropdown options
    - [x] Refactor UI to use dropdowns for all selection fields
    - [x] Verify database submission logic
    - [x] Test the full contribution flow
  - [x] Implement "Mark All Read" in `MessagesPage.tsx`.
  - [x] Add `handleMarkAllRead` function.
  - [x] Link function to the "Mark Read" UI button.
  - [x] Ensure database update for `is_read = true` across all user conversations.
  - [x] Refine `BottomNavigation.tsx` unread count.
  - [x] Simplify the query for better reliability.
  - [x] Ensure it invalidates properly after "Mark All Read".
  - [x] Aggregate counts in `MessagesPage.tsx`.
  - [x] Ensure that even if conversations are deduped, the unread count is calculated correctly.
  - [x] Verify fix and create walkthrough.
  - [x] Configure environment variables (Supabase, AI API keys)
  - [x] Setup Vercel deployment
  - [x] Identify official logo file (`icon-192x192.jpg`)
  - [x] Update `AuthLogo.tsx` to use the image logo and restore brand text
  - [x] Verify the change across different pages (Feed, Login)
- [x] Database Design & Setup
  - [x] Database Schema: Add `parent_id` to `comments` table
  - [x] Core tables (`users`, `universities`, `departments`, `profiles`, `posts`, `messages`, `groups`, `group_members`, `reports`)
  - [x] Seed `universities` and `departments` (prevent duplicates)
  - [x] Storage setup (profile avatars only, enforced size/type limits)
  - [x] Row Level Security (RLS) policies basics
- [x] Authentication
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

- [x] University Feed
  - [x] Create text-only posts
  - [x] Like and comment on posts
  - [x] Realtime updates via Supabase Realtime
- [x] Moderation System
  - [x] Basic reporting mechanism for MVP text feed

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
  - [x] Update `src/components/FeedCard.tsx`: Hide `[[USER_PROFILE_UPDATE]]` text
  - [x] Update `src/components/PdfViewer.tsx` with AI trigger and panel
  - [x] Verify AI assistant UI and "flow up" animation
  - [x] Integrate external AI API (using secure server-side env vars)
  - [x] Test AI response and content extraction
  - [ ] Fix News Feed Auto-Refresh Issue
    - [x] Remove random sorting from `src/app/page.tsx`
    - [x] Implement optimistic cache updates for likes/bookmarks/reposts in `src/app/page.tsx`
    - [x] Verify feed stability during interactions
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
## Phase 9 — Authentication Enhancements

- [x] Implement Client-Side Google Auth (Google Identity Services)
  - [x] Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to `.env.local`
  - [x] Add Google SDK script to `src/app/layout.tsx`
  - [x] Update `src/app/login/page.tsx` with `signInWithIdToken`
  - [x] Update `src/app/signup/page.tsx` with `signInWithIdToken`
  - [x] Verify the "continue to" domain display in Google Cloud Console

- [x] Fix hydration mismatch in layout.tsx (suppressHydrationWarning)
