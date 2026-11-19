# UNIVAS

## MVP IMPLEMENTATION PLAN

**Version:** 1.0  
**Date:** 18 November 2026  
**Status:** Proposed for Approval  
**Product:** UNIVAS  
**Reference Documents:**

- `univas_mvp.md`
- `UNIVAS_MVP_AUDIT_REPORT.md`

---

# 1. PURPOSE

This document defines the technical implementation strategy for simplifying the existing UNIVAS application into a stable, functional and launch-ready Minimum Viable Product.

The existing UNIVAS codebase already contains substantial implementations of the core features.

The objective is therefore not to rebuild UNIVAS but to simplify, improve, secure and stabilise the existing application.

All implementation activities must follow the approved MVP scope.

# 2. APPROVED MVP SCOPE

The first release of UNIVAS will contain four primary capabilities.

| No. | Feature                    | Description                                                              |
| --- | -------------------------- | ------------------------------------------------------------------------ |
| 1   | User Accounts and Profiles | Students can register, log in and maintain basic profiles.               |
| 2   | General Public Feed        | Students can publish and read text posts in one shared feed.             |
| 3   | Private Messaging          | Students can send and receive normal one-to-one messages.                |
| 4   | Academic PDF Library       | Students can browse and read academic books and resources in PDF format. |

Essential supporting functionality:

- Secure authentication.
- Password recovery.
- Basic account settings.
- User administration.
- Content moderation.
- Academic resource management.
- Database security.
- Responsive web interface.

## 2.1 Platform Direction

UNIVAS will remain a web-only application.

It must work properly on:

- Desktop computers.
- Laptops.
- Tablets.
- Mobile phone browsers.

No separate Android or iOS application is required.

# 3. FUNCTIONALITY TO RETAIN

The following existing components should remain part of the application.

| Component               | Required Action             |
| ----------------------- | --------------------------- |
| Authentication          | Retain and improve.         |
| Student Profiles        | Retain and simplify.        |
| General Feed            | Retain and simplify.        |
| Text Post Creation      | Retain.                     |
| Private Messaging       | Retain.                     |
| Conversation History    | Retain.                     |
| Academic Library        | Retain and improve.         |
| PDF Viewer              | Retain.                     |
| Admin Dashboard         | Retain essential functions. |
| User Management         | Retain.                     |
| Post Moderation         | Retain.                     |
| PDF Resource Management | Retain.                     |

Existing working implementations should be reused wherever possible.

# 4. FUNCTIONALITY TO REMOVE OR DISCONNECT

The following features are excluded from the MVP.

| Feature                       | Required Action                                       |
| ----------------------------- | ----------------------------------------------------- |
| Groups                        | Remove from MVP interface and routes.                 |
| Communities                   | Remove from MVP interface and routes.                 |
| Group Channels                | Remove from MVP interface and routes.                 |
| Events                        | Remove from MVP interface and routes.                 |
| Stories                       | Remove from feed and navigation.                      |
| AI Assistant                  | Remove from navigation and application functionality. |
| AI API Integration            | Remove if present.                                    |
| Push Notifications            | Disable and remove unnecessary infrastructure.        |
| Push Subscription             | Disable and remove unnecessary infrastructure.        |
| Re-engagement Cron Jobs       | Remove from deployment configuration.                 |
| Build Your Loop               | Remove the five-connection requirement.               |
| Premium Features              | Remove from MVP interface.                            |
| Advanced Profile Gamification | Simplify or remove.                                   |
| Android TWA                   | Exclude from product deployment.                      |
| APK Generation                | Exclude from development workflow.                    |
| App Store Deployment          | Exclude.                                              |
| Play Store Deployment         | Exclude.                                              |

## 4.1 Database Preservation Rule

Removing a feature from the MVP does not automatically authorise dropping its database tables.

Existing tables and relationships associated with groups, events, stories and other excluded functionality should remain untouched during the initial simplification.

Before removing any shared component, inspect its dependencies.

Do not introduce destructive database migrations as part of the initial cleanup.

Future database cleanup can be considered after the application has been stabilised.

# 5. DEVELOPMENT PHASES

## PHASE 1 — SECURITY AND AUTHENTICATION

**Priority: Critical**

Objective: Address critical security vulnerabilities and ensure users can access their accounts reliably.

### Tasks

