import { useContext, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useChangeUserRole, useChangeUserStatus, useCreateUser, useResetUserPassword, useUpdateUser, useUsers } from "../../hooks/useUser";
import type { CreateUserRequest, User, UserRole } from "../../interfaces/User";
import Modal from "../../components/ui/Modal";
import FormSelect from "../../components/ui/FormSelect";

const ROLES = [
    { value: "MEMBER", label: "Membro" },
    { value: "ADMIN", label: "Administrador" }
];

const ROLE_LABEL: Record<UserRole, string> = {
    ADMIN: "Administrador",
    MEMBER: "Membro"
};

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : (parts[0]?.[0] ?? "?").toUpperCase();
}

export default function Usuarios() {
    const { user: currentUser } = useContext(AuthContext);
    const isAdmin = currentUser?.role === "ADMIN";
    const { data: users = [], isLoading, isError } = useUsers(isAdmin);
    const createUser = useCreateUser();
    const changeUserRole = useChangeUserRole();
    const changeUserStatus = useChangeUserStatus();
    const updateUser = useUpdateUser();
    const resetUserPassword = useResetUserPassword();
    const [modalOpen, setModalOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<UserRole>("MEMBER");
    const [error, setError] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editingName, setEditingName] = useState("");
    const [editingEmail, setEditingEmail] = useState("");
    const [editingPassword, setEditingPassword] = useState("");
    const [editingRole, setEditingRole] = useState<UserRole>("MEMBER");
    const [editError, setEditError] = useState<string | null>(null);

    if (!isAdmin) return <Navigate to="/catalogo" replace />;

    function openCreateModal() {
        setName("");
        setEmail("");
        setPassword("");
        setRole("MEMBER");
        setError(null);
        setModalOpen(true);
    }

    function submit(event: FormEvent) {
        event.preventDefault();
        setError(null);

        const data: CreateUserRequest = { name: name.trim(), email: email.trim(), password, role };
        createUser.mutate(data, {
            onSuccess: () => setModalOpen(false),
            onError: (requestError) => {
                const message = isAxiosError<{ message?: string }>(requestError)
                    ? requestError.response?.data?.message
                    : undefined;
                setError(message ?? "Não foi possível criar a conta.");
            }
        });
    }

    function openEditModal(user: User) {
        setEditingUser(user);
        setEditingName(user.nome);
        setEditingEmail(user.email);
        setEditingPassword("");
        setEditingRole(user.role);
        setEditError(null);
    }

    async function submitEdit(event: FormEvent) {
        event.preventDefault();
        if (!editingUser) return;

        if (editingPassword && editingPassword.length < 6) {
            setEditError("A nova senha deve ter no mínimo 6 caracteres.");
            return;
        }

        setEditError(null);
        try {
            await updateUser.mutateAsync({
                userId: editingUser.id,
                data: { name: editingName.trim(), email: editingEmail.trim() }
            });
            if (editingRole !== editingUser.role) {
                await changeUserRole.mutateAsync({ userId: editingUser.id, role: editingRole });
            }
            if (editingPassword) {
                await resetUserPassword.mutateAsync({ userId: editingUser.id, newPassword: editingPassword });
            }
            setEditingUser(null);
        } catch (requestError) {
            const message = isAxiosError<{ message?: string }>(requestError)
                ? requestError.response?.data?.message
                : undefined;
            setEditError(message ?? "Não foi possível atualizar o usuário.");
        }
    }

    async function changeEditingUserStatus() {
        if (!editingUser) return;

        setEditError(null);
        try {
            await changeUserStatus.mutateAsync({ userId: editingUser.id, active: !editingUser.active });
            setEditingUser(null);
        } catch (requestError) {
            const message = isAxiosError<{ message?: string }>(requestError)
                ? requestError.response?.data?.message
                : undefined;
            setEditError(message ?? "Não foi possível alterar o status da conta.");
        }
    }

    return (
        <>
            <div className="users-toolbar">
                <div>
                    {!isLoading && !isError && <p className="users-count">{users.length} {users.length === 1 ? "usuário cadastrado" : "usuários cadastrados"}</p>}
                </div>
                <button type="button" className="header-btn" onClick={openCreateModal}>+ Novo usuário</button>
            </div>

            {isLoading && <p className="users-feedback">Carregando usuários...</p>}
            {isError && <p className="users-feedback">Não foi possível carregar os usuários.</p>}
            {!isLoading && !isError && (
                <div className="users-list">
                    {users.map((user) => (
                        <article className={user.active ? "user-card" : "user-card inactive"} key={user.id}>
                            <span className="user-card-avatar" aria-hidden="true">{getInitials(user.nome)}</span>
                            <div className="user-card-info">
                                <strong>{user.nome}</strong>
                                <span>{user.email}</span>
                            </div>
                            <span className={user.role === "ADMIN" ? "user-role admin" : "user-role"}>{ROLE_LABEL[user.role]}</span>
                            {user.id !== currentUser.id && <button type="button" className="user-edit-button" onClick={() => openEditModal(user)}>Editar</button>}
                        </article>
                    ))}
                </div>
            )}

            <Modal
                open={modalOpen}
                title="Novo usuário"
                subtitle="Crie uma conta para acessar o sistema."
                closeLabel="Fechar"
                onClose={() => !createUser.isPending && setModalOpen(false)}
                actions={<button type="submit" form="create-user-form" className="modal-btn primary" disabled={createUser.isPending}>{createUser.isPending ? "Criando..." : "Criar usuário"}</button>}
            >
                <form id="create-user-form" className="password-form" onSubmit={submit}>
                    <div className="form-group"><label htmlFor="user-name">Nome</label><input id="user-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={100} required /></div>
                    <div className="form-group"><label htmlFor="user-email">E-mail</label><input id="user-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></div>
                    <div className="form-group"><label htmlFor="user-password">Senha inicial</label><input id="user-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={6} required /></div>
                    <div className="form-group"><label htmlFor="user-role">Perfil</label><FormSelect id="user-role" value={role} placeholder="Selecione o perfil" options={ROLES} onChange={(value) => setRole(value as UserRole)} /></div>
                    {error && <p className="password-form-error">{error}</p>}
                </form>
            </Modal>

            <Modal
                open={editingUser !== null}
                title="Editar usuário"
                subtitle={editingUser ? `${editingUser.active ? "Conta ativa" : "Conta inativa"} · ${editingUser.email}` : undefined}
                sheetClassName="modal-sheet-compact"
                closeLabel="Fechar"
                onClose={() => !updateUser.isPending && !resetUserPassword.isPending && !changeUserRole.isPending && !changeUserStatus.isPending && setEditingUser(null)}
                actions={
                    <div className="modal-actions-inline">
                        <button type="button" className={editingUser?.active ? "modal-btn danger" : "modal-btn"} onClick={changeEditingUserStatus} disabled={changeUserStatus.isPending || updateUser.isPending || resetUserPassword.isPending || changeUserRole.isPending}>
                            {changeUserStatus.isPending ? "Salvando..." : editingUser?.active ? "Desativar" : "Reativar"}
                        </button>
                        <button type="submit" form="edit-user-form" className="modal-btn primary" disabled={updateUser.isPending || resetUserPassword.isPending || changeUserRole.isPending || changeUserStatus.isPending}>{updateUser.isPending || resetUserPassword.isPending || changeUserRole.isPending ? "Salvando..." : "Confirmar"}</button>
                    </div>
                }
            >
                <form id="edit-user-form" className="password-form" onSubmit={submitEdit}>
                    <div className="form-group"><label htmlFor="edit-user-name">Nome</label><input id="edit-user-name" value={editingName} onChange={(event) => setEditingName(event.target.value)} autoComplete="name" maxLength={100} required /></div>
                    <div className="form-group"><label htmlFor="edit-user-email">E-mail</label><input id="edit-user-email" type="email" value={editingEmail} onChange={(event) => setEditingEmail(event.target.value)} autoComplete="email" required /></div>
                    <div className="form-group"><label htmlFor="edit-user-password">Nova senha <span className="optional-label">(opcional)</span></label><input id="edit-user-password" type="password" value={editingPassword} onChange={(event) => setEditingPassword(event.target.value)} autoComplete="new-password" minLength={6} /></div>
                    <div className="form-group"><label htmlFor="edit-user-role">Perfil</label><FormSelect id="edit-user-role" value={editingRole} placeholder="Selecione o perfil" options={ROLES} onChange={(value) => setEditingRole(value as UserRole)} /></div>
                    {editError && <p className="password-form-error">{editError}</p>}
                </form>
            </Modal>
        </>
    );
}
