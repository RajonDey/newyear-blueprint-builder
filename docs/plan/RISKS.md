# Risk Register

## Active risks

### R1 - Cross-user write risk in weekly check-in API

- Severity: High
- Likelihood: Medium
- Impact: unauthorized check-ins tied to wrong plans
- Mitigation: validate plan ownership before transactional create
- Owner: Backend
- Status: Mitigated (monitor)

### R2 - Unsanitized rich-text HTML rendering

- Severity: High
- Likelihood: Medium
- Impact: XSS exposure in user-facing pages
- Mitigation: sanitize at consistent boundary and audit all render points
- Owner: Platform
- Status: Mitigated (monitor)

### R3 - Inconsistent week boundaries across modules

- Severity: Medium
- Likelihood: High (timezones and year boundaries)
- Impact: confusion in weekly plan/review cadence
- Mitigation: centralized timezone-aware week helper shared by queries and APIs
- Owner: Platform
- Status: Mitigated (monitor)

### R4 - Product promise mismatch (marketing vs shipped depth)

- Severity: Medium
- Likelihood: Medium
- Impact: trust and conversion quality degradation
- Mitigation: align claim wording or accelerate feature completion
- Owner: Product
- Status: Open

## Resolved risks

- None yet.
