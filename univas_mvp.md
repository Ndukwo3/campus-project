# UNIVAS

## Minimum Viable Product (MVP) Scope Document

**Version:** 1.0  
**Date:** 18 November 2026  
**Status:** Draft for Approval  
**Product:** UNIVAS  
**Tagline:** The Ultimate Social and Academic Network for Nigerian University Students.

---

# 1. Product Overview

UNIVAS is a web-based social and academic platform designed to connect students across Nigerian universities.

The platform provides a simple environment where students can communicate privately, share posts publicly, and access academic books and learning materials in PDF format.

The initial release will focus on delivering these essential capabilities reliably.

UNIVAS will not attempt to become a feature-heavy social network at launch. The objective is to release a functional, accessible and secure platform that students can begin using immediately.

# 2. MVP Objective

The primary objective of the UNIVAS MVP is to launch a working platform that allows students to:

1. Create accounts and access the platform.
2. Publish and view posts on one general public feed.
3. Send and receive private messages.
4. Access and read academic books and resources in PDF format.

These capabilities form the foundation of the first release.

# 3. Target Audience

The primary target audience is students in Nigerian tertiary institutions, including:

- University students.
- Polytechnic students.
- College of Education students.
- Other eligible tertiary institution students.

The platform will initially serve students from different institutions within one shared environment.

There will be no separate university-specific feeds in the MVP.

# 4. Core MVP Features

## 4.1 User Registration and Authentication

Users must be able to create accounts and securely access UNIVAS.

Essential functionality:

- User registration.
- Login and logout.
- Password management.
- Password recovery.
- Basic account information.
- Appropriate authentication and access controls.

The registration process should remain straightforward and avoid unnecessary onboarding requirements.

## 4.2 Student Profiles

Each registered user should have a basic profile.

Essential functionality:

- Display name.
- Profile picture, where available.
- University or institution information.
- Basic profile information.
- Ability to view other users' profiles.

The profile system should remain simple. Advanced profile customisation is not required.

## 4.3 General Public Feed

UNIVAS will have one shared public feed.

Posts from users across different institutions will appear in the same feed.

Essential functionality:

- View posts from other users.
- Create and publish text posts.
- View individual posts.
- Display the author's basic information.
- Display post publication dates.
- Load additional posts as users browse.

There will be no separate campus feed, nationwide feed or institution-specific feed in the MVP.

The feed should provide a straightforward way for students to share information and see what other students are posting.

## 4.4 Private Messaging (Normal Chat)

Users should be able to communicate privately through normal one-to-one conversations.

Essential functionality:

- Find or select another user.
- Start a private conversation.
- Send text messages.
- Receive messages.
- View previous conversations.
- View message history.
- Display message timestamps.

The messaging system should be simple and reliable.

The MVP will not include group chats, group messaging or community channels.

## 4.5 Academic PDF Library

UNIVAS will provide a library where students can access academic books and learning materials in PDF format.

Essential functionality:

- Browse available academic resources.
- View resource titles and basic descriptions.
- Open PDF documents.
- Read PDFs within the platform.
- Navigate between PDF pages.
- Return to the resource library.

The library should make academic materials easy to discover and access.

Administrators should be able to manage the resources available in the library.

The initial release will focus on PDF documents rather than building a complicated learning management system.

---

# 5. Essential Administrative Functionality

Although the MVP is intentionally small, administrators need basic tools to operate the platform safely.

Essential functionality:

- View registered users.
- Manage user accounts.
- Suspend or restrict abusive accounts where necessary.
- Review and moderate public posts.
- Manage academic PDF resources.
- Handle basic reports of inappropriate content.

Administrative permissions must be protected. Ordinary users must not be able to access administrative functions.

# 6. Security and Technical Foundations

The following are necessary supporting requirements rather than optional additional features.

- Secure authentication.
- Proper database access controls.
- Appropriate user permissions.
- Server-side authorization for protected operations.
- Secure private messaging.
- Protection of private user information.
- Appropriate file access controls.
- Input validation and protection against malicious content.
- Secure administrative operations.
- Error handling and basic system monitoring.

Private conversations must not be publicly accessible.

The PDF library must also use appropriate permissions to prevent unauthorised resource management.

# 7. Platform Requirements

UNIVAS will be a web-only product for the initial release.

Requirements:

- Accessible through modern web browsers.
- Responsive on mobile phones, tablets and desktop computers.
- Functional across commonly used screen sizes.
- Reliable navigation and user interactions.
- Reasonable loading performance.
- Secure deployment over HTTPS.

There will be no separate mobile application development during the MVP phase.

# 8. Explicitly Excluded Features

The following features are outside the MVP scope.

## 8.1 Groups and Communities

- Group creation.
- Group membership.
- Group conversations.
- Community channels.
- Group management.

These features are postponed until a future development phase.

## 8.2 Events

- Event creation.
- Event discovery.
- Event registration.
- Event reminders.
- Event management.

