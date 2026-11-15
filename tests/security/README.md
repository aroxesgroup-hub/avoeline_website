# Security tests (docs/25 T7)

Local first, then staging. Production and `avoeline.aroxes.com` are refused.

## Commands

```bash
# Full orchestrator (writes reports/security/status.json)
npm run test:security

# Individual layers
npm run test:security:unit      # pure logic + payload corpus
npm run test:security:deps      # npm audit, osv-scanner, gitleaks (if installed)
npm run test:security:transport # headers/CSP against BASE_URL
npm run test:security:authz     # unauth API matrix + override expiry unit tests
npm run test:security:zap       # OWASP ZAP baseline/active if docker/zap available
npm run test:security:postman   # Newman negatives against local (then staging if set)
```

Requires `APP_ENV=local` (or `staging` with allowlisted `BASE_URL`). Report: [docs/testing/security-report.md](../../docs/testing/security-report.md).
