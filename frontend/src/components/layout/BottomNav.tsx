import { useLocation, useNavigate } from "react-router-dom";
import { AuditIcon, CatalogIcon, ScanIcon } from "../ui/Icons";

export default function BottomNav() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    return (
        <div className="bottom-nav">
            <div
                className={pathname === "/catalogo" ? "nav-item active" : "nav-item"}
                onClick={() => navigate("/catalogo")}
            >
                <CatalogIcon />
                <span>Catálogo</span>
            </div>

            <div className="nav-scan" onClick={() => navigate("/")}>
                <ScanIcon />
            </div>

            <div
                className={pathname === "/auditoria" ? "nav-item active" : "nav-item"}
                onClick={() => navigate("/auditoria")}
            >
                <AuditIcon />
                <span>Auditoria</span>
            </div>
        </div>
    );
}
