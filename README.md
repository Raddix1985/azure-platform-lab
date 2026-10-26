# Azure Platform Lab

A portfolio project demonstrating Infrastructure as Code (IaC), Azure platform services, Terraform remote state, and GitHub Actions OIDC authentication.

## Project goals

- Provision and manage Azure infrastructure with Terraform.
- Keep Terraform state in Azure Storage rather than on a developer workstation.
- Authenticate GitHub Actions to Azure using OpenID Connect (OIDC), without storing a long-lived Azure client secret.
- Use a user-assigned managed identity for the Container App's image-pull access to Azure Container Registry (ACR).
- Validate infrastructure changes before applying them.
- Practice least-privilege access and document the architecture.

## Architecture

See [docs/architecture.md](docs/architecture.md) for the architecture diagram and component notes.

The current deployment includes:

| Component | Resource |
|---|---|
| Resource group | `rg-simplicreate-platform-dev` |
| Region | `southafricanorth` |
| Virtual network | `vnet-simplicreate-dev` (`10.10.0.0/16`) |
| Application subnet | `snet-app` (`10.10.1.0/24`) |
| Network security group | `nsg-simplicreate-app-dev` |
| Azure Container Registry | `crsimplicreateplatformdev` |
| Log Analytics workspace | `law-simplicreate-dev` |
| Container Apps environment | `cae-simplicreate-dev` |
| Container App | `ca-platform-api-dev` |
| User-assigned managed identity | `mi-simplicreate-aca-dev` |
| Terraform state storage | `scplatformtfstate2026`, container `tfstate` |

Resource names are documented for this lab and may differ if the configuration is changed. Review Terraform files and the Azure portal before making deployment decisions.

## Technology stack

- Azure
- Terraform CLI `1.16.5`
- AzureRM provider `4.81.0` (pinned by `.terraform.lock.hcl`)
- Azure CLI
- Git and GitHub
- GitHub Actions
- GitHub OIDC federation to Microsoft Entra ID
- Azure Container Apps, Azure Container Registry, Virtual Network, Network Security Group, Log Analytics, and Managed Identity

## Local development on Bazzite

The local workflow was tested inside a Fedora 44 Distrobox named `azure-dev`, keeping the host OS separate from the Terraform toolchain.

See [docs/development-environment.md](docs/development-environment.md) for setup and daily commands.

Typical safe validation sequence:

```bash
terraform init
terraform fmt -check -recursive
terraform validate
terraform plan
```

`terraform plan` reads remote state and Azure resources but does not apply changes. Review any proposed changes before taking further action. Do not run `terraform apply` unless you intentionally want to change Azure resources and have reviewed the plan.

## Remote state

Terraform uses an Azure Storage backend configured in `main.tf`:

- Resource group: `rg-simplicreate-tfstate`
- Storage account: `scplatformtfstate2026`
- Container: `tfstate`
- State key: `platform-dev.tfstate`
- Authentication: Microsoft Entra ID (`use_azuread_auth = true`)

The backend supports shared state and state locking. Keep the storage account and state container access restricted. Never commit state files, credentials, client secrets, or local Terraform working directories.

## CI/CD and security

The current `Terraform Deploy` workflow is manually triggered and gated by the `confirm_deploy` input. When that input is true on `main`, the workflow initializes Terraform, checks formatting, validates configuration, creates a saved plan, and applies that plan. **This workflow can modify Azure resources.** Inspect the plan and workflow run before authorizing a deployment.

A separate validation-only workflow is proposed in [`proposed-workflows/terraform-validate.yml`](proposed-workflows/terraform-validate.yml). It runs on pull requests and pushes to `main`, uses `terraform init -backend=false`, and does not authenticate to Azure or apply infrastructure changes. Review it and copy it into `.github/workflows/terraform-validate.yml` when ready.

Security principles used in this project:

- GitHub Actions authenticates to Azure using OIDC federation.
- No long-lived Azure client secret is required by the workflow.
- The Container App uses a user-assigned managed identity with `AcrPull` access to ACR.
- The deployment service principal is scoped to the development resource group for infrastructure management and to the state storage account for blob data access, rather than being granted subscription-wide Contributor.
- Keep the deployment workflow restricted to trusted branches and a protected GitHub environment.

## Current validation status

As of 26 October 2026, local `terraform validate` succeeded and `terraform plan` reported:

> No changes. Your infrastructure matches the configuration.

The GitHub Actions workflow also passed after the Azure RBAC scope was reduced. These are point-in-time results, not a guarantee that future runs will pass or that every deployment is risk-free.

## Suggested project improvements

1. Add automated pull-request validation using the validation-only workflow in this repository pack.
2. Keep deployment as a separate manually approved action; review the saved plan before apply.
3. Add test coverage for the API in `tests/` and ensure CI runs those tests.
4. Add a screenshot or sanitized output from a successful validation run to the portfolio.
5. Review Azure cost and resource status regularly; remove lab resources when they are no longer needed.

## Disclaimer

This is a learning and portfolio project, not a production-ready landing zone. Review security, availability, networking, cost, and operational requirements before reusing the design for real workloads.
