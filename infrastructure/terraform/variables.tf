variable "resource_group_name" {
  description = "Назва групи ресурсів Azure"
  type        = string
  default     = "DistributedSystem-RG"
}

variable "location" {
  description = "Регіон Azure (https://learn.microsoft.com/en-us/azure/reliability/regions-list)"
  type        = string
  default     = "germanywestcentral"
}

variable "prefix" {
  description = "Префікс для іменування ресурсів"
  type        = string
  default     = "cms"
}

variable "acr_name" {
  description = "Унікальна назва Azure Container Registry (лише малі літери та цифри)"
  type        = string
}

variable "postgres_admin_password" {
  description = "Пароль адміністратора PostgreSQL"
  type        = string
  sensitive   = true
}

variable "cms_image_tag" {
  description = "Тег Docker-образу для CMS Service (керується CI/CD)"
  type        = string
  default     = "latest"
}

variable "gateway_image_tag" {
  description = "Тег Docker-образу для Gateway (керується CI/CD)"
  type        = string
  default     = "latest"
}
