# --- ЕТАП 1: Збірка сервісу ---
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Копіюємо файл рішення з кореня
COPY DistributedSystem.slnx ./

# Копіюємо файл проєкту сервісу
COPY src/CMS.Service/*.csproj ./src/CMS.Service/

# Цей рядок розкоментуємо пізніше, коли буде створено спільний проєкт для контрактів
# COPY src/Shared.Contracts/*.csproj ./src/Shared.Contracts/

# Відновлюємо залежності
RUN dotnet restore src/CMS.Service/CMS.Service.csproj

# Копіюємо весь вихідний код сервісу
COPY src/CMS.Service/ ./src/CMS.Service/

# Це теж пізніше розкоментуємо
# COPY src/Shared.Contracts/ ./src/Shared.Contracts/

# Збираємо та публікуємо бінарні файли
WORKDIR /app/src/CMS.Service
RUN dotnet publish -c Release -o /out

# --- ЕТАП 2: Фінальний образ (Runtime) ---
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

# Копіюємо тільки результат збірки
COPY --from=build /out .

# .NET контейнери за замовчуванням слухають порт 8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "CMS.Service.dll"]