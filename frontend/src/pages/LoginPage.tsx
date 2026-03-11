import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import { login } from "../services/authService";
import { BookOpen, ArrowLeft } from "lucide-react";
import { useI18n } from "../i18n/useI18n";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { lang, setLang, t } = useI18n();

    const handleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            const response = await login(email, password);
            dispatch(
                loginSuccess({
                    user: {
                        userId: response.userId,
                        email: response.email,
                        fullName: response.fullName,
                        role: response.role,
                    },
                    token: response.accessToken,
                })
            );
            localStorage.setItem("token", response.accessToken);
            navigate("/dashboard");
        } catch {
            setError(t("auth.invalidCredentials"));
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && email && password && !loading) handleLogin();
    };

    return (
        <div className="noise min-h-screen flex items-center justify-center px-4 relative">
            {/* Background */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
                        radial-gradient(ellipse 70% 50% at 50% 20%, rgba(120, 53, 15, 0.15), transparent),
                        radial-gradient(ellipse at bottom, rgba(120, 53, 15, 0.05), transparent)
                    `,
                }}
            />

            {/* Back link */}
            <Link
                to="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-amber-400 text-sm transition z-10"
            >
                <ArrowLeft className="w-4 h-4" />
                {t("auth.back")}
            </Link>

            <button
                type="button"
                onClick={() => setLang(lang === "en" ? "es" : "en")}
                className="absolute top-6 right-6 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition z-10"
                title={lang === "en" ? t("lang.spanish") : t("lang.english")}
            >
                {lang.toUpperCase()}
            </button>

            {/* Card */}
            <div className="relative glass-strong rounded-2xl p-10 w-full max-w-md animate-fade-in" onKeyDown={handleKeyDown}>
                {/* Header */}
                <div className="text-center mb-10">
                    <BookOpen className="w-8 h-8 text-amber-500/70 mx-auto mb-4" />
                    <h1 className="text-gradient text-4xl font-bold tracking-wider mb-1">LOREKEEPER</h1>
                    <p className="text-gray-500 text-sm mt-2">{t("auth.enterRealm")}</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 animate-fade-in">
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    </div>
                )}

                {/* Form */}
                <div className="space-y-5">
                    <div>
                        <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">
                            {t("auth.email")}
                        </label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white/[0.03] border border-white/10 text-white w-full p-3.5 rounded-xl placeholder-gray-600 transition"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">
                            {t("auth.password")}
                        </label>
                        <input
                            type="password"
                            placeholder={t("auth.enterPassword")}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white/[0.03] border border-white/10 text-white w-full p-3.5 rounded-xl placeholder-gray-600 transition"
                        />
                    </div>
                </div>

                {/* Button */}
                <button
                    onClick={handleLogin}
                    disabled={loading || !email || !password}
                    className="w-full mt-8 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-semibold p-3.5 rounded-xl transition-all duration-300 tracking-wide shadow-lg shadow-amber-900/20 hover:shadow-amber-800/40 disabled:shadow-none"
                >
                    {loading ? t("auth.entering") : t("auth.enterButton")}
                </button>

                {/* Divider */}
                <div className="flex items-center my-8">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="px-4 text-gray-600 text-xs tracking-wider">{t("auth.or")}</span>
                    <div className="flex-1 h-px bg-white/5" />
                </div>

                {/* Register link */}
                <p className="text-center text-gray-500 text-sm">
                    {t("auth.newHere")}{" "}
                    <Link className="text-amber-500 hover:text-amber-400 transition font-medium" to="/register">
                        {t("auth.createAccount")}
                    </Link>
                </p>
            </div>
        </div>
    );
}
