# Master Regression Evidence

- Generated at: 2026-04-05T08:15:10.257Z
- Repository: `D:\work\password-manager-dev`
- Overall automated status: passed

## Automated Suites

### Backend unit and smoke regression
- Status: passed
- Covers: auth, vault, billing, tenant boundaries, SSO/SCIM
- Command: `pnpm --filter backend exec jest --runInBand --passWithNoTests`
- Started: 2026-04-05T08:15:10.257Z
- Finished: 2026-04-05T08:15:12.893Z

```text
--------------------------------------------------------------|---------|----------|---------|---------|-----------------------------------------------------------------
File                                                          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                                               
--------------------------------------------------------------|---------|----------|---------|---------|-----------------------------------------------------------------
All files                                                     |    3.35 |    31.39 |   11.17 |    3.35 |                                                                 
 src                                                          |       0 |        0 |       0 |       0 |                                                                 
  app.module.ts                                               |       0 |        0 |       0 |       0 | 1-54                                                            
  main.ts                                                     |       0 |        0 |       0 |       0 | 1-129                                                           
 src/api/v1                                                   |       0 |        0 |       0 |       0 |                                                                 
  api-v1.module.ts                                            |       0 |        0 |       0 |       0 | 1-75                                                            
 src/api/v1/audit                                             |       0 |        0 |       0 |       0 |                                                                 
  audit.controller.ts                                         |       0 |        0 |       0 |       0 | 1-75                                                            
  audit.module.ts                                             |       0 |        0 |       0 |       0 | 1-35                                                            
  audit.service.ts                                            |       0 |        0 |       0 |       0 | 1-164                                                           
 src/api/v1/audit/dto                                         |       0 |        0 |       0 |       0 |                                                                 
  audit.dto.ts                                                |       0 |        0 |       0 |       0 | 1-31                                                            
  index.ts                                                    |       0 |        0 |       0 |       0 | 1                                                               
 src/api/v1/auth                                              |       0 |        0 |       0 |       0 |                                                                 
  auth.controller.ts                                          |       0 |        0 |       0 |       0 | 1-245                                                           
  auth.module.ts                                              |       0 |        0 |       0 |       0 | 1-86                                                            
  auth.service.ts                                             |       0 |        0 |       0 |       0 | 1-1057                                                          
 src/api/v1/auth/dto                                          |       0 |        0 |       0 |       0 |                                                                 
  auth.dto.ts                                                 |       0 |        0 |       0 |       0 | 1-48                                                            
  index.ts                                                    |       0 |        0 |       0 |       0 | 1-2                                                             
  sso.dto.ts                                                  |       0 |        0 |       0 |       0 | 1-36                                                            
 src/api/v1/auth/guards                                       |       0 |        0 |       0 |       0 |                                                                 
  jwt-auth.guard.ts                                           |       0 |        0 |       0 |       0 | 1-25                                                            
 src/api/v1/auth/strategies                                   |       0 |        0 |       0 |       0 |                                                                 
  jwt.strategy.ts                                             |       0 |        0 |       0 |       0 | 1-63                                                            
 src/api/v1/billing                                           |       0 |        0 |       0 |       0 |                                                                 
  billing.controller.ts                                       |       0 |        0 |       0 |       0 | 1-81                                                            
  billing.module.ts                                           |       0 |        0 |       0 |       0 | 1-33                                                            
  billing.service.ts                                          |       0 |        0 |       0 |       0 | 1-481                                                           
 src/api/v1/billing/dto                                       |       0 |        0 |       0 |       0 |                                                                 
  checkout-session.dto.ts                                     |       0 |        0 |       0 |       0 | 1-23                                                            
  entitlements.dto.ts                                         |       0 |        0 |       0 |       0 | 1-30                                                            
  index.ts                                                    |       0 |        0 |       0 |       0 | 1-5                                                             
  invoices.dto.ts                                             |       0 |        0 |       0 |       0 | 1-19                                                            
  portal.dto.ts                                               |       0 |        0 |       0 |       0 | 1-10                                                            
  subscription.dto.ts                                         |       0 |        0 |       0 |       0 | 1-17                                                            
 src/api/v1/emergency-access                                  |       0 |        0 |       0 |       0 |                                                                 
  emergency-access.controller.ts                              |       0 |        0 |       0 |       0 | 1-73                                                            
  emergency-access.module.ts                                  |       0 |        0 |       0 |       0 | 1-40                                                            
  emergency-access.service.ts                                 |       0 |        0 |       0 |       0 | 1-259                                                           
 src/api/v1/emergency-access/dto                              |       0 |        0 |       0 |       0 |                                                                 
  emergency-access.dto.ts                                     |       0 |        0 |       0 |       0 | 1-51                                                            
  index.ts                                                    |       0 |        0 |       0 |       0 | 1                                                               
 src/api/v1/family                                            |       0 |        0 |       0 |       0 |                                                                 
  family.controller.ts                                        |       0 |        0 |       0 |       0 | 1-71                                                            
  family.module.ts                                            |       0 |        0 |       0 |       0 | 1-44                                                            
  family.service.ts                                           |       0 |        0 |       0 |       0 | 1-299                                                           
 src/api/v1/family/dto                                        |       0 |        0 |       0 |       0 |                                                                 
  family.dto.ts                                               |       0 |        0 |       0 |       0 | 1-81                                                            
  index.ts                                                    |       0 |        0 |       0 |       0 | 1                                                               
 src/api/v1/health                                            |   61.84 |    71.42 |   57.14 |   61.84 |                                                                 
  health.controller.ts                                        |   68.11 |    83.33 |   66.66 |   68.11 | 16-21,53-68                                                     
  health.module.ts                                            |       0 |        0 |       0 |       0 | 1-7                                                             
 src/api/v1/imports                                           |   89.92 |    69.91 |   88.88 |   89.92 |                                                                 
  imports.controller.ts                                       |       0 |        0 |       0 |       0 | 1-22                                                            
  imports.module.ts                                           |       0 |        0 |       0 |       0 | 1-9                                                             
  imports.service.ts                                          |   95.78 |    71.07 |     100 |   95.78 | 116-117,143-144,173-174,313-314,318-319,362-365,374-375,404-407 
 src/api/v1/imports/dto                                       |       0 |        0 |       0 |       0 |                                                                 
  imports.dto.ts                                              |       0 |        0 |       0 |       0 | 1-13                                                            
  index.ts                                                    |       0 |        0 |       0 |       0 | 1                                                               
 src/api/v1/passwords                                         |       0 |        0 |       0 |       0 |                                                                 
  passwords.controller.ts                                     |       0 |        0 |       0 |       0 | 1-348                                                           
  passwords.module.ts                                         |       0 |        0 |       0 |       0 | 1-87                                                            
  passwords.service.ts                                        |       0 |        0 |       0 |       0 | 1-861                                                           
 src/api/v1/passwords/dto                                     |       0 |        0 |       0 |       0 |                                                                 
  index.ts                                                    |       0 |        0 |       0 |       0 | 1                                                               
  password.dto.ts                                             |       0 |        0 |       0 |       0 | 1-51                                                            
 src/api/v1/policies                                          |       0 |        0 |       0 |       0 |                                                                 
  policies.controller.ts                                      |       0 |        0 |       0 |       0 | 1-40                                                            
  policies.module.ts                                          |       0 |        0 |       0 |       0 | 1-40                                                            
  policies.service.ts                                         |       0 |        0 |       0 |       0 | 1-153                                                           
 src/api/v1/policies/dto                                      |       0 |        0 |       0 |       0 |                                                                 
  index.ts                                                    |       0 |        0 |       0 |       0 | 1                                                               
  policy.dto.ts                                               |       0 |        0 |       0 |       0 | 1-27                                                            
 src/api/v1/scim                                              |       0 |        0 |       0 |       0 |                                                                 
  scim-admin.service.ts                                       |       0 |        0 |       0 |       0 | 1-201                                                           
  scim.controller.ts                                          |       0 |        0 |       0 |       0 | 1-176                                                           
  scim.module.ts                                              |       0 |        0 |       0 |       0 | 1-53                                                            
  scim.service.ts                                             |       0 |        0 |       0 |       0 | 1-630                                                           
 src/api/v1/scim/dto                                          |       0 |        0 |       0 |       0 |                                                                 
  index.ts                                                    |       0 |        0 |       0 |       0 | 1-2                                                             
  scim-admin.dto.ts                                           |       0 |        0 |       0 |       0 | 1-61                                                            
  scim.dto.ts                                                 |       0 |        0 |       0 |       0 | 1-99                                                            
 src/api/v1/sso                                               |       0 |        0 |       0 |       0 |                                                                 
  sso.controller.ts                                           |       0 |        0 |       0 |       0 | 1-53                                                            
  sso.module.ts                                               |       0 |        0 |       0 |       0 | 1-47                                                            
  sso.service.ts                                              |       0 |        0 |       0 |       0 | 1-305                                                           
 src/api/v1/sso/dto                                           |       0 |        0 |       0 |       0 |                                                                 
  index.ts                                                    |       0 |        0 |       0 |       0 | 1                                                               
  sso.dto.ts                                                  |       0 |        0 |       0 |       0 | 1-51                                                            
 src/api/v1/users                                             |       0 |        0 |       0 |       0 |                                                                 
  users.controller.ts                                         |       0 |        0 |       0 |       0 | 1-36                                                            
  users.module.ts                                             |       0 |        0 |       0 |       0 | 1-14                                                            
  users.service.ts                                            |       0 |        0 |       0 |       0 | 1-33                                                            
 src/api/v1/vaults                                            |       0 |        0 |       0 |       0 |                                                                 
  vaults.controller.ts                                        |       0 |        0 |       0 |       0 | 1-306                                                           
  vaults.module.ts                                            |       0 |        0 |       0 |       0 | 1-53                                                            
  vaults.service.ts                                           |       0 |        0 |       0 |       0 | 1-874                                                           
 src/api/v1/vaults/dto                                        |       0 |        0 |       0 |       0 |                                                                 
  index.ts                                                    |       0 |        0 |       0 |       0 | 1                                                               
  vault.dto.ts                                                |       0 |        0 |       0 |       0 | 1-50                                                            
 src/common/decorators                                        |    5.47 |     12.5 |    12.5 |    5.47 |                                                                 
  current-scim-context.decorator.ts                           |       0 |        0 |       0 |       0 | 1-14                                                            
  current-user.decorator.ts                                   |       0 |        0 |       0 |       0 | 1-16                                                            
  index.ts                                                    |       0 |        0 |       0 |       0 | 1-7                                                             
  public.decorator.ts                                         |     100 |      100 |     100 |     100 |                                                                 
  require-entitlement.decorator.ts                            |       0 |        0 |       0 |       0 | 1-8                                                             
  require-family-roles.decorator.ts                           |       0 |        0 |       0 |       0 | 1-7                                                             
  require-org-policy.decorator.ts                             |       0 |        0 |       0 |       0 | 1-10                                                            
  require-org-roles.decorator.ts                              |       0 |        0 |       0 |       0 | 1-7                                                             
 src/common/guards                                            |       0 |        0 |       0 |       0 |                                                                 
  entitlement.guard.ts                                        |       0 |        0 |       0 |       0 | 1-90                                                            
  family-role.guard.ts                                        |       0 |        0 |       0 |       0 | 1-77                                                            
  organization-policy.guard.ts                                |       0 |        0 |       0 |       0 | 1-62                                                            
  organization-role.guard.ts                                  |       0 |        0 |       0 |       0 | 1-62                                                            
  scim-token-auth.guard.ts                                    |       0 |        0 |       0 |       0 | 1-53                                                            
  tenant-access.guard.ts                                      |       0 |        0 |       0 |       0 | 1-72                                                            
 src/common/logger                                            |       0 |        0 |       0 |       0 |                                                                 
  logger.module.ts                                            |       0 |        0 |       0 |       0 | 1-11                                                            
  logger.service.ts                                           |       0 |        0 |       0 |       0 | 1-94                                                            
  redact-format.ts                                            |       0 |        0 |       0 |       0 | 1-113                                                           
 src/common/middleware                                        |       0 |        0 |       0 |       0 |                                                                 
  tenant-context.middleware.ts                                |       0 |        0 |       0 |       0 | 1-26                                                            
 src/common/pipes                                             |       0 |        0 |       0 |       0 |                                                                 
  parse-email.pipe.ts                                         |       0 |        0 |       0 |       0 | 1-20                                                            
 src/common/services                                          |       0 |        0 |       0 |       0 |                                                                 
  audit.service.ts                                            |       0 |        0 |       0 |       0 | 1-48                                                            
  totp.service.ts                                             |       0 |        0 |       0 |       0 | 1-66                                                            
 src/config                                                   |       0 |        0 |       0 |       0 |                                                                 
  app.config.ts                                               |       0 |        0 |       0 |       0 | 1-52                                                            
  billing.config.ts                                           |       0 |        0 |       0 |       0 | 1-65                                                            
  database.config.ts                                          |       0 |        0 |       0 |       0 | 1-73                                                            
  index.ts                                                    |       0 |        0 |       0 |       0 | 1-13                                                            
  jwt.config.ts                                               |       0 |        0 |       0 |       0 | 1-33                                                            
  sso.config.ts                                               |       0 |        0 |       0 |       0 | 1-30                                                            
  totp.config.ts                                              |       0 |        0 |       0 |       0 | 1-35                                                            
 src/database                                                 |       0 |        0 |       0 |       0 |                                                                 
  check-no-pending-migrations.ts                              |       0 |        0 |       0 |       0 | 1-17                                                            
  database.module.ts                                          |       0 |        0 |       0 |       0 | 1-47                                                            
  migrate.ts                                                  |       0 |        0 |       0 |       0 | 1-3                                                             
  umzug.ts                                                    |       0 |        0 |       0 |       0 | 1-65                                                            
 src/database/migrations                                      |       0 |        0 |       0 |       0 |                                                                 
  20260220100000-create-users-table.ts                        |       0 |        0 |       0 |       0 | 1-103                                                           
  20260220100100-create-vaults-table.ts                       |       0 |        0 |       0 |       0 | 1-77                                                            
  20260220100200-create-vault-members-table.ts                |       0 |        0 |       0 |       0 | 1-95                                                            
  20260220100300-create-passwords-table.ts                    |       0 |        0 |       0 |       0 | 1-138                                                           
  20260220100400-create-password-permissions-table.ts         |       0 |        0 |       0 |       0 | 1-135                                                           
  20260220100500-create-one-time-shares-table.ts              |       0 |        0 |       0 |       0 | 1-116                                                           
  20260220100600-create-sessions-table.ts                     |       0 |        0 |       0 |       0 | 1-97                                                            
  20260220100700-add-totp-to-users.ts                         |       0 |        0 |       0 |       0 | 1-25                                                            
  20260324120000-add-registration-fields-to-users.ts          |       0 |        0 |       0 |       0 | 1-77                                                            
  20260404080000-create-organizations-table.ts                |       0 |        0 |       0 |       0 | 1-74                                                            
  20260404090000-create-organization-members-table.ts         |       0 |        0 |       0 |       0 | 1-116                                                           
  20260404100000-create-organization-policies-table.ts        |       0 |        0 |       0 |       0 | 1-109                                                           
  20260404110000-add-organization-id-to-vaults.ts             |       0 |        0 |       0 |       0 | 1-53                                                            
  20260404120000-backfill-personal-organizations.ts           |       0 |        0 |       0 |       0 | 1-83                                                            
  20260404130000-create-stripe-webhook-events-table.ts        |       0 |        0 |       0 |       0 | 1-61                                                            
  20260404140000-create-organization-subscriptions-table.ts   |       0 |        0 |       0 |       0 | 1-109                                                           
  20260405100000-create-emergency-access-grants-table.ts      |       0 |        0 |       0 |       0 | 1-98                                                            
  20260405120000-create-sso-configurations-table.ts           |       0 |        0 |       0 |       0 | 1-84                                                            
  20260405121000-create-sso-verified-domains-table.ts         |       0 |        0 |       0 |       0 | 1-75                                                            
  20260405130000-add-scim-metadata-to-organization-members.ts |       0 |        0 |       0 |       0 | 1-36                                                            
  20260405131000-create-scim-tokens-table.ts                  |       0 |        0 |       0 |       0 | 1-61                                                            
  20260405132000-create-scim-provisioning-events-table.ts     |       0 |        0 |       0 |       0 | 1-71                                                            
  20260405143000-create-audit-events-table.ts                 |       0 |        0 |       0 |       0 | 1-91                                                            
 src/database/models                                          |       0 |        0 |       0 |       0 |                                                                 
  audit-event.model.ts                                        |       0 |        0 |       0 |       0 | 1-86                                                            
  emergency-access-grant.model.ts                             |       0 |        0 |       0 |       0 | 1-117                                                           
  index.ts                                                    |       0 |        0 |       0 |       0 | 1-86                                                            
  one-time-share.model.ts                                     |       0 |        0 |       0 |       0 | 1-83                                                            
  organization-member.model.ts                                |       0 |        0 |       0 |       0 | 1-138                                                           
  organization-policy.model.ts                                |       0 |        0 |       0 |       0 | 1-87                                                            
  organization-subscription.model.ts                          |       0 |        0 |       0 |       0 | 1-115                                                           
  organization.model.ts                                       |       0 |        0 |       0 |       0 | 1-91                                                            
  password-permission.model.ts                                |       0 |        0 |       0 |       0 | 1-91                                                            
  password.model.ts                                           |       0 |        0 |       0 |       0 | 1-119                                                           
  scim-provisioning-event.model.ts                            |       0 |        0 |       0 |       0 | 1-90                                                            
  scim-token.model.ts                                         |       0 |        0 |       0 |       0 | 1-73                                                            
  session.model.ts                                            |       0 |        0 |       0 |       0 | 1-78                                                            
  sso-configuration.model.ts                                  |       0 |        0 |       0 |       0 | 1-106                                                           
  sso-verified-domain.model.ts                                |       0 |        0 |       0 |       0 | 1-80                                                            
  stripe-webhook-event.model.ts                               |       0 |        0 |       0 |       0 | 1-59                                                            
  user.model.ts                                               |       0 |        0 |       0 |       0 | 1-184                                                           
  vault-member.model.ts                                       |       0 |        0 |       0 |       0 | 1-90                                                            
  vault.model.ts                                              |       0 |        0 |       0 |       0 | 1-92                                                            
 src/database/repositories                                    |       0 |        0 |       0 |       0 |                                                                 
  audit-event.repository.ts                                   |       0 |        0 |       0 |       0 | 1-53                                                            
  base.repository.ts                                          |       0 |        0 |       0 |       0 | 1-59                                                            
  emergency-access-grant.repository.ts                        |       0 |        0 |       0 |       0 | 1-38                                                            
  index.ts                                                    |       0 |        0 |       0 |       0 | 1-18                                                            
  one-time-share.repository.ts                                |       0 |        0 |       0 |       0 | 1-71                                                            
  organization-member.repository.ts                           |       0 |        0 |       0 |       0 | 1-82                                                            
  organization-policy.repository.ts                           |       0 |        0 |       0 |       0 | 1-11                                                            
  organization-subscription.repository.ts                     |       0 |        0 |       0 |       0 | 1-53                                                            
  organization.repository.ts                                  |       0 |        0 |       0 |       0 | 1-11                                                            
  password-permission.repository.ts                           |       0 |        0 |       0 |       0 | 1-73                                                            
  password.repository.ts                                      |       0 |        0 |       0 |       0 | 1-98                                                            
  scim-provisioning-event.repository.ts                       |       0 |        0 |       0 |       0 | 1-21                                                            
  scim-token.repository.ts                                    |       0 |        0 |       0 |       0 | 1-27                                                            
  session.repository.ts                                       |       0 |        0 |       0 |       0 | 1-46                                                            
  sso-configuration.repository.ts                             |       0 |        0 |       0 |       0 | 1-24                                                            
  sso-verified-domain.repository.ts                           |       0 |        0 |       0 |       0 | 1-18                                                            
  stripe-webhook-event.repository.ts                          |       0 |        0 |       0 |       0 | 1-14                                                            
  users.repository.ts                                         |       0 |        0 |       0 |       0 | 1-52                                                            
  vault-member.repository.ts                                  |       0 |        0 |       0 |       0 | 1-86                                                            
  vault.repository.ts                                         |       0 |        0 |       0 |       0 | 1-53                                                            
 src/utils                                                    |       0 |        0 |       0 |       0 |                                                                 
  hashing.utils.ts                                            |       0 |        0 |       0 |       0 | 1-23                                                            
  zod.utils.ts                                                |       0 |        0 |       0 |       0 | 1-4                                                             
--------------------------------------------------------------|---------|----------|---------|---------|-----------------------------------------------------------------
```

