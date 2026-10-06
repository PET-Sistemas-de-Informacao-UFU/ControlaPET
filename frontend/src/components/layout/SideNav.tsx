import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { AuditIcon, CatalogIcon, LoanIcon, UsersIcon } from "../ui/Icons";
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
                    { path: "/auditoria", label: "Auditoria", Icon: AuditIcon },
                    { path: "/usuarios", label: "Usuários", Icon: UsersIcon }
                ] : [])].map(({ path, label, Icon }) => (
                    <div key={path} className={pathname === path ? "side-nav-item active" : "side-nav-item"} onClick={() => navigate(path)}>
                        <Icon />
                        <span>{label}</span>
                    </div>
                ))}
            </div>

            <div className="side-nav-account"><AccountMenu variant="sidebar" /></div>
        </nav>
    );
}
