import api from "./api";

export const generateCharacters = async (
    worldName: string,
    worldDescription: string,
    numCharacters: number,
    seed?: string,
    style?: string,
    language?: string,
    avoidNames?: string[],
) => {
    const response = await api.post("/ai/generate/characters", {
        world_name: worldName,
        world_description: worldDescription,
        num_characters: numCharacters,
        seed: seed?.trim() || null,
        style: style?.trim() || null,
        language: language?.trim() || null,
        avoid_names: avoidNames && avoidNames.length ? avoidNames : null,
    });
    return response.data;
};

export const generateLocations = async (
    worldName: string,
    worldDescription: string,
    numLocations: number,
    seed?: string,
    style?: string,
    language?: string,
    avoidNames?: string[],
) => {
    const response = await api.post("/ai/generate/locations", {
        world_name: worldName,
        world_description: worldDescription,
        num_locations: numLocations,
        seed: seed?.trim() || null,
        style: style?.trim() || null,
        language: language?.trim() || null,
        avoid_names: avoidNames && avoidNames.length ? avoidNames : null,
    });
    return response.data;
};

export const generateFactions = async (
    worldName: string,
    worldDescription: string,
    numFactions: number,
    seed?: string,
    style?: string,
    language?: string,
    avoidNames?: string[],
) => {
    const response = await api.post("/ai/generate/factions", {
        world_name: worldName,
        world_description: worldDescription,
        num_factions: numFactions,
        seed: seed?.trim() || null,
        style: style?.trim() || null,
        language: language?.trim() || null,
        avoid_names: avoidNames && avoidNames.length ? avoidNames : null,
    });
    return response.data;
};

export const generateLore = async (
    worldName: string,
    worldDescription: string,
    topic: string,
    seed?: string,
    style?: string,
    language?: string,
) => {
    const response = await api.post("/ai/generate/lore", {
        world_name: worldName,
        world_description: worldDescription,
        topic,
        seed: seed?.trim() || null,
        style: style?.trim() || null,
        language: language?.trim() || null,
    });
    return response.data;
};
