
variable "resource_group_name" {
  description = "Name of the platform resource group"
  type        = string
  default     = "rg-simplicreate-platform-dev"
}

variable "location" {
  description = "Azure region for the platform"
  type        = string
  default     = "southafricanorth"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}
