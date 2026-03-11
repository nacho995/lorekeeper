# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/Gateway/Lorekeeper.Gateway/Lorekeeper.Gateway.csproj src/Gateway/Lorekeeper.Gateway/
RUN dotnet restore src/Gateway/Lorekeeper.Gateway/Lorekeeper.Gateway.csproj

COPY src/Gateway/Lorekeeper.Gateway/ src/Gateway/Lorekeeper.Gateway/
RUN dotnet publish src/Gateway/Lorekeeper.Gateway/Lorekeeper.Gateway.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Lorekeeper.Gateway.dll"]
