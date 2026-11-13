let accessToken: string | null = null;

// Remove tokens gravados por versões anteriores.
localStorage.removeItem("@Auth:token");
localStorage.removeItem("@Auth:refreshToken");

export function readToken(): string | null {
    return accessToken;
}

export function storeToken(token: string) {
    accessToken = token;
}

export function clearTokens() {
    accessToken = null;
}
