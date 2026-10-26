# Local development environment

## Tested environment

- Host: Bazzite KDE
- Tool container: Fedora 44 Distrobox named `azure-dev`
- Repository directory: `~/azure-platform-lab`
- Terraform CLI: `1.16.5`
- AzureRM provider: `4.81.0`
- Azure CLI: `2.83.0` in the Distrobox at the time of setup
- Azure authentication: Microsoft Entra interactive login
- Backend: Azure Storage with Microsoft Entra authentication

Versions can change. Confirm current versions with `terraform version` and `az version`.

## Enter the environment

From the host terminal:

```bash
distrobox enter azure-dev
cd ~/azure-platform-lab
```

If the Distrobox is not present, create a Fedora Distrobox first and install Git, Terraform, Azure CLI, and any other project dependencies inside it. Keep host-level package changes separate from this environment.

## Authenticate to Azure

```bash
az login --tenant 0478391b-2ecf-4e4d-9187-e2ba4e803624 --use-device-code
az account show --output table
```

Confirm that the selected subscription is the intended lab subscription before running Terraform:

- Subscription: `5ec2fb09-eb60-4823-a43e-bcde9564bfe0`
- Tenant: `0478391b-2ecf-4e4d-9187-e2ba4e803624`

If multiple subscriptions are available, explicitly select the intended one with `az account set --subscription <subscription-id>`.

## Initialize and validate

```bash
terraform init
terraform fmt -check -recursive
terraform validate
terraform plan
```

What these commands do:

- `terraform init` configures the backend and downloads the locked provider.
- `terraform fmt -check -recursive` checks formatting without rewriting files.
- `terraform validate` checks the configuration's internal consistency.
- `terraform plan` refreshes tracked resources and reports proposed changes. It does not apply them.

If a plan proposes changes, stop and review the complete plan before deciding what to do. Do not run `terraform apply` as part of routine validation.

## Git workflow

Configure an author identity inside this Distrobox if it has not already been configured:

```bash
git config --global user.name "Your Name"
git config --global user.email "your-github-email@example.com"
```

Check status and review changes before committing:

```bash
git status
git diff
git diff --check
```

Use GitHub CLI (`gh auth login`) or SSH authentication for pushes. Do not use your GitHub account password as a Git HTTPS password, and never paste access tokens into chat or commit them to the repository.

## Troubleshooting

- **Azure backend authentication failure:** confirm `az account show`, tenant/subscription selection, and that your user has data-plane access to the state blob.
- **State lock:** do not force-unlock unless you have verified that no Terraform operation is active and understand the consequences.
- **Provider lock-file change:** inspect `git diff -- .terraform.lock.hcl`. Commit intended checksum additions so other environments can reproduce provider installation.
- **Unexpected plan:** do not apply. Inspect the plan and check whether someone changed Azure resources or the Terraform configuration.
