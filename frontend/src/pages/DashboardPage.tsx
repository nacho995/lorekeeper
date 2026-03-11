import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/store";
import { setWorlds, addWorld, deleteWorld } from "../store/worldSlice";
import { getWorldsByUser, createWorld, deleteWorld as deleteWorldApi } from "../services/worldService";
import WorldCard from "../components/WorldCard";
import CreateWorldModal from "../components/CreateWorldModal";
import { Plus, Globe, Search, X, Flame, Sparkles } from "lucide-react";
import { useI18n } from "../i18n/useI18n";

const STOP_WORDS = new Set([
    "the", "and", "with", "from", "that", "this", "into", "about", "over", "under", "after", "before",
    "una", "uno", "unos", "unas", "para", "con", "que", "del", "los", "las", "por", "sobre", "entre",
    "de", "la", "el", "y", "o", "en", "a", "un",
]);

const normalizeText = (value: string) =>
    value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const tokenize = (value: string) =>
    normalizeText(value)
        .split(" ")
        .filter((t) => t.length > 2 && !STOP_WORDS.has(t));

const scorePrompt = (prompt: string, title: string, description: string) => {
    const normalizedPrompt = normalizeText(prompt);
    if (!normalizedPrompt) return 0;

    const tokens = tokenize(prompt);
    if (!tokens.length) return 0;

    const titleText = normalizeText(title);
    const descText = normalizeText(description);

    let matches = 0;
    for (const token of tokens) {
        if (descText.includes(token) || titleText.includes(token)) matches += 1;
    }

    const tokenScore = matches / tokens.length;
    const phraseBoost = descText.includes(normalizedPrompt) || titleText.includes(normalizedPrompt) ? 0.4 : 0;
    return Math.min(1, tokenScore + phraseBoost);
};

