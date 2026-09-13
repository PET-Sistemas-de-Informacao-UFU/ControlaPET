import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export function PublicRoute() {
    const { authenticated, loading } = useContext(AuthContext);

    if (loading) return null;

    return authenticated ? <Navigate to="/" replace /> : <Outlet />;
}
