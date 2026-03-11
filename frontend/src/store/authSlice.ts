import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
    userId: string;
    email: string;
    fullName: string;
    role: string;
}

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
}

function parseJwtPayload(token: string): Record<string, string> | null {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

function loadAuthFromStorage(): AuthState {
    const token = localStorage.getItem("token");
    if (!token) return { isAuthenticated: false, user: null, token: null };

    const payload = parseJwtPayload(token);
    if (!payload) {
        localStorage.removeItem("token");
        return { isAuthenticated: false, user: null, token: null };
    }

    // Check expiration
    const exp = Number(payload.exp);
    if (exp && Date.now() / 1000 > exp) {
        localStorage.removeItem("token");
        return { isAuthenticated: false, user: null, token: null };
    }

    // .NET JWT claims can use short names (nameid, email, unique_name, role)
    // or long URIs depending on the JwtSecurityTokenHandler config.
    // We check both to be safe.
    const user: User = {
        userId:
            payload["nameid"] ??
            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
            payload["sub"] ??
            "",
        email:
            payload["email"] ??
            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ??
            "",
        fullName:
            payload["unique_name"] ??
            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ??
            "",
        role:
            payload["role"] ??
            payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
            "",
    };

    // If we couldn't extract a userId, the token is useless
    if (!user.userId) {
        localStorage.removeItem("token");
        return { isAuthenticated: false, user: null, token: null };
    }

    return { isAuthenticated: true, user, token };
}

const initialState: AuthState = loadAuthFromStorage();

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action: PayloadAction<{ user: User; token: string | null }>) => {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            localStorage.removeItem("token");
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
