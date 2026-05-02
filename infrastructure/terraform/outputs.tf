output "gateway_url" {
  description = "Публічна URL-адреса застосунку"
  value       = "https://${azurerm_container_app.gateway.ingress[0].fqdn}"
}

output "acr_login_server" {
  description = "Адреса Azure Container Registry"
  value       = azurerm_container_registry.main.login_server
}

output "postgres_fqdn" {
  description = "FQDN PostgreSQL сервера"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "storage_account_name" {
  description = "Назва Storage Account"
  value       = azurerm_storage_account.main.name
}

output "storage_container_name" {
  description = "Назва Blob контейнера для медіафайлів"
  value       = azurerm_storage_container.media.name
}

output "container_app_environment_id" {
  description = "ID Container App Environment"
  value       = azurerm_container_app_environment.main.id
}

output "cms_identity_client_id" {
  description = "Client ID Managed Identity (для налаштування додаткових ролей)"
  value       = azurerm_user_assigned_identity.cms.client_id
}
