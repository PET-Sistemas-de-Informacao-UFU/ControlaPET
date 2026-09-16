import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../../service/api";

export default function EsqueciSenha() {
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            await api.post("/auth/forgot-password", { email: email.trim() });
            setSent(true);
        } catch {
            setError("Não foi possível enviar o link. Tente novamente mais tarde.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="login-wrap">
            <div className="login-card password-recovery-card">
                <img src="/logoPET.png" alt="Logo do PET-SI" className="login-logo" />
                <h1 className="login-title">Redefinir senha</h1>
                {sent ? (
                    <>
                        <p className="login-subtitle">Se houver uma conta com esse e-mail, enviaremos um link para redefinir a senha.</p>
                        <Link className="login-submit password-recovery-link" to="/login">Voltar ao login</Link>
                    </>
                ) : (
                    <>
                        <p className="login-subtitle">Informe seu e-mail para receber um link de redefinição.</p>
                        <form className="login-form" onSubmit={submit}>
                            <div className="form-group">
                                <label htmlFor="recovery-email">E-mail</label>
                                <input id="recovery-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                            </div>
                            {error && <div className="login-error">{error}</div>}
                            <button type="submit" className="login-submit" disabled={submitting}>{submitting ? "Enviando..." : "Enviar link"}</button>
                        </form>
                        <Link className="forgot-password-link password-recovery-link" to="/login">Voltar ao login</Link>
                    </>
                )}
            </div>
        </div>
    );
}
