Note on Database Design:
The ERD and Data Dictionary represent the normalized logical design of the system.
The deployed database applies selective denormalization for certain lookup values
(categories, transaction types, payment methods) to reduce implementation
complexity while preserving all system functionality and business rules.

## Vercel Deployment Requirements

Set these environment variables in Vercel Project Settings → Environment Variables for **Production** (and Preview if needed):

- `DATABASE_URL` (Neon Postgres connection string)
- `JWT_SECRET` (strong random secret)

If `DATABASE_URL` is missing in Vercel, server routes will fail at runtime and may show an internal error page.
