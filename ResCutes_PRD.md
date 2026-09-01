Copy and paste this as your PRD-generation prompt:

Act as a senior product manager, systems architect, UX designer, and technical lead. Create a complete, implementation-ready Product Requirements Document for a hackathon project named ShelterFlow.

The PRD must be specific enough that four Computer Science students specializing in Data Science can divide the work and begin development without needing another planning session.

Do not write application code yet. Produce only the complete PRD in structured Markdown.

# 1. Project Context

ShelterFlow is an intelligent animal rescue intake, coordination, and shelter-routing platform.

It connects:

* Citizens reporting animals
* Volunteer rescuers
* Shelter staff
* Authorized veterinarians

ShelterFlow manages an animal from its initial public report through rescue, shelter handoff, animal intake, and medical clearance.

The platform has two interfaces built from one shared codebase:

1. ShelterFlow Mobile: An installable responsive PWA for citizens and rescuers.
2. ShelterFlow Web: A desktop operations dashboard for shelter staff and authorized veterinarians.

Do not propose separate native Android or iOS applications. The mobile experience must be a responsive, installable PWA to keep the hackathon scope feasible.

# 2. Core Problem

Animal rescue reports are often fragmented across social media, private messages, telephone calls, rescuers, shelters, and veterinary clinics.

This creates problems such as:

* Incomplete or duplicate reports
* Delayed rescue response
* Poor coordination between reporters and rescuers
* Animals being sent to shelters without available capacity
* Shelters receiving animals they cannot medically support
* Missing handoff information
* Rescue cases becoming difficult to track
* Lack of visibility after an animal is rescued

ShelterFlow provides one coordinated workflow from report to medical clearance.

# 3. Product Positioning

Use this positioning statement:

“ShelterFlow connects citizens, rescuers, shelters, and veterinarians through one coordinated workflow—from animal reporting to safe shelter intake and medical clearance.”

The main innovation is an explainable Capacity and Capability Routing Engine that recommends the most suitable shelter for each rescued animal.

The application must not be presented as a veterinary diagnosis system, prescription system, adoption marketplace, or social media platform.

# 4. Complete Workflow

Design the product around this exact workflow:

Report Animal
→ Verify Report
→ Calculate Rescue Urgency
→ Assign Rescuer
→ Recommend Shelter
→ Rescue Animal
→ Confirm Shelter Handoff
→ Create Animal Record
→ Record Medical Examination
→ Update Medical Clearance
→ Complete Case

Every feature must support this workflow directly.

# 5. User Roles

Define permissions and workflows for these roles:

## Citizen

* Submit an animal report
* Upload a photo
* Share the animal’s location
* Describe its visible condition
* Track reports they submitted
* Receive case-status updates

## Rescuer

* View assigned rescue cases
* Accept or decline assignments
* Open case navigation
* Contact the reporter through protected contact options
* Update rescue status
* Upload rescue photos
* Request shelter placement
* Confirm animal handoff

## Shelter Staff

* Review submitted reports
* Verify, reject, or mark reports as duplicates
* Confirm rescue urgency
* Assign rescuers
* View destination recommendations
* Select the final shelter destination
* Confirm intake
* Manage animal records
* Add staff and behavior notes
* Monitor shelter capacity

## Authorized Veterinarian

* Access animals assigned for examination
* Record examination date
* Record general condition
* Set medical priority
* Add treatment notes
* Add restrictions
* Set a follow-up date
* Update medical-clearance status

## Administrator

* Manage shelters
* Manage users and roles
* Configure shelter capacity
* Configure species accepted
* Configure available medical capabilities
* View system activity logs

Provide a complete role-based access-control matrix.

# 6. MVP Scope

The PRD must treat the following as the complete hackathon MVP.

## Mobile PWA

Required screens:

* Mobile Home
* Nearby Cases
* Report an Animal
* My Cases
* Case Details
* Rescuer Assignment Details
* Profile

Required bottom navigation:

