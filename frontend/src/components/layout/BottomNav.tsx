import DefectReportBadge from "./DefectReportBadge";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { AuditIcon, CatalogIcon, DefectIcon, LoanIcon, UsersIcon } from "../ui/Icons";

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

            {user?.role === "ADMIN" && (
                <>
                    <button type="button" className={pathname === "/defeitos" ? "nav-item active" : "nav-item"} aria-current={pathname === "/defeitos" ? "page" : undefined} onClick={() => navigate("/defeitos")}>
                        <span className="defect-nav-icon"><DefectIcon /><DefectReportBadge /></span>
                        <span>Defeitos</span>
                    </button>
                    <div
                        className={pathname === "/auditoria" ? "nav-item active" : "nav-item"}
                        onClick={() => navigate("/auditoria")}
                    >
                        <AuditIcon />
                        <span>Auditoria</span>
                    </div>

                    <div
                        className={pathname === "/usuarios" ? "nav-item active" : "nav-item"}
                        onClick={() => navigate("/usuarios")}
                    >
                        <UsersIcon />
                        <span>Usuários</span>
                    </div>
                </>
            )}
        </div>
    );
}
