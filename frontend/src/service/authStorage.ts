const TOKEN_KEY = "@Auth:token";
const REFRESH_TOKEN_KEY = "@Auth:refreshToken";

function read(key: string): string | null {
    const raw = localStorage.getItem(key);

    if (!raw || raw === "undefined") return null;

    try {
        return JSON.parse(raw) as string;
    } catch {
        return null;
    }
}

export function readToken(): string | null {
    return read(TOKEN_KEY);
}

export function readRefreshToken(): string | null {
    return read(REFRESH_TOKEN_KEY);
}

export function storeTokens(token: string, refreshToken: string) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
    localStorage.setItem(REFRESH_TOKEN_KEY, JSON.stringify(refreshToken));
}

export function clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}
