import { useMemo, useState, type ReactNode } from "react";
import { dict, interpolate, type Language } from "./dict";
import { I18nContext, type I18nCtx } from "./context";

export function I18nProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Language>(() => {
        const raw = (localStorage.getItem("lorekeeper:lang") || "").toLowerCase();
        return raw === "en" ? "en" : "es";
    });

    const setLang = (next: Language) => {
        setLangState(next);
        try {
            localStorage.setItem("lorekeeper:lang", next);
        } catch {
            // ignore storage errors
        }
    };

    const value = useMemo<I18nCtx>(() => {
        return {
            lang,
            setLang,
            t: (key, vars) => {
                const v = dict[lang]?.[key] ?? dict.en[key] ?? key;
                return interpolate(v, vars);
            },
        };
    }, [lang]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
