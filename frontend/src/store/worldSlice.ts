import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WorldDto } from "../api/worldApi.generated";

interface WorldState {
    worlds: WorldDto[];
    selectedWorld: WorldDto | null;
}

const initialState: WorldState = {
    worlds: [],
    selectedWorld: null,
};

const worldSlice = createSlice({
    name: "world",
    initialState,
    reducers: {
        setWorlds: (state, action: PayloadAction<WorldDto[]>) => {
            state.worlds = action.payload;
        },
        addWorld: (state, action: PayloadAction<WorldDto>) => {
            state.worlds.push(action.payload);
        },
        setSelectedWorld: (state, action: PayloadAction<WorldDto | null>) => {
            state.selectedWorld = action.payload;
        },
        deleteWorld: (state, action: PayloadAction<string>) => {
            state.worlds = state.worlds.filter((w) => w.id !== action.payload);
        },
    },
});

export const { setWorlds, addWorld, setSelectedWorld, deleteWorld } = worldSlice.actions;
export default worldSlice.reducer;
