import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";
import { BookOpen, ArrowLeft } from "lucide-react";
import { useI18n } from "../i18n/useI18n";

export default function RegisterPage() {
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", phone: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { lang, setLang, t } = useI18n();

    const fields: { key: string; label: string; type: string; placeholder: string; required?: boolean }[] = [
        { key: "firstName", label: t("register.firstName"), type: "text", placeholder: "Aragorn", required: true },
        { key: "lastName", label: t("register.lastName"), type: "text", placeholder: "Elessar", required: true },
        { key: "email", label: t("auth.email"), type: "email", placeholder: "your@email.com", required: true },
        { key: "password", label: t("auth.password"), type: "password", placeholder: t("auth.enterPassword"), required: true },
        { key: "phone", label: t("register.phoneOptional"), type: "tel", placeholder: "+34 600 000 000" },
    ];

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({ ...prev, [key]: e.target.value }));

    const canSubmit = form.firstName && form.lastName && form.email && form.password;

    const handleRegister = async () => {
        setError("");
        setLoading(true);
        try {
            await register(form.firstName, form.lastName, form.email, form.password, form.phone);
            navigate("/login");
        } catch {
            setError(t("register.failed"));
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && canSubmit && !loading) handleRegister();
    };

    return (
        <div className="noise min-h-screen flex items-center justify-center px-4 py-12 relative">
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
                <div className="text-center mb-8">
                    <BookOpen className="w-8 h-8 text-amber-500/70 mx-auto mb-4" />
                    <h1 className="text-gradient text-3xl font-bold tracking-wider mb-1">{t("register.joinRealm")}</h1>
                    <p className="text-gray-500 text-sm mt-2">{t("register.beginLegend")}</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 animate-fade-in">
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    </div>
                )}

                {/* Form */}
                <div className="space-y-4">
                    {fields.map((f) => (
                        <div key={f.key}>
                            <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">
                                {f.label}
                            </label>
                            <input
                                type={f.type}
                                placeholder={f.placeholder}
                                value={form[f.key as keyof typeof form]}
                                onChange={set(f.key)}
                                className="bg-white/[0.03] border border-white/10 text-white w-full p-3.5 rounded-xl placeholder-gray-600 transition"
                            />
                        </div>
                    ))}
                </div>

                {/* Button */}
                <button
                    onClick={handleRegister}
                    disabled={loading || !canSubmit}
                    className="w-full mt-8 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-semibold p-3.5 rounded-xl transition-all duration-300 tracking-wide shadow-lg shadow-amber-900/20 hover:shadow-amber-800/40 disabled:shadow-none"
                >
                    {loading ? t("register.forging") : t("register.forgeAccount")}
                </button>

                {/* Divider */}
                <div className="flex items-center my-8">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="px-4 text-gray-600 text-xs tracking-wider">{t("auth.or")}</span>
                    <div className="flex-1 h-px bg-white/5" />
                </div>

                {/* Login link */}
                <p className="text-center text-gray-500 text-sm">
                    {t("register.alreadyHave")}{" "}
                    <Link className="text-amber-500 hover:text-amber-400 transition font-medium" to="/login">
                        {t("register.signIn")}
                    </Link>
                </p>
            </div>
        </div>
    );
}
