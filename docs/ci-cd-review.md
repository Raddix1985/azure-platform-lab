# CI/CD workflow review

## Current workflow

The existing `.github/workflows/terraform-ci.yml` is manually dispatched. It only proceeds when the selected ref is `main` and `confirm_deploy` is `true`. It uses GitHub OIDC to log in to Azure, initializes Terraform, checks formatting, validates the configuration, creates a saved plan, and applies that saved plan.

**This is a deployment workflow, not a validation-only CI workflow.** A successful run with confirmation enabled can change Azure infrastructure.

## Recommended workflow split

1. **Pull request / push validation:** format and validate Terraform without contacting the remote backend or authenticating to Azure.
2. **Manual deployment:** retain the separate deployment workflow and protected `dev` GitHub environment. Review plan output and keep the explicit confirmation gate.
3. **Future enhancement:** consider a plan-only workflow that uses OIDC and remote state only for trusted branches, publishes a sanitized plan summary, and never applies automatically. Be careful: plans can contain sensitive values, so do not publish raw plan files to public artifacts.

## Least-privilege notes

- Keep `permissions: contents: read` at workflow level.
- Grant `id-token: write` only to jobs that need Azure OIDC.
- Scope infrastructure permissions to the dev resource group when possible.
- Scope Storage Blob Data permissions to the Terraform state storage account/container as appropriate.
- The `azurerm_role_assignment` resource may require additional Azure authorization beyond Contributor. If a future plan/apply fails on role assignment management, inspect the exact error and grant only the narrowly scoped permission required; do not restore subscription-wide Contributor by default.
- Keep GitHub environment protection and branch restrictions enabled.

## Proposed validation-only workflow

See `proposed-workflows/terraform-validate.yml`. It intentionally uses `terraform init -backend=false` so pull-request validation does not require remote state access or Azure credentials. It does not create a plan, authenticate to Azure, or apply changes.

Before adding more checks, verify the current tests and application test command in the repository and extend the workflow deliberately.
