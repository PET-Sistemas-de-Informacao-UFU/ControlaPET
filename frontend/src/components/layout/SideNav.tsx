import { useContext, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../service/api";
import { AuditIcon, CatalogIcon, LoanIcon } from "../ui/Icons";
import Modal from "../ui/Modal";

const DESTINATIONS = [
    { path: "/catalogo", label: "Catálogo", Icon: CatalogIcon },
    { path: "/movimentacoes", label: "Movimentações", Icon: LoanIcon },
    { path: "/auditoria", label: "Auditoria", Icon: AuditIcon }
];

function getInitials(name?: string) {
    const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];

    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function SideNav() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { user, handleLogout } = useContext(AuthContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [changingPassword, setChangingPassword] = useState(false);

    function openPasswordModal() {
        setMenuOpen(false);
        setPasswordError(null);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmation("");
        setPasswordModalOpen(true);
    }

    async function submitPassword(event: FormEvent) {
        event.preventDefault();
        setPasswordError(null);

        if (newPassword.length < 6) {
            setPasswordError("A nova senha deve ter no mínimo 6 caracteres.");
            return;
        }

        if (newPassword !== confirmation) {
            setPasswordError("A confirmação da nova senha não confere.");
            return;
        }

        setChangingPassword(true);

        try {
            await api.patch("/users/me/password", { currentPassword, newPassword });
            handleLogout();
            navigate("/login", { replace: true });
        } catch (error: unknown) {
            const message = typeof error === "object" && error !== null && "response" in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            setPasswordError(message ?? "Não foi possível alterar a senha.");
        } finally {
            setChangingPassword(false);
        }
    }

    function logout() {
        handleLogout();
        navigate("/login", { replace: true });
    }

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

            <div className="side-nav-account">
                {menuOpen && (
                    <div className="account-menu" role="menu">
                        <button type="button" role="menuitem" onClick={openPasswordModal}>Redefinir senha</button>
                        <button type="button" className="account-menu-logout" role="menuitem" onClick={logout}>Sair da conta</button>
                    </div>
                )}
                <button
                    type="button"
                    className="side-nav-user"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <span className="side-nav-user-avatar" aria-hidden="true">{getInitials(user?.nome)}</span>
                    {user?.nome ?? "Usuário"}
                </button>
            </div>

            <Modal
                open={passwordModalOpen}
                title="Redefinir senha"
                subtitle="Informe sua senha atual e escolha uma nova senha."
                closeLabel="Fechar"
                onClose={() => !changingPassword && setPasswordModalOpen(false)}
                actions={
                    <button type="submit" form="change-password-form" className="modal-btn primary" disabled={changingPassword}>
                        {changingPassword ? "Redefinindo..." : "Redefinir senha"}
                    </button>
                }
            >
                <form id="change-password-form" className="password-form" onSubmit={submitPassword}>
                    <div className="form-group">
                        <label htmlFor="current-password">Senha atual</label>
                        <input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="new-password">Nova senha</label>
                        <input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password-confirmation">Confirmar nova senha</label>
                        <input id="password-confirmation" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
                    </div>
                    {passwordError && <p className="password-form-error">{passwordError}</p>}
                </form>
            </Modal>
        </nav>
    );
}