export default function DashboardPage() {
    const dispatch = useDispatch();
    const worlds = useSelector((s: RootState) => s.world.worlds);
    const user = useSelector((s: RootState) => s.auth.user);
    const { t } = useI18n();
    const [modalOpen, setModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [promptSearch, setPromptSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user?.userId) {
            setLoading(false);
            return;
        }

        const load = async () => {
            try {
                const data = await getWorldsByUser(user?.userId ?? "");
                dispatch(setWorlds(data));
            } catch {
                setError(t("dashboard.failedLoad"));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [dispatch, user, t]);

    const handleCreate = async (name: string, description: string, image: string) => {
        try {
            const newWorld = await createWorld(name, description, image, user?.userId ?? "");
            dispatch(addWorld(newWorld));
        } catch {
            setError(t("dashboard.failedCreate"));
        }
    };

    const handleDelete = async (id: string) => {
        const world = worlds.find((w) => w.id === id);
        if (world && confirm(t("dashboard.deleteConfirm", { name: world.name }))) {
            try {
                await deleteWorldApi(id);
                dispatch(deleteWorld(id));
            } catch {
                setError(t("dashboard.failedDelete"));
            }
        }
    };

    const promptTokens = tokenize(promptSearch);
    const minPromptScore = promptTokens.length <= 2 ? 0.15 : 0.25;
    const filtered = worlds
        .map((w) => ({
            world: w,
            score: promptTokens.length
                ? scorePrompt(promptSearch, w.name, w.description || "")
                : 0,
        }))
        .filter(({ world, score }) => {
            const titleMatch = !search || world.name.toLowerCase().includes(search.toLowerCase());
            const promptMatch = !promptTokens.length || score >= minPromptScore;
            return titleMatch && promptMatch;
        })
        .sort((a, b) => (promptTokens.length ? b.score - a.score : 0))
        .map(({ world }) => world);

    const hasFilters = Boolean(search || promptSearch);

    return (
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-16">
            {/* ── Welcome Header ── */}
            <div className="panel rounded-2xl overflow-hidden mb-10 p-8 md:p-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-600/5 rounded-full blur-[60px]" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Flame className="w-5 h-5 text-amber-500" />
                            <span className="text-amber-500/80 text-xs tracking-[0.2em] uppercase font-medium">
                                {t("dashboard.storyworldStudio")}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            {t("dashboard.welcomeBack", { name: user?.fullName?.split(" ")[0] ?? "" })}
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {t("dashboard.projectsCount", {
                                count: worlds.length,
                                projectWord: worlds.length === 1 ? t("dashboard.project") : t("dashboard.projects"),
                            })}
                        </p>
                    </div>

                        <button
                            onClick={() => setModalOpen(true)}
                            className="btn-primary flex items-center gap-2 px-6 py-3 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            {t("dashboard.newProject")}
                        </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 flex items-center justify-between">
                    <p className="text-red-400 text-sm">{error}</p>
                    <button onClick={() => setError("")} className="text-red-400 hover:text-red-300 p-1">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ── Workspace ── */}
            <div className="grid lg:grid-cols-[320px_1fr] gap-6">
                {/* Left panel */}
                <aside className="panel rounded-2xl p-6 h-fit">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-amber-500/70 font-medium">
                                {t("dashboard.panelTitle")}
                            </p>
                            <h2 className="text-lg text-white font-bold mt-1">{t("dashboard.panelSubtitle")}</h2>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                        </div>
                    </div>

                        <div className="grid grid-cols-1 gap-3 mb-6">
                            <div className="panel-soft rounded-xl p-3 text-center">
                                <p className="text-gray-500 text-xs">{t("dashboard.projectsLabel")}</p>
                                <p className="text-white text-lg font-bold">{worlds.length}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setModalOpen(true)}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            {t("dashboard.createNewProject")}
                        </button>

                    {worlds.length > 0 && (
                        <div className="mt-6">
                            <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">
                                {t("dashboard.searchProjects")}
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder={t("dashboard.typeTitle")}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="bg-[#34373b] border border-amber-500/20 text-white pl-10 pr-4 py-2.5 rounded-xl placeholder-gray-500 text-sm w-full transition focus:border-amber-500/50"
                                />
                            </div>

                            <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block mt-4">
                                {t("dashboard.searchPrompt")}
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder={t("dashboard.promptPlaceholder")}
                                    value={promptSearch}
                                    onChange={(e) => setPromptSearch(e.target.value)}
                                    className="bg-[#34373b] border border-amber-500/20 text-white pl-10 pr-4 py-2.5 rounded-xl placeholder-gray-500 text-sm w-full transition focus:border-amber-500/50"
                                />
                            </div>
                        </div>
                    )}

                    <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                        <p className="text-amber-400 text-xs uppercase tracking-[0.2em] font-medium mb-2">
                            {t("dashboard.tip")}
                        </p>
                        <p className="text-gray-400 text-sm">
                            {t("dashboard.tipText")}
                        </p>
                    </div>
                </aside>

                {/* Right content */}
                <section>
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <h2 className="text-2xl text-white font-bold">{t("dashboard.yourProjects")}</h2>
                            <p className="text-gray-500 text-sm">{t("dashboard.subtitle")}</p>
                        </div>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="btn-ghost px-4 py-2 text-sm hidden md:inline-flex"
                        >
                            {t("dashboard.newProject")}
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-32">
                            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((w) => (
                                <WorldCard key={w.id} world={w} onDelete={handleDelete} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div
                                className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6"
                                style={{ background: "linear-gradient(135deg, #1a1207, #0f1623)", border: "1px solid rgba(217, 119, 6, 0.15)" }}
                            >
                                <Globe className="w-10 h-10 text-amber-600/50" />
                            </div>
                            <h3 className="text-xl text-white font-semibold mb-2">
                                {hasFilters ? t("dashboard.noProjectsFound") : t("dashboard.noProjects")}
                            </h3>
                            <p className="text-gray-500 mb-8 max-w-sm text-sm">
                                {hasFilters ? t("dashboard.noProjectsFoundHint") : t("dashboard.noProjectsHint")}
                            </p>
                            {!hasFilters && (
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="btn-primary px-6 py-3 text-sm"
                                >
                                    {t("dashboard.createFirst")}
                                </button>
                            )}
                        </div>
                    )}
                </section>
            </div>

            <CreateWorldModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleCreate}
            />
        </div>
    );
}
