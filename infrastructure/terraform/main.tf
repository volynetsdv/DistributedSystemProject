# Унікальний суфікс для глобально унікальних імен (ACR, Storage Account)
resource "random_string" "suffix" {
  length  = 6
  upper   = false
  special = false
}

# ─── Група ресурсів ───────────────────────────────────────────────────────────

resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
}

# ─── Моніторинг (Log Analytics) ───────────────────────────────────────────────

resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.prefix}-logs"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

# ─── Azure Container Registry ────────────────────────────────────────────────

resource "azurerm_container_registry" "main" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = false
}

# ─── Managed Identity для pull з ACR ─────────────────────────────────────────

resource "azurerm_user_assigned_identity" "cms" {
  name                = "${var.prefix}-identity"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_role_assignment" "acr_pull" {
  scope                = azurerm_container_registry.main.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.cms.principal_id

  depends_on = [azurerm_user_assigned_identity.cms]
}

# ─── Azure Blob Storage (замінює MinIO) ───────────────────────────────────────

resource "azurerm_storage_account" "main" {
  name                            = "cmsstorage${random_string.suffix.result}"
  resource_group_name             = azurerm_resource_group.main.name
  location                        = azurerm_resource_group.main.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  allow_nested_items_to_be_public = true
}

resource "azurerm_storage_container" "media" {
  name                  = "cms-media"
  storage_account_id    = azurerm_storage_account.main.id
  container_access_type = "blob" # Публічний доступ на читання для відображення файлів
}

# ─── PostgreSQL Flexible Server ───────────────────────────────────────────────
#
# ВАЖЛИВО: Azure PostgreSQL Flexible Server підтримує read replica тільки в
# General Purpose (GP) та Memory Optimized тирах. Burstable (B_Standard_B1ms)
# не підтримує реплікацію.
#
# Для production-середовища:
#   - Master:  GP_Standard_D2s_v3 (create_mode = "Default")
#   - Replica: GP_Standard_D2s_v3 (create_mode = "Replica", source_server_id = ...)
#
# В цьому demo використовується один Burstable-сервер для обох з'єднань.
# Це дозволяє демонструвати IaC та round-robin балансування без додаткових витрат.

resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "${var.prefix}-postgres-${random_string.suffix.result}"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "16"
  administrator_login    = "cms_user"
  administrator_password = var.postgres_admin_password
  storage_mb             = 32768
  sku_name               = "B_Standard_B1ms"
  zone                   = "1"

  authentication {
    active_directory_auth_enabled = false
    password_auth_enabled         = true
  }
}

resource "azurerm_postgresql_flexible_server_database" "cms_db" {
  name      = "cms_db"
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# Дозволяємо з'єднання від Azure-сервісів (Container Apps)
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# ─── Container App Environment ────────────────────────────────────────────────

resource "azurerm_container_app_environment" "main" {
  name                       = "${var.prefix}-env"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
}

# ─── Локальні змінні (connection strings) ────────────────────────────────────

locals {
  # Обидва вказують на один сервер (буде замінено GP + read replica в prod)
  master_conn_str  = "Host=${azurerm_postgresql_flexible_server.main.fqdn};Database=cms_db;Username=cms_user;Password=${var.postgres_admin_password};SslMode=Require;Trust Server Certificate=true;Application Name=CMS_MASTER_WRITER"
  replica_conn_str = "Host=${azurerm_postgresql_flexible_server.main.fqdn};Database=cms_db;Username=cms_user;Password=${var.postgres_admin_password};SslMode=Require;Trust Server Certificate=true;Application Name=CMS_REPLICA_READER"
  placeholder_image = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
}

# ─── CMS Service (2 репліки — Azure балансує між ними) ───────────────────────
#
# min_replicas=2 / max_replicas=2 гарантує наявність двох інстансів.
# NODE_ID не задається явно — кожна репліка використовує своє Environment.MachineName.

resource "azurerm_container_app" "cms" {
  name                         = "cms-service"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.cms.id]
  }

  registry {
    server   = azurerm_container_registry.main.login_server
    identity = azurerm_user_assigned_identity.cms.id
  }

  secret {
    name  = "master-db"
    value = local.master_conn_str
  }
  secret {
    name  = "replica-db"
    value = local.replica_conn_str
  }
  secret {
    name  = "blob-storage"
    value = azurerm_storage_account.main.primary_connection_string
  }

  template {
    min_replicas = 2
    max_replicas = 2

    container {
      name   = "cms-service"
      image  = local.placeholder_image
      cpu    = 0.5
      memory = "1Gi"

      env {
        name        = "ConnectionStrings__MasterDb"
        secret_name = "master-db"
      }
      env {
        name        = "ConnectionStrings__ReplicaDb"
        secret_name = "replica-db"
      }
      env {
        name        = "Azure__BlobStorage__ConnectionString"
        secret_name = "blob-storage"
      }
      env {
        name  = "Azure__BlobStorage__ContainerName"
        value = azurerm_storage_container.media.name
      }
    }
  }

  ingress {
    external_enabled = false
    target_port      = 8080
    transport        = "http"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  lifecycle {
    ignore_changes = [template[0].container[0].image]
  }

  depends_on = [azurerm_role_assignment.acr_pull]
}

# ─── Gateway (YARP + React UI) ────────────────────────────────────────────────

resource "azurerm_container_app" "gateway" {
  name                         = "gateway"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.cms.id]
  }

  registry {
    server   = azurerm_container_registry.main.login_server
    identity = azurerm_user_assigned_identity.cms.id
  }

  template {
    min_replicas = 1
    max_replicas = 1

    container {
      name   = "gateway"
      image  = local.placeholder_image
      cpu    = 0.25
      memory = "0.5Gi"

      # Перевизначаємо YARP-маршрути через env-змінні.
      # В Azure — один внутрішній endpoint cms-service; Azure сам балансує між репліками.
      # Обидва YARP-destinations вказують на один адрес, щоб не змінювати appsettings.json.
      env {
        name  = "ReverseProxy__Clusters__cmsCluster__Destinations__node1__Address"
        value = "http://cms-service"
      }
      env {
        name  = "ReverseProxy__Clusters__cmsCluster__Destinations__node2__Address"
        value = "http://cms-service"
      }
    }
  }

  ingress {
    external_enabled = true
    target_port      = 8080
    transport        = "http"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  lifecycle {
    ignore_changes = [template[0].container[0].image]
  }

  depends_on = [
    azurerm_role_assignment.acr_pull,
    azurerm_container_app.cms,
  ]
}
