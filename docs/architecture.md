# Architecture

## Logical topology

```mermaid
flowchart TB
    Dev[Developer workstation<br/>Bazzite + Fedora Distrobox]
    Repo[GitHub repository<br/>Terraform + application source]
    Actions[GitHub Actions<br/>OIDC federation]
    Entra[Microsoft Entra ID<br/>Federated identity]
    StateRG[Terraform state resource group]
    Storage[Azure Storage account<br/>tfstate container<br/>platform-dev.tfstate]

    subgraph Azure["Azure subscription — South Africa North"]
      subgraph RG["rg-simplicreate-platform-dev"]
        VNet["Virtual network<br/>vnet-simplicreate-dev<br/>10.10.0.0/16"]
        Subnet["Application subnet<br/>snet-app<br/>10.10.1.0/24"]
        NSG["Network security group<br/>nsg-simplicreate-app-dev"]
        ACR["Azure Container Registry<br/>crsimplicreateplatformdev"]
        Identity["User-assigned managed identity<br/>mi-simplicreate-aca-dev"]
        Logs["Log Analytics workspace<br/>law-simplicreate-dev"]
        Env["Container Apps environment<br/>cae-simplicreate-dev"]
        App["Container App<br/>ca-platform-api-dev<br/>platform-lab-api:1.0.0"]
      end
    end

    Dev -->|Git push / pull| Repo
    Repo --> Actions
    Actions -->|OIDC token| Entra
    Actions -->|Terraform plan / approved apply| Azure
    Dev -->|terraform init / plan| StateRG
    Actions -->|state read / write| StateRG
    StateRG --> Storage
    VNet --> Subnet
    NSG -. protects .-> Subnet
    Subnet -. association .-> VNet
    Env --> Logs
    App --> Env
    Identity -->|AcrPull role| ACR
    App -->|image pull using managed identity| ACR
```

## Components and responsibilities

| Layer | Component | Purpose |
|---|---|---|
| Source control | GitHub repository | Stores Terraform configuration, application source, tests, and workflow definitions. |
| CI/CD | GitHub Actions | Runs validation and the manually gated deployment workflow. |
| Workload identity | Microsoft Entra ID federated credential | Lets GitHub Actions exchange its OIDC token for Azure access without a stored client secret. |
| State | Azure Storage backend | Stores `platform-dev.tfstate` and provides Terraform state locking. |
| Network | Virtual network, subnet, NSG | Defines the lab network boundary and subnet security controls. |
| Image registry | Azure Container Registry | Stores the application container image. |
| Compute | Azure Container Apps environment and app | Hosts the Python API container. |
| Identity | User-assigned managed identity | Gives the Container App `AcrPull` access without embedding registry credentials. |
| Observability | Log Analytics workspace | Receives Container Apps environment logs. |

## Security boundaries

- The GitHub Actions service principal uses OIDC federation, not a long-lived client secret.
- Infrastructure permissions are scoped to the development resource group; blob data permissions are scoped to the Terraform state storage account.
- The Container App's managed identity is separate from the GitHub Actions deployment identity.
- Terraform state can contain sensitive values. Restrict access to the storage account and never commit state files.
- The current deployment workflow can apply infrastructure changes when manually dispatched on `main` with `confirm_deploy=true`. A successful workflow run is not the same as a validation-only run.

## Important accuracy note

This diagram describes the known resource inventory and identity relationships for this lab. Verify any network integration, ingress, egress, and subnet associations against `main.tf` and the Azure portal before using the diagram as a production design.
