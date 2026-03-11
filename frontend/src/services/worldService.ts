import api from "./api";

export const getWorldsByUser = async (userId: string) => {
    const response = await api.get("/worlds", {
        params: { userId },
    });
    return response.data;
};

export const getWorldById = async (userId: string, worldId: string) => {
    const worlds = await getWorldsByUser(userId);
    return worlds.find((w: { id: string }) => w.id === worldId) ?? null;
};

export const createWorld = async (name: string, description: string, image: string, userId: string) => {
    const response = await api.post("/worlds", {
        name,
        description,
        image,
        userId,
    });
    return response.data;
};

export const deleteWorld = async (id: string) => {
    await api.delete(`/worlds/${id}`);
};
