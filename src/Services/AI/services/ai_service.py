from dotenv import load_dotenv
import json
import os
import re
import traceback

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))


def _parse_json(content: str, fallback: list[dict]):
    try:
        data = json.loads(content)
        return data if isinstance(data, list) else fallback
    except json.JSONDecodeError:
        return fallback


def _extract_json_array(content: str) -> str | None:
    if not content:
        return None

    text = content.strip()
    if text.startswith("[") and text.endswith("]"):
        return text

    match = re.search(r"\[[\s\S]*\]", text)
    if match:
        return match.group(0)
    return None

def _tone_phrase(style: str | None) -> str:
    if not style:
        return "cinematic"
    key = style.strip().lower()
    mapping = {
        "cinematic": "cinematic",
        "illustration": "mythic, lyrical",
        "anime": "energetic, character-driven",
        "noir": "noir, hardboiled",
        "watercolor": "dreamlike, gentle",
        "concept": "worldbuilding-focused, descriptive",
        "sci-fi": "grounded sci-fi",
    }
    return mapping.get(key, style)


def _is_english(language: str | None) -> bool:
    lang = (language or "").strip().lower()
    return lang.startswith("en") or lang in {"english", "ingles", "inglés"}


def _language_instruction(language: str | None) -> str:
    if _is_english(language):
        return (
            "Output must be English. JSON field names must remain exactly as specified. "
            "Use 'Alive'/'Dead' for status. Do not include any other languages."
        )
    return (
        "Output must be Spanish. JSON field names must remain exactly as specified in English; "
        "only the values must be Spanish. Use 'Vivo'/'Muerto' for status. Do not include English words."
    )


def _distinct_instruction(language: str | None) -> str:
    if _is_english(language):
        return "All entries must be distinct; do not reuse names, roles, or descriptions."
    return "Todos deben ser distintos entre si; no repitas nombres, roles ni descripciones."


def _format_avoid_names(avoid_names: list[str] | None) -> list[str]:
    if not avoid_names:
        return []
    cleaned: list[str] = []
    seen: set[str] = set()
    for name in avoid_names:
        value = str(name).strip()
        if not value:
            continue
        key = re.sub(r"\s+", " ", value.lower()).strip()
        if not key or key in seen:
            continue
        seen.add(key)
        cleaned.append(value)
        if len(cleaned) >= 25:
            break
    return cleaned


def _avoid_instruction(avoid_names: list[str] | None, language: str | None) -> str:
    names = _format_avoid_names(avoid_names)
    if not names:
        return ""
    joined = "; ".join(names)
    if _is_english(language):
        return f"Avoid repeating or reusing any of these existing names: {joined}."
    return f"No repitas ni reutilices ninguno de estos nombres existentes: {joined}."


def _normalize_status(value: str | None, language: str | None) -> str | None:
    if not value:
        return value
    raw = value.strip().lower()

    if _is_english(language):
        if raw in {"vivo", "alive", "living"}:
            return "Alive"
        if raw in {"muerto", "dead", "deceased"}:
            return "Dead"
        return value

    if raw in {"alive", "living", "vivo"}:
        return "Vivo"
    if raw in {"dead", "deceased", "muerto"}:
        return "Muerto"
    return value


def _fallback_character(language: str | None) -> dict:
    if _is_english(language):
        return {"name": "Error", "title": "", "race": "", "description": "AI generation failed", "status": "Alive"}
    return {"name": "Error", "title": "", "race": "", "description": "Fallo la generacion de IA", "status": "Vivo"}


def _fallback_location(language: str | None) -> dict:
    if _is_english(language):
        return {"name": "Error", "type": "", "description": "AI generation failed"}
    return {"name": "Error", "type": "", "description": "Fallo la generacion de IA"}


def _fallback_faction(language: str | None) -> dict:
    if _is_english(language):
        return {"name": "Error", "alignment": "", "description": "AI generation failed"}
    return {"name": "Error", "alignment": "", "description": "Fallo la generacion de IA"}


def _fallback_lore(language: str | None) -> str:
    return "AI generation failed." if _is_english(language) else "Fallo la generacion de IA."


def _groq_text(prompt: str, *, api_key: str | None = None) -> str:
    try:
        key = (api_key or os.getenv("GROQ_API_KEY") or "").strip()
        if not key:
            print("GROQ_API_KEY missing")
            return ""

        try:
            from groq import Groq  # type: ignore
        except Exception:
            return ""

        client = Groq(api_key=key)

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
        )
        return response.choices[0].message.content or ""
    except Exception as exc:
        print(f"Groq error: {type(exc).__name__}: {exc}")
        traceback.print_exc()
        return ""

def _pick(item: dict, keys: list[str]) -> dict:
    return {k: item.get(k) for k in keys}