1. Investigate the unauthenticated push notification endpoints.
2. Disable or remove the unnecessary push delivery functionality.
3. Disable or remove the push subscription endpoint.
4. Review and remove unnecessary push-related cron jobs.
5. Review authentication and session handling.
6. Implement appropriate server-side authentication protection.
7. Ensure administrative operations enforce server-side role verification.
8. Implement functional password recovery.
9. Restrict institution and department creation to authorised processes and valid records.
10. Review sensitive operations and Supabase service-role key usage.

### Expected Outcome

- No publicly accessible privileged push endpoints.
- Protected routes enforce authentication.
- Administrative actions require appropriate privileges.
- Students can recover forgotten passwords.
- Existing registration and login continue working.

### Testing Requirements

- Register a new account.
- Log in and log out.
- Request a password reset.
- Complete a password reset.
- Attempt to access protected pages without authentication.
- Attempt to access administrative pages as a normal student.
- Verify that private account information is not exposed.

### Approval Gate

Do not proceed until authentication and critical security issues have been reviewed and tested.

---

## PHASE 2 — FEED, ONBOARDING AND PROFILE SIMPLIFICATION

**Priority: High**

Objective: Make the student experience straightforward.

### Tasks

1. Remove the Build Your Loop requirement.
2. Allow authenticated users to access the general feed without following five students.
3. Ensure all users share one general public feed.
4. Retain text post creation.
5. Retain post author information and timestamps.
6. Remove StoriesBar from the feed.
7. Simplify unnecessary profile features.
8. Remove unnecessary profile gamification.
9. Review onboarding and remove unnecessary steps.
10. Ensure students can update their basic profile information.

### Feed Requirements

The feed must:

- Display posts from all UNIVAS users.
- Use a consistent ordering system.
- Allow users to create text posts.
- Display the author's basic information.
- Display publication timestamps.
- Support reasonable pagination.

### Important Scope Restriction

Text posts are the primary requirement.

Image posting, reposts, bookmarks, elaborate threaded comments and other advanced interactions are not launch requirements unless separately approved.

Do not introduce new social features during this phase.

### Expected Outcome

Students can register, complete basic profile information and access the general feed immediately.

---

## PHASE 3 — NAVIGATION AND APPLICATION SIMPLIFICATION

**Priority: High**

Objective: Remove unnecessary complexity from the interface.

### Tasks

1. Simplify desktop navigation.
2. Simplify mobile bottom navigation.
3. Remove links to groups and communities.
4. Remove event navigation.
5. Remove stories navigation.
6. Remove AI assistant navigation.
7. Remove unnecessary notification navigation.
8. Remove premium and suggested-connection widgets where unnecessary.
9. Remove unused buttons and actions associated with excluded features.
10. Review the remaining pages for broken links and unnecessary UI elements.

### Approved Primary Navigation

The main application navigation should contain:

1. Home — General Feed.
2. Messages — Private Chat.
3. Library — Academic PDF Resources.
4. Profile — Student Account.

Administrative navigation should remain available only to authorised administrators.

### Important Restriction

Do not remove shared components merely because they are also used by excluded features.

Inspect dependencies before making changes.

### Expected Outcome

The application has a clean, simple interface focused on the four approved MVP capabilities.

---

## PHASE 4 — ACADEMIC PDF LIBRARY

**Priority: High**

Objective: Ensure students can discover and read real academic resources.

### Tasks

1. Investigate the existing academic resource database structure.
2. Remove hardcoded MOCK_COURSES data.
3. Connect course discovery to actual database records.
4. Retrieve only approved resources for ordinary students.
5. Verify university, faculty, department, level and course relationships.
6. Verify PDF storage and file access permissions.
7. Verify the existing PDF reader.
8. Verify PDF page navigation.
9. Test document loading on mobile and desktop.
10. Verify administrator resource approval and management.

### Important Database Rule

Do not invent a new academic database structure without inspecting the existing schema.

Reuse existing tables and relationships wherever possible.

If the existing catalogue cannot support the required browsing experience, document the gap and propose the smallest necessary database improvement.

### Expected Outcome

Students can browse genuine academic resources and open PDF documents successfully.

---

## PHASE 5 — PRIVATE MESSAGING AND ADMINISTRATION VERIFICATION

**Priority: High**

Objective: Ensure the two essential supporting systems are reliable.

### Private Messaging

Verify:

- Starting one-to-one conversations.
- Sending text messages.
- Receiving text messages.
- Conversation history.
- Conversation list.
- Message timestamps.
- Realtime message delivery.
- Message privacy.
- Participant-based database permissions.

Do not introduce group chats or community channels.

### Administration

Verify:

- User directory.
- User account management.
- Role-based permissions.
- Post moderation.
- Academic resource approval.
- Academic resource management.
- Protection of administrative operations.

Simplify unnecessary administrative features without compromising the ability to operate the platform safely.

### Expected Outcome

Students can communicate privately, while administrators can manage the essential operations of UNIVAS.

---

## PHASE 6 — QUALITY ASSURANCE AND LAUNCH PREPARATION

**Priority: Critical before launch**

Objective: Verify that the complete MVP works reliably.

### Functional Testing

Test the following user journeys.

**Journey 1: Account Creation**

Visit website → Register → Log in → Complete basic profile → Access feed.

**Journey 2: Public Posting**

Open feed → Create text post → Publish → Verify that the post appears in the shared feed.

**Journey 3: Private Messaging**

Find another student → Start conversation → Send message → Receive response → View message history.

**Journey 4: Academic Library**

Open library → Browse resources → Select PDF → Read document → Navigate pages.

### Security Testing

Verify:

- Authentication.
- Server-side authorization.
- Administrative permissions.
- Private messaging isolation.
- Database RLS policies.
- File storage permissions.
- Input validation.
- API endpoint security.
- Protection against unauthorised data modification.

### Responsiveness Testing

Test on:

- Desktop.
- Laptop.
- Tablet.
- Mobile phone.

### Final Launch Checks

- No broken navigation links.
- No unnecessary feature entry points.
- No critical console errors.
- No critical API failures.
- No exposed secrets.
- No unauthenticated privileged endpoints.
- No major responsive layout problems.
- No broken core user journeys.

### Expected Outcome

A stable, secure and usable web application ready for an initial student release.

# 6. IMPLEMENTATION RULES FOR GOOGLE ANTIGRAVITY

All implementation work must follow these rules.

## 6.1 Investigate Before Editing

Before modifying a feature, inspect:

- Relevant components.
- Related API routes.
- Hooks and utilities.
- Database tables.
- SQL migrations.
- RLS policies.
- Shared dependencies.

Do not assume the audit report contains every dependency.

## 6.2 Small and Controlled Changes

Implement one phase at a time.

Do not combine unrelated changes into one large implementation operation.

## 6.3 Preserve Existing Functionality

Do not rebuild working components unnecessarily.

Prefer modifying and reusing existing implementations.

## 6.4 No Unauthorised Database Changes

Do not:

- Drop tables.
- Drop columns.
- Delete database records.
- Remove foreign keys.
- Change existing RLS policies without review.
- Run destructive migrations.

If a database change is necessary, explain why and request approval.

## 6.5 Dependency Management

Do not install or remove dependencies without establishing why they are required.

Check whether packages are used elsewhere before removing them.

## 6.6 No Automatic Deployment

Do not push to production or deploy changes without explicit approval.

## 6.7 Testing and Reporting

After every phase, provide:

1. Summary of completed work.
2. Files modified.
3. Files created or removed.
4. Database changes, if any.
5. Dependencies changed, if any.
6. Tests performed.
7. Test results.
8. Outstanding problems.
9. Recommendations for the next phase.

Do not report a feature as working unless it has been appropriately tested.

# 7. IMPLEMENTATION TRACKER

| Phase | Description                   | Status      |
| ----- | ----------------------------- | ----------- |
| 1     | Security and Authentication   | Not Started |
| 2     | Feed, Onboarding and Profiles | Not Started |
| 3     | Navigation and Simplification | Not Started |
| 4     | Academic PDF Library          | Not Started |
| 5     | Messaging and Administration  | Not Started |
| 6     | Quality Assurance and Launch  | Not Started |

# 8. FINAL PRODUCT DEFINITION

The final MVP will be a responsive web-based social and academic platform for Nigerian tertiary students.

It will provide:

- Student accounts and basic profiles.
- One general public feed for text posts.
- Normal one-to-one private messaging.
- An academic PDF library with an in-browser reader.
- Essential administrative functionality.
- Secure authentication and database permissions.

Groups, communities, events, AI functionality, stories, push notifications and mobile applications are outside the initial release.

The development strategy is to simplify the existing application, preserve useful working functionality, fix important issues and prepare the platform for real users.

**The goal is to launch a simple product that works, learn from students using it and expand only when there is a genuine need.**

---

**Document Owner:** UNIVAS Product Team  
**Implementation Reference:** `univas_mvp.md`  
**Audit Reference:** `UNIVAS_MVP_AUDIT_REPORT.md`
