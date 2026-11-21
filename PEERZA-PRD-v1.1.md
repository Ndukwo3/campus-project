# PEERZA — Product Requirements Document (PRD)

**Product:** PEERZA  
**Tagline:** The ultimate social and academic network for Nigerian university students.  
**Document type:** Product Requirements Document  
**Version:** 1.1 — Validated Draft  
**Date:** 18 November 2026  
**Status:** Updated following read-only codebase validation  
**Product category:** Social networking, academic collaboration and student community platform  
**Initial market:** Nigerian tertiary institutions  
**Reference documents:** `PEERZA-PRD.md` v1.0 and `PEERZA-PRD-VALIDATION-REPORT.md`

---

## Document Control

| Item | Details |
|---|---|
| Document | PEERZA Product Requirements Document |
| Version | 1.1 — Validated Draft |
| Supersedes | Version 1.0 — Initial Draft |
| Date | 18 November 2026 |
| Validation basis | Antigravity read-only codebase audit |
| Codebase inspected | `campus-project` |
| Change scope | Product documentation only; no application code changes |
| Next review | After product-owner decisions and SRS preparation |

### Version 1.1 change summary

This revision incorporates findings from the codebase validation report. It:

- Clarifies the distinction between the intended product requirements and the implementation status observed during the audit.
- Documents the existing Events module and multi-device session functionality more accurately.
- Records the exact five-connection Build Your Loop gate reported by the audit.
- Clarifies the current academic-library hierarchy and the hardcoded course fallback.
- Records the missing AI API route and password-recovery workflow.
- Makes the institutional-feed behaviour and privacy decision explicit.
- Adds the reported push-endpoint security concerns and route-protection gaps to the risk register.
- Updates the implementation snapshot without treating existing implementation as automatic approval of future product scope.

**Important:** This PRD is a product requirements document, not a declaration that every requirement is already implemented or production-ready. The implementation snapshot is evidence from a read-only audit and may need live testing or further technical verification.

---

# 1. Product Overview

## 1.1 Introduction

PEERZA is a digital social and academic networking platform designed to connect university and tertiary institution students across Nigeria.

The platform provides students with a central digital environment where they can interact with fellow students, build academic and professional connections, participate in campus communities, share information, communicate in real time, access academic resources and receive academic support.

PEERZA combines the social networking experience of general social platforms with professional networking and community-building capabilities, while introducing features specifically designed around the structure and needs of Nigerian tertiary institutions.

Its structure recognizes universities, faculties, colleges, departments, academic levels and courses. This allows students to connect and collaborate based on their academic identities while remaining part of a larger nationwide student community.

The platform is intended to become a central digital space for student interaction, academic collaboration, knowledge sharing and networking across Nigerian tertiary institutions.

## 1.2 Product Concept

PEERZA brings together five major areas of student digital life:

1. **Social Networking:** Connecting students, sharing updates, interacting with posts and participating in campus conversations.
2. **Academic Collaboration:** Helping students discover, contribute and share academic resources.
3. **Communication:** Providing real-time messaging and organized communities for student interaction.
4. **Academic Support:** Providing access to AI-powered academic assistance and learning tools.
5. **Community Management:** Providing administrative and moderation tools to manage users, academic content and platform activities.

These areas operate within one interconnected platform rather than requiring students to depend on several disconnected applications.

## 1.3 Product Positioning

PEERZA is positioned as a student-first social and academic network for Nigerian tertiary institutions.

It is not intended to be another generic social media platform or simply an online repository of past questions. It brings social interaction, academic resources, student communities and communication together in one environment.

**Product tagline:** “The ultimate social and academic network for Nigerian university students.”

---

# 2. Background and Problem Statement

## 2.1 Background

University students in Nigeria rely on different digital platforms to communicate, exchange academic information, access learning materials and maintain relationships with classmates.

Messaging groups are commonly used for departmental announcements, course discussions and sharing past questions. General social platforms are used for interaction and content discovery.

These experiences are fragmented. Students often have to move between several platforms to accomplish activities that are directly connected to their academic and social lives.

PEERZA was conceived to address this fragmentation by providing a unified digital environment specifically designed for tertiary students.

## 2.2 Problems Being Addressed

### A. Disconnected Student Communities

Students frequently lose access to organized communication with classmates outside physical lecture environments. Departmental and course-based discussions are often scattered across multiple messaging groups, making it difficult to maintain organized academic communities.

### B. Fragmented Academic Resources

Past examination questions, lecture notes, course materials and other educational resources are commonly distributed through informal student networks. These materials are often difficult to locate, organize and retrieve when needed.

### C. Limited Cross-University Networking

Students from different universities frequently operate within isolated institutional communities. There are limited centralized opportunities for students across different institutions to interact, exchange ideas, share knowledge and build connections.

### D. Lack of Student-Centred Social Platforms

Most mainstream social networking platforms are designed for general audiences. They do not inherently organize users around university identities, departments, academic levels and course-related communities.

### E. Academic Information Management

Students need a more structured way to discover academic materials based on their institutions, faculties, departments, levels and courses. Searching through unrelated messages and multiple groups makes this process unnecessarily difficult.

