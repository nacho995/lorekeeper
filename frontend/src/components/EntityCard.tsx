import { Calendar } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "../i18n/useI18n";

interface Props {
    name: string;
    description: string;
    icon: ReactNode;
    meta?: { label: string; value: string }[];
    date?: string;
}

export default function EntityCard({
    name,
    description,
    icon,
    meta,
    date,
}: Props) {
    const { t, lang } = useI18n();
    const locale = lang === "es" ? "es-ES" : "en-US";
    const formattedDate = date
        ? new Date(date).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })
        : null;

    return (
        <div className="group relative panel-soft rounded-xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-900/10">
            <div className="absolute inset-0 rounded-xl border border-amber-500/0 group-hover:border-amber-500/15 transition-all duration-500 pointer-events-none" />

            <div
                className="w-full flex items-center justify-center py-6"
                style={{
                    background: "radial-gradient(ellipse at center, rgba(217, 119, 6, 0.08), #0a0f1a 70%)",
                }}
            >
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-black/20 border border-amber-500/10">
                    {icon}
                </div>
            </div>

            <div className="p-5">
                <h4 className="text-white font-bold mb-1.5 group-hover:text-amber-400 transition-colors duration-300">
                    {name}
                </h4>

                {meta && meta.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {meta.map((m) => (
                            <span
                                key={m.label}
                                className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400/90 border border-amber-500/15 font-medium"
                            >
                                {m.value}
                            </span>
                        ))}
                    </div>
                )}

                <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed mb-3">
                    {description || t("world.noDescription")}
                </p>

                {formattedDate && (
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <Calendar className="w-3 h-3" />
                        {formattedDate}
                    </div>
                )}
            </div>
        </div>
    );
}
