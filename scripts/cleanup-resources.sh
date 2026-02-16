#!/bin/bash
RG="DistributedSystem-RG"
ACR_NAME="dvolynetscmsregistry"

az containerapp env delete --name cms-environment --resource-group $RG --yes

# Видаляємо Container Registry щоб не платити за зберігання образів
az acr delete --name $ACR_NAME --resource-group $RG --yes

echo "Ресурси успішно видалені"

# Можна зробити ось так, щоб просто зупинити застосунки, якщо не хочемо видаляти все:
# az containerapp update --name cms-app --resource-group $RG --min-replicas 0
# az containerapp update --name gateway-app --resource-group $RG --min-replicas 0