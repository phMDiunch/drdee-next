# Aftercare (TreatmentCare) - Implementation Summary

- Added Prisma model TreatmentCare with enum TreatmentCareStatus and relations to Employee and Customer. Indexed by clinicId+treatmentDate and careAt.
- API endpoints:
  - GET /api/treatment-cares/customers?date=YYYY-MM-DD[&keyword][&clinicId]
  - GET /api/treatment-cares?from=YYYY-MM-DD&to=YYYY-MM-DD[&groupBy=day][&onlyMine=bool][&clinicId]
  - GET /api/treatment-cares?customerId=... (history)
  - POST /api/treatment-cares (create)
  - DELETE /api/treatment-cares/[id] (delete rules: non-admin only own and same-day VN)
- FE pages: /treatment-care with Tabs (Customers, Records). Customers has date prev/next, search, per-row create modal. Records shows last 35 days grouped by day with delete.
- Headers required (v1): x-employee-id, x-employee-role, x-clinic-id; wired via useAuthHeaders from Zustand employeeProfile.
- Timezone: VN (Asia/Ho_Chi_Minh) for day boundaries and grouping.

Follow-ups: Add Customer Detail tab integration; improve server-side auth and RBAC; add tests.
