import { useLocation, useNavigate } from "react-router-dom";
import { AuditIcon, CatalogIcon, LoanIcon } from "../ui/Icons";

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

            <div
                className={pathname === "/movimentacoes" ? "nav-item active" : "nav-item"}
                onClick={() => navigate("/movimentacoes")}
            >
                <LoanIcon />
                <span>Movimentações</span>
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
