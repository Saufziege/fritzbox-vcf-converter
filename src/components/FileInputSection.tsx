import { useTranslation } from "react-i18next";

type FileInputSectionProps = {
    direction: "fritz-to-vcf" | "vcf-to-fritz";
    inputText: string;
    onInputChange: (text: string) => void;
    onConvert: () => void;
};

export default function FileInputSection({
    direction,
    inputText,
    onInputChange,
    onConvert,
}: FileInputSectionProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-100">{t("fileInput.title")}</h2>
            <textarea
                className="w-full h-64 p-4 bg-slate-900/80 border-2 border-slate-700/80 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300"
                value={inputText}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder={
                    direction === "fritz-to-vcf"
                        ? t("fileInput.placeholderFritz")
                        : t("fileInput.placeholderVCard")
                }
            />
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