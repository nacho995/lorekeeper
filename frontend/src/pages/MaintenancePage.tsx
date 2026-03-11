import { Link } from "react-router-dom";
import { Wrench, Sparkles } from "lucide-react";
import { useI18n } from "../i18n/useI18n";

export default function MaintenancePage() {
    const { t } = useI18n();

    return (
        <div className="noise min-h-screen flex items-center justify-center px-6 py-16 relative">
            <div
                className="absolute inset-0"
                style={{
                    background: `
                        radial-gradient(ellipse 70% 50% at 50% 20%, rgba(120, 53, 15, 0.18), transparent),
                        radial-gradient(ellipse at bottom, rgba(120, 53, 15, 0.08), transparent)
                    `,
                }}
            />

            <div className="relative z-10 max-w-xl text-center panel rounded-3xl p-10 md:p-12">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
                    <Wrench className="w-7 h-7 text-amber-400" />
                </div>
                <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-amber-400/80 text-xs tracking-[0.2em] uppercase font-medium">
                        {t("maintenance.badge")}
                    </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {t("maintenance.title")}
                </h1>
                <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-8">
                    {t("maintenance.subtitle")}
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Link
                        to="/"
                        className="btn-primary px-6 py-2.5 text-sm"
                    >
                        {t("maintenance.backHome")}
                    </Link>
                    <span className="text-gray-600 text-xs">{t("maintenance.note")}</span>
                </div>
            </div>
        </div>
    );
}