* Home
* Nearby
* Elevated center Report button
* Cases
* Profile

The center Report button must be the primary mobile action.

## Desktop Web Dashboard

Required routes and pages:

* `/`

  * Brief landing page
  * Project explanation
  * Demo access

* `/dashboard`

  * Shelter operations overview

* `/rescue-cases`

  * Rescue-case list and filters

* `/rescue-cases/[id]`

  * Complete rescue-case profile

* `/animals`

  * Animal list

* `/animals/[id]`

  * Animal profile, rescue history, shelter pathway, and medical-clearance section

* `/settings`

  * Shelter capacity and capability configuration

Do not create separate pages for Foster, Adoptions, Long-Stay, Pathways, Veterinary Scheduling, or Advanced Analytics in the MVP.

If pathway information is needed, place it inside the Animal Profile.

# 7. Mobile Requirements

## Mobile Home

Show:

* Primary Report an Animal action
* Active report or rescue-case status
* Recent case updates
* Emergency safety reminder
* Rescuer assignment card when applicable

## Nearby Cases

Show verified rescue cases on a map and list.

Protect animal and reporter safety:

* Show approximate locations to ordinary users
* Show exact coordinates only to assigned rescuers and authorized staff
* Do not expose reporter contact information publicly

## Report an Animal

Required fields:

* Animal photo
* Current location
* Species
* Visible condition
* Immediate danger
* Vulnerability
* Short description
* Reporter contact preference

Include safety guidance telling users not to approach animals that are injured, aggressive, trapped, or in dangerous locations.

## Cases

Citizens see cases they reported.

Rescuers see cases assigned to them.

Support these statuses:

* Report Submitted
* Under Verification
* Verified
* Rescuer Assigned
* Rescue Accepted
* Rescue in Progress
* Animal Secured
* Awaiting Shelter
* Shelter Handoff
* Completed
* Rejected
* Duplicate
* Cancelled

## Rescuer Actions

Allow rescuers to:

* Accept assignment
* Decline assignment with reason
* Open navigation
* Update rescue status
* Upload a rescue photo
* Add a field note
* Request shelter placement
* Confirm handoff

# 8. Web Dashboard Requirements

## Main Dashboard

Show:

* Active rescue cases
* Critical and high-urgency cases
* Unassigned cases
* Shelter capacity
* Animals awaiting medical examination
* Animals under treatment
* Completed rescues
* Recent activity

Include:

* Compact live rescue map
* Rescue attention queue
* Shelter-capacity indicator
* Recent handoffs
* Cases waiting for a rescuer

## Rescue Cases Page

Include:

* Search
* Status filters
* Urgency filters
* Assigned-rescuer filter
* Shelter-destination filter
* Sort by urgency, waiting time, and report date

Shelter staff can:

* Verify report
* Reject report with reason
* Mark duplicate manually
* Adjust urgency with a required reason
* Assign rescuer
* Review recommended shelters
* Select final shelter
* Monitor the case timeline

## Rescue Case Profile

Show:

* Animal photo
* Report details
* Approximate and authorized exact location
* Reporter information with privacy controls
* Urgency score
* Explainable urgency factors
* Assigned rescuer
* Rescue timeline
* Shelter recommendations
* Final destination
* Rescue notes
* Handoff confirmation
* Linked animal record after intake

## Animals Page

Show:

* Photo
* Name or temporary case ID
* Species
* Estimated age
* Intake date
* Medical status
* Current pathway stage
* Linked rescue case

## Animal Profile

Combine these sections into one page:

* Basic animal information
* Rescue history
* Intake details
* Medical handoff
* Medical clearance
* Behavior notes
* Shelter pathway
* Staff notes
* Recommended next action

Do not create a complete electronic medical-record system.

# 9. Veterinary Scope

The only veterinary feature in the MVP is Medical Handoff and Clearance.

Required fields:

* Examination date
* Examining veterinarian
* General condition
* Medical priority
* Treatment summary
* Restrictions
* Follow-up date
* Clearance status
* Veterinarian notes

