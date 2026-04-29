import { useTranslation } from "react-i18next";
import { useState } from "react";
import ContactPreviewList from "./ContactPreviewList";
import { parseFritzXml, parseVCardContacts } from "../utils/converters";

type ViewMode = "raw" | "preview";

type FileInputSectionProps = {
    direction: "fritz-to-vcf" | "vcf-to-fritz";
    inputText: string;
    onInputChange: (text: string) => void;
    onConvert: () => void;
};

const ViewToggle = ({ viewMode, setViewMode }: { viewMode: ViewMode, setViewMode: (mode: ViewMode) => void }) => {
    const { t } = useTranslation();
    return (
        <div className="flex rounded-lg bg-slate-900/80 p-1 border border-slate-700/80 mb-2 w-min">
            <button
                onClick={() => setViewMode('raw')}
                className={`px-3 py-1 text-sm font-medium transition-colors duration-200 rounded-md ${viewMode === 'raw' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
                {t('preview.raw')}
            </button>
            <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 text-sm font-medium transition-colors duration-200 rounded-md ${viewMode === 'preview' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
                {t('preview.preview')}
            </button>
        </div>
    );
};

export default function FileInputSection({
    direction,
    inputText,
    onInputChange,
    onConvert,
}: FileInputSectionProps) {
    const { t } = useTranslation();
    const [viewMode, setViewMode] = useState<ViewMode>('preview');

    const renderPreview = () => {
        if (!inputText) {
            return <p className="text-slate-400 h-64 flex items-center justify-center">{t('preview.noContacts')}</p>;
        }
        try {
            const contacts = direction === 'fritz-to-vcf' ? parseFritzXml(inputText) : parseVCardContacts(inputText);
            return <ContactPreviewList contacts={contacts} direction={direction} />;
        } catch {
            return <p className="text-red-400 h-64 flex items-center justify-center">{t('preview.parsingError')}</p>;
        }
    };

    return (
        <div className="space-y-4 flex flex-col h-full min-h-0">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-slate-100">{t("fileInput.title")}</h2>
                <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>
            {viewMode === 'raw' ? (
                <textarea
                    className="w-full flex-1 min-h-16rem max-h-96 p-4 bg-slate-900/80 border-2 border-slate-700/80 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300"
                    value={inputText}
                    onChange={(e) => onInputChange(e.target.value)}
                    placeholder={
                        direction === "fritz-to-vcf"
                            ? t("fileInput.placeholderFritz")
                            : t("fileInput.placeholderVCard")
                    }
                />
            ) : (
                <div className="w-full flex-1 min-h-16rem max-h-96 p-4 bg-slate-900/80 border-2 border-slate-700/80 rounded-lg text-slate-100 min-h-0">
                    {renderPreview()}
                </div>
            )}
            <div className="mt-4">
                <button
                    onClick={onConvert}
                    className="btn btn-primary w-full text-lg font-semibold px-8 py-3 transition-transform transform hover:scale-105"
                >
                    {t("fileInput.convertButton")}
                </button>
            </div>
        </div>
    );
}