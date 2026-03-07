---
title: "Troubleshooting"
---

This page collects recovery steps for common operational issues.

## MFA lockout recovery

If a user is locked out because MFA cannot be completed (lost authenticator device, broken migration, wrong TOTP setup), you can reset MFA from inside the container.

List users and MFA status:

```bash
docker exec -it paperless-ai-next node scripts/mfa-reset.js --list
```

Reset MFA for one user:

```bash
docker exec -it paperless-ai-next node scripts/mfa-reset.js --user <username> --yes
```

Reset MFA for all users (careful):

```bash
docker exec -it paperless-ai-next node scripts/mfa-reset.js --all --yes
```

Alternative (inside container):

```bash
npm run mfa:reset -- --user <username> --yes
```

:::caution
`--yes` is required for write operations on purpose. This prevents accidental MFA resets.
:::

:::note
If you are using a custom container name, replace `paperless-ai-next` in the commands above.
:::