Medical-clearance statuses:

* Awaiting Examination
* Under Examination
* Under Treatment
* Follow-Up Required
* Medically Cleared

Explicitly exclude:

* Dosage calculation
* Prescription generation
* Drug recommendations
* Differential diagnosis
* Ambient AI transcription
* Radiograph or ultrasound analysis
* Client-facing diagnosis
* Veterinary appointment scheduling
* Clinic workforce scheduling

Veterinary records must only be editable by authorized veterinarians and designated shelter staff.

# 10. Rescue Urgency Scoring

Define a transparent, rules-based urgency score from 0 to 100.

Use this baseline weighting:

* Visible injury severity: 0–35 points
* Immediate environmental danger: 0–30 points
* Animal vulnerability: 0–20 points
* Time waiting after verification: 0–15 points

Suggested levels:

* Critical: 80–100
* High: 60–79
* Medium: 30–59
* Low: 0–29

The PRD must define:

* Exact input options
* Points assigned to every option
* Calculation method
* Thresholds
* User-facing explanations
* Staff override rules
* Audit logging
* Required override reason

The score must support human decision-making and must not replace staff judgment.

# 11. Capacity and Capability Routing Engine

Define an explainable destination-match score from 0 to 100.

Use this baseline weighting:

* Required medical capability match: 35%
* Available shelter capacity: 25%
* Species compatibility: 20%
* Distance and estimated travel time: 15%
* Current operational workload: 5%

For every recommendation, display:

* Shelter name
* Match score
* Distance
* Available capacity
* Species accepted
* Relevant medical capabilities
* Reasons for recommendation
* Warnings or missing capabilities

Shelter staff must make the final decision.

Allow manual destination selection, but require a reason when staff reject the highest-ranked recommendation.

Define deterministic fallback behavior when:

* No shelter has sufficient capacity
* No shelter has the required capability
* Location information is unavailable
* Distance cannot be calculated
* All matching shelters reject intake

# 12. Scope Exclusions

Create a clear non-goals section.

The MVP must not include:

* Adoption marketplace
* Adoption applications
* Foster-family matching
* Predictive abandonment maps
* City-scale digital twins
* Reporter reputation graphs
* Automatic facial recognition
* Automatic duplicate-image detection
* Animal pain recognition
* Gait-based injury diagnosis
* Bioacoustic distress classification
* Veterinary dosage calculation
* AI diagnosis
* AI medical imaging
* Ambient veterinary scribe
* Medication reminders
* Client veterinary portal
* Clinic scheduling
* Staff burnout prediction
* Native Android application
* Native iOS application
* Public real-time chat
* Payment processing
* Donations
* Social-media feed

Place these only under Future Opportunities and do not allow them to expand the MVP.

# 13. Technical Architecture

Use this required technical direction:

* One shared monorepo and codebase
* Next.js App Router
* React
* TypeScript with strict mode
* Tailwind CSS
* shadcn/ui or equivalent accessible component primitives
* Installable Progressive Web App for the mobile experience
* Desktop-responsive shelter dashboard
* Neon PostgreSQL 17
* Neon region: AWS Asia Pacific 1, Singapore
* Drizzle ORM
* Zod validation
* Auth.js with role-based authorization stored in Neon
* Vercel Blob for uploaded animal and rescue photos
* MapLibre or Leaflet with OpenStreetMap-compatible mapping
* Recharts for limited dashboard charts
* Vitest for unit testing
* Playwright for critical end-to-end testing
* Deployment exclusively on Vercel
* Configure server execution as close to Singapore as supported by the current Vercel platform

Do not introduce:

* A separate backend repository
* Microservices
* Kubernetes
* A native mobile codebase
* A second database
* Blockchain
* Complex event-streaming infrastructure
* Paid services unless absolutely required

Prefer simple server actions, route handlers, and controlled polling over unnecessary real-time infrastructure.

# 14. Authentication

For the hackathon:

