import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/store";
import { setSelectedWorld } from "../store/worldSlice";
import { getWorldsByUser } from "../services/worldService";
import { generateCharacters, generateLore, generateLocations, generateFactions } from "../services/aiService";
import type { CharacterDto, LocationDto, FactionDto } from "../api/worldApi.generated";
import EntityCard from "../components/EntityCard";
import { useI18n } from "../i18n/useI18n";
import {
    ArrowLeft,
    Users,
    MapPin,
    Shield,
    Sparkles,
    Globe,
    BookOpen,
    ScrollText,
    X,
    Flame,
} from "lucide-react";

type Tab = "characters" | "locations" | "factions" | "lore";

interface LoreEntry {
    topic: string;
    content: string;
    createdAt: string;
}

type CharacterItem = CharacterDto & { appearance?: string };
type LocationItem = LocationDto & { type?: string };
type FactionItem = FactionDto & { alignment?: string };

const STORAGE_PREFIX = "lorekeeper:world:";

export default function WorldDetailPage() {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch();
    const world = useSelector((s: RootState) => s.world.selectedWorld);
    const user = useSelector((s: RootState) => s.auth.user);
    const { lang, t } = useI18n();

    const [activeTab, setActiveTab] = useState<Tab>("characters");
    const [characters, setCharacters] = useState<CharacterItem[]>([]);
    const [locations, setLocations] = useState<LocationItem[]>([]);
    const [factions, setFactions] = useState<FactionItem[]>([]);
    const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]);
    const [generating, setGenerating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [hydrated, setHydrated] = useState(false);

    const [selectedTopic, setSelectedTopic] = useState("");
    const [customTopic, setCustomTopic] = useState("");
    const [charCount, setCharCount] = useState(3);
    const [storySeed, setStorySeed] = useState("");
    const [locationCount, setLocationCount] = useState(3);
    const [factionCount, setFactionCount] = useState(3);
    const [characterFocus, setCharacterFocus] = useState("");
    const [locationFocus, setLocationFocus] = useState("");
    const [factionFocus, setFactionFocus] = useState("");
    const [loreFocus, setLoreFocus] = useState("");

    const extractErrorDetail = (err: unknown) => {
        const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        return typeof detail === "string" && detail.trim() ? detail : "";
    };

    const entityTabs: { key: Tab; label: string; icon: typeof Users }[] = [
        { key: "characters", label: t("world.characters"), icon: Users },
        { key: "locations", label: t("world.locations"), icon: MapPin },
        { key: "factions", label: t("world.factions"), icon: Shield },
        { key: "lore", label: t("world.lore"), icon: ScrollText },
    ];

    const loreTopics = lang === "es"
        ? [
            "Historia",
            "Religion y Mitologia",
            "Politica y Gobierno",
            "Economia y Comercio",
            "Sistema de Magia",
            "Geografia y Clima",
            "Cultura y Tradiciones",
            "Milicia y Guerra",
            "Lenguas y Escritura",
            "Flora y Fauna",
        ]
        : [
            "History",
            "Religion & Mythology",
            "Politics & Government",
            "Economy & Trade",
            "Magic System",
            "Geography & Climate",
            "Culture & Traditions",
            "Military & Warfare",
            "Languages & Writing",
            "Flora & Fauna",
        ];


const buildSeed = (base: string, focus: string) =>
    [base?.trim(), focus?.trim()].filter(Boolean).join(" | ");

const normalizeKey = (value: string) =>
    value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

const buildNameSet = (items: { name?: string }[]) => {
    const set = new Set<string>();
    for (const item of items) {
        const key = normalizeKey(item.name ?? "");
        if (key) set.add(key);
    }
    return set;
};

const buildAvoidNames = (items: { name?: string }[], limit = 24) => {
    const seen = new Set<string>();
    const names: string[] = [];
    for (const item of items) {
        const raw = item.name?.trim();
        if (!raw) continue;
        const key = normalizeKey(raw);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        names.push(raw);
        if (names.length >= limit) break;
    }
    return names;
};

const filterUniqueByName = <T extends { name?: string }>(items: T[], nameSet: Set<string>) => {
    const unique: T[] = [];
    for (const item of items) {
        const key = normalizeKey(item.name ?? "");
        if (!key || nameSet.has(key)) continue;
        nameSet.add(key);
        unique.push(item);
    }
    return unique;
};



    useEffect(() => {
        if (!id) return;
        setHydrated(false);

        const key = `${STORAGE_PREFIX}${id}`;
        const raw = localStorage.getItem(key);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                setCharacters(parsed.characters ?? []);
                setLocations(parsed.locations ?? []);
                setFactions(parsed.factions ?? []);
                setLoreEntries(parsed.loreEntries ?? []);
                setStorySeed(parsed.storySeed ?? "");
                setCharacterFocus(parsed.characterFocus ?? "");
                setLocationFocus(parsed.locationFocus ?? "");
                setFactionFocus(parsed.factionFocus ?? "");
                setLoreFocus(parsed.loreFocus ?? "");
            } catch {
                setCharacters([]);
                setLocations([]);
                setFactions([]);
                setLoreEntries([]);
                setStorySeed("");
                setCharacterFocus("");
                setLocationFocus("");
                setFactionFocus("");
                setLoreFocus("");
            }
        } else {
            setCharacters([]);
            setLocations([]);
            setFactions([]);
            setLoreEntries([]);
            setStorySeed("");
            setCharacterFocus("");
            setLocationFocus("");
            setFactionFocus("");
            setLoreFocus("");
        }

        setHydrated(true);
    }, [id]);

    useEffect(() => {
        if (!hydrated || !id) return;
        const key = `${STORAGE_PREFIX}${id}`;
        const payload = {
            characters,
            locations,
            factions,
            loreEntries,
            storySeed,
            characterFocus,
            locationFocus,
            factionFocus,
            loreFocus,
        };
        try {
            localStorage.setItem(key, JSON.stringify(payload));
        } catch {
            // ignore storage quota errors
        }
    }, [
        hydrated,
        id,
        characters,
        locations,
        factions,
        loreEntries,
        storySeed,
        characterFocus,
        locationFocus,
        factionFocus,
        loreFocus,
    ]);

    useEffect(() => {
        if (!user?.userId) {
            setLoading(false);
            return;
        }

        const load = async () => {
            try {
                const worlds = await getWorldsByUser(user?.userId ?? "");
                const found = worlds.find((w: { id: string }) => w.id === id);
                if (found) dispatch(setSelectedWorld(found));
            } catch {
                setError(t("world.failedLoad"));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, dispatch, user, t]);

    const handleGenerateCharacters = async () => {
        if (!world) return;
        setGenerating(true);
        setError("");
        try {
            const seed = buildSeed(storySeed, characterFocus);
            const nameSet = buildNameSet(characters);
            let remaining = charCount;
            let created: CharacterItem[] = [];
            let avoidNames = buildAvoidNames(characters);

            for (let attempt = 0; attempt < 2 && remaining > 0; attempt += 1) {
                const data = await generateCharacters(
                    world.name,
                    world.description,
                    remaining,
                    seed,
                    undefined,
                    lang,
                    avoidNames
                );
                const raw = Array.isArray(data) ? data : [];
                const mapped: CharacterItem[] = raw.map(
                    (c: { name: string; title: string; race: string; description: string; status: string; appearance?: string }) => ({
                        id: crypto.randomUUID(),
                        name: c.name,
                        description: c.description,
                        image: "",
                        title: c.title,
                        race: c.race,
                        status: c.status,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        worldId: world.id,
                        worldName: world.name,
                        appearance: c.appearance,
                    })
                );
                const unique = filterUniqueByName(mapped, nameSet);
                created = [...created, ...unique];
                remaining = charCount - created.length;
                avoidNames = buildAvoidNames([...characters, ...created]);
            }

            if (created.length) {
                setCharacters((prev) => [...prev, ...created]);
            }
        } catch (err) {
            const detail = extractErrorDetail(err);
            setError(detail || t("world.failedCharacters"));
        } finally {
            setGenerating(false);
        }
    };

    const handleGenerateLore = async () => {
        const topic = selectedTopic || customTopic;
        if (!world || !topic) return;
        setGenerating(true);
        setError("");
        try {
            const seed = buildSeed(storySeed, loreFocus);
            const data = await generateLore(world.name, world.description, topic, seed, undefined, lang);
            setLoreEntries((prev) => [
                { topic, content: data.content, createdAt: new Date().toISOString() },
                ...prev,
            ]);
            setSelectedTopic("");
            setCustomTopic("");
        } catch (err) {
            const detail = extractErrorDetail(err);
            setError(detail || t("world.failedLore"));
        } finally {
            setGenerating(false);
        }
    };

    const handleGenerateLocations = async () => {
        if (!world) return;
        setGenerating(true);
        setError("");
        try {
            const seed = buildSeed(storySeed, locationFocus);
            const nameSet = buildNameSet(locations);
            let remaining = locationCount;
            let created: LocationItem[] = [];
            let avoidNames = buildAvoidNames(locations);

            for (let attempt = 0; attempt < 2 && remaining > 0; attempt += 1) {
                const data = await generateLocations(
                    world.name,
                    world.description,
                    remaining,
                    seed,
                    undefined,
                    lang,
                    avoidNames
                );
                const raw = Array.isArray(data) ? data : [];
                const mapped: LocationItem[] = raw.map(
                    (l: { name: string; description: string; type?: string }) => ({
                        id: crypto.randomUUID(),
                        name: l.name,
                        description: l.description,
                        image: "",
                        createdAt: new Date().toISOString(),
                        worldId: world.id,
                        worldName: world.name,
                        type: l.type,
                    })
                );
                const unique = filterUniqueByName(mapped, nameSet);
                created = [...created, ...unique];
                remaining = locationCount - created.length;
                avoidNames = buildAvoidNames([...locations, ...created]);
            }

            if (created.length) {
                setLocations((prev) => [...prev, ...created]);
            }
        } catch (err) {
            const detail = extractErrorDetail(err);
            setError(detail || t("world.failedLocations"));
        } finally {
            setGenerating(false);
        }
    };

    const handleGenerateFactions = async () => {
        if (!world) return;
        setGenerating(true);
        setError("");
        try {
            const seed = buildSeed(storySeed, factionFocus);
            const nameSet = buildNameSet(factions);
            let remaining = factionCount;
            let created: FactionItem[] = [];
            let avoidNames = buildAvoidNames(factions);

            for (let attempt = 0; attempt < 2 && remaining > 0; attempt += 1) {
                const data = await generateFactions(
                    world.name,
                    world.description,
                    remaining,
                    seed,
                    undefined,
                    lang,
                    avoidNames
                );
                const raw = Array.isArray(data) ? data : [];
                const mapped: FactionItem[] = raw.map(
                    (f: { name: string; description: string; alignment?: string }) => ({
                        id: crypto.randomUUID(),
                        name: f.name,
                        description: f.description,
                        image: "",
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        worldId: world.id,
                        worldName: world.name,
                        alignment: f.alignment,
                    })
                );
                const unique = filterUniqueByName(mapped, nameSet);
                created = [...created, ...unique];
                remaining = factionCount - created.length;
                avoidNames = buildAvoidNames([...factions, ...created]);
            }

            if (created.length) {
                setFactions((prev) => [...prev, ...created]);
            }
        } catch (err) {
            const detail = extractErrorDetail(err);
            setError(detail || t("world.failedFactions"));
        } finally {
            setGenerating(false);
        }
    };

    const removeCharacter = (charId: string) => setCharacters((prev) => prev.filter((c) => c.id !== charId));
    const removeLoreEntry = (index: number) => setLoreEntries((prev) => prev.filter((_, i) => i !== index));


    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="sr-only">{t("world.loading")}</span>
            </div>
        );
    }

    if (!world) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: "linear-gradient(135deg, #1a1207, #0f1623)", border: "1px solid rgba(217, 119, 6, 0.15)" }}
                >
                    <Globe className="w-10 h-10 text-amber-600/50" />
                </div>
                <h2 className="text-xl text-white font-semibold mb-2">{t("world.projectNotFound")}</h2>
                <Link to="/dashboard" className="text-amber-400 hover:text-amber-300 text-sm transition mt-2">
                    {t("world.backToProjects")}
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Back */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/10 text-white/90 border border-white/15 hover:bg-white/15 hover:text-white transition text-sm md:text-base font-semibold shadow-lg shadow-black/10"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t("world.backToProjects")}
                </Link>
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

            {/* ── World Header ── */}
            <div className="panel rounded-2xl overflow-hidden mb-10">
                <div className="h-56 md:h-72 relative">
                    {world.image ? (
                        <img src={world.image} alt={world.name} className="w-full h-full object-cover" />
                    ) : (
                        <div
                            className="w-full h-full"
                            style={{
                                background: `
                                    radial-gradient(ellipse at 30% 30%, rgba(217, 119, 6, 0.2), transparent 60%),
                                    radial-gradient(ellipse at 70% 70%, rgba(217, 119, 6, 0.08), transparent 50%),
                                    linear-gradient(135deg, #2f3236, #1d2024)
                                `,
                            }}
                        />
                    )}
                    <Link
                        to="/dashboard"
                        className="absolute top-4 right-4 z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/45 text-white text-xs font-semibold uppercase tracking-[0.2em] border border-white/15 backdrop-blur hover:bg-black/60 transition whitespace-nowrap"
                    >
                        {t("world.backToProjects")}
                    </Link>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#23262b] via-[#23262b]/45 to-transparent pointer-events-none" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-2 mb-3">
                        <Flame className="w-4 h-4 text-amber-500" />
                        <span className="text-amber-500/80 text-xs tracking-[0.2em] uppercase font-medium">{t("world.project")}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">{world.name}</h1>
                    <p className="text-gray-400 max-w-2xl line-clamp-2 text-sm leading-relaxed">{world.description}</p>
                </div>
            </div>

            {/* ── Story Seed ── */}
            <div className="panel-soft rounded-xl p-5 mb-8">
                <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">
                        {t("world.seed")}
                    </label>
                    <input
                        type="text"
                        placeholder={t("world.seedPlaceholder")}
                        value={storySeed}
                        onChange={(e) => setStorySeed(e.target.value)}
                        className="bg-[#34373b] border border-amber-500/20 text-white px-4 py-2.5 rounded-xl placeholder-gray-500 text-sm w-full transition focus:border-amber-500/50"
                    />
                    <p className="text-gray-500 text-xs mt-2">
                        {t("world.seedHelp")}
                    </p>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="panel-soft flex gap-1 rounded-xl p-1.5 mb-8 w-fit">
                {entityTabs.map((t) => {
                    const count =
                        t.key === "characters"
                            ? characters.length
                            : t.key === "locations"
                            ? locations.length
                            : t.key === "factions"
                            ? factions.length
                            : loreEntries.length;
                    return (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                activeTab === t.key
                                    ? "bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <t.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{t.label}</span>
                            {count > 0 && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
                                    activeTab === t.key ? "bg-black/20 text-black" : "bg-amber-500/15 text-amber-400"
                                }`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Tab Content ── */}
            {activeTab === "characters" && (
                <CharactersTab
                    characters={characters}
                    generating={generating}
                    charCount={charCount}
                    setCharCount={setCharCount}
                    characterFocus={characterFocus}
                    setCharacterFocus={setCharacterFocus}
                    onGenerate={handleGenerateCharacters}
                    onRemove={removeCharacter}
                />
            )}
            {activeTab === "locations" && (
                <LocationsTab
                    locations={locations}
                    generating={generating}
                    locationCount={locationCount}
                    setLocationCount={setLocationCount}
                    locationFocus={locationFocus}
                    setLocationFocus={setLocationFocus}
                    onGenerate={handleGenerateLocations}
                />
            )}
            {activeTab === "factions" && (
                <FactionsTab
                    factions={factions}
                    generating={generating}
                    factionCount={factionCount}
                    setFactionCount={setFactionCount}
                    factionFocus={factionFocus}
                    setFactionFocus={setFactionFocus}
                    onGenerate={handleGenerateFactions}
                />
            )}
            {activeTab === "lore" && (
                <LoreTab
                    entries={loreEntries}
                    generating={generating}
                    selectedTopic={selectedTopic}
                    setSelectedTopic={setSelectedTopic}
                    customTopic={customTopic}
                    setCustomTopic={setCustomTopic}
                    loreFocus={loreFocus}
                    setLoreFocus={setLoreFocus}
                    onGenerate={handleGenerateLore}
                    onRemove={removeLoreEntry}
                    topics={loreTopics}
                />
            )}

        </div>
    );
}

/* ─── Characters Tab ─── */
function CharactersTab({
    characters,
    generating,
    charCount,
    setCharCount,
    characterFocus,
    setCharacterFocus,
    onGenerate,
    onRemove,
}: {
    characters: CharacterItem[];
    generating: boolean;
    charCount: number;
    setCharCount: (n: number) => void;
    characterFocus: string;
    setCharacterFocus: (v: string) => void;
    onGenerate: () => void;
    onRemove: (id: string) => void;
}) {
    const { t } = useI18n();
    const characterLabel = (n: number) => (n === 1 ? t("world.character") : t("world.characters"));
    const aiButton = (
        <div className="flex items-center gap-3">
            <select
                value={charCount}
                onChange={(e) => setCharCount(Number(e.target.value))}
                className="bg-[#3b3e42] border border-amber-500/20 text-white px-3 py-2 rounded-lg text-sm"
            >
                {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} {characterLabel(n)}</option>
                ))}
            </select>
            <button
                onClick={onGenerate}
                disabled={generating}
                className="btn-primary flex items-center gap-2 px-5 py-2 text-sm disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none"
            >
                <Sparkles className="w-4 h-4" />
                {generating ? t("world.generating") : characters.length ? t("world.generateMore") : t("world.generateWithAi")}
            </button>
        </div>
    );

    const focusInput = (
        <div className="mb-6">
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">
                {t("world.characterFocus")}
            </label>
            <input
                type="text"
                placeholder={t("world.characterFocusPlaceholder")}
                value={characterFocus}
                onChange={(e) => setCharacterFocus(e.target.value)}
                className="bg-[#34373b] border border-amber-500/20 text-white px-4 py-2.5 rounded-xl placeholder-gray-500 text-sm w-full transition focus:border-amber-500/50"
            />
        </div>
    );



    if (characters.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: "linear-gradient(135deg, #1a1207, #0f1623)", border: "1px solid rgba(217, 119, 6, 0.12)" }}
                >
                    <Users className="w-8 h-8 text-amber-600/50" />
                </div>
                <h3 className="text-lg text-white font-semibold mb-2">{t("world.noCharacters")}</h3>
                <p className="text-gray-500 text-sm mb-8 max-w-sm">
                    {t("world.noCharactersDesc")}
                </p>
                {focusInput}
                {aiButton}
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <p className="text-gray-400 text-sm font-medium">
                    {characters.length} {characterLabel(characters.length)}
                </p>
                {aiButton}
            </div>
            {focusInput}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {characters.map((c) => (
                    <div key={c.id} className="relative group">
                        <EntityCard
                            name={c.name}
                            description={c.description}
                            icon={<Users className="w-8 h-8 text-amber-700/30" />}
                            meta={[
                                ...(c.title ? [{ label: t("world.metaTitle"), value: c.title }] : []),
                                ...(c.race ? [{ label: t("world.metaRace"), value: c.race }] : []),
                                ...(c.status ? [{ label: t("world.metaStatus"), value: c.status }] : []),
                            ]}
                            date={c.createdAt}
                        />
                        <button
                            onClick={() => onRemove(c.id)}
                            className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 text-gray-400 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Locations Tab ─── */
function LocationsTab({
    locations,
    generating,
    locationCount,
    setLocationCount,
    locationFocus,
    setLocationFocus,
    onGenerate,
}: {
    locations: LocationItem[];
    generating: boolean;
    locationCount: number;
    setLocationCount: (n: number) => void;
    locationFocus: string;
    setLocationFocus: (v: string) => void;
    onGenerate: () => void;
}) {
    const { t } = useI18n();
    const locationLabel = (n: number) => (n === 1 ? t("world.location") : t("world.locations"));
    const controls = (
        <div className="flex items-center gap-3">
            <select
                value={locationCount}
                onChange={(e) => setLocationCount(Number(e.target.value))}
                className="bg-[#3b3e42] border border-amber-500/20 text-white px-3 py-2 rounded-lg text-sm"
            >
                {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} {locationLabel(n)}</option>
                ))}
            </select>
            <button
                onClick={onGenerate}
                disabled={generating}
                className="btn-primary flex items-center gap-2 px-5 py-2 text-sm disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none"
            >
                <Sparkles className="w-4 h-4" />
                {generating ? t("world.generating") : locations.length ? t("world.generateMore") : t("world.generateLocations")}
            </button>
        </div>
    );

    const focusInput = (
        <div className="mb-6">
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">
                {t("world.locationFocus")}
            </label>
            <input
                type="text"
                placeholder={t("world.locationFocusPlaceholder")}
                value={locationFocus}
                onChange={(e) => setLocationFocus(e.target.value)}
                className="bg-[#34373b] border border-amber-500/20 text-white px-4 py-2.5 rounded-xl placeholder-gray-500 text-sm w-full transition focus:border-amber-500/50"
            />
        </div>
    );

    if (locations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="panel-soft w-20 h-20 rounded-2xl flex items-center justify-center mb-5">
                    <MapPin className="w-8 h-8 text-amber-600/50" />
                </div>
                <h3 className="text-lg text-white font-semibold mb-2">{t("world.noLocations")}</h3>
                <p className="text-gray-500 text-sm mb-8 max-w-sm">
                    {t("world.noLocationsDesc")}
                </p>
                {focusInput}
                {controls}
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <p className="text-gray-400 text-sm font-medium">
                    {locations.length} {locationLabel(locations.length)}
                </p>
                {controls}
            </div>
            {focusInput}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {locations.map((l) => (
                    <div key={l.id} className="relative group">
                        <EntityCard
                            name={l.name}
                            description={l.description}
                            icon={<MapPin className="w-8 h-8 text-amber-700/30" />}
                            meta={l.type ? [{ label: t("world.metaType"), value: l.type }] : []}
                            date={l.createdAt}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Factions Tab ─── */
function FactionsTab({
    factions,
    generating,
    factionCount,
    setFactionCount,
    factionFocus,
    setFactionFocus,
    onGenerate,
}: {
    factions: FactionItem[];
    generating: boolean;
    factionCount: number;
    setFactionCount: (n: number) => void;
    factionFocus: string;
    setFactionFocus: (v: string) => void;
    onGenerate: () => void;
}) {
    const { t } = useI18n();
    const factionLabel = (n: number) => (n === 1 ? t("world.faction") : t("world.factions"));
    const controls = (
        <div className="flex items-center gap-3">
            <select
                value={factionCount}
                onChange={(e) => setFactionCount(Number(e.target.value))}
                className="bg-[#3b3e42] border border-amber-500/20 text-white px-3 py-2 rounded-lg text-sm"
            >
                {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} {factionLabel(n)}</option>
                ))}
            </select>
            <button
                onClick={onGenerate}
                disabled={generating}
                className="btn-primary flex items-center gap-2 px-5 py-2 text-sm disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none"
            >
                <Sparkles className="w-4 h-4" />
                {generating ? t("world.generating") : factions.length ? t("world.generateMore") : t("world.generateFactions")}
            </button>
        </div>
    );

    const focusInput = (
        <div className="mb-6">
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">
                {t("world.factionFocus")}
            </label>
            <input
                type="text"
                placeholder={t("world.factionFocusPlaceholder")}
                value={factionFocus}
                onChange={(e) => setFactionFocus(e.target.value)}
                className="bg-[#34373b] border border-amber-500/20 text-white px-4 py-2.5 rounded-xl placeholder-gray-500 text-sm w-full transition focus:border-amber-500/50"
            />
        </div>
    );

    if (factions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="panel-soft w-20 h-20 rounded-2xl flex items-center justify-center mb-5">
                    <Shield className="w-8 h-8 text-amber-600/50" />
                </div>
                <h3 className="text-lg text-white font-semibold mb-2">{t("world.noFactions")}</h3>
                <p className="text-gray-500 text-sm mb-8 max-w-sm">
                    {t("world.noFactionsDesc")}
                </p>
                {focusInput}
                {controls}
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <p className="text-gray-400 text-sm font-medium">
                    {factions.length} {factionLabel(factions.length)}
                </p>
                {controls}
            </div>
            {focusInput}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {factions.map((f) => (
                    <div key={f.id} className="relative group">
                        <EntityCard
                            name={f.name}
                            description={f.description}
                            icon={<Shield className="w-8 h-8 text-amber-700/30" />}
                            meta={f.alignment ? [{ label: t("world.metaAlignment"), value: f.alignment }] : []}
                            date={f.createdAt}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Lore Tab ─── */
function LoreTab({
    entries,
    generating,
    selectedTopic,
    setSelectedTopic,
    customTopic,
    setCustomTopic,
    loreFocus,
    setLoreFocus,
    onGenerate,
    onRemove,
    topics,
}: {
    entries: LoreEntry[];
    generating: boolean;
    selectedTopic: string;
    setSelectedTopic: (v: string) => void;
    customTopic: string;
    setCustomTopic: (v: string) => void;
    loreFocus: string;
    setLoreFocus: (v: string) => void;
    onGenerate: () => void;
    onRemove: (index: number) => void;
    topics: string[];
}) {
    const { t, lang } = useI18n();
    const activeTopic = selectedTopic || customTopic;
    const locale = lang === "es" ? "es-ES" : "en-US";

    return (
        <div>
            {/* Generate panel */}
            <div className="panel rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-amber-400" />
                    </div>
                <h3 className="text-white font-bold">{t("world.generateLore")}</h3>
                </div>
                <p className="text-gray-400 text-sm mb-5">
                    {t("world.loreHelp")}
                </p>

                {/* Topic chips */}
                <div className="flex flex-wrap gap-2 mb-5">
                    {topics.map((topic) => (
                        <button
                            key={topic}
                            onClick={() => {
                                setSelectedTopic(selectedTopic === topic ? "" : topic);
                                setCustomTopic("");
                            }}
                            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                                selectedTopic === topic
                                    ? "bg-amber-500 text-black border-amber-500 font-bold shadow-lg shadow-amber-500/20"
                                    : "bg-[#34373b] text-gray-300 border-amber-500/20 hover:border-amber-500/40 hover:text-amber-300"
                            }`}
                        >
                            {topic}
                        </button>
                    ))}
                </div>

                {/* Custom + button */}
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder={t("world.customTopicPlaceholder")}
                        value={customTopic}
                        onChange={(e) => { setCustomTopic(e.target.value); setSelectedTopic(""); }}
                        className="flex-1 bg-[#34373b] border border-amber-500/20 text-white px-4 py-2.5 rounded-xl placeholder-gray-500 text-sm transition focus:border-amber-500/50"
                    />
                    <button
                        onClick={onGenerate}
                        disabled={generating || !activeTopic}
                        className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm shrink-0 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none"
                    >
                        <Sparkles className="w-4 h-4" />
                        {generating ? t("world.generating") : t("world.generate")}
                    </button>
                </div>

                <div className="mt-4">
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">
                        {t("world.loreFocus")}
                    </label>
                    <input
                        type="text"
                        placeholder={t("world.loreFocusPlaceholder")}
                        value={loreFocus}
                        onChange={(e) => setLoreFocus(e.target.value)}
                        className="bg-[#34373b] border border-amber-500/20 text-white px-4 py-2.5 rounded-xl placeholder-gray-500 text-sm w-full transition focus:border-amber-500/50"
                    />
                </div>
            </div>

            {/* Entries */}
            {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                        style={{ background: "linear-gradient(135deg, #1a1207, #0f1623)", border: "1px solid rgba(217, 119, 6, 0.12)" }}
                    >
                        <ScrollText className="w-8 h-8 text-amber-600/50" />
                    </div>
                    <h3 className="text-lg text-white font-semibold mb-2">{t("world.noLore")}</h3>
                    <p className="text-gray-500 text-sm max-w-sm">{t("world.noLoreDesc")}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {entries.map((entry, index) => (
                        <div
                            key={index}
                            className="panel-soft rounded-xl p-6 group transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/5"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                                        <ScrollText className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-amber-400 font-bold text-sm">{entry.topic}</h4>
                                        <p className="text-gray-600 text-xs">
                                            {new Date(entry.createdAt).toLocaleDateString(locale, {
                                                year: "numeric", month: "short", day: "numeric",
                                                hour: "2-digit", minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onRemove(index)}
                                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line pl-11">
                                {entry.content}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
