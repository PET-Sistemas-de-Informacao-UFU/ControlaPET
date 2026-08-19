import { Outlet, useLocation } from "react-router-dom";
import StatusBar from "./StatusBar";
import AppHeader from "./AppHeader";
import BottomNav from "./BottomNav";

const TITLES: Record<string, string> = {
    "/": "Ler",
    "/catalogo": "Catálogo",
    "/auditoria": "Auditoria"
};

export default function AppLayout() {
    const { pathname } = useLocation();

    return (
        <div className="phone">
            <StatusBar />

            <AppHeader title={TITLES[pathname] ?? "ControlaPET"} />

            <div className="content">
                <Outlet />
            </div>

            <BottomNav />
        </div>
    );
}
