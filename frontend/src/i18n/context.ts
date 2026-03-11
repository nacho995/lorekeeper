import { createContext } from "react";
import type { Language } from "./dict";

export type I18nCtx = {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string, vars?: Record<string, string | number>) => string;
};

export const I18nContext = createContext<I18nCtx | null>(null);
