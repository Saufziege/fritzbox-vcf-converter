import { useTranslation } from "react-i18next";
import { useState } from "react";
import ContactPreviewList from "./ContactPreviewList";
import { parseFritzXml, parseVCardContacts } from "../utils/converters";

type ViewMode = "raw" | "preview";

type FileOutputSectionProps = {
    outputText: string;
    onDownload: () => void;
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


export default function FileOutputSection({ outputText, onDownload }: FileOutputSectionProps) {
    const { t } = useTranslation();
    const [viewMode, setViewMode] = useState<ViewMode>('raw');

    const renderPreview = () => {
        if (!outputText) {
            return <p className="text-slate-400 h-64 flex items-center justify-center">{t('fileOutput.placeholderResult')}</p>;
        }
        try {
            // The direction is reversed for the output
            const contacts = outputText.trim().startsWith('<?xml') ? parseFritzXml(outputText) : parseVCardContacts(outputText);
            return <ContactPreviewList contacts={contacts} direction={outputText.trim().startsWith('<?xml') ? 'vcf-to-fritz' : 'fritz-to-vcf'} />;
        } catch {
            return <p className="text-red-400 h-64 flex items-center justify-center">{t('preview.parsingError')}</p>;
        }
    };

    return (
        <div className="space-y-4 flex flex-col h-full min-h-0">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-slate-100">{t("fileOutput.title")}</h2>
                <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>
            {viewMode === 'raw' ? (
                <textarea
                    className="w-full flex-1 min-h-[16rem] max-h-96 p-4 bg-slate-900/80 border-2 border-slate-700/80 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300"
                    value={outputText}
                    readOnly
                    placeholder={t("fileOutput.placeholderResult")}
                />
            ) : (
                <div className="w-full flex-1 min-h-[16rem] max-h-96 p-4 bg-slate-900/80 border-2 border-slate-700/80 rounded-lg text-slate-100 min-h-0">
                    {renderPreview()}
                </div>
            )}
            {outputText && (
                <div className="mt-4">
                    <button
                        onClick={onDownload}
                        className="btn btn-primary w-full text-lg font-semibold px-8 py-3 transition-transform transform hover:scale-105"
                    >
                        {t("fileOutput.downloadButton")}
                    </button>
                </div>
            )}
        </div>
    );
}