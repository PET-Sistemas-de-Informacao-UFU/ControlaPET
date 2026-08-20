import { Navigate } from "react-router-dom";
import Scanner from "../pages/Scanner/Index";
import { useIsDesktop } from "../hooks/useIsDesktop";

export default function HomeRoute() {
    const isDesktop = useIsDesktop();

    return isDesktop ? <Navigate to="/catalogo" replace /> : <Scanner />;
}