* Skip public signup
* Provide seeded demo accounts
* Include role-based demo credentials
* Support Reporter, Rescuer, Shelter Staff, Veterinarian, and Administrator accounts
* Provide a visible Demo Access section on the landing page
* Protect routes according to role
* Prevent unauthorized access to exact locations and medical notes

The PRD must define:

* Authentication flow
* Session handling
* Role checks
* Route protection
* Unauthorized states
* Seeded demo accounts
* Demo reset strategy

# 15. Data Model

Produce a complete proposed database schema with:

* Tables
* Important columns
* Data types
* Primary keys
* Foreign keys
* Relationships
* Enums
* Indexes
* Unique constraints
* Timestamps
* Soft-deletion or archival rules where appropriate

At minimum, cover:

* Users
* User roles
* Shelters
* Shelter capabilities
* Shelter capacity
* Rescue reports
* Rescue cases
* Case photos
* Case status history
* Rescuer assignments
* Shelter recommendations
* Shelter handoffs
* Animals
* Medical clearances
* Animal notes
* Notifications
* Audit logs

Provide a Mermaid entity-relationship diagram.

# 16. API and Server Requirements

Define all required:

* Server actions
* Route handlers
* Request parameters
* Response shapes
* Authentication requirements
* Authorization requirements
* Validation rules
* Expected errors
* Retry behavior

Cover:

* Report submission
* Photo upload
* Case verification
* Urgency calculation
* Rescuer assignment
* Assignment acceptance or rejection
* Case-status update
* Shelter recommendation
* Shelter selection
* Handoff confirmation
* Animal-record creation
* Medical-clearance update
* Dashboard metrics

# 17. UX and Design Direction

Use this design direction:

* Modern
* Professional
* Warm
* Humane
* Operational
* Trustworthy
* Not overly cute
* Not a generic AI dashboard

Color system:

* Deep evergreen: `#183C35`
* Warm bone: `#F5F3ED`
* White: `#FFFFFF`
* Graphite: `#202825`
* Muted sage: `#9DB7A9`
* Rescue red: `#C7513A`
* Warning ochre: `#C9912F`

Design requirements:

* Clear information hierarchy
* Restrained shadows
* Thin neutral borders
* Moderate corner radii
* Realistic animal photography
* Small route-inspired ShelterFlow symbol
* Accessible color contrast
* Do not communicate priority through color alone
* Mobile controls must be easy to operate with one hand
* Desktop tables must remain readable at common laptop resolutions
* Include loading, empty, error, offline, and permission-denied states

For every page, define:

* Purpose
* Primary user
* Required information
* Components
* Primary action
* Secondary actions
* Empty state
* Loading state
* Error state
* Mobile behavior
* Desktop behavior
* Accessibility requirements

# 18. Privacy and Safety

Define safeguards for:

* Reporter identity
* Reporter contact information
* Exact rescue locations
* Medical notes
* Uploaded photographs
* Role-restricted information
* Audit logs
* Data retention
* Demo data
* Lost or stolen sessions

Include:

* Approximate public map locations
* Exact coordinates only for authorized users
* Image metadata handling
* Input sanitization
* File-type and size restrictions
* Rate limiting
* Duplicate-submission protection
* Secure server-side authorization
* Protection against insecure direct-object references

# 19. Accessibility and Performance

Target:

* WCAG 2.2 AA
* Keyboard-accessible web dashboard
* Screen-reader labels
* Visible focus states
* Minimum touch-target sizes
* Reduced-motion support
* Status labels in addition to color
* Responsive layout from small mobile screens to desktop
* Optimized images
* Lazy-loaded maps
* Paginated or virtualized long lists
* Fast initial page load
* Resilient behavior on weak mobile connections

Define measurable performance targets.

# 20. Acceptance Criteria

For every major feature, provide testable acceptance criteria in Given/When/Then format.

At minimum, include criteria for:

