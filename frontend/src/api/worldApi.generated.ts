export interface WorldDto {
    id: string;
    name: string;
    description: string;
    image: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
}

export interface CharacterDto {
    id: string;
    name: string;
    description: string;
    image: string;
    title: string;
    race: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    worldId: string;
    worldName: string;
}

export interface LocationDto {
    id: string;
    name: string;
    description: string;
    image: string;
    createdAt: string;
    worldId: string;
    worldName: string;
}

export interface FactionDto {
    id: string;
    name: string;
    description: string;
    image: string;
    createdAt: string;
    updatedAt: string;
    worldId: string;
    worldName: string;
}
