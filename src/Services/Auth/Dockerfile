FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/Services/Auth/Lorekeeper.Auth.Api/Lorekeeper.Auth.Api.csproj src/Services/Auth/Lorekeeper.Auth.Api/
COPY src/Services/Auth/Lorekeeper.Auth.Application/Lorekeeper.Auth.Application.csproj src/Services/Auth/Lorekeeper.Auth.Application/
COPY src/Services/Auth/Lorekeeper.Auth.Infrastructure/Lorekeeper.Auth.Infrastructure.csproj src/Services/Auth/Lorekeeper.Auth.Infrastructure/
COPY src/Services/Auth/Lorekeeper.Auth.Domain/Lorekeeper.Auth.Domain.csproj src/Services/Auth/Lorekeeper.Auth.Domain/
RUN dotnet restore src/Services/Auth/Lorekeeper.Auth.Api/Lorekeeper.Auth.Api.csproj

COPY src/Services/Auth/ src/Services/Auth/
RUN dotnet publish src/Services/Auth/Lorekeeper.Auth.Api/Lorekeeper.Auth.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Lorekeeper.Auth.Api.dll"]