### F. Limited Access to Integrated Academic Assistance

Students increasingly need digital tools that can help explain difficult topics, summarize learning materials, support examination preparation and assist with academic calculations. These capabilities are often provided through separate applications rather than being integrated into the student's academic community.

## 2.3 Problem Statement

Nigerian tertiary students lack a unified digital platform that combines social networking, academic resource management, real-time communication and academic collaboration within an institution-aware environment.

PEERZA aims to bridge this gap by creating a connected student ecosystem where academic and social interactions can happen in one place.

---

# 3. Product Vision, Mission and Philosophy

## 3.1 Vision

To build the largest digital student network in Nigeria, becoming the default platform where university students connect socially, collaborate academically, build professional networks, learn together and grow beyond physical campus boundaries.

In the long term, PEERZA aims to connect students from tertiary institutions across Africa into a unified digital ecosystem that encourages innovation, academic advancement and career opportunities.

## 3.2 Mission

To eliminate academic and social boundaries for tertiary students by providing a community-structured digital platform that organizes academic resources, fosters student networking, facilitates real-time collaboration and improves student learning through technology and AI-driven academic support.

## 3.3 Product Philosophy

- **Student First:** Product decisions should prioritize the needs and experiences of students.
- **Connected Communities:** Students should be able to connect within their institutions and beyond them.
- **Accessible Knowledge:** Academic resources should be easier to discover, organize and share.
- **Simple Onboarding:** Students should be able to join the platform without unnecessary institutional verification barriers.
- **Collaboration:** The platform should encourage students to learn and grow together.
- **Trust and Accountability:** User-generated content and academic contributions should have appropriate moderation mechanisms.
- **Continuous Improvement:** The platform should evolve based on user feedback, usage patterns and changing student needs.

---

# 4. Product Goals and Objectives

1. **Build a Nationwide Student Network:** Create a connected community where students from federal, state and private tertiary institutions can discover and interact with one another.
2. **Improve Academic Resource Accessibility:** Provide a structured academic library where students can find past questions, lecture notes and other educational materials based on their academic institutions and courses.
3. **Encourage Student Interaction:** Enable students to publish updates, share experiences, participate in discussions and build meaningful academic and social relationships.
4. **Improve Academic Collaboration:** Provide messaging, communities and other collaboration tools that support group learning and academic discussions.
5. **Integrate Intelligent Academic Support:** Develop an AI-powered academic assistant that helps students understand academic topics, summarize learning materials and prepare for examinations.
6. **Maintain a Trusted Student Environment:** Introduce moderation, reporting, administrative controls and appropriate access restrictions to maintain platform integrity.
7. **Establish a Scalable Platform:** Build a technical and product foundation that can support increasing numbers of students, universities, academic resources and communities.

---

# 5. Target Audience

## 5.1 Undergraduate Students

Students from 100 Level through 600 Level across Nigerian federal, state and private universities and other supported tertiary institutions. They are the platform's primary audience.

## 5.2 Postgraduate Students

Students pursuing postgraduate qualifications, including master's and doctoral degrees, who need academic connections, collaboration and access to educational resources.

## 5.3 Graduates and Recent Alumni

Graduates and recent alumni who may wish to maintain connections with their academic communities and participate in relevant student or professional discussions. Their access and eligibility rules require product confirmation.

## 5.4 Student Creators and Innovators

Students involved in technology, entrepreneurship, student leadership, creative activities and campus initiatives.

## 5.5 Academic Communities

Departmental associations, course groups, study circles and examination preparation communities.

## 5.6 Campus Moderators and Institutional Representatives

Trusted student representatives or appointed personnel responsible for reviewing academic contributions and supporting community governance.

---

# 6. User Roles and Access Levels

## 6.1 Student

The standard platform user should be able to:

- Create and manage an account.
- Set up an academic profile.
- Connect with other students.
- Publish posts and interact with content.
- Create and share stories.
- Send direct messages.
- Join communities and groups.
- Access the academic library.
- Submit academic resources for review.
- Receive notifications.
- Use available academic support tools.

## 6.2 Moderator

A campus-specific moderator responsible for reviewing academic contributions and maintaining content quality within an assigned university.

Expected permissions include:

- Access an authorized moderation dashboard.
- Review pending academic resources.
- Approve or reject submitted materials.
- Perform other moderation activities explicitly permitted by the assigned role.

Moderator access must be limited to the assigned university where the operation is university-scoped.

## 6.3 Admin

A platform-level administrator responsible for broader platform management.

Expected permissions include:

- Manage user accounts.
- Review and moderate reported content.
- Manage academic contributions.
- Oversee platform activities.
- Access platform-level administrative tools permitted by the role.

## 6.4 Super Admin

The highest administrative role.

Expected permissions include:

- Manage administrators and moderators.
- Assign or change administrative roles.
- Oversee platform-wide operations.
- Access administrative features reserved for the highest permission level.

**Access-control principle:** Permissions must be enforced by trusted server-side and database controls, not only by hiding interface elements or redirecting users in the browser.

---

# 7. Core Value Proposition

## 7.1 Institution-Aware Networking

