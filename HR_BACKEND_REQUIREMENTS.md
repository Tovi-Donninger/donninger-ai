# Donninger.AI — HR Backend Requirements

This document records the intended backend scope for the HR & Recruitment automation. It is a product requirement, not a claim that these backend features are already implemented.

## Product scope: full employee lifecycle

The HR system must support the journey from vacancy creation through recruitment, onboarding, active employment, performance management and employee offboarding.

## 1. Recruitment and candidate records
- Capture vacancy details, job descriptions, responsibilities and job-related selection criteria.
- Prepare job adverts for supported recruitment channels; publishing depends on each platform's API, permissions and account access.
- Accept applications through configured forms or recruitment inboxes.
- Extract CV information, create candidate profiles, associate candidates with vacancies and track recruitment stages.
- Prepare evidence-based candidate summaries and shortlist recommendations for human review.
- Keep candidate records logically separate from employee records, with defined retention and deletion rules.

## 2. Employee database and individual employee files
After a hire is confirmed and onboarding is completed:
- Create an individual digital employee file.
- Add the employee to a central, searchable employee database.
- Store verified personal/contact details, job title, department, manager, location, start date, employment status and other approved employment fields.
- Store employment agreements and amendments, onboarding documents, policy acknowledgements, training records and relevant employment documentation.
- Maintain a dated history of employee-record changes and the person/system responsible for each change.
- Support controlled document upload, retrieval, versioning, access and retention.

## 3. Finance and payroll integration
- Integrate with the selected finance/payroll platform through its supported API or approved integration method.
- Map employee and payroll fields and define the source of truth for each field.
- Synchronise approved new-hire details and changes such as salary, pay frequency, working hours, allowances, benefits, leave adjustments and employment status, where supported by the payroll platform.
- Route salary changes, bonuses, deductions, bank-detail changes and payroll submissions through explicit authorised approval.
- Keep sync status, timestamps, errors, approvals and reconciliation/audit records.
- Never assume an update succeeded: surface failed or pending synchronisation for authorised staff to resolve.
- Do not store or expose sensitive bank/payroll information beyond the minimum required permissions.

## 4. KPIs and performance management
- Help managers define role-specific KPIs and measurable targets using the job description, responsibilities, seniority and company objectives.
- Store KPI definitions, measurement methods, target values, periods, owners and effective dates.
- Create assessment criteria and competency frameworks linked to the employee's individual file.
- Support scheduled and ad-hoc reviews, manager assessments, employee comments and acknowledgement.
- Record actual results against agreed targets, with source/evidence references where appropriate.
- Store dated performance reviews, feedback, achievements, supporting documentation, development objectives, training plans and performance-improvement plans.
- Maintain review history so earlier targets and results remain traceable rather than being silently overwritten.
- AI may prepare summaries, identify trends and draft review material, but managers must verify evidence and approve outcomes.

## 5. Permissions, privacy and governance
- Use organisation/tenant separation so one customer can never access another customer's employee or candidate data.
- Apply role-based access for HR administrators, managers, payroll/finance staff, employees and system administrators.
- Restrict sensitive personal, compensation, bank and performance information to authorised roles.
- Maintain audit logs for viewing or changing sensitive records, approvals, exports and integrations.
- Define lawful purpose, notices/consent where required, retention periods, correction processes, deletion and secure data handling for the jurisdictions served.
- Apply appropriate security controls, encryption, backups and incident procedures.
- Ensure employee assessments use transparent, role-relevant criteria. Do not infer protected characteristics or automate hiring, disciplinary, promotion or termination decisions.

## 6. Offboarding and lifecycle closure
- Support an authorised offboarding checklist when employment ends.
- Coordinate return of company property, access removal requests, final payroll inputs, handover tasks and required documentation.
- Preserve records only for the applicable lawful retention period and restrict access appropriately.

## 7. Backend entities to plan for
At minimum, design data relationships for:
- Organisation / tenant
- User account and role / permission
- Vacancy / job
- Candidate / application / candidate document
- Employee
- Employee document / employment event
- Payroll profile / payroll change / approval / sync event
- KPI definition / employee KPI target / measurement result
- Assessment template / assessment criterion / performance review
- Review result / feedback / evidence attachment / development action
- Audit event / retention policy / integration connection

## Implementation principles
- Treat this as a multi-tenant, permission-controlled system from the beginning.
- Keep employee records distinct from candidate records, with a controlled conversion when a candidate is hired.
- Use approval workflows and audit trails for sensitive changes.
- Make integrations modular; availability depends on the chosen third-party provider and its API permissions.
- Do not build a decorative or simulated portal. Backend features must be connected to real authentication, storage and integrations before being advertised as operational.
