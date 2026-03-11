FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/Services/World/Lorekeeper.World.Api/Lorekeeper.World.Api.csproj src/Services/World/Lorekeeper.World.Api/
COPY src/Services/World/Lorekeeper.World.Application/Lorekeeper.World.Application.csproj src/Services/World/Lorekeeper.World.Application/
COPY src/Services/World/Lorekeeper.World.Infrastructure/Lorekeeper.World.Infrastructure.csproj src/Services/World/Lorekeeper.World.Infrastructure/
COPY src/Services/World/Lorekeeper.World.Domain/Lorekeeper.World.Domain.csproj src/Services/World/Lorekeeper.World.Domain/
RUN dotnet restore src/Services/World/Lorekeeper.World.Api/Lorekeeper.World.Api.csproj

COPY src/Services/World/ src/Services/World/
RUN dotnet publish src/Services/World/Lorekeeper.World.Api/Lorekeeper.World.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Lorekeeper.World.Api.dll"]
