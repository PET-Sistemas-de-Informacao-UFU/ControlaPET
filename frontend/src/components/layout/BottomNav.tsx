import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { AuditIcon, CatalogIcon, LoanIcon, UsersIcon } from "../ui/Icons";

export default function BottomNav() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { user } = useContext(AuthContext);

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

            {user?.role === "ADMIN" && (
                <div
                    className={pathname === "/usuarios" ? "nav-item active" : "nav-item"}
                    onClick={() => navigate("/usuarios")}
                >
                    <UsersIcon />
                    <span>Usuários</span>
                </div>
            )}
        </div>
    );
}
