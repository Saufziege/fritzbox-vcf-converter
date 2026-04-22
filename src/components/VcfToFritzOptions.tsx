import { useTranslation } from "react-i18next";

type VcfToFritzOptionsProps = {
    areaCode: string;
    countryCode: string;
    onAreaCodeChange: (value: string) => void;
    onCountryCodeChange: (value: string) => void;
};

export default function VcfToFritzOptions({
    areaCode,
    countryCode,
    onAreaCodeChange,
    onCountryCodeChange,
}: VcfToFritzOptionsProps) {
    const { t } = useTranslation();

    return (
        <div className="mt-8 p-6 bg-slate-900/80 border-2 border-slate-700/80 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-slate-100">{t("options.title")}</h3>
            <div className="flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder={t("options.countryPlaceholder")}
                    value={countryCode}
                    onChange={(e) => onCountryCodeChange(e.target.value)}
                    className="flex-1 p-3 bg-slate-900/80 border-2 border-slate-700/80 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300"
                />
                <input
                    type="text"
                    placeholder={t("options.areaPlaceholder")}
                    value={areaCode}
                    onChange={(e) => onAreaCodeChange(e.target.value)}
                    className="flex-1 p-3 bg-slate-900/80 border-2 border-slate-700/80 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300"
                />
            </div>
            <p className="mt-3 text-sm text-slate-300">
                {t("options.hint")}
            </p>
        </div>
    );
}