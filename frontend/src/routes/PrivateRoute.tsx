import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export function PrivateRoute() {
    const { authenticated, loading } = useContext(AuthContext);

    if(loading) return null;

    return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
