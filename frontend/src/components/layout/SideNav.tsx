import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { AuditIcon, CatalogIcon } from "../ui/Icons";

const DESTINATIONS = [
    { path: "/catalogo", label: "Catálogo", Icon: CatalogIcon },
    { path: "/auditoria", label: "Auditoria", Icon: AuditIcon }
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
                {DESTINATIONS.map(({ path, label, Icon }) => (
                    <div
                        key={path}
                        className={pathname === path ? "side-nav-item active" : "side-nav-item"}
                        onClick={() => navigate(path)}
                    >
                        <Icon />
                        <span>{label}</span>
                    </div>
                ))}
            </div>

            <div className="side-nav-user">{user?.nome ?? "PET Sistemas de Informação"}</div>
        </nav>
    );
}