def generate_characters(
    world_name: str,
    world_description: str,
    num_characters: int,
    seed: str | None = None,
    style: str | None = None,
    avoid_names: list[str] | None = None,
    *,
    groq_api_key: str | None = None,
    language: str | None = None,
):
    seed = seed or world_name
    avoid_line = _avoid_instruction(avoid_names, language)
    distinct_line = _distinct_instruction(language)
    has_avoid = bool(_format_avoid_names(avoid_names))
    seed_person_line = ""
    if not has_avoid:
        seed_person_line = (
            "If the seed looks like a specific character or show, make the FIRST character that exact person "
            "and build the rest as close associates."
            if _is_english(language)
            else "Si la semilla parece un personaje o serie concreta, el PRIMER personaje debe ser esa persona exacta y el resto cercanos."
        )
    if _is_english(language):
        seed_line = f"Base story seed: {seed}" if seed else "Base story seed: None"
        tone_line = f"Tone: {_tone_phrase(style)}"
        language_line = _language_instruction(language)
        prompt = f"""You are a creative writer. Generate {num_characters} unique characters for a fictional world.
World: {world_name}
Description: {world_description}
{seed_line}
{tone_line}
{avoid_line}
{distinct_line}
{language_line}
If a base story seed is provided, it is canonical and overrides conflicting details in the world description.
All characters MUST be consistent with the seed.
{seed_person_line}
Return ONLY a JSON array with this exact format, no extra text:
[
    {{
        "name": "character name",
        "title": "character title or role",
        "race": "character race",
        "description": "brief character description",
        "status": "Alive or Dead",
        "appearance": "physical traits (age, gender, ethnicity), hair, clothing, props"
    }}
]"""
    else:
        seed_line = f"Semilla base de historia: {seed}" if seed else "Semilla base de historia: Ninguna"
        tone_line = f"Tono: {_tone_phrase(style)}"
        language_line = _language_instruction(language)
        prompt = f"""Eres un escritor creativo. Genera {num_characters} personajes unicos para un mundo ficticio.
Mundo: {world_name}
Descripcion: {world_description}
{seed_line}
{tone_line}
{avoid_line}
{distinct_line}
{language_line}
Si se proporciona una semilla base, es canonica y prevalece sobre la descripcion.
Todos los personajes DEBEN ser consistentes con la semilla.
{seed_person_line}
Devuelve SOLO un array JSON con este formato exacto (las claves deben permanecer en ingles):
[
    {{
        "name": "nombre del personaje",
        "title": "titulo o rol",
        "race": "raza del personaje",
        "description": "descripcion breve",
        "status": "Vivo o Muerto",
        "appearance": "rasgos fisicos (edad, genero, etnia), cabello, ropa, props"
    }}
]"""

    fallback = [_fallback_character(language)]
    content = _groq_text(prompt, api_key=groq_api_key)
    raw = _extract_json_array(content) if content else None
    items = _parse_json(raw, fallback) if raw else fallback
    items = items[:max(1, num_characters)]

    cleaned = []
    for item in items:
        if isinstance(item, dict):
            entry = _pick(item, ["name", "title", "race", "description", "status", "appearance"])
            entry["status"] = _normalize_status(entry.get("status"), language)
            cleaned.append(entry)
    return cleaned or fallback


def generate_locations(
    world_name: str,
    world_description: str,
    num_locations: int,
    seed: str | None = None,
    style: str | None = None,
    avoid_names: list[str] | None = None,
    *,
    groq_api_key: str | None = None,
    language: str | None = None,
):
    seed = seed or world_name
    avoid_line = _avoid_instruction(avoid_names, language)
    distinct_line = _distinct_instruction(language)
    if _is_english(language):
        seed_line = f"Base story seed: {seed}" if seed else "Base story seed: None"
        tone_line = f"Tone: {_tone_phrase(style)}"
        language_line = _language_instruction(language)
        prompt = f"""You are a creative writer. Generate {num_locations} distinct locations for a fictional world.
World: {world_name}
Description: {world_description}
{seed_line}
{tone_line}
{avoid_line}
{distinct_line}
{language_line}
If a base story seed is provided, it is canonical and overrides conflicting details in the world description.
The locations MUST be consistent with it.
Return ONLY a JSON array with this exact format, no extra text:
[
    {{
        "name": "location name",
        "type": "city, forest, fortress, temple, etc",
        "description": "brief location description"
    }}
]"""
    else:
        seed_line = f"Semilla base de historia: {seed}" if seed else "Semilla base de historia: Ninguna"
        tone_line = f"Tono: {_tone_phrase(style)}"
        language_line = _language_instruction(language)
        prompt = f"""Eres un escritor creativo. Genera {num_locations} lugares distintos para un mundo ficticio.
Mundo: {world_name}
Descripcion: {world_description}
{seed_line}
{tone_line}
{avoid_line}
{distinct_line}
{language_line}
Si se proporciona una semilla base, es canonica y prevalece sobre la descripcion.
Los lugares DEBEN ser consistentes con la semilla.
Devuelve SOLO un array JSON con este formato exacto (las claves deben permanecer en ingles):
[
    {{
        "name": "nombre del lugar",
        "type": "ciudad, bosque, fortaleza, templo, etc",
        "description": "descripcion breve"
    }}
]"""
    fallback = [_fallback_location(language)]
    content = _groq_text(prompt, api_key=groq_api_key)
    raw = _extract_json_array(content) if content else None
    items = _parse_json(raw, fallback) if raw else fallback
    items = items[:max(1, num_locations)]

    cleaned = []
    for item in items:
        if isinstance(item, dict):
            cleaned.append(_pick(item, ["name", "type", "description"]))
    return cleaned or fallback


