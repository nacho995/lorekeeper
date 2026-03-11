# Lorekeeper

Storyworld studio to build worlds, characters, locations, factions, and lore for books, games, film, and series. Text-only by design, with AI-assisted generation and a Spanish-first UI (toggle ES/EN).

## Para recruiters

Lorekeeper es un producto para crear y mantener un "story bible" con un flujo rapido: idea -> personajes -> lugares -> facciones -> lore, todo en un solo lugar.

- Problema que resuelve: dispersar notas, canon y personajes entre documentos y herramientas diferentes.
- Valor: crea un centro de verdad, mejora consistencia narrativa y acelera la pre-produccion.
- UX: interfaz clara, filtros por sinopsis, toggle ES/EN, mantenimiento por feature-flag.
- AI: generacion de texto on-demand (sin imagenes) para ampliar el universo.
- Deployment: microservicios en Fly.io con Docker por servicio.

## Para developers

### Arquitectura

- Frontend: React + Vite + Tailwind.
- Gateway: .NET 8 + YARP reverse proxy.
- Auth Service: .NET 8 + JWT + EF Core.
- World Service: .NET 8 + EF Core.
- AI Service: FastAPI + Groq (texto, sin imagenes).
- DB: Postgres (unico o separado para Auth/World).

### Estructura del repo

- `frontend/` UI (React + Vite).
- `src/Services/Auth/` Auth API (JWT + EF Core).
- `src/Services/World/` World API (entidades y canon).
- `src/Services/AI/` AI text generation (FastAPI).
- `src/Gateway/` API Gateway (YARP).
- `fly/` configs para Fly.io por servicio.

### Setup local rapido

Requisitos:

- Node.js 18+ (frontend)
- .NET 8 SDK (auth/world/gateway)
- Python 3.11+ (ai)
- Postgres (local o remoto)

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Auth API:

```bash
dotnet run --project src/Services/Auth/Lorekeeper.Auth.Api/Lorekeeper.Auth.Api.csproj
```

World API:

```bash
dotnet run --project src/Services/World/Lorekeeper.World.Api/Lorekeeper.World.Api.csproj
```

Gateway:

```bash
dotnet run --project src/Gateway/Lorekeeper.Gateway/Lorekeeper.Gateway.csproj
```

AI Service:

```bash
cd src/Services/AI
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8080
```

### Variables de entorno

- `DATABASE_URL` (Auth/World). Se setea automaticamente con `fly postgres attach`.
- `Jwt__Secret` (Auth). En prod, setear como secreto de Fly.
- `GROQ_API_KEY` (AI). Necesario para generar texto.
- `CORS_ORIGINS` (Gateway). Origen permitido del frontend.
- `VITE_API_BASE` (Frontend). URL del gateway.
- `VITE_MAINTENANCE_MODE` (Frontend). `true|false`.

### No duplicados en generacion

La UI envia `avoid_names` al AI Service y filtra duplicados por nombre. Si el modelo repite, se hace un reintento corto con nombres ya existentes.

### Deploy en Fly.io

Configuraciones en `fly/*.toml`, con Dockerfiles por servicio:

- `src/Services/Auth/Dockerfile`
- `src/Services/World/Dockerfile`
- `src/Services/AI/Dockerfile`
- `Dockerfile` (Gateway)
- `frontend/Dockerfile`

Orden recomendado:

```bash
fly deploy -c fly/auth.toml
fly deploy -c fly/world.toml
fly deploy -c fly/ai.toml
fly deploy -c fly/gateway.toml
fly deploy -c fly/web.toml
```

### Mantenimiento

El frontend soporta modo mantenimiento por `VITE_MAINTENANCE_MODE`.

### Asset y atribucion

El fondo de biblioteca usa un asset de Freepik con atribucion requerida (si es licencia free):

"Designed by macrovector_official / Freepik"

Si usas licencia premium, puedes remover la atribucion del footer.
