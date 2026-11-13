import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { AuditIcon, CatalogIcon, DefectIcon, LoanIcon, UsersIcon } from "../ui/Icons";
import DefectReportBadge from "./DefectReportBadge";
import AccountMenu from "./AccountMenu";

const MEMBER_DESTINATIONS = [
    { path: "/catalogo", label: "Catálogo", Icon: CatalogIcon },
    { path: "/movimentacoes", label: "Movimentações", Icon: LoanIcon }
];

export default function SideNav() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { user } = useContext(AuthContext);

    return (
        <nav className="side-nav">
            <div className="side-nav-brand">
                <img src="/logoPET.png" alt="Logo do PET-SI" />
                <span>ControlaPET</span>
            </div>

            <div className="side-nav-items">
                {[...MEMBER_DESTINATIONS, ...(user?.role === "ADMIN" ? [
                    { path: "/defeitos", label: "Defeitos", Icon: DefectIcon },
                    { path: "/auditoria", label: "Auditoria", Icon: AuditIcon },
                    { path: "/usuarios", label: "Usuários", Icon: UsersIcon }
                ] : [])].map(({ path, label, Icon }) => (
                    <button type="button" key={path} className={pathname === path ? "side-nav-item active" : "side-nav-item"} aria-current={pathname === path ? "page" : undefined} onClick={() => navigate(path)}>
                        <Icon />
                        <span>{label}</span>
                        {path === "/defeitos" && <DefectReportBadge />}
                    </button>
                ))}
            </div>

            <div className="side-nav-account"><AccountMenu variant="sidebar" /></div>
        </nav>
    );
}
