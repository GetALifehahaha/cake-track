import { REFRESH_TOKEN } from "@/api/constants"
export const decodeToken = (token) => {
    if (!token) return null;

    try {
        const payload = token.split(".")[1];
        const decodedPayload = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decodedPayload);
    } catch {
        return null;
    }
}

export const isTokenExpired = (token, bufferSecond = 10) => {
    const payload = decodeToken(token);
    if (!payload?.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime + bufferSecond;
}

export const isSessionValid = () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);

    return !isTokenExpired(refreshToken, 0);
}

export const refreshTokenMinutesRemaining = () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);

    const payload = decodeToken(refreshToken);

    if (!payload?.exp) return 0;
    
    const secondsLeft = payload.exp - Math.floor(Date.now() / 1000);
    return Math.max(0, Math.floor(secondsLeft / 60));
}