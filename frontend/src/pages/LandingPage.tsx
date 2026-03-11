import { Link } from "react-router-dom";
import { BookOpen, Sparkles, Globe, Users, Feather, Scroll, ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { useI18n } from "../i18n/useI18n";

function EmberField() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const embers: HTMLDivElement[] = [];

        for (let i = 0; i < 25; i++) {
            const ember = document.createElement("div");
            ember.className = "ember";
            ember.style.left = `${Math.random() * 100}%`;
            ember.style.bottom = `-${Math.random() * 20}px`;
            ember.style.width = `${2 + Math.random() * 3}px`;
            ember.style.height = ember.style.width;
            ember.style.animationDuration = `${6 + Math.random() * 10}s`;
            ember.style.animationDelay = `${Math.random() * 8}s`;
            ember.style.opacity = `${0.3 + Math.random() * 0.7}`;
            container.appendChild(ember);
            embers.push(ember);
        }

        return () => {
            embers.forEach((e) => e.remove());
        };
    }, []);

    return <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" />;
}

export default function LandingPage() {
    const { lang, setLang, t } = useI18n();
    const features = [
        {
            icon: Globe,
            title: t("feature.storyworlds.title"),
            desc: t("feature.storyworlds.desc"),
        },
        {
            icon: Users,
            title: t("feature.characters.title"),
            desc: t("feature.characters.desc"),
        },
        {
            icon: Scroll,
            title: t("feature.seriesBible.title"),
            desc: t("feature.seriesBible.desc"),
        },
        {
            icon: Sparkles,
            title: t("feature.ai.title"),
            desc: t("feature.ai.desc"),
        },
    ];
    return (
        <div className="noise flex flex-col" style={{ minHeight: '100dvh' }}>
            {/* ── Navbar ── */}
            <nav className="fixed top-0 inset-x-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 shrink-0">
                        <BookOpen className="w-5 h-5 text-amber-500" />
                        <span className="text-amber-400/90 font-semibold text-sm tracking-[0.25em] uppercase">
                            Lorekeeper
                        </span>
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={() => setLang(lang === "en" ? "es" : "en")}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold tracking-wider border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition"
                            title={lang === "en" ? t("lang.spanish") : t("lang.english")}
                        >
                            {lang.toUpperCase()}
                        </button>
                        <Link
                            to="/login"
                            className="btn-ghost hidden sm:inline-flex text-sm px-4 py-2"
                        >
                            {t("landing.signIn")}
                        </Link>
                        <Link
                            to="/register"
                            className="btn-primary text-xs sm:text-sm px-4 sm:px-5 py-2 whitespace-nowrap"
                        >
                            {t("landing.getStarted")}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="relative flex-1 flex flex-col items-center justify-center px-6 pt-28 sm:pt-32 pb-20 sm:pb-24 text-center overflow-hidden" style={{ minHeight: '100dvh' }}>
                {/* Background layers */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: `
                            radial-gradient(ellipse 80% 60% at 50% 30%, rgba(120, 53, 15, 0.18), transparent),
                            radial-gradient(ellipse 60% 40% at 20% 80%, rgba(120, 53, 15, 0.08), transparent),
                            radial-gradient(ellipse 50% 50% at 80% 70%, rgba(120, 53, 15, 0.06), transparent)
                        `,
                    }}
                />
                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#030712_80%)]" />

                <EmberField />

                {/* Content */}
                <div className="relative z-10 max-w-3xl">
                    <div className="animate-fade-in">
                        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8">
                            <Feather className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-amber-400/80 text-xs tracking-[0.2em] uppercase font-medium">
                                {t("landing.storyworldStudio")}
                            </span>
                        </div>
                    </div>

                    <h1 className="animate-fade-in delay-100 text-6xl md:text-8xl font-bold tracking-tight text-gradient leading-[0.9] mb-6">
                        LORE
                        <br />
                        KEEPER
                    </h1>

                    <p className="animate-fade-in-slow delay-200 text-gray-400 text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed font-light">
                        {t("landing.heroSubtitle")}
                    </p>

                    <div className="animate-fade-in-slow delay-300 flex gap-4 flex-wrap justify-center">
                        <Link
                            to="/register"
                            className="btn-primary flex items-center gap-2 px-8 py-3.5"
                        >
                            {t("landing.startProject")}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <Link
                            to="/login"
                            className="btn-ghost text-gray-300 hover:text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-300"
                        >
                            {t("landing.openStudio")}
                        </Link>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in delay-500">
                    <div className="w-5 h-8 rounded-full border border-gray-700 flex items-start justify-center p-1">
                        <div className="w-1 h-2 rounded-full bg-amber-500/60 animate-bounce" />
                    </div>
                </div>
            </section>

            {/* ── Features Bento Grid ── */}
            <section className="relative max-w-6xl mx-auto px-6 pb-32">
                <div className="text-center mb-16 animate-fade-in">
                    <p className="text-amber-600/80 text-xs tracking-[0.3em] uppercase font-medium mb-3">
                        {t("landing.everythingYouNeed")}
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                        {t("landing.canonTitle")}
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {features.map((f, i) => (
                        <div
                            key={f.title}
                            className={`animate-fade-in-slow delay-${(i + 1) * 100} group glass rounded-2xl p-8 hover:bg-white/[0.03] transition-all duration-500 cursor-default`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center mb-5 group-hover:bg-amber-500/15 transition-colors duration-500">
                                <f.icon className="w-5 h-5 text-amber-500" />
                            </div>
                            <h3 className="text-white text-lg font-semibold mb-2 group-hover:text-amber-300 transition-colors duration-300">
                                {f.title}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="relative px-6 pb-32">
                <div
                    className="max-w-4xl mx-auto glass rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
                >
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            background: "radial-gradient(ellipse at center, rgba(120, 53, 15, 0.2), transparent 70%)",
                        }}
                    />
                    <div className="relative z-10">
                        <BookOpen className="w-10 h-10 text-amber-500/60 mx-auto mb-6 animate-float" />
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {t("landing.ready")}
                        </h2>
                        <p className="text-gray-400 text-lg max-w-lg mx-auto mb-10 leading-relaxed font-light">
                            {t("landing.readySubtitle")}
                        </p>
                        <Link
                            to="/register"
                            className="btn-primary inline-flex items-center gap-2 px-10 py-4"
                        >
                            {t("landing.ctaButton")}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-white/5 py-8 text-center">
                <span className="text-gray-600 text-xs tracking-[0.3em] uppercase">
                    {t("footer.tagline")}
                </span>
            </footer>
        </div>
    );
}
