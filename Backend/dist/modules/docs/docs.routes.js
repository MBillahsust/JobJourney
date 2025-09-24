"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/docs/openapi.json", (_req, res) => {
    const spec = {
        openapi: "3.0.3",
        info: { title: "JobJourney API", version: "0.5.0" },
        servers: [{ url: "/v1" }],
        paths: {
            "/health": { get: { summary: "Health", responses: { "200": { description: "OK" } } } },
            "/auth/register": { post: { summary: "Register", responses: { "201": { description: "Created" } } } },
            "/auth/login": { post: { summary: "Login", responses: { "200": { description: "OK" } } } },
            "/auth/refresh": { post: { summary: "Refresh token", responses: { "200": { description: "OK" } } } },
            "/auth/logout": { post: { summary: "Logout", responses: { "204": { description: "No Content" } } } },
            "/me": {
                get: { summary: "Current user", responses: { "200": { description: "OK" } } },
                patch: { summary: "Update user", responses: { "200": { description: "OK" } } }
            },
            "/me/profile": {
                get: { summary: "Get profile", responses: { "200": { description: "OK" } } },
                patch: { summary: "Update profile", responses: { "200": { description: "OK" } } }
            },
            "/jobs/search": { get: { summary: "Search jobs", responses: { "200": { description: "OK" } } } },
            "/jobs/import": { post: { summary: "Create job", responses: { "201": { description: "Created" } } } },
            "/jobs/{id}": { get: { summary: "Job detail", responses: { "200": { description: "OK" } } } },
            "/jobs/{id}/save": {
                post: { summary: "Save job", responses: { "201": { description: "Created" } } },
                delete: { summary: "Unsave job", responses: { "204": { description: "No Content" } } }
            },
            "/me/saved-jobs": { get: { summary: "My saved jobs", responses: { "200": { description: "OK" } } } },
            "/files/upload": { post: { summary: "Upload a file (multipart)", responses: { "201": { description: "Created" } } } },
            "/files/{id}": {
                get: { summary: "Get file metadata", responses: { "200": { description: "OK" } } },
                delete: { summary: "Delete file", responses: { "204": { description: "No Content" } } }
            },
            "/files/{id}/download": { get: { summary: "Download/stream file", responses: { "200": { description: "OK" } } } },
            "/ats/score": { post: { summary: "ATS score (on-the-fly)", responses: { "200": { description: "OK" } } } },
            "/ats/evaluate": { post: { summary: "ATS score + save", responses: { "201": { description: "Created" } } } },
            "/ats/scores": { get: { summary: "List saved ATS evaluations", responses: { "200": { description: "OK" } } } },
            "/ats/scores/{id}": {
                get: { summary: "Get ATS evaluation", responses: { "200": { description: "OK" } } },
                delete: { summary: "Delete ATS evaluation", responses: { "204": { description: "No Content" } } }
            },
            "/ats/compare": { post: { summary: "Compare multiple resumes for a job", responses: { "200": { description: "OK" } } } },
            "/applications": {
                post: { summary: "Create application", responses: { "201": { description: "Created" } } },
                get: { summary: "List applications", responses: { "200": { description: "OK" } } }
            },
            "/applications/{id}": {
                get: { summary: "Get application", responses: { "200": { description: "OK" } } },
                patch: { summary: "Update application", responses: { "200": { description: "OK" } } }
            },
            "/applications/{id}/notes": {
                post: { summary: "Add note", responses: { "201": { description: "Created" } } }
            },
            "/applications/{id}/notes/{noteId}": {
                delete: { summary: "Delete note", responses: { "204": { description: "No Content" } } }
            },
            "/applications/{id}/tasks": {
                post: { summary: "Add task", responses: { "201": { description: "Created" } } }
            },
            "/applications/{id}/tasks/{taskId}": {
                patch: { summary: "Update task", responses: { "200": { description: "OK" } } },
                delete: { summary: "Delete task", responses: { "204": { description: "No Content" } } }
            },
            "/applications/{id}/contacts": {
                post: { summary: "Add contact", responses: { "201": { description: "Created" } } }
            },
            "/applications/{id}/contacts/{contactId}": {
                patch: { summary: "Update contact", responses: { "200": { description: "OK" } } },
                delete: { summary: "Delete contact", responses: { "204": { description: "No Content" } } }
            },
            "/job-alerts": {
                post: { summary: "Create job alert", responses: { "201": { description: "Created" } } },
                get: { summary: "List job alerts", responses: { "200": { description: "OK" } } }
            },
            "/job-alerts/preview": {
                post: { summary: "Preview results for filters (no save)", responses: { "200": { description: "OK" } } }
            },
            "/job-alerts/{id}": {
                get: { summary: "Get job alert", responses: { "200": { description: "OK" } } },
                patch: { summary: "Update job alert", responses: { "200": { description: "OK" } } },
                delete: { summary: "Delete job alert", responses: { "204": { description: "No Content" } } }
            },
            "/job-alerts/{id}/run-now": { post: { summary: "Run alert immediately", responses: { "200": { description: "OK" } } } },
            "/job-alerts/{id}/pause": { post: { summary: "Pause alert", responses: { "200": { description: "OK" } } } },
            "/job-alerts/{id}/resume": { post: { summary: "Resume alert", responses: { "200": { description: "OK" } } } }
        }
    };
    res.json(spec);
});
exports.default = router;
