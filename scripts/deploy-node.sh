#!/bin/bash

# Змінні
RESOURCE_GROUP="DistributedSystem-RG" # Resource Group я створював вручну, тому сюди переношу створене ім'я
LOCATION="germanywestcentral" # https://learn.microsoft.com/en-us/azure/reliability/regions-list
ACR_NAME="dvolynetscmsregistry" # Унікальне ім'я для Azure Container Registry
ENVIRONMENT_NAME="cms-env"

# спробуємо додати реєстрацію провайдера згідно інструкції https://learn.microsoft.com/en-us/azure/azure-resource-manager/troubleshooting/error-register-resource-provider?tabs=azure-cli
az provider register -n Microsoft.ContainerRegistry --wait
az provider register -n Microsoft.OperationalInsights --wait

# 1. Створення групи ресурсів
az group create --name $RESOURCE_GROUP --location $LOCATION

# 2. Створення Azure Container Registry (ACR)
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic

# 3. Логін в ACR
az acr login --name $ACR_NAME

# 4. Збірка та завантаження образів прямо в Azure
# Azure сам збирає образи з Dockerfile
az acr build --registry $ACR_NAME --image cms-service:latest -f src/CMS.Service/Dockerfile .
az acr build --registry $ACR_NAME --image gateway:latest -f src/Gateway.Yarp/Dockerfile .

# 5. Створення Container App Environment
az containerapp env create --name $ENVIRONMENT_NAME --resource-group $RESOURCE_GROUP --location $LOCATION

# 6. Деплой двух реплік CMS Service
az containerapp create \
  --name cms-service \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT_NAME \
  --image "$ACR_NAME.azurecr.io/cms-service:latest" \
  --min-replicas 2 --max-replicas 2 \
  --ingress internal --target-port 8080

# 7. Деплой Gateway 
az containerapp create \
  --name gateway \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT_NAME \
  --image "$ACR_NAME.azurecr.io/gateway:latest" \
  --min-replicas 1 --max-replicas 1 \
  --ingress external --target-port 8080