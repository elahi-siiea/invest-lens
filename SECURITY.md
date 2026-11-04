# Security policy

## Reporting a vulnerability

Please do not open a public issue for a security problem. Use GitHub's private vulnerability reporting: open the repository's **Security** tab and choose **Report a vulnerability**. Include what you found, how to reproduce it, and the impact.

You can expect a reply within a week. Fixes land on `main`, and the report is credited unless you prefer otherwise.

## What to know

- API keys are read only on the server, in `src/app/api/prices/route.ts` and `src/lib/data`. Never expose a key with a `NEXT_PUBLIC_` prefix.
- The app stores only display settings in `localStorage`. It has no accounts and no database.
- Please never include real API keys in an issue or pull request. If a key leaks, revoke it with the provider.