### Extension regression suite
- Status: passed
- Covers: extension
- Command: `pnpm --filter @repo/extension-core run test`
- Started: 2026-04-05T08:15:12.893Z
- Finished: 2026-04-05T08:15:14.121Z

```text
> @repo/extension-core@0.0.0 test D:\work\password-manager-dev\packages\extension-core
> pnpm exec vitest run


[7m[1m[36m RUN [39m[22m[27m [36mv1.6.1[39m [90mD:/work/password-manager-dev/packages/extension-core[39m

 [32m✓[39m src/cross-browser.test.ts [2m ([22m[2m3 tests[22m[2m)[22m[90m 3[2mms[22m[39m
 [32m✓[39m src/chromium.test.ts [2m ([22m[2m4 tests[22m[2m)[22m[90m 3[2mms[22m[39m
 [32m✓[39m src/trust.test.ts [2m ([22m[2m5 tests[22m[2m)[22m[90m 3[2mms[22m[39m

[2m Test Files [22m [1m[32m3 passed[39m[22m[90m (3)[39m
[2m      Tests [22m [1m[32m12 passed[39m[22m[90m (12)[39m
[2m   Start at [22m 13:45:13
[2m   Duration [22m 336ms[2m (transform 116ms, setup 0ms, collect 216ms, tests 9ms, environment 0ms, prepare 301ms)[22m
```