def generate_factions(
    world_name: str,
    world_description: str,
    num_factions: int,
    seed: str | None = None,
    style: str | None = None,
    avoid_names: list[str] | None = None,
    *,
    groq_api_key: str | None = None,
    language: str | None = None,
):
    seed = seed or world_name
    avoid_line = _avoid_instruction(avoid_names, language)
    distinct_line = _distinct_instruction(language)
    if _is_english(language):
        seed_line = f"Base story seed: {seed}" if seed else "Base story seed: None"
        tone_line = f"Tone: {_tone_phrase(style)}"
        language_line = _language_instruction(language)
        prompt = f"""You are a creative writer. Generate {num_factions} factions for a fictional world.
World: {world_name}
Description: {world_description}
{seed_line}
{tone_line}
{avoid_line}
{distinct_line}
{language_line}
If a base story seed is provided, it is canonical and overrides conflicting details in the world description.
The factions MUST be consistent with it.
Return ONLY a JSON array with this exact format, no extra text:
[
    {{
        "name": "faction name",
        "alignment": "neutral, good, evil, etc",
        "description": "brief faction description"
    }}
]"""
    else:
        seed_line = f"Semilla base de historia: {seed}" if seed else "Semilla base de historia: Ninguna"
        tone_line = f"Tono: {_tone_phrase(style)}"
        language_line = _language_instruction(language)
        prompt = f"""Eres un escritor creativo. Genera {num_factions} facciones para un mundo ficticio.
Mundo: {world_name}
Descripcion: {world_description}
{seed_line}
{tone_line}
{avoid_line}
{distinct_line}
{language_line}
Si se proporciona una semilla base, es canonica y prevalece sobre la descripcion.
Las facciones DEBEN ser consistentes con la semilla.
Devuelve SOLO un array JSON con este formato exacto (las claves deben permanecer en ingles):
[
    {{
        "name": "nombre de la faccion",
        "alignment": "neutral, buena, malvada, etc",
        "description": "descripcion breve"
    }}
]"""
    fallback = [_fallback_faction(language)]
    content = _groq_text(prompt, api_key=groq_api_key)
    raw = _extract_json_array(content) if content else None
    items = _parse_json(raw, fallback) if raw else fallback
    items = items[:max(1, num_factions)]

    cleaned = []
    for item in items:
        if isinstance(item, dict):
            cleaned.append(_pick(item, ["name", "alignment", "description"]))
    return cleaned or fallback


def generate_lore(
    world_name: str,
    world_description: str,
    topic: str,
    seed: str | None = None,
    style: str | None = None,
    *,
    groq_api_key: str | None = None,
    language: str | None = None,
):
    seed = seed or world_name
    if _is_english(language):
        seed_line = f"Base story seed: {seed}" if seed else "Base story seed: None"
        tone_line = f"Tone: {_tone_phrase(style)}"
        language_line = _language_instruction(language)
        prompt = f"""You are a creative writer. Write a detailed {topic} for a fictional world.
World: {world_name}
Description: {world_description}
{seed_line}
{tone_line}
{language_line}
If a base story seed is provided, it is canonical and overrides conflicting details in the world description.
The lore MUST be consistent with it.
Write 2-3 paragraphs about the {topic} of this world. Be creative and detailed."""
    else:
        seed_line = f"Semilla base de historia: {seed}" if seed else "Semilla base de historia: Ninguna"
        tone_line = f"Tono: {_tone_phrase(style)}"
        language_line = _language_instruction(language)
        prompt = f"""Eres un escritor creativo. Escribe {topic} de este mundo ficticio.
Mundo: {world_name}
Descripcion: {world_description}
{seed_line}
{tone_line}
{language_line}
Si se proporciona una semilla base, es canonica y prevalece sobre la descripcion.
El lore DEBE ser consistente con la semilla.
Escribe 2-3 parrafos sobre {topic}. Se creativo y detallado."""
    content = _groq_text(prompt, api_key=groq_api_key)
    return content or _fallback_lore(language)


"""Text-only AI service."""
