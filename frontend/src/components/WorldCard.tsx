import { Link } from "react-router-dom";
import { Globe, Trash2, Calendar, ArrowUpRight } from "lucide-react";
import type { WorldDto } from "../api/worldApi.generated";
import { useState } from "react";
import { useI18n } from "../i18n/useI18n";

interface Props {
    world: WorldDto;
    onDelete: (id: string) => void;
}

export default function WorldCard({ world, onDelete }: Props) {
    const { t, lang } = useI18n();
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const imageOk = Boolean(world.image) && failedSrc !== world.image;

    const locale = lang === "es" ? "es-ES" : "en-US";
    const date = new Date(world.createdAt).toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <div className="group relative panel-soft rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-900/10">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500/60 via-amber-500/20 to-transparent" />
            <div className="absolute inset-0 rounded-2xl border border-amber-500/0 group-hover:border-amber-500/20 transition-all duration-500 pointer-events-none z-10" />

            {/* Image */}
            <div className="h-44 relative overflow-hidden">
                {world.image && imageOk ? (
                    <img
                        src={world.image}
                        alt={world.name}
                        onError={() => setFailedSrc(world.image ?? null)}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                            background: "radial-gradient(ellipse at 40% 40%, rgba(217, 119, 6, 0.15), #0a0f1a 70%)",
                        }}
                    >
                        <div className="flex flex-col items-center gap-2 text-center px-3">
                            <Globe className="w-12 h-12 text-amber-700/30 group-hover:text-amber-600/40 transition-colors duration-500" />
                            {world.image && !imageOk && (
                                <div className="text-xs text-gray-500">
                                    {t("world.imageUnavailable")}
                                    <div>
                                        <a
                                            href={world.image}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-amber-400 hover:text-amber-300"
                                        >
                                            {t("world.openImage")}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />

                {/* Delete */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(world.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-black/50 backdrop-blur-sm text-gray-400 hover:text-red-400 hover:bg-red-500/20 transition opacity-0 group-hover:opacity-100 z-20"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Content */}
            <Link to={`/world/${world.id}`} className="block p-5 pt-3 relative">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-white font-bold text-lg group-hover:text-amber-400 transition-colors duration-300 leading-tight">
                        {world.name}
                    </h3>
                    <ArrowUpRight className="w-4 h-4 text-amber-200/60 group-hover:text-amber-300 transition-all duration-300 shrink-0 mt-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed mb-4">
                    {world.description || t("world.emptyDescription")}
                </p>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <Calendar className="w-3 h-3" />
                    {date}
                </div>
            </Link>
        </div>
    );
}