Events are reserved for future development.

## 8.3 AI Functionality

- AI assistant.
- AI-powered recommendations.
- AI chat features.
- AI academic assistance.
- AI-related API functionality.

All AI-related functionality is excluded from the current product scope.

## 8.4 Mobile Applications

- Android application.
- iOS application.
- APK generation and distribution.
- Android TWA/Bubblewrap packaging.
- Play Store deployment.
- App Store deployment.

UNIVAS will operate exclusively as a responsive web platform for now.

## 8.5 Other Deferred Features

The following are also excluded unless later approved:

- Stories and story management.
- Advanced social networking features.
- Complex recommendation systems.
- Advanced analytics for ordinary users.
- Monetisation and advertising systems.
- Premium subscriptions.
- Advanced gamification.
- Complex institutional dashboards.

---

# 9. Future Development Backlog

The following ideas are retained for possible future development. They are not launch requirements.

| Feature                      | Status                |
| ---------------------------- | --------------------- |
| Groups and communities       | Future phase          |
| Events and event management  | Future phase          |
| Android and iOS applications | Future phase          |
| Stories                      | Future consideration  |
| AI functionality             | Not currently planned |
| Advanced social features     | Future consideration  |
| Monetisation                 | Future consideration  |

Keeping these ideas documented ensures that reducing the MVP scope does not mean permanently losing potentially useful product ideas.

---

# 10. MVP User Journeys

The first release should support four straightforward user journeys.

### Journey 1: Joining UNIVAS

1. A student visits the UNIVAS website.
2. The student creates an account.
3. The student logs in.
4. The student completes or updates basic profile information.
5. The student accesses the platform.

### Journey 2: Sharing a Post

1. A registered student opens the general feed.
2. The student enters text into the post composer.
3. The student publishes the post.
4. The post appears in the general feed.
5. Other users can view it.

### Journey 3: Sending a Private Message

1. A student opens the messaging section.
2. The student selects another user.
3. The student starts a conversation.
4. The student sends a message.
5. The recipient receives the message and can respond.

### Journey 4: Reading an Academic PDF

1. A student opens the academic library.
2. The student browses available resources.
3. The student selects a PDF.
4. The document opens in the platform's PDF reader.
5. The student reads and navigates through the document.

---

# 11. MVP Acceptance Criteria

The MVP should not be considered ready for launch until the following conditions are satisfied.

| ID     | Requirement     | Expected Result                                       |
| ------ | --------------- | ----------------------------------------------------- |
| MVP-01 | Registration    | New users can create accounts.                        |
| MVP-02 | Authentication  | Registered users can securely log in and out.         |
| MVP-03 | Profiles        | Users can view and update basic profile information.  |
| MVP-04 | Public Feed     | Users can view one shared public feed.                |
| MVP-05 | Posts           | Users can create and publish text posts.              |
| MVP-06 | Messaging       | Users can send and receive private messages.          |
| MVP-07 | Message History | Users can access their previous conversations.        |
| MVP-08 | PDF Library     | Users can browse available academic resources.        |
| MVP-09 | PDF Reader      | Users can open and read PDF documents.                |
| MVP-10 | Administration  | Administrators can manage users, posts and resources. |
| MVP-11 | Security        | Protected operations enforce appropriate permissions. |
| MVP-12 | Responsiveness  | The website works on mobile and desktop browsers.     |

# 12. Development Principles

Development of the UNIVAS MVP should follow these principles:

**1. Simplicity first**

Build only what is necessary for the first release.

**2. Reuse existing functionality**

Preserve working components and systems in the existing codebase wherever possible.

**3. No unnecessary rebuilding**

Do not rewrite working modules simply to change their implementation.

**4. Security is essential**

Reducing features must never mean reducing security.

**5. Incremental development**

Implement changes in manageable stages, test them and review results before proceeding.

**6. Avoid premature expansion**

Do not introduce new features without a clear reason and approval.

**7. Mobile-responsive web experience**

A separate mobile application is unnecessary for the initial release, but the website must work properly on mobile devices.

# 13. Definition of MVP Success

The first version of UNIVAS will be considered successful when students can reliably:

- Register and access their accounts.
- Share and read posts.
- Communicate through private one-to-one messaging.
- Access and read academic PDF resources.

The platform must also be secure, stable and usable enough to support real students.

# 14. Final Scope Statement

The UNIVAS MVP is a web-based social and academic platform for Nigerian tertiary students.

Its initial release will focus exclusively on:

1. User accounts and basic profiles.
2. One general public feed for text posts.
3. Private one-to-one messaging.
4. An academic library for reading PDF resources.

Essential administrative, security and operational capabilities will support these features.

Groups, communities, events, AI functionality and mobile applications are excluded from the current release.

The objective is to launch a simple, stable and useful product, gather feedback from actual students and expand UNIVAS gradually based on real needs.

**UNIVAS MVP: Connect. Share. Communicate. Learn.**
