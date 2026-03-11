import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import type { RootState } from "../store/store";
import { BookOpen, LogOut, Map } from "lucide-react";
import { useI18n } from "../i18n/useI18n";

export default function Layout() {
    const user = useSelector((s: RootState) => s.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { lang, setLang, t } = useI18n();

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen flex flex-col bg-transparent">
            {/* ── Navbar ── */}
            <nav className="sticky top-0 z-50 bg-[#2f3236]/75 backdrop-blur-xl border-b border-amber-500/15">
                <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-2.5 group">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center group-hover:bg-amber-500/25 transition">
                            <BookOpen className="w-4 h-4 text-amber-400" />
                        </div>
                        <span className="text-amber-400 font-bold text-sm tracking-[0.2em] uppercase">
                            Lorekeeper
                        </span>
                    </Link>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setLang(lang === "en" ? "es" : "en")}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider border border-amber-500/30 text-amber-200 hover:text-amber-100 hover:bg-amber-500/10 transition"
                            title={lang === "en" ? t("lang.spanish") : t("lang.english")}
                        >
                            {lang.toUpperCase()}
                        </button>

                        <Link
                            to="/dashboard"
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm transition ${
                                isActive("/dashboard")
                                    ? "bg-amber-500/15 text-amber-200"
                                    : "text-amber-200/80 hover:text-amber-100 hover:bg-amber-500/10"
                            }`}
                        >
                            <Map className="w-4 h-4" />
                            <span className="hidden sm:inline">{t("nav.myProjects")}</span>
                        </Link>

                        <div className="w-px h-5 bg-white/10 mx-2" />

                        <div className="flex items-center gap-2.5 px-3 py-1.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-xs font-bold">
                                {user?.fullName?.charAt(0)?.toUpperCase() ?? "U"}
                            </div>
                            <span className="text-sm text-gray-200 hidden sm:inline font-medium">{user?.fullName}</span>
                        </div>

                        <button
                            onClick={handleLogout}
                            title={t("nav.signOut")}
                            className="p-2 rounded-lg text-amber-200/70 hover:text-red-300 hover:bg-red-500/10 transition"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Background glow ── */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-amber-500/[0.03] rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-amber-600/[0.02] rounded-full blur-[100px]" />
            </div>

            {/* ── Main ── */}
            <main className="flex-1 relative z-10">
                <Outlet />
            </main>

            {/* ── Footer ── */}
            <footer className="relative z-10 border-t border-white/5 py-6 text-center">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[#8f8a82] text-xs tracking-[0.3em] uppercase">
                        {t("footer.tagline")}
                    </span>
                    <a
                        href="https://www.freepik.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#a09b93]/80 hover:text-[#a09b93] transition"
                    >
                        {t("footer.attribution")}
                    </a>
                </div>
            </footer>
        </div>
    );
}
