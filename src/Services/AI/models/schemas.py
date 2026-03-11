from pydantic import BaseModel
class GenerateCharacterRequest(BaseModel):
    world_name: str
    world_description: str
    num_characters: int = 3
    seed: str | None = None
    style: str | None = None
    language: str | None = None
    avoid_names: list[str] | None = None
class GenerateCharacterResponse(BaseModel):
    name: str
    title: str
    race: str
    description: str
    status: str
    appearance: str | None = None
class GenerateLoreRequest(BaseModel):
    world_name: str
    world_description: str
    topic: str
    seed: str | None = None
    style: str | None = None
    language: str | None = None
class GenerateLoreResponse(BaseModel):
    content: str

class GenerateLocationRequest(BaseModel):
    world_name: str
    world_description: str
    num_locations: int = 3
    seed: str | None = None
    style: str | None = None
    language: str | None = None
    avoid_names: list[str] | None = None

class GenerateLocationResponse(BaseModel):
    name: str
    description: str
    type: str | None = None

class GenerateFactionRequest(BaseModel):
    world_name: str
    world_description: str
    num_factions: int = 3
    seed: str | None = None
    style: str | None = None
    language: str | None = None
    avoid_names: list[str] | None = None

class GenerateFactionResponse(BaseModel):
    name: str
    description: str
    alignment: str | None = None