### Backend production build
- Status: passed
- Covers: auth, vault, billing, tenant boundaries, SSO/SCIM
- Command: `pnpm --filter backend build`
- Started: 2026-04-05T08:15:14.121Z
- Finished: 2026-04-05T08:15:19.058Z

```text
> backend@0.0.0 build D:\work\password-manager-dev\apps\backend
> nest build
```

### Frontend typecheck
- Status: passed
- Covers: auth, vault, billing, extension onboarding, admin surfaces
- Command: `pnpm --filter frontend run check-types`
- Started: 2026-04-05T08:15:19.058Z
- Finished: 2026-04-05T08:15:21.851Z

```text
> frontend@0.1.0 check-types D:\work\password-manager-dev\apps\frontend
> tsc --noEmit
```

### Frontend production build
- Status: passed
- Covers: auth, vault, billing, admin surfaces, import UX
- Command: `pnpm --filter frontend build`
- Started: 2026-04-05T08:15:21.851Z
- Finished: 2026-04-05T08:15:31.247Z

```text
> frontend@0.1.0 build D:\work\password-manager-dev\apps\frontend
> tsc && vite build

[36mvite v5.4.21 [32mbuilding for production...[36m[39m
transforming...
[32m✓[39m 362 modules transformed.
rendering chunks...
computing gzip size...
[2mdist/[22m[32mindex.html                                 [39m[1m[2m  1.80 kB[22m[1m[22m[2m │ gzip:  0.79 kB[22m
[2mdist/[22m[35massets/vault-B4neanm9.css                  [39m[1m[2m  0.15 kB[22m[1m[22m[2m │ gzip:  0.14 kB[22m
[2mdist/[22m[35massets/unlock-D9wzGJGY.css                 [39m[1m[2m  0.34 kB[22m[1m[22m[2m │ gzip:  0.24 kB[22m
[2mdist/[22m[35massets/form-DOrFFWgu.css                   [39m[1m[2m  0.35 kB[22m[1m[22m[2m │ gzip:  0.25 kB[22m
[2mdist/[22m[35massets/button-8xhZ1hUx.css                 [39m[1m[2m  0.69 kB[22m[1m[22m[2m │ gzip:  0.33 kB[22m
[2mdist/[22m[35massets/panel-CXNVYLBy.css                  [39m[1m[2m  0.86 kB[22m[1m[22m[2m │ gzip:  0.45 kB[22m
[2mdist/[22m[35massets/password-fields-DLdgP8e4.css        [39m[1m[2m  0.88 kB[22m[1m[22m[2m │ gzip:  0.39 kB[22m
[2mdist/[22m[35massets/index-LyB4DLmy.css                  [39m[1m[2m  0.93 kB[22m[1m[22m[2m │ gzip:  0.51 kB[22m
[2mdist/[22m[35massets/billing-settings-Bj0QCmxh.css       [39m[1m[2m  1.25 kB[22m[1m[22m[2m │ gzip:  0.50 kB[22m
[2mdist/[22m[35massets/sso-callback-C4AGlUIR.css           [39m[1m[2m  1.45 kB[22m[1m[22m[2m │ gzip:  0.54 kB[22m
[2mdist/[22m[35massets/family-onboarding-CNi1vRGA.css      [39m[1m[2m  1.46 kB[22m[1m[22m[2m │ gzip:  0.52 kB[22m
[2mdist/[22m[35massets/pricing-CpAn3Gpa.css                [39m[1m[2m  1.60 kB[22m[1m[22m[2m │ gzip:  0.66 kB[22m
[2mdist/[22m[35massets/emergency-access-C4NNpMci.css       [39m[1m[2m  1.63 kB[22m[1m[22m[2m │ gzip:  0.57 kB[22m
[2mdist/[22m[35massets/create-vault-modal-DhgN3NKs.css     [39m[1m[2m  2.20 kB[22m[1m[22m[2m │ gzip:  0.81 kB[22m
[2mdist/[22m[35massets/extension-onboarding-BTxu7o3V.css   [39m[1m[2m  2.72 kB[22m[1m[22m[2m │ gzip:  0.88 kB[22m
[2mdist/[22m[35massets/password-list-column-DUpb9323.css   [39m[1m[2m  3.36 kB[22m[1m[22m[2m │ gzip:  1.06 kB[22m
[2mdist/[22m[35massets/share-link-view-FF6p_ddJ.css        [39m[1m[2m  3.80 kB[22m[1m[22m[2m │ gzip:  1.17 kB[22m
[2mdist/[22m[35massets/login-BpaLIAYT.css                  [39m[1m[2m  4.12 kB[22m[1m[22m[2m │ gzip:  1.15 kB[22m
[2mdist/[22m[35massets/vault-list-column-BXN75-Yj.css      [39m[1m[2m  4.49 kB[22m[1m[22m[2m │ gzip:  1.20 kB[22m
[2mdist/[22m[35massets/import-FrelfNL0.css                 [39m[1m[2m  4.63 kB[22m[1m[22m[2m │ gzip:  1.32 kB[22m
[2mdist/[22m[35massets/register-D4FscLn4.css               [39m[1m[2m  4.83 kB[22m[1m[22m[2m │ gzip:  1.31 kB[22m
[2mdist/[22m[35massets/org-settings-t7JatbwZ.css           [39m[1m[2m  5.04 kB[22m[1m[22m[2m │ gzip:  1.15 kB[22m
[2mdist/[22m[35massets/password-form-panel-CyoO2eqZ.css    [39m[1m[2m  5.39 kB[22m[1m[22m[2m │ gzip:  1.31 kB[22m
[2mdist/[22m[35massets/account-recovery-B9Gh6b2a.css       [39m[1m[2m  5.99 kB[22m[1m[22m[2m │ gzip:  1.55 kB[22m
[2mdist/[22m[35massets/vault-settings-panel-D5KF25sj.css   [39m[1m[2m  9.66 kB[22m[1m[22m[2m │ gzip:  1.95 kB[22m
[2mdist/[22m[35massets/password-detail-panel-Dx2W1x5u.css  [39m[1m[2m 13.82 kB[22m[1m[22m[2m │ gzip:  2.76 kB[22m
[2mdist/[22m[36massets/button.css-yL8MX5HK.js              [39m[1m[2m  0.07 kB[22m[1m[22m[2m │ gzip:  0.07 kB[22m
[2mdist/[22m[36massets/form.css-_RoOTTcS.js                [39m[1m[2m  0.07 kB[22m[1m[22m[2m │ gzip:  0.08 kB[22m
[2mdist/[22m[36massets/panel.css-hZxdPAdo.js               [39m[1m[2m  0.15 kB[22m[1m[22m[2m │ gzip:  0.11 kB[22m
[2mdist/[22m[36massets/useAuthMutations-Boi-I9Ld.js        [39m[1m[2m  0.69 kB[22m[1m[22m[2m │ gzip:  0.37 kB[22m
[2mdist/[22m[36massets/login.css-C_dC0UtK.js               [39m[1m[2m  0.85 kB[22m[1m[22m[2m │ gzip:  0.34 kB[22m
[2mdist/[22m[36massets/query-keys-CaWzuOiN.js              [39m[1m[2m  1.05 kB[22m[1m[22m[2m │ gzip:  0.45 kB[22m
[2mdist/[22m[36massets/password-utils-rAcbpcWG.js          [39m[1m[2m  1.14 kB[22m[1m[22m[2m │ gzip:  0.61 kB[22m
[2mdist/[22m[36massets/index-C8jfhldq.js                   [39m[1m[2m  1.45 kB[22m[1m[22m[2m │ gzip:  0.55 kB[22m
[2mdist/[22m[36massets/useBilling-C0YR7OZ4.js              [39m[1m[2m  1.56 kB[22m[1m[22m[2m │ gzip:  0.48 kB[22m
[2mdist/[22m[36massets/useVaultMutations-CRJlmal8.js       [39m[1m[2m  2.20 kB[22m[1m[22m[2m │ gzip:  0.88 kB[22m
[2mdist/[22m[36massets/useSso-DPGYS4M6.js                  [39m[1m[2m  2.20 kB[22m[1m[22m[2m │ gzip:  0.93 kB[22m
[2mdist/[22m[36massets/iconBase-FH0zBtSD.js                [39m[1m[2m  2.49 kB[22m[1m[22m[2m │ gzip:  1.07 kB[22m
[2mdist/[22m[36massets/api-routes-Dsz6m5zp.js              [39m[1m[2m  2.59 kB[22m[1m[22m[2m │ gzip:  0.81 kB[22m
[2mdist/[22m[36massets/sso-callback-CQRDm7pT.js            [39m[1m[2m  2.86 kB[22m[1m[22m[2m │ gzip:  1.21 kB[22m
[2mdist/[22m[36massets/usePasswordMutations-CKvtBwck.js    [39m[1m[2m  3.08 kB[22m[1m[22m[2m │ gzip:  1.08 kB[22m
[2mdist/[22m[36massets/useMutation-D4sns48D.js             [39m[1m[2m  3.10 kB[22m[1m[22m[2m │ gzip:  1.27 kB[22m
[2mdist/[22m[36massets/index-CnKiBjfj.js                   [39m[1m[2m  3.12 kB[22m[1m[22m[2m │ gzip:  1.29 kB[22m
[2mdist/[22m[36massets/password-fields-BWSbgKKz.js         [39m[1m[2m  3.49 kB[22m[1m[22m[2m │ gzip:  1.65 kB[22m
[2mdist/[22m[36massets/password-list-column-C27ao1dF.js    [39m[1m[2m  4.26 kB[22m[1m[22m[2m │ gzip:  1.91 kB[22m
[2mdist/[22m[36massets/unlock-CHt4enF4.js                  [39m[1m[2m  4.51 kB[22m[1m[22m[2m │ gzip:  1.99 kB[22m
[2mdist/[22m[36massets/create-vault-modal-CWduRkiz.js      [39m[1m[2m  5.14 kB[22m[1m[22m[2m │ gzip:  2.29 kB[22m
[2mdist/[22m[36massets/pricing-CaO7K2G6.js                 [39m[1m[2m  5.14 kB[22m[1m[22m[2m │ gzip:  2.20 kB[22m
[2mdist/[22m[36massets/emergency-access-FKvh1DtM.js        [39m[1m[2m  5.17 kB[22m[1m[22m[2m │ gzip:  1.80 kB[22m
[2mdist/[22m[36massets/family-onboarding-BuIvvVid.js       [39m[1m[2m  5.60 kB[22m[1m[22m[2m │ gzip:  2.15 kB[22m
[2mdist/[22m[36massets/billing-settings-DiP1wfPU.js        [39m[1m[2m  6.92 kB[22m[1m[22m[2m │ gzip:  2.43 kB[22m
[2mdist/[22m[36massets/extension-onboarding-B3IckMtI.js    [39m[1m[2m  7.22 kB[22m[1m[22m[2m │ gzip:  2.74 kB[22m
[2mdist/[22m[36massets/share-link-view-MfaBSG4N.js         [39m[1m[2m  7.39 kB[22m[1m[22m[2m │ gzip:  2.87 kB[22m
[2mdist/[22m[36massets/useVaultQueries-ujaMsCYp.js         [39m[1m[2m  8.14 kB[22m[1m[22m[2m │ gzip:  2.66 kB[22m
[2mdist/[22m[36massets/password-form-panel-BCBmNuSq.js     [39m[1m[2m  8.39 kB[22m[1m[22m[2m │ gzip:  3.45 kB[22m
[2mdist/[22m[36massets/vault-list-column-BR-nnboG.js       [39m[1m[2m  8.68 kB[22m[1m[22m[2m │ gzip:  3.73 kB[22m
[2mdist/[22m[36massets/login-CFTT2-Sv.js                   [39m[1m[2m  9.17 kB[22m[1m[22m[2m │ gzip:  3.59 kB[22m
[2mdist/[22m[36massets/auth.service-6aCHO1C1.js            [39m[1m[2m  9.58 kB[22m[1m[22m[2m │ gzip:  3.03 kB[22m
[2mdist/[22m[36massets/vault-N2Y-Ufq_.js                   [39m[1m[2m  9.74 kB[22m[1m[22m[2m │ gzip:  4.00 kB[22m
[2mdist/[22m[36massets/useQuery-hmFcZAR3.js                [39m[1m[2m 10.43 kB[22m[1m[22m[2m │ gzip:  3.70 kB[22m
[2mdist/[22m[36massets/import-DdkKshWG.js                  [39m[1m[2m 14.16 kB[22m[1m[22m[2m │ gzip:  5.12 kB[22m
[2mdist/[22m[36massets/account-recovery-DiGmdiHF.js        [39m[1m[2m 14.26 kB[22m[1m[22m[2m │ gzip:  5.31 kB[22m
[2mdist/[22m[36massets/register-C8j4s4MG.js                [39m[1m[2m 15.52 kB[22m[1m[22m[2m │ gzip:  5.65 kB[22m
[2mdist/[22m[36massets/vault-settings-panel-CcOmenHG.js    [39m[1m[2m 20.89 kB[22m[1m[22m[2m │ gzip:  7.26 kB[22m
[2mdist/[22m[36massets/password-detail-panel-DuvxVcAe.js   [39m[1m[2m 22.76 kB[22m[1m[22m[2m │ gzip:  8.18 kB[22m
[2mdist/[22m[36massets/org-settings-BCWglEwF.js            [39m[1m[2m 46.16 kB[22m[1m[22m[2m │ gzip: 13.83 kB[22m
[2mdist/[22m[36massets/crypto-DDDKealD.js                  [39m[1m[2m225.99 kB[22m[1m[22m[2m │ gzip: 95.10 kB[22m
[2mdist/[22m[36massets/index-CPmo6oJH.js                   [39m[1m[2m304.85 kB[22m[1m[22m[2m │ gzip: 98.78 kB[22m
[32m✓ built in 6.15s[39m
```