Students can identify their university, faculty or college, department and academic level during onboarding. The platform organizes student identities around academic institutions without making matriculation numbers or institutional email addresses mandatory onboarding requirements, unless a future verification policy changes this.

## 7.2 Connected Campus and Nationwide Communities

Students should be able to participate in relevant campus communities while also discovering and interacting with students from other institutions.

The product must support both campus relevance and nationwide networking. The exact default feed composition and privacy model remain open product decisions.

## 7.3 Organized Academic Library

Students should be able to discover educational resources through a structured hierarchy:

**University Category → University → Faculty/College → Department → Academic Level → Course Code**

The audit found separate faculty and college data entities in the current database. The product's final academic hierarchy and how faculties and colleges relate to institutions must be defined consistently in the SRS and data model.

## 7.4 Integrated Communication

The platform brings together direct messages, groups, communities and organized discussion channels.

## 7.5 AI-Powered Academic Assistance

The product vision includes an academic AI assistant that supports learning, academic explanations, summaries, examination preparation and relevant calculations.

The assistant is a product requirement, but the audit found that its current interface does not have a functioning backend API route.

## 7.6 Student-Focused Social Experience

The platform combines posts, comments, reactions, stories and connections within a community designed around tertiary students.

---

# 8. Product Features and Modules

PEERZA is organized into the following product modules. The implementation notes in each module describe what the validation audit reported; they do not reduce the intended product requirements.

## 8.1 Module One: Identity, Authentication and Onboarding

**Purpose:** Provide students with a simple way to create accounts, establish their academic identities and become part of the PEERZA network.

### Product requirements

- Users must be able to register and log in using supported authentication methods.
- Google authentication should be supported.
- Students must be able to establish an academic profile.
- Onboarding should collect relevant identity and academic information, including name, university category, institution, department, academic level and username.
- The institution catalogue should distinguish supported institution categories, including federal, state and private institutions.
- New users should be guided through Build Your Loop.
- Users should be able to manage active sessions and recover access to their accounts.
- Academic catalogue entries should be validated and managed through an approved process; ordinary onboarding input should not create uncontrolled duplicate institutions or departments.

### Build Your Loop

The validation audit reports that the current onboarding flow includes a Build Your Loop step and that the main feed access gate requires at least five peer connections.

The product requirement is therefore clarified as follows:

- New users are guided to connect with other students during onboarding.
- The reported current gate requires **five connections** before access to the main feed.
- The user interface should communicate progress and explain why the step is required.
- The product owner must confirm whether five connections remains the desired permanent rule, whether users may skip it, and what happens when suggested users are unavailable.

### Validation snapshot

- Email/password authentication: reported implemented.
- Google authentication: reported implemented.
- Academic onboarding wizard: reported implemented.
- Five-connection gate: reported implemented.
- Password recovery: placeholder; full recovery workflow not implemented.
- Unmatched universities/departments may be inserted from client-side onboarding code, creating a data-quality risk.

## 8.2 Module Two: Social Networking

**Purpose:** Enable students to share information, interact with content and build relationships within a student-centred network.

### A. Social Feed

Students should be able to:

- View a feed of student posts.
- Discover relevant campus and nationwide content.
- Publish text and supported media posts.
- View post authors, timestamps and content.
- Interact with posts through supported actions.

**Feed requirement clarification:** PEERZA must support campus-relevant discovery and nationwide discovery. The current audit found that the home feed queries posts globally and does not enforce a university-level filter. The final feed design must define whether the default is “My Campus,” a combined feed, or another arrangement, and whether users can switch to “Nationwide.”

### B. Post Interactions

Students should be able to:

- Like posts.
- Comment on posts.
- Reply to comments where supported.
- Like comments where supported.
- Repost content.
- Bookmark posts.
- Share content through supported sharing options.

### C. Stories

Students should be able to:

- Create image-based stories using a supported upload or capture flow.
- Create text-based stories.
- View stories from eligible users.
- Have stories expire after 24 hours.

The audit reports that the current implementation filters expired stories and displays stories from the user's connections.

### D. Student Connections

Students should be able to discover and connect with other students. Connection requests and accepted connections should be represented consistently and should respect the platform's privacy rules.

### Validation snapshot

The audit reports the social feed, post interactions, nested comments, stories, bookmarks, reposts and bidirectional connections as implemented. It recommends pagination or infinite scrolling for higher-volume feeds. Institutional feed filtering remains incomplete.

## 8.3 Module Three: Communication and Communities

**Purpose:** Provide students with organized channels for one-to-one and group communication.

### A. Direct Messaging

Students should be able to:

- Start and continue one-to-one conversations.
- Exchange messages in real time.
- See relevant unread-message indicators.
- See typing or presence indicators where supported.
- Use supported message attachments.
- *Future Capability:* Audio & Video Calling (deferred to post-MVP development).

### B. Communities and Groups

Students should be able to:

- Discover available groups.
- Create groups where permitted.
- Join and leave groups.
- View group information and membership.
- Participate in group-specific discussions.
- Use privacy settings supported by the product.

### C. Discussion Channels

