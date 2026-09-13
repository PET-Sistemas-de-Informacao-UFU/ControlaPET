import { useContext, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
    const { handleLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            await handleLogin({ email, password });
            navigate("/", { replace: true });
        } catch {
            setError("E-mail ou senha inválidos.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="login-wrap">
            <div className="login-card">
                <img src="/logoPET.png" alt="Logo do PET-SI" className="login-logo" />
                <h1 className="login-title">ControlaPET</h1>
                <p className="login-subtitle">Entre com sua conta do PET-SI</p>

                <form className="login-form" onSubmit={onSubmit}>
                    <div className="form-group">
                        <label htmlFor="login-email">E-mail</label>
                        <input
                            id="login-email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">Senha</label>
                        <input
                            id="login-password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <button type="submit" className="login-submit" disabled={submitting}>
                        {submitting ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}
