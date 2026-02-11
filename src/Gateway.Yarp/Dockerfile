# --- ЕТАП 1: Збірка React застосунку ---
FROM node:24-alpine3.22 AS ui-build
# створюємо робочу папку в контейнері для фронтенду
WORKDIR /app/ui-client
# Копіюємо залежності фронтенду
COPY src/ui-client/package*.json ./
RUN npm install
# Копіюємо вихідний код фронтенду
COPY src/ui-client/ ./
# Збираємо фронтенд (результат буде в ../Gateway.Yarp/wwwroot згідно vite.config.ts)
RUN npm run build

# --- ЕТАП 2: Збірка .NET Gateway ---
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS dotnet-build
WORKDIR /app
# Копіюємо файли рішень та проєктів для відновлення (restore)
COPY DistributedSystem.slnx ./
COPY src/Gateway.Yarp/*.csproj ./src/Gateway.Yarp/
# COPY src/Shared.Contracts/*.csproj ./src/Shared.Contracts/ # цей проєкт ще не створено
RUN dotnet restore src/Gateway.Yarp/YARP.csproj

# Копіюємо решту коду бекенду
COPY src/Gateway.Yarp/ ./src/Gateway.Yarp/
# COPY src/Shared.Contracts/ ./src/Shared.Contracts/ # цей проєкт ще не створено

# Копіюємо вже зібраний фронтенд з першого етапу в wwwroot проксі-сервера
COPY --from=ui-build /app/Gateway.Yarp/wwwroot ./src/Gateway.Yarp/wwwroot

# Публікуємо проєкт
WORKDIR /app/src/Gateway.Yarp
RUN dotnet publish -c Release -o /out

# --- ЕТАП 3: Фінальний образ (Runtime) ---
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=dotnet-build /out .
# Важливо: порт 80 для HTTP або 443 для HTTPS
EXPOSE 80
ENTRYPOINT ["dotnet", "YARP.dll"]