Groups should be able to organize discussions into topic-based channels, such as announcements, general discussion and resources, where enabled.

### D. Notifications

Students should receive relevant notifications for supported platform activity. Notification preferences should be respected, and notification delivery endpoints must be securely authorized.

### Validation snapshot

The audit reports one-to-one messaging, realtime updates, presence, unread counters, groups, group membership and discussion channels as implemented. It also reports web push functionality, but identifies serious authorization weaknesses in the push API endpoints. Implementation does not imply that the notification system is safe for public production use.

## 8.4 Module Four: Academic Resource Library

**Purpose:** Provide a structured environment for discovering, viewing and contributing academic materials.

### A. Academic Hierarchy

The library should support navigation by:

1. University category.
2. University.
3. Faculty or college, as applicable.
4. Department.
5. Academic level.
6. Course code.

The final relationship between faculties and colleges, and the management of courses, must be specified precisely in the SRS.

### B. Resource Discovery

Students should be able to discover relevant academic resources using the academic hierarchy and available resource metadata.

### C. Resource Types

The platform's intended academic content includes past examination questions, lecture notes, course materials and other approved educational resources. Exact accepted categories and file policies remain to be finalized.

### D. Document Viewer

Users should be able to view supported academic documents in the application. The current audit reports a PDF viewer with page navigation, zoom, pan, rotation and thumbnails.

### E. Resource Submission

Students should be able to submit academic resources with required metadata. Submissions should enter a review process before publication where moderation is required.

### F. Resource Moderation

Authorized moderators should be able to review, approve or reject submitted resources. University-scoped moderation must respect the moderator's assigned institution.

### Validation snapshot

- University/faculty/college/department navigation: reported implemented.
- PDF viewer: reported implemented.
- Student resource upload and pending review records: reported implemented.
- Moderator approval/rejection workflow: reported implemented.
- Course selection: partially implemented; the audit found a hardcoded mock course fallback (including CSC 101, MTH 101, PHY 101 and GST 101) rather than a complete database-backed course catalogue.

A database-backed course catalogue and an approved process for maintaining institution, department and course records remain required.

## 8.5 Module Five: Administration and Governance

**Purpose:** Provide tools to manage users, academic content, reports, moderators and platform operations.

### A. Administrative Dashboard

Authorized administrators should be able to view relevant platform metrics and access management functions permitted by their roles.

### B. User Management

Authorized administrators should be able to review user records and perform permitted account-management actions.

### C. Content Reports

Users should have a way to report inappropriate or problematic content. Authorized staff should be able to review, resolve or dismiss reports.

### D. Academic Resource Moderation

Moderators should be able to review academic contributions within their assigned institutional scope.

### E. Role Management

Only appropriately authorized roles should be able to assign or modify administrative roles. Super-admin-only operations must be protected at the server and database layers.

### F. Support and Settings

Support and settings functions that appear interactive must perform the described action or clearly indicate that the feature is unavailable. Static mock interfaces must not be represented as working product capabilities.

### Validation snapshot

The audit reports a multi-tier role hierarchy (student, moderator, admin and super_admin), an administrative dashboard, user management, report review and resource moderation. It also reports that some settings pages, including support-related interfaces, contain static or disconnected UI. The audit found no root middleware file and reported that route checks rely heavily on client-side redirects. These areas require technical security review.

## 8.6 Module Six: Campus Events

**Purpose:** Support discovery and participation in campus-related events.

The validation audit identified an Events module with event discovery, category filtering and event creation, backed by a database migration and dedicated application views.

Events were previously treated as an assumption or post-MVP possibility in the initial PRD. Version 1.1 records Events as an existing product capability that requires formal scope confirmation.

The following product decisions remain open:

- Whether event creation is available to all students or selected roles.
- Whether events support RSVP or attendance limits.
- Whether event reminders and notifications are required.
- Whether ticketing or paid events are in scope.
- What moderation and reporting rules apply to event listings.

### Validation snapshot

The audit reports database-backed event views and creation functionality. The exact completeness of all event workflows was not independently live-tested as part of this document revision.

## 8.7 Module Seven: Multi-Device Session Management

**Purpose:** Allow users to review and manage active sessions associated with their accounts.

The audit reports an existing session-tracking component and database support for recording session details, including device/browser information and city-level geolocation.

Product requirements:

- Users should be able to review active sessions.
- Users should be able to terminate sessions they do not recognize, subject to secure server-side enforcement.
- Session information should be handled transparently and proportionately.
- The platform should define data retention and privacy rules for session metadata.

The exact session fields, location precision, retention period and behaviour after remote termination require confirmation in the SRS.

## 8.8 Module Eight: AI Academic Assistant

**Purpose:** Provide integrated academic assistance to students.

### Intended capabilities

The AI Academic Assistant should support:

- Answering academic questions.
- Explaining difficult concepts.
- Summarizing learning materials.
- Supporting examination preparation.
- Helping students understand course topics.
- Assisting with relevant calculations, including Nigerian university grading and GP calculations.

### Current implementation status

The audit found an AI assistant chat interface that submits requests to `POST /api/ai`, but no matching API route was found in the inspected repository. The assistant is therefore **not functional end to end** at the time of the audit.

### Outstanding requirements

- Select the AI service provider and model.
- Define backend architecture and secret management.
- Define rate limits and usage policies.
- Decide whether document uploads or supplied learning materials may be used as context.
- Establish cost controls.
- Define safeguards against fabricated or misleading academic answers.
- Establish privacy rules for prompts and uploaded materials.
- Provide clear error handling when the service is unavailable.

---

# 9. User Journeys

These journeys describe intended product experiences, not proof that every step currently works.

## 9.1 New Student Registration

1. A student visits PEERZA.
2. The student creates an account using email or Google authentication.
3. The student enters personal information.
4. The student selects a university category.
5. The student selects their university.
6. The student provides their department and academic level.
7. The student selects a username.
8. The student proceeds to Build Your Loop.
9. The student connects with suggested users.
10. The student gains access to the main feed after meeting the configured connection requirement.

## 9.2 Social Networking

1. A student opens the main feed.
2. The student discovers campus or nationwide posts according to the selected feed design.
3. The student interacts through likes, comments, reposts or bookmarks.
4. The student visits other profiles.
5. The student establishes connections.
6. The student publishes content.

## 9.3 Sharing Stories

1. A student opens the stories section.
2. The student selects or captures an image, or creates a text-based story.
3. The student publishes the story.
4. Eligible students view the story.
5. The story expires after 24 hours.

## 9.4 Direct Messaging

1. A student discovers another user.
2. The student initiates a conversation.
3. PEERZA opens or creates the conversation.
4. Both users exchange messages.
5. New messages update in real time.
6. Relevant unread indicators and notifications are displayed.

## 9.5 Academic Resource Discovery

1. A student opens the academic library.
2. The student selects the relevant institution category and university.
3. The student navigates through the available faculty/college and department structure.
4. The student selects an academic level and course where catalogue data is available.
5. The student browses available materials.
6. The student opens a supported document in the in-app viewer.

## 9.6 Academic Resource Contribution

1. A student opens the contribution workflow.
2. The student selects and uploads an eligible academic document.
3. The student provides the required academic metadata.
4. The submission is recorded as pending review.
5. An authorized moderator reviews the submission.
6. The moderator approves or rejects it.
7. Approved material becomes available according to library access rules.

## 9.7 Campus Events

1. A student opens the Events area.
2. The student browses available events and categories.
3. The student opens an event to view its details.
4. Where supported, the student creates or manages an event subject to the applicable permissions.

The exact RSVP, reminder and ticketing journey remains to be decided.

---

# 10. Functional Requirements

Priorities: **Critical** = essential to the core platform; **High** = important for a complete product experience; **Medium** = valuable supporting capability. These priorities describe product importance, not implementation status.

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | Users must be able to register and log in. | Critical |
| FR-002 | Users must be able to authenticate using Google. | High |
| FR-003 | Users must be able to establish academic profiles. | Critical |
| FR-004 | Users must be able to select their university, department and academic level. | Critical |
| FR-005 | New users must be guided through the Build Your Loop process. | High |
| FR-006 | Users must be able to publish social posts. | Critical |
| FR-007 | Users must be able to interact with posts. | Critical |
| FR-008 | Users must be able to publish and view stories. | High |
| FR-009 | Users must be able to establish connections. | High |
| FR-010 | Users must be able to send direct messages. | Critical |
| FR-011 | Users must be able to participate in communities and groups. | High |
| FR-012 | Users must be able to participate in group discussion channels. | High |
| FR-013 | Users must be able to browse the academic library. | Critical |
| FR-014 | Users must be able to view supported academic documents. | High |
| FR-015 | Users must be able to submit academic resources. | High |
| FR-016 | Authorized moderators must be able to review contributions. | Critical |
| FR-017 | Administrators must be able to manage users and reports. | High |
| FR-018 | Administrative permissions must respect assigned user roles. | Critical |
| FR-019 | Users should receive relevant platform notifications. | High |
| FR-020 | The platform should provide AI-powered academic assistance. | High |
| FR-021 | Users should be able to recover access to their accounts. | High |
| FR-022 | Users should be able to manage their active sessions. | Medium |
| FR-023 | The platform should support academic and campus discovery. | High |
| FR-024 | Users should be able to discover and use campus event functionality. | High; scope to be confirmed |
| FR-025 | The feed should support campus-relevant and nationwide content discovery according to defined visibility rules. | High |
| FR-026 | Users should be able to report content and receive a meaningful report-submission outcome. | High |
| FR-027 | Users should be able to manage supported notification preferences. | Medium |

---

# 11. Non-Functional Requirements

The platform should meet the following quality requirements. Exact measurable thresholds should be defined in the SRS and validated through testing.

## 11.1 Security

- Authentication and authorization must be enforced on trusted server-side and database layers.
- Privileged service credentials must never be exposed to untrusted clients.
- Service-role API endpoints must authenticate and authorize callers.
- Users must not be able to act on another user's account or data by changing a submitted identifier.
- Administrative and moderator permissions must be enforced for every protected operation.
- Database access policies must be reviewed for correct user, role and institutional boundaries.
- User input and file uploads must be validated.
- Secrets must be stored in secure environment configuration.

## 11.2 Privacy and Data Protection

- The platform must define which profile, post, academic and session data is public, campus-scoped, connection-scoped or private.
- The platform must avoid collecting more personal data than is required for the feature.
- Session and location-related metadata must have a defined purpose, access policy and retention policy.
- Users should receive understandable information about relevant data use.

## 11.3 Performance and Scalability

- Feed, messaging and library experiences should remain responsive as usage grows.
- High-volume lists should support pagination or another scalable loading strategy.
- Database queries should be indexed and scoped appropriately.
- Media and document delivery should account for users on low-bandwidth networks.

## 11.4 Reliability

- The application should handle network failures and unavailable external services gracefully.
- Optimistic UI updates should recover correctly when a request fails.
- Critical user actions should provide clear success or failure feedback.
- Realtime features should recover from connection interruptions where feasible.

## 11.5 Usability and Accessibility

- The platform should provide a consistent responsive experience across supported screen sizes.
- Navigation and key actions should be understandable to students with different levels of digital experience.
- Loading, empty, error and success states should be designed for major workflows.
- Important controls should be keyboard accessible and have suitable labels.

## 11.6 Compatibility

The application should support modern browsers and the intended mobile web experience. Android packaging is present in the current technical setup according to the audit; the supported release targets and testing requirements must be formally agreed.

---

# 12. Technology and Platform Direction

The validation report identified the following technology stack in the inspected codebase. This is an observed implementation snapshot, not a requirement to retain every technology indefinitely.

| Layer | Observed technology |
|---|---|
| Framework | Next.js 16 |
| Frontend | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Client state | Zustand |
| Server state | TanStack React Query |
| Backend services | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth and Google Identity Services |
| Realtime | Supabase Realtime |
| Notifications | Web Push and Vercel Cron |
| Document viewing | React-PDF and PDF.js |
| Hosting | Vercel |
| Android packaging | Trusted Web Activity / Bubblewrap |

### Architecture observations from validation

- The project uses the Next.js App Router.
- Supabase is used for authentication, database access, storage and realtime functionality.
- The audit reports that many pages are client components and that client-side Supabase operations and React Query mutations are common.
- Some API routes use the Supabase service-role key.
- The audit identified a difference between the architecture guidance in the repository and the implementation patterns used in many pages.

The SRS and technical architecture documentation should establish the approved patterns for server/client responsibilities, privileged operations, data access and API boundaries.

---

# 13. Current Implementation Snapshot

The following table summarizes the findings of the read-only Antigravity validation report dated 18 November 2026. Statuses are audit findings, not independent live-test results.

| Feature | Audit status | Validation notes |
|---|---|---|
| Email/password authentication | Implemented | Supabase Auth flow reported present |
| Google authentication | Implemented | Google Identity Services flow reported present |
| Academic onboarding | Implemented | Four-step flow reported present |
| Build Your Loop | Implemented | Audit reports a five-connection feed gate |
| Student profiles | Implemented | Profile functionality reported present |
| Institutional feed isolation | Partially implemented | Feed query reported global; campus filter not enforced |
| Social feed | Implemented | Post feed reported present |
| Post interactions | Implemented | Likes, comments, bookmarks and reposts reported present |
| Nested comments | Implemented | One-level nested replies reported |
| Stories | Implemented | Image/text stories with 24-hour expiry reported |
| Student connections | Implemented | Bidirectional connection model reported |
| Direct messaging | Implemented | Realtime one-to-one messaging reported |
| Communities and groups | Implemented | Group creation and membership reported |
| Group channels | Implemented | Topic-based channels reported |
| Academic library hierarchy | Partially implemented | University/faculty/college/department navigation reported |
| Course catalogue | Partially implemented | Course choices use hardcoded mock data |
| In-app PDF viewer | Implemented | PDF controls reported present |
| Academic resource contributions | Implemented | Upload and pending review workflow reported |
| Resource moderation | Implemented | Moderator approval/rejection reported |
| Administrative hub | Implemented | Admin dashboard and management pages reported |
| Role-based access control | Implemented, requires security review | Role hierarchy reported; enforcement needs deeper verification |
| Web push notifications | Implemented, insecure as audited | Push endpoints reported without required authorization |
| Multi-device session tracking | Implemented | Session tracking component and table reported |
| AI Academic Assistant | Not implemented end to end | Interface exists; `/api/ai` route missing |
| Password recovery | UI only / placeholder | Login link reported as `href="#"` |
| Campus Events | Implemented per audit | Event views and database-backed creation reported |
| Support/reporting settings | Partially implemented | Some settings interfaces reported static or disconnected |
| Route protection | Requires remediation | Audit found reliance on client-side redirects and no root middleware file |

---

# 14. Product Scope

## 14.1 Core Product Scope

The core PEERZA product direction includes:

- Student identity, authentication and onboarding.
- Student profiles and connections.
- Social feed, posts and interactions.
- Stories.
- Direct messaging.
- Groups, communities and channels.
- Academic resource library.
- Academic document viewing.
- Academic resource contributions and moderation.
- Notifications.
- Administrative governance and reporting.
- Campus discovery and events.
- Multi-device session management.
- AI-powered academic assistance.

## 14.2 Existing Implementation Versus Approved Scope

A feature's presence in the codebase does not automatically mean its final product scope, behaviour or release priority has been approved.

Campus Events, automated profile verification, automatic connection to the super admin during onboarding and other audit-discovered behaviours must be reviewed by the product owner. Their existence should be documented, but their long-term behaviour should not be assumed without confirmation.

## 14.3 Future or Potential Scope

The following remain potential future directions rather than confirmed initial-release commitments:

- More advanced academic collaboration.
- Expanded AI-powered learning and productivity tools.
- Expanded university and departmental communities.
- Student career and professional networking.
- Real-time Audio & Video Calling (one-to-one VoIP and video calls via WebRTC / Agora).
- Institutional partnerships.
- Sponsored student opportunities.
- Relevant advertising or premium services.
- Expansion across African tertiary institutions.

---

# 15. Product Risks and Known Gaps

The following items were identified by the validation audit. Severity and priority should be confirmed through technical review and testing.

## 15.1 Push Notification API Authorization — Critical

The audit reports that `/api/push/send` and `/api/push/subscribe` use the Supabase service-role key without adequate authentication or identity validation.

Potential impacts include unauthorized push delivery and subscription hijacking. These findings require immediate security review and remediation before public production use.

## 15.2 Route Protection and Authorization — High

The audit reports that route guarding relies heavily on client-side redirects and that no root middleware file was found. Client-side navigation checks are not sufficient as the sole protection for sensitive data or privileged operations.

Protected operations must be enforced on the server and database layers. The appropriate Next.js protection architecture should be determined by the technical team.

## 15.3 Institutional Feed Isolation — High

The audit reports that the home feed query retrieves posts globally without applying a university-level filter. The product must define campus and nationwide feed behaviour, visibility rules and access boundaries.

## 15.4 AI Assistant Backend — High

The assistant interface calls `POST /api/ai`, but the route was not found in the inspected repository. The AI feature is not functional end to end.

## 15.5 Academic Course Catalogue — High

The library uses hardcoded course fallback data rather than a complete database-backed course catalogue. This limits accurate course discovery and expansion across institutions.

## 15.6 Password Recovery — High

The password recovery interface is a placeholder. A complete and secure account recovery workflow is required.

## 15.7 Academic Catalogue Data Quality — Medium

The audit reports that onboarding may insert unmatched universities or departments from client-side input. This creates a risk of duplicate, misspelled or invalid catalogue entries.

## 15.8 Support and Reporting Workflows — Medium

Some support/settings interfaces are reported as static or disconnected. The user-facing experience must not imply that reports or support requests have been submitted when no persistent action occurred.

## 15.9 Feed Scalability — Medium

The audit recommends pagination or infinite scrolling for high-volume feed content.

## 15.10 Document Viewer Delivery — Medium

The audit notes that the PDF.js worker relies on an external CDN reference, which may be unreliable for users on low-bandwidth networks or where the external resource is unavailable.

## 15.11 Product Scope Alignment — Medium

Events, session management and other capabilities have evolved beyond the initial product description. Their requirements, ownership and release priorities need to be formalized.

---

# 16. Business and Sustainability Considerations

PEERZA is intended to provide a valuable digital service to tertiary students. The initial product direction prioritizes building a useful and active student network, establishing trust and creating a strong academic resource ecosystem.

No finalized revenue model has been established in the source PRD or validation report.

Potential future sustainability opportunities may include:

- Strategic partnerships with educational organizations.
- Institutional partnerships.
- Sponsored student opportunities.
- Relevant advertising.
- Premium academic or productivity services.
- Other value-added services for students and educational communities.

These are possibilities for future evaluation, not confirmed product features or approved revenue streams.

The core product experience and its long-term sustainability model should be developed without compromising student trust or the usefulness of the platform.

---

# 17. Success Metrics

PEERZA should measure its success through product adoption, engagement, academic usefulness and platform reliability.

## 17.1 User Acquisition

- Number of registered students.
- Number of institutions represented.
- Number of active university communities.
- New user registration rate.

## 17.2 User Engagement

- Daily active users.
- Monthly active users.
- Posts published.
- Comments and reactions.
- Stories created and viewed.
- Connections established.

## 17.3 Communication

- Direct messages exchanged.
- Active conversations.
- Community memberships.
- Group and channel activity.

## 17.4 Academic Resource Usage

- Number of academic resources submitted.
- Number of approved resources.
- Number of resource downloads or views.
- Most active academic institutions.
- Most accessed courses and materials.

## 17.5 Platform Quality

- Application availability.
- Page loading performance.
- Authentication success rate.
- Error rates.
- User-reported issues.
- Moderation response time.
- Security incidents and unauthorized access attempts.

## 17.6 Academic Support

Once the AI Academic Assistant is operational:

- Number of academic questions submitted.
- Active assistant users.
- User satisfaction.
- Successful completion of learning tasks.
- AI response quality and failure rate.
- Cost per active assistant user.