* Animal report submission
* Photo upload failure
* Location-permission denial
* Report verification
* Urgency calculation
* Manual urgency override
* Rescuer assignment
* Rescuer acceptance and rejection
* Case-status progression
* Shelter recommendation
* Manual destination override
* Shelter handoff
* Automatic animal-record creation
* Medical-clearance update
* Role-based access
* Exact-location privacy
* Offline or weak-connection behavior

# 21. Demo Data

Define realistic seeded data for:

* Three shelters with different capacities and capabilities
* Two veterinary-capable shelters
* Five rescuers with different availability and distances
* At least twelve rescue cases
* At least ten animal records
* Critical, high, medium, and low urgency examples
* Successful and rejected assignments
* One completed rescue-to-clearance journey

Use fictional names and clearly label the data as simulated.

# 22. Hackathon Demo Scenario

Create one complete demonstration centered on an animal named Luna.

Required scenario:

1. A citizen reports Luna near a busy road with a possible leg injury.
2. ShelterFlow calculates a high rescue urgency score and explains why.
3. Shelter staff verify the case.
4. A rescuer receives and accepts the assignment.
5. ShelterFlow recommends a destination with sufficient capacity and medical capability.
6. Staff approve the destination.
7. The rescuer marks Luna as secured.
8. The shelter confirms handoff.
9. ShelterFlow automatically creates Luna’s animal record.
10. An authorized veterinarian records Luna’s examination.
11. Luna’s status becomes Under Treatment and later Medically Cleared.
12. The reporter sees that Luna is safe without accessing restricted medical details.

Provide a concise presentation script for this workflow.

# 23. Implementation Plan

Create a realistic implementation plan for four equally responsible developers.

Divide the work into parallel workstreams:

* Shared foundation and database
* Mobile reporting and case tracking
* Web operations dashboard
* Routing engine, scoring, testing, and deployment

Include:

* Dependency order
* Integration checkpoints
* Recommended branch structure
* Definition of done
* Critical path
* MVP cut line
* Stretch cut line
* Final testing checklist
* Vercel deployment checklist
* Neon migration and seed checklist
* Demo rehearsal checklist

Do not assign managerial authority to one person. All four developers have equal technical responsibility and decision-making authority.

# 24. Required PRD Output Structure

Return the PRD using this exact order:

1. Document Control
2. Executive Summary
3. Product Vision
4. Problem Statement
5. Goals
6. Success Metrics
7. Non-Goals
8. Assumptions
9. User Roles
10. Role-Permission Matrix
11. End-to-End Workflow
12. Information Architecture
13. Mobile PWA Requirements
14. Desktop Web Requirements
15. Rescue Urgency Scoring
16. Capacity and Capability Routing
17. Veterinary Medical Clearance
18. Functional Requirements
19. Page-by-Page Specifications
20. Status and State Machines
21. Data Model
22. Mermaid ER Diagram
23. API and Server Contracts
24. Technical Architecture
25. Security and Privacy
26. Accessibility
27. Performance
28. Error and Edge-Case Handling
29. Analytics and Audit Events
30. Demo Data
31. Acceptance Criteria
32. Testing Strategy
33. Deployment Plan
34. Four-Person Implementation Plan
35. Hackathon Demo Script
36. Risks and Mitigations
37. Future Opportunities
38. Final MVP Checklist

# 25. Final Instructions

* Keep the PRD focused on the defined MVP.
* Do not silently add features.
* Do not broaden the veterinary scope.
* Do not create separate native applications.
* Do not turn ShelterFlow into an adoption platform.
* Clearly distinguish MVP requirements from future opportunities.
* Resolve minor ambiguities using the simplest implementation.
* State all assumptions explicitly.
* Prefer deterministic, explainable logic over unnecessary AI.
* Make every requirement technically actionable.
* Use tables where they improve precision.
* Use Mermaid only for workflows, state machines, and the database diagram.
* Include validation rules, permissions, error states, and acceptance criteria.
* Avoid vague phrases such as “user-friendly,” “AI-powered,” or “secure” without defining measurable behavior.
* Produce the complete PRD in one response.
