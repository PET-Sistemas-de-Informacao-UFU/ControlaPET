import { Outlet, useLocation } from "react-router-dom";
import AppHeader from "./AppHeader";
import BottomNav from "./BottomNav";
import SideNav from "./SideNav";
import { useIsDesktop } from "../../hooks/useIsDesktop";

const TITLES: Record<string, string> = {
    "/catalogo": "Catálogo",
    "/emprestimos": "Meus Empréstimos",
    "/auditoria": "Auditoria"
};

export default function AppLayout() {
    const { pathname } = useLocation();
    const isDesktop = useIsDesktop();

    return (
        <div className="app-shell">
            {isDesktop && <SideNav />}

            <div className="app-main">
                <AppHeader title={TITLES[pathname] ?? "ControlaPET"} />

                <div className="content">
                    <Outlet />
                </div>
            </div>

            {!isDesktop && <BottomNav />}
        </div>
    );
}
