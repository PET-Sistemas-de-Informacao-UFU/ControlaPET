import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { api } from "../../service/api";

export default function RedefinirSenha() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(token ? null : "Link de redefinição inválido.");

    async function submit(event: FormEvent) {
        event.preventDefault();
        if (password.length < 6) {
            setError("A nova senha deve ter no mínimo 6 caracteres.");
            return;
        }
        if (password !== confirmation) {
            setError("A confirmação da senha não confere.");
            return;
        }

        setError(null);
        setSubmitting(true);
        try {
            await api.post("/auth/reset-password", { token, newPassword: password });
            setSuccess(true);
        } catch (requestError) {
            const message = isAxiosError<{ message?: string }>(requestError)
                ? requestError.response?.data?.message
                : undefined;
            setError(message ?? "Não foi possível redefinir a senha.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="login-wrap">
            <div className="login-card password-recovery-card">
                <img src="/logoPET.png" alt="Logo do PET-SI" className="login-logo" />
                <h1 className="login-title">Nova senha</h1>
                {success ? (
                    <>
                        <p className="login-subtitle">Senha redefinida. Você já pode entrar com a nova senha.</p>
                        <Link className="login-submit password-recovery-link" to="/login">Ir para o login</Link>
                    </>
                ) : (
                    <form className="login-form" onSubmit={submit}>
                        <p className="login-subtitle">Escolha uma nova senha para sua conta.</p>
                        <div className="form-group"><label htmlFor="new-password">Nova senha</label><input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required /></div>
                        <div className="form-group"><label htmlFor="confirm-password">Confirmar nova senha</label><input id="confirm-password" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={6} required /></div>
                        {error && <div className="login-error">{error}</div>}
                        <button type="submit" className="login-submit" disabled={submitting || !token}>{submitting ? "Redefinindo..." : "Redefinir senha"}</button>
                    </form>
                )}
            </div>
        </div>
    );
}
