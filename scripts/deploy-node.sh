#!/bin/bash

# Змінні
RESOURCE_GROUP="DistributedSystem-RG" # Resource Group я створював вручну, тому сюди переношу створене ім'я
LOCATION="germanywestcentral" # https://learn.microsoft.com/en-us/azure/reliability/regions-list
ACR_NAME="dvolynetscmsregistry" # Унікальне ім'я для Azure Container Registry
ENVIRONMENT_NAME="cms-env"

# спробуємо додати реєстрацію провайдера згідно інструкції https://learn.microsoft.com/en-us/azure/azure-resource-manager/troubleshooting/error-register-resource-provider?tabs=azure-cli
az provider register -n Microsoft.ContainerRegistry --wait
az provider register -n Microsoft.OperationalInsights --wait
az provider register -n Microsoft.App --wait # цей провайдер зареєстрований в поточному RG, але на всяк випадок нехай буде, раптом доведеться перестворювати RG

# 1. Створення групи ресурсів
az group create --name $RESOURCE_GROUP --location $LOCATION

# 2. Створення Azure Container Registry (ACR)
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic

ACR_ID=$(az acr show --name $ACR_NAME --query id -o tsv)

# 5. Створення Container App Environment
az containerapp env create --name $ENVIRONMENT_NAME --resource-group $RESOURCE_GROUP --location $LOCATION

setup_app() {
    local NAME=$1
    local INGRESS=$2
    local MIN_REPLICAS=$3
    local MAX_REPLICAS=$4

    echo "--- Створення $NAME ---"
    
    # Створюємо застосунок з публічного образу
    az containerapp create \
        --name $NAME \
        --resource-group $RESOURCE_GROUP \
        --environment $ENVIRONMENT_NAME \
        --image "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest" \
        --target-port 8080 \
        --ingress $INGRESS \
        --min-replicas $MIN_REPLICAS \
        --max-replicas $MAX_REPLICAS

    # Вмикаємо identity
    az containerapp identity assign --name $NAME -g $RESOURCE_GROUP --system-assigned

    # Отримуємо ID identity
    PRINCIPAL_ID=$(az containerapp show --name $NAME -g $RESOURCE_GROUP --query identity.principalId -o tsv)

    # Даємо права на читання з ACR
    az role assignment create \
        --assignee $PRINCIPAL_ID \
        --role AcrPull \
        --scope $ACR_ID

    # Кажемо застосунку використовувати Identity для доступу до ACR
    az containerapp registry set \
        --name $NAME \
        --resource-group $RESOURCE_GROUP \
        --server "$ACR_NAME.azurecr.io" \
        --identity system
}

setup_app "cms-service" "internal" 2 2
setup_app "gateway" "external" 1 1

URL=$(az containerapp show --name gateway --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)
echo "URL сторінки: https://$URL"