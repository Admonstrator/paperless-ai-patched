# Contributing

Contributions are welcome! Here's how to get involved.

---

## Reporting issues

If something doesn't work as expected, please [open an issue](https://github.com/Admonstrator/paperless-ai-next/issues). Include:

- What you expected to happen
- What actually happened
- Your Docker image version (`docker inspect` or the tag you used)
- Relevant log output (`docker logs <container-name>`)

---

## Submitting a fix or improvement

1. **Fork** the repository and create a branch. Use a descriptive name:

    ```
    fix/retry-loop-broken
    perf/faster-history-queries
    feat/new-ai-provider
    ```

2. **Make your changes** and test them locally (see below).

3. **Open a pull request** against the `main` branch. Describe what you changed and why.

---

## Testing locally

```bash
# Install dependencies
npm install

# Start with auto-reload
npm run test
```

The application will be available at `http://localhost:3000`. You'll still need a running Paperless-ngx instance to connect to.

---

## Integrating upstream fixes

If you want to bring in a fix from the upstream [clusterzx/paperless-ai](https://github.com/clusterzx/paperless-ai) repository:

1. Create a branch: e.g. `PR-800-fix-something`
2. Apply the changes
3. Add a `Included_Fixes/PR-800-fix-something/README.md` documenting what was changed
4. Update `Included_Fixes/README.md` and `docs/changelog.md` with the new entry
5. Open a pull request

---

## Code style

Run the formatter before committing:

```bash
npx prettier --write .
```

---

## Questions?

Feel free to open a discussion or issue on GitHub. There's no strict contribution process – just be clear about what you're changing and why.
