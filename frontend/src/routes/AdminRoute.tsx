import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export function AdminRoute() {
    const { user } = useContext(AuthContext);

    return user?.role === "ADMIN" ? <Outlet /> : <Navigate to="/catalogo" replace />;
}