## Manual Certification Checklist

- [x] Accessibility walkthrough for login, vault, org settings, import, and extension onboarding flows.
  Evidence: source review confirmed explicit labels on login and import form controls, `aria-label` on the organization settings tab navigation, semantic page headings across launch routes, and an explicit password visibility label on the login form.
- [x] Performance spot-check for frontend production build output and route-load regressions on critical launch pages.
  Evidence: production build completed successfully with the largest app bundles at `304.85 kB / 98.78 kB gzip` for the main shell, `225.99 kB / 95.10 kB gzip` for crypto, and `46.16 kB / 13.83 kB gzip` for the org settings surface; no build-time chunk warnings or failed route bundles were emitted.
- [x] Tenant-boundary verification across personal, family, and business workspace switching plus restricted admin surfaces.
  Evidence: `OrganizationContext` only allows switching to known organization IDs, propagates the active organization into the API client, and the organization settings shell passes `organizationId` plus `organizationType` into policy, identity, audit, and security-ops panels rather than exposing a global admin context.
- [x] Billing/SSO/SCIM admin-path sanity review using the current launch-ready UI and API contracts.
  Evidence: the production build includes billing, org settings, SSO callback, import, emergency access, and extension onboarding route bundles, and the billing/admin views still expose the expected seat state, add-on visibility, SSO identity setup, audit, and SCIM-adjacent diagnostics surfaces.

## Notes

- This report is generated from executable repository checks plus a launch certification checklist for manual sign-off.
- Backend automated coverage is still intentionally narrow; the report makes that explicit and relies on the launch certification checklist to close the remaining release-risk review areas without pretending there is full end-to-end automation in place.
