from fastapi import FastAPI
from models.schemas import (
    GenerateCharacterRequest,
    GenerateCharacterResponse,
    GenerateLoreRequest,
    GenerateLoreResponse,
    GenerateLocationRequest,
    GenerateLocationResponse,
    GenerateFactionRequest,
    GenerateFactionResponse,
)
from services.ai_service import (
    generate_characters,
    generate_lore,
    generate_locations,
    generate_factions,
)
app = FastAPI(title="Lorekeeper AI Service", version="1.0.0")
@app.get("/health")
def health():
    return {"status": "ok"}
@app.post("/generate/characters", response_model=list[GenerateCharacterResponse])
def generate_characters_endpoint(
    request: GenerateCharacterRequest,
):
    characters = generate_characters(
        request.world_name,
        request.world_description,
        request.num_characters,
        request.seed,
        request.style,
        request.avoid_names,
        language=request.language,
    )
    return characters

@app.post("/generate/locations", response_model=list[GenerateLocationResponse])
def generate_locations_endpoint(
    request: GenerateLocationRequest,
):
    locations = generate_locations(
        request.world_name,
        request.world_description,
        request.num_locations,
        request.seed,
        request.style,
        request.avoid_names,
        language=request.language,
    )
    return locations

@app.post("/generate/factions", response_model=list[GenerateFactionResponse])
def generate_factions_endpoint(
    request: GenerateFactionRequest,
):
    factions = generate_factions(
        request.world_name,
        request.world_description,
        request.num_factions,
        request.seed,
        request.style,
        request.avoid_names,
        language=request.language,
    )
    return factions
@app.post("/generate/lore", response_model=GenerateLoreResponse)
def generate_lore_endpoint(
    request: GenerateLoreRequest,
):
    content = generate_lore(
        request.world_name,
        request.world_description,
        request.topic,
        request.seed,
        request.style,
        language=request.language,
    )
    return GenerateLoreResponse(content=content)
