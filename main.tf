
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "platform" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    project     = "azure-platform-lab"
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "azurerm_virtual_network" "platform" {
  name                = "vnet-simplicreate-dev"
  address_space       = ["10.10.0.0/16"]
  location            = azurerm_resource_group.platform.location
  resource_group_name = azurerm_resource_group.platform.name

  tags = {
    project     = "azure-platform-lab"
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "azurerm_subnet" "app" {
  name                 = "snet-app"
  resource_group_name  = azurerm_resource_group.platform.name
  virtual_network_name = azurerm_virtual_network.platform.name
  address_prefixes     = ["10.10.1.0/24"]
}


resource "azurerm_network_security_group" "app" {
  name                = "nsg-simplicreate-app-dev"
  location            = azurerm_resource_group.platform.location
  resource_group_name = azurerm_resource_group.platform.name

  tags = {
    project     = "azure-platform-lab"
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "azurerm_subnet_network_security_group_association" "app" {
  subnet_id                 = azurerm_subnet.app.id
  network_security_group_id = azurerm_network_security_group.app.id
}


