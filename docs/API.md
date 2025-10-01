# API Documentation

This document lists all available APIs powering **JobJourney**’s workflows.  
Each section includes purpose, endpoints, request examples, and Swagger UI links for interactive testing.

---

## Job Analysis

**Purpose:** Retrieve and analyze job postings ***(via URL, manual text, or search)*** to extract requirements and compute overall match scores with a candidate’s skills.  
**Swagger UI:** [View](https://cmfx1afg12387o3wtjw6255o4.agent.pa.smyth.ai/swagger/#/)

### `POST /api/search_and_analyze`
**Endpoint:**  
`https://cmfx1afg12387o3wtjw6255o4.agent.pa.smyth.ai/api/search_and_analyze`

**Request Example:**
```json
{
  "role": "string",
  "location": "string",
  "work_type": "string",
  "experience_level": "string",
  "salary_range": "string",
  "resume_text": "string",
  "skills_text": "string",
  "projects_text": "string"
}
```
### `POST /api/analyze_job_url`

**Endpoint:**  
`https://cmfx1afg12387o3wtjw6255o4.agent.pa.smyth.ai/api/analyze_job_url`

**Request Example:**
```json

{
  "job_url": "string",
  "resume_text": "string",
  "skills_text": "string",
  "projects_text": "string"
}
```

Notes: Scrapes and extracts requirements from the given job URL, then analyzes matches with the resume and skills.

### `POST /api/analyze_job_manual`

**Endpoint:** 
`https://cmfx1afg12387o3wtjw6255o4.agent.pa.smyth.ai/api/analyze_job_manual`

**Request Example:**
```json

{
  "job_description": "string",
  "resume_text": "string",
  "skills_text": "string",
  "projects_text": "string"
}
```

Notes: Analyzes a manually entered job description against resume and skills. Returns a detailed skill-match analysis and suggested preparation plan.

## Plan Creation

**Purpose:** Generate interview preparation plans (manual inputs or from job description). Each plan outlines daily tasks, problems to solve, and resources, with progress tracking on skill gaps.
**Swagger UI:** [View](https://cmfxkz7f239pfjxgt8y44e12d.agent.pa.smyth.ai/swagger/)

### `POST /api/create_manual_plan`

**Endpoint:** 
`https://cmfxkz7f239pfjxgt8y44e12d.agent.pa.smyth.ai/api/create_manual_plan`

**Request Example:**
```json

{
  "job_title": "software engineer",
  "company_name": "google",
  "plan_duration": 10,
  "experience_level": "Mid level",
  "focus_areas": "CS fundamentals",
  "skill_gaps": "data structure"
}
```

Notes: Creates a day-by-day study plan. Response includes JSON sequence of daily tasks and resources.

### `POST /api/analyze_job_description`

**Endpoint:** 
`https://cmfxkz7f239pfjxgt8y44e12d.agent.pa.smyth.ai/api/analyze_job_description`

**Request Example:**
```json

{
  "job_content": "string",
  "skill_analysis_text": "string",
  "plan_duration": "7 days"
}
```

Notes: Generates a preparation plan tailored to a specific JD and candidate skills. Returns resources, daily plan, and milestones.

## Mock Exam

**Purpose:** Simulate interview prep with candidate analysis and interview questions.
**Swagger UI:** [View](https://cmfwk1819zesujxgtwcz7h5ns.agent.pa.smyth.ai/swagger/#/)

### `POST /api/generate_questions`

**Endpoint:** 
`https://cmfwk1819zesujxgtwcz7h5ns.agent.pa.smyth.ai/api/generate_questions`

**Request Example:**
```json

{
  "cv": "string",
  "job_description": "string",
  "job_role": "string"
}
```

Notes: Returns CV analysis, strengths/weaknesses, and interview questions.

### `POST /api/generate_custom_questions`

**Endpoint:** 
`https://cmfwk1819zesujxgtwcz7h5ns.agent.pa.smyth.ai/api/generate_custom_questions`

**Request Example:**
```json

{
  "number_of_questions": "string",
  "question_type": "string",
  "interview_topic": "string",
  "cv": "string"
}
```

Notes: Generates a custom set of interview questions (e.g., MCQs, written). Includes correct answers.

## Resume Checking

**Purpose:**  Evaluate a resume against a JD for ATS compatibility and skill relevance.
**Swagger UI:** [View](https://cmfxss7i643gqjxgt0209ltrr.agent.pa.smyth.ai/swagger/)

### `POST /api/analyze_resume`

**Endpoint:** 
`https://cmfxss7i643gqjxgt0209ltrr.agent.pa.smyth.ai/analyze_resume`

**Request Example:**
```json

{
  "resume_text": "string",
  "job_description": "string"
}
```

Notes: Returns ATS compatibility score, breakdowns, strengths, weaknesses, and tips.

## Cover Letter Generation

**Purpose:** Creates a tailored cover letter.
**Swagger UI:** [View](https://cmfxu4isw4g2z2py5onyd929u.agent.pa.smyth.ai/swagger/)

### `POST /api/generate_cover_letter`

**Endpoint:**
`https://cmfxu4isw4g2z2py5onyd929u.agent.pa.smyth.ai/api/generate_cover_letter`

**Request Example:**
```json

{
  "cv": "string",
  "job_description": "string",
  "tone": "string",
  "word_length": 0,
  "focus_areas": "string"
}
```

Notes: Returns a formatted cover letter text.

## Application Email Generation

**Purpose:** Generates a job application email.
**Swagger UI:** [View](https://cmfxu4isw4g2z2py5onyd929u.agent.pa.smyth.ai/swagger/)

### `POST /api/generate_application_email`

**Endpoint:**
`https://cmfxu4isw4g2z2py5onyd929u.agent.pa.smyth.ai/api/generate_application_email`

**Request Example:**
```json

{
  "cv": "string",
  "job_description": "string",
  "email_type": "string"
}
```

Notes: Returns application email (subject + body).

## Grammar and Style Check

**Purpose:** Corrects grammar and style in documents.
**Swagger UI:** [View](https://cmfxu4isw4g2z2py5onyd929u.agent.pa.smyth.ai/swagger/)

### `POST /api/check_grammar_style`

**Endpoint:**
`https://cmfxu4isw4g2z2py5onyd929u.agent.pa.smyth.ai/api/check_grammar_style`

**Request Example:**
```json

{
  "document": "string"
}
```

Notes: Returns revised version of the input with grammar/style fixes.

## Custom Questions Generator

**Purpose:** Generate quiz questions (MCQ or mixed format).
**Swagger UI:** [View](https://cmfyxsw1p8pbxo3wtkwhnmlat.agent.pa.smyth.ai/swagger/)

### `GET /api/generate_mcq`

**Endpoint:**
`https://cmfyxsw1p8pbxo3wtkwhnmlat.agent.pa.smyth.ai/api/generate_mcq`

Notes: Generates a set of MCQs on a given topic.

### `GET /api/generate_mixed`

**Endpoint:**
`https://cmfyxsw1p8pbxo3wtkwhnmlat.agent.pa.smyth.ai/api/generate_mixed`

Notes: Generates a mixed quiz (MCQs + written).