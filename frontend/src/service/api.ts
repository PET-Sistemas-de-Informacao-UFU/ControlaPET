import axios from "axios"
import { readToken } from "./authStorage"

export const BASE_URL = import.meta.env.VITE_API_URL

export const api = axios.create({
    baseURL: BASE_URL
})

api.interceptors.request.use((config) => {
    const token = readToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
})
