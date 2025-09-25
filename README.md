# JobJourney

JobJourney helps software professionals go from **job description → fit → plan → apply** with an AI-guided workflow. It turns your résumé and a target JD into a personalized 14-day prep plan, tailored application documents, and a lightweight tracker with reminders—so you can prepare with intent and apply with confidence.

---

## Table of Contents

* [Overview](#overview)
* [Core Value](#core-value)
* [Product Walkthrough](#product-walkthrough)
* [Features](#features)

  * [Big Features (Core Engines)](#big-features-core-engines)
  * [Small Features (Polish & Usability)](#small-features-polish--usability)
* [How Scoring & Feedback Work](#how-scoring--feedback-work)
* [Accessibility, Privacy & Safety](#accessibility-privacy--safety)
* [Roadmap](#roadmap)
* [Getting Started](#getting-started)
* [FAQ](#faq)
* [Contributing](#contributing)
* [Support](#support)
* [License](#license)

---

## Overview

**JobJourney** is a career preparation companion focused on engineering roles (SWE, Backend, SRE, Data; junior → senior). It provides:

* A **fit analysis** between your résumé and a target JD
* A **gap-aware 14-day plan** (\~10 hrs/week) with daily tasks and resources
* A **JD-aligned written exam** to benchmark your readiness
* **Tailored bullets, emails, and cover letters**
* An **application tracker** with reminders and calendar exports

---

## Core Value

* **Precision over noise:** Prep tasks and mock exams align exactly to the JD.
* **Traceability:** All tailored documents cite facts from your résumé.
* **Momentum:** Streaks, progress bars, and friendly nudges keep you moving.
* **Organization:** One place for tasks, drafts, deadlines, and exports.

---

## Product Walkthrough

1. **Import résumé & paste a JD**
   Get a **match score**, an **evidence view** (what matches and why), and a **gap list**.
2. **Generate your 14-day plan**
   Daily mix of coding, mini system design, quick reviews, and curated resources—each task closes a named gap.
3. **Benchmark with a JD-aligned written exam**
   Take a timed exam; get section-level feedback and auto-injected gaps into your plan.
4. **Tailor your application**
   One-click creation of concise bullets, email, and cover letter—all traceable to real résumé facts.
5. **Track applications & deadlines**
   Move roles from Saved → Offer with reminders, notes, attachments, and calendar files.

---

## Features

### Big Features (Core Engines)

#### BF-1) JD → Fit → Plan → Apply (headline AI flow)

* **Output:** Match score, evidence view, gap list, 14-day plan, tailored bullets/cover letter/email, and an apply checklist.
* **Acceptance:**

  * Match score shows reasons and evidence
  * Gaps link to tasks
  * Tailored docs cite résumé facts
  * Apply checklist supports reminders and export

#### BF-2) Prep & Learning Engine

* **Plan:** 14 days (\~10 hrs/week). Each day includes:

  * **2 coding questions**, **1 tiny system-design task**, **1 quick review**, **curated resources**
* **Content:** CS fundamentals, DSA, ML/DL starters with **quizzes**
* **Acceptance:**

  * Each task maps to a specific gap
  * **Progress bars** + friendly messages
  * **Calendar export** works

#### 🆕 BF-3) JD-Aligned Written Exam (Mock-Interview Style)

* **Modes:**

  * **Quick Check (15–20 min):** 8–12 items (MCQ/short/coding snippet)
  * **Standard (35–45 min):** 18–25 items + 1 mini system design
  * **Custom:** choose sections (e.g., Backend + SQL + Docker)
* **Sections:** Core CS; Role Skills (Node/Express, Java/Spring, Python/Django, SRE/Linux/Docker/K8s); SQL; Coding Snippet; System Design Mini (requirements → API sketch → data model)
* **Acceptance:** Create → take → **auto-score** → review downloadable report → **weak topics injected** into your gap list/plan (timer, pause rules, honor note included)

#### BF-4) Applications & Reminders

* **Pipeline:** Saved → Applied → Phone → Onsite → Offer → Rejected
* **Utilities:** Deadlines, notes, attachments, reminders, calendar (.ics) export
* **Acceptance:** Stage/deadlines editable; reminder scheduling; progress UI updates with checklist ticks

#### BF-5) Tailoring & Docs

* **Bullet rewriter:** ≤ 28 words, quantified, tense-consistent
* **Email writer:** brief, polite email derived from JD + profile
* **Cover letter writer:** 120–160 words citing résumé facts
* **Proof/style pass:** grammar, spelling, British/American toggle
* **Export:** PDF/Doc with clear filenames
* **Acceptance:** Concise, specific, traceable; single-click export

---

### Small Features (Polish & Usability)

**System & Basics**

* Account & Profile (roles, seniority, locations, hours/week, BN/EN, **email notifications**)
* BN/EN language toggle, keyboard-friendly, high-contrast, screen-reader labels
* Privacy controls: export/delete; HTTPS; **no auto-apply** without review
* Friendly empty/error/loading states
* Dashboard: today’s tasks, top matches, gaps, deadlines, **streak ring**
* Settings: roles, locations, hours/week, language

**Résumé, Profile & Portfolio**

* Smart résumé import (PDF/Doc/text → editable outline)
* Simple ATS checks: keyword coverage vs JD, clarity flags, section length warnings
* ATS score guidance (plain language)
* Bullet rewriter + Skill Map (language/framework/infra/CS + comfort levels)

**Job Discovery & Matching**

* Built-in JD library (10–15 sample JDs across roles/levels; offline)
* Search jobs (safe search/APIs; demo relies on library + paste)
* JD paste cleanup & dedupe
* JD summary (“What you’ll do”, “Must-haves”, “Nice-to-haves”, red flags)
* Match score, evidence view, gap list, role template fallback

**Personalized Prep**

* Gap → task mapping; **hand-picked resources** (1–2 per task); calendar export
* Scoring & progress bars; milestone messages

**CS Fundamentals**

* Curated resources, learning plans, quizzes, PDF summaries
* On-demand materials + quick quizzes

**Coding (DSA) Practice**

* Daily set by pattern (two-pointers, BFS/DFS, DP, greedy) and topic (number theory, strings, etc.)
* Pattern coach: approach hints + target complexity
* On-demand resources + quiz per topic

**ML-DL Learning**

* Starters for supervised/unsupervised/RL + resources and quizzes

**System Design (Interviews)**

* Tiny prompts (rate limiter, URL shortener, news feed)
* Answer scaffold (requirements → API → data model → scaling → trade-offs)
* Self-check list

**Behavioral & Communication**

* **STAR Coach:** 10 role-specific questions; text/voice → strengths/risks + tighter rewrite
* Story Bank: 6–8 reusable stories

**Applying & Tracking**

* Application tracker, apply checklist, reminders (ICS), progress bars

**Tailoring & Documents**

* Email writer, cover-letter writer, bullet picker, proof/style, PDF/Doc export

---

## How Scoring & Feedback Work

* **Auto-scored** items: MCQs, coding snippet tests, and SQL queries (with hidden test cases)
* **Rubric-based** scoring: short answers & system design mini (structure, correctness, trade-offs)
* **Section breakdowns:** e.g., SQL 6/10, System Design 7/10
* **Gap injection:** Low-scoring topics are **added to your gap list**; the **14-day plan updates** automatically

---

## Accessibility, Privacy & Safety

* **Accessibility:** BN/EN toggle, keyboard navigation, high contrast, semantic labels for screen readers
* **Privacy:** Export/delete your data; HTTPS transport; résumé facts are only used to generate artifacts you review
* **Safety:** JobJourney never **auto-applies** on your behalf without explicit review

---

## Roadmap

* Expanded JD library and role templates
* Deeper company-specific exam presets
* Richer analytics (time-on-task, improvement trends)
* More export targets and integrations (Calendars, Drive, ATS)

---

## Getting Started

1. **Sign up** and complete your profile (role, level, preferred locations, weekly hours, language).
2. **Import your résumé** (PDF/Doc/text) and verify the outline.
3. **Paste a JD** or choose one from our library.
4. **Generate Fit & Plan** to see your match score, gaps, and a 14-day schedule.
5. **Take the JD-Aligned Exam** to benchmark and refine your plan.
6. **Tailor & Export** your bullets, email, and cover letter.
7. **Track your applications** and set reminders with calendar exports.

---

## FAQ

**What roles are supported?**
SWE, Backend, SRE, and Data across junior to senior levels (with ML/DL starters).

**Can I use JobJourney offline?**
The built-in JD library is available offline; most features require connectivity.

**Do you auto-apply to jobs?**
No. JobJourney prepares and organizes; applications are submitted by you.

**How long is the prep plan?**
A focused **14-day** schedule (\~10 hrs/week). You can regenerate as gaps evolve.

---

## Contributing

We welcome feedback, bug reports, and suggestions for the JD library, quizzes, and exam rubrics. Please open an issue or submit a proposal describing:

* The improvement, why it helps JobJourney users, and any acceptance criteria
* Example prompts/tasks or rubric adjustments where relevant

---

## Support

Questions, feedback, or partnership inquiries: **[support@jobjourney.app](mailto:support@jobjourney.app)**

---

## License

Copyright © JobJourney. All rights reserved.
Usage of the app and materials is governed by the terms available in the JobJourney service.
