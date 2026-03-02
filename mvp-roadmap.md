# Campus MVP Roadmap

## Overview

This document outlines the development roadmap for the **Campus MVP (Minimum Viable Product)**.

The goal of the MVP is to launch a functional university social and academic platform connecting students across thousands of Nigerian universities while validating real student adoption.

The MVP focuses only on **core features required for real usage**, avoiding unnecessary complexity.

---

## MVP Goal

Build a working platform where students can:

- Join their university community
- Connect with other students
- Communicate in real time
- Share posts
- Form study groups
- Use an AI academic assistant

---

## Development Stack

- **Frontend:** JavaScript, HTML, CSS
- **Backend:** Supabase
- **Database:** PostgreSQL
- **Authentication:** Supabase Auth
- **Realtime:** Supabase Realtime
- **Hosting:** Vercel
- **AI Integration:** External AI APIs

---

## Phase 1 — Foundation Setup

### ✅ Project Initialization

- Create GitHub repository
- Setup Vercel deployment
- Connect Supabase project
- Environment variables configuration

### ✅ Database Design

Core tables:

- users
- universities
- departments
- profiles
- posts
- messages
- groups
- group_members

### ✅ Authentication

- Email signup/login
- Profile creation
- Select university & department
- Basic onboarding flow

---

## Phase 2 — User System

### 👤 Student Profiles

- Username
- Bio
- Department
- Level
- University badge
- Profile image upload

### 🔎 User Discovery

- View students in same university
- Filter by department
- Basic search functionality

---

## Phase 3 — Social Feed

### 📰 University Feed

- Create post
- Text posts
- Like posts
- Comment system
- Realtime updates

Scope limitation:

- No media-heavy uploads initially

---

## Phase 4 — Messaging System

### 💬 Realtime Chat

- One-to-one messaging
- Conversation list
- Message timestamps
- Online status (basic)

Future improvement postponed:

- Voice/video calls

---

## Phase 5 — Study Groups

### 👥 Groups

- Create group
- Join group
- Group chat
- Member list

Use cases:

- Course discussions
- Exam preparation
- Project collaboration

---

## Phase 6 — AI Academic Assistant

### 🤖 AI Features

- Ask academic questions
- Explanation generation
- Study summaries
- Quick revision help

Integration via external AI API.

---

## Phase 7 — Multi‑University Scaling

### 🌍 Platform Structure

- Thousands of universities supported
- University-based content filtering
- Row Level Security policies
- Data isolation per university

---

## Phase 8 — MVP Polish & Launch

### ✅ Performance

- Optimize queries
- Loading states
- Error handling

### ✅ Security

- Supabase RLS policies
- Protected routes

### ✅ UX Improvements

- Mobile responsiveness
- Clean onboarding
- Navigation refinement

---

## MVP Success Metrics

- User signup rate
- Daily active students
- Messages sent
- Posts created
- Groups formed
- AI assistant usage

---

## Post‑MVP (Future Features)

Not included in MVP:

- Video calls
- Marketplace
- Events system
- Internship board
- Monetization
- Cross‑country expansion

---

## Target Outcome

Launch a usable Campus platform where real Nigerian university students can onboard, interact, and collaborate daily.

The MVP validates Campus as a scalable national student social network.
