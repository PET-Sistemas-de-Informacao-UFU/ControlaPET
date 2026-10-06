import axios from "axios"

const configuredApiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const configuredUrl = new URL(configuredApiUrl);

// Em testes pela rede local, "localhost" apontaria para o dispositivo que abriu o site.
// Nesse caso, usa o mesmo host que serviu o frontend e preserva a porta/caminho da API.
export const BASE_URL = configuredUrl.hostname === "localhost"
    ? `${window.location.protocol}//${window.location.hostname}:${configuredUrl.port}${configuredUrl.pathname}`
    : configuredApiUrl;

export const api = axios.create({
    baseURL: BASE_URL
})
