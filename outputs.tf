
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


output "virtual_network_name" {
  description = "Name of the platform virtual network"
  value       = azurerm_virtual_network.platform.name
}

output "virtual_network_id" {
  description = "Resource ID of the platform virtual network"
  value       = azurerm_virtual_network.platform.id
}

output "application_subnet_id" {
  description = "Resource ID of the application subnet"
  value       = azurerm_subnet.app.id
}

output "container_registry_name" {
  description = "Name of the Azure Container Registry"
  value       = data.azurerm_container_registry.acr.name
}

output "container_registry_login_server" {
  description = "Login server for Azure Container Registry"
  value       = data.azurerm_container_registry.acr.login_server
}

output "api_fqdn" {
  description = "The fully qualified domain name of the API Container App"
  value       = "https://${azurerm_container_app.api.latest_revision_fqdn}"
}

