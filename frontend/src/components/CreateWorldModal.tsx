import { useState, useRef } from "react";
import { X, Sparkles, Upload, Trash2 } from "lucide-react";
import { useI18n } from "../i18n/useI18n";

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (name: string, description: string, image: string) => Promise<void>;
}

export default function CreateWorldModal({ open, onClose, onSubmit }: Props) {
    const { t } = useI18n();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [loading, setLoading] = useState(false);
    const [fileError, setFileError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!open) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setFileError(t("modal.imageUnder5mb"));
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setImage(reader.result as string);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImage("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onSubmit(name, description, image);
            setName("");
            setDescription("");
            setImage("");
            if (fileInputRef.current) fileInputRef.current.value = "";
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            {/* Modal */}
            <div
                className="relative rounded-2xl p-8 w-full max-w-lg shadow-2xl shadow-black/50"
                style={{
                    background: "linear-gradient(160deg, #1a1207, #111827 30%, #0d1321)",
                    border: "1px solid rgba(217, 119, 6, 0.2)",
                }}
            >
                {fileError && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/60" onClick={() => setFileError("")} />
                        <div className="panel-soft relative rounded-xl p-6 max-w-sm w-full text-center">
                            <h3 className="text-white font-bold mb-2">Upload Error</h3>
                            <h3 className="text-white font-bold mb-2">{t("modal.uploadError")}</h3>
                            <p className="text-gray-400 text-sm mb-5">{fileError}</p>
                            <button
                                onClick={() => setFileError("")}
                                className="btn-primary px-6 py-2 text-sm"
                            >
                                {t("modal.ok")}
                            </button>
                        </div>
                    </div>
                )}
                {/* Top glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent rounded-full" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition p-1"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-white text-lg font-bold">{t("modal.createNewProject")}</h2>
                        <p className="text-gray-500 text-xs">{t("modal.startStoryworld")}</p>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-5">
                    <div>
                        <label className="text-gray-300 text-xs uppercase tracking-wider mb-1.5 block font-medium">
                            {t("modal.projectTitle")}
                        </label>
                        <input
                            type="text"
                            placeholder={t("modal.projectTitlePlaceholder")}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-[#34373b] border border-amber-500/20 text-white w-full p-3.5 rounded-xl placeholder-gray-500 transition focus:border-amber-500/50"
                        />
                    </div>

                    <div>
                        <label className="text-gray-300 text-xs uppercase tracking-wider mb-1.5 block font-medium">
                            {t("modal.synopsis")}
                        </label>
                        <textarea
                            placeholder={t("modal.synopsisPlaceholder")}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="bg-[#34373b] border border-amber-500/20 text-white w-full p-3.5 rounded-xl placeholder-gray-500 transition resize-none focus:border-amber-500/50"
                        />
                    </div>

                    <div>
                        <label className="text-gray-300 text-xs uppercase tracking-wider mb-1.5 block font-medium">
                            {t("modal.coverImage")}
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {image ? (
                            <div className="relative rounded-xl overflow-hidden border border-gray-700/50">
                                <img src={image} alt={t("modal.previewAlt")} className="w-full h-40 object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                <button
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-gray-300 hover:text-red-400 transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-32 border-2 border-dashed border-gray-700/40 rounded-xl flex flex-col items-center justify-center gap-2.5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-300 group cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-800/80 flex items-center justify-center group-hover:bg-amber-500/15 transition">
                                    <Upload className="w-5 h-5 text-gray-500 group-hover:text-amber-400 transition" />
                                </div>
                                <div className="text-center">
                                    <span className="text-gray-400 text-sm block group-hover:text-gray-300 transition">
                                        {t("modal.clickUpload")}
                                    </span>
                                    <span className="text-gray-600 text-xs">{t("modal.fileHint")}</span>
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600 font-medium p-3 rounded-xl transition"
                    >
                        {t("modal.cancel")}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !name}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold p-3 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 disabled:shadow-none"
                    >
                        {loading ? t("modal.creating") : t("modal.create")}
                    </button>
                </div>
            </div>
        </div>
    );
}
