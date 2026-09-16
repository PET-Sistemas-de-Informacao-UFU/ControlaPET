import { useNavigate } from "react-router-dom";
import AccountMenu from "./AccountMenu";

interface AppHeaderProps {
    title: string;
}

export default function AppHeader({ title }: AppHeaderProps) {
    const navigate = useNavigate();

    return (
        <div className="app-header">
            <button type="button" className="icon-btn" aria-label="Ir para o catálogo" onClick={() => navigate("/catalogo")}>
                <img src="/logoPET.png" alt="Logo do PET-SI" className="LogoPET" />
            </button>

            <h1>{title}</h1>

            <AccountMenu variant="header" />
        </div>
    );
}
