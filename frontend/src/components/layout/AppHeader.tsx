import { HomeIcon } from "../ui/Icons";

interface AppHeaderProps {
    title: string;
}

export default function AppHeader({ title }: AppHeaderProps) {
    return (
        <div className="app-header">
            <div className="icon-btn" title="Início">
                <HomeIcon />
            </div>

            <h1>{title}</h1>

            <div className="icon-btn" title="Perfil">
                <img src="/logoPET.png" alt="Logo do PET-SI" className="LogoPET" />
            </div>
        </div>
    );
}
