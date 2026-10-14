
output "resource_group_name" {
  description = "Name of the deployed resource group"
  value       = azurerm_resource_group.platform.name
}

output "resource_group_location" {
  description = "Azure region of the resource group"
  value       = azurerm_resource_group.platform.location
}

output "resource_group_id" {
  description = "Azure resource group resource ID"
  value       = azurerm_resource_group.platform.id
}