Specific numerical targets should be established after baseline usage data becomes available.

---

# 18. Assumptions and Open Product Decisions

These matters require product-owner decisions. They must not be silently resolved by implementation assumptions.

| Area | Open decision |
|---|---|
| Product naming | Confirm PEERZA as the exclusive official product name across documentation and user-facing materials. |
| Feed structure | Decide the default feed: campus-only, nationwide, combined or user-selectable. Define post visibility and privacy rules. |
| Build Your Loop | Confirm whether five connections remain mandatory, whether the gate can be skipped and how unavailable suggestions are handled. |
| AI assistant | Select provider, model, backend architecture, usage limits, document context support and cost controls. |
| Academic catalogue | Decide how universities, faculties, colleges, departments and courses are created, verified and maintained. |
| Resource policies | Define accepted file types, maximum upload sizes, resource categories and moderation standards. |
| Account recovery | Define the complete password recovery process. |
| Events | Confirm event creation permissions, RSVP, reminders, limits and whether ticketing is in scope. |
| Monetization | Determine whether and how the platform will generate revenue in the future. |
| Verification | Define what the verification badge represents and how it should be awarded. |
| Data privacy | Establish access and privacy boundaries for student profiles, posts, academic data and session metadata. |
| Alumni access | Confirm whether graduates and recent alumni can register and what features they can access. |
| Support and reporting | Define report categories, submission workflow, moderation ownership and user feedback. |
| Mobile delivery | Confirm supported browsers, PWA expectations and Android release strategy. |

---

# 19. Long-Term Product Direction

PEERZA is intended to grow beyond a conventional campus social network. Its long-term direction is to become a comprehensive digital ecosystem for students and tertiary education communities.

Potential areas of future development include:

- More advanced academic collaboration.
- AI-powered learning and academic productivity tools.
- Expanded university and departmental communities.
- Student career and professional networking.
- Campus events and opportunities.
- Institutional partnerships.
- Expanded coverage across African tertiary institutions.

These possibilities represent the broader product vision and should not be interpreted as commitments to include every capability in the initial release.

---

# 20. Conclusion

PEERZA is being developed to create a unified digital environment for Nigerian tertiary students.

By combining social networking, academic resources, real-time communication, student communities and intelligent academic support, the platform aims to address the fragmentation that currently exists across students' digital academic and social experiences.

The product's central idea is straightforward:

> Students should not need several disconnected platforms to connect with classmates, discover academic materials, participate in discussions and build relationships with other students.

PEERZA aims to bring these experiences together in one connected student ecosystem.

Its long-term ambition is to become a major digital network for tertiary students in Nigeria and, eventually, across Africa.

**PEERZA — The ultimate social and academic network for Nigerian university students.**

---

# Appendix A — Validation Report Findings Requiring Technical Follow-up

The following findings are transcribed as issues requiring technical verification or remediation. This appendix is not a substitute for a security test or live functional test.

| Finding | Audit evidence reference | Follow-up |
|---|---|---|
| Unauthenticated push delivery endpoint | `src/app/api/push/send/route.ts` | Verify caller authentication, authorization and abuse controls; remediate before public use. |
| Push subscription identity validation gap | `src/app/api/push/subscribe/route.ts` | Bind subscription updates to the authenticated user. |
| Client-side creation of universities/departments | `src/app/onboarding/page.tsx` | Move catalogue creation to an authorized administrative workflow. |
| Client-side route guarding | No root `middleware.ts` reported | Define server-side route and operation protection. |
| Missing AI endpoint | `src/app/ai-assistant/page.tsx` calls `/api/ai` | Design and implement the approved AI backend in a later development phase. |
| Mock course data | `src/app/library/page.tsx` | Replace mock fallback with an approved course catalogue. |
| Global feed query | `src/app/page.tsx` | Define and implement campus/nationwide feed rules. |
| Password recovery placeholder | `src/app/login/page.tsx` | Implement secure recovery workflow. |
| Static support/settings views | Settings pages identified in audit | Connect actual workflows or clearly mark unavailable functionality. |
| External PDF worker dependency | `src/components/PdfViewer.tsx` | Assess local hosting/reliability for low-bandwidth environments. |

**Audit limitation:** These findings reflect the inspected repository and the audit's stated scope. They do not prove exploitability in every deployed environment. Confirm production configuration, database policies, deployment behaviour and live workflows before making final security conclusions.

# Appendix B — Next Documentation and Delivery Steps

The recommended sequence after this PRD is:

1. Product-owner review of Version 1.1 and resolution of the open decisions that affect requirements.
2. Software Requirements Specification (SRS), including detailed behaviour, data rules, API expectations, permissions, validation and error handling.
3. User stories and acceptance criteria for each feature.
4. Prioritized development roadmap based on product value, dependencies, security risk and implementation effort.
5. Technical architecture and database/API documentation.
6. Separate security remediation plan and test plan before public beta.

---

**Document status:** PRD v1.1 — Validated Draft  
**Prepared from:** PEERZA PRD v1.0 and the Antigravity read-only validation report dated 18 November 2026.  
**Implementation changes:** None. This document revision does not authorize or describe any code changes.
