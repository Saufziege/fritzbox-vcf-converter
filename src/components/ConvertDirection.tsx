import { useTranslation } from 'react-i18next';

type ConvertDirectionProps = {
    direction: "fritz-to-vcf" | "vcf-to-fritz";
    onDirectionChange: (direction: "fritz-to-vcf" | "vcf-to-fritz") => void;
};

export default function ConvertDirection({ direction, onDirectionChange }: ConvertDirectionProps) {
    const { t } = useTranslation();

    return (
        <div className="flex justify-center mb-8">
            <div className="flex rounded-lg bg-slate-900/80 p-1 border border-slate-700/80">
                <button
                    onClick={() => onDirectionChange("fritz-to-vcf")}
                    className={`btn text-sm font-medium ${
                        direction === "fritz-to-vcf" ? "btn-active" : "btn-secondary"
                    }`}
                >
                    {t('navigation.fritzToVcf')}
                </button>
                <button
                    onClick={() => onDirectionChange("vcf-to-fritz")}
                    className={`btn text-sm font-medium ${
                        direction === "vcf-to-fritz" ? "btn-active" : "btn-secondary"
                    }`}
                >
                    {t('navigation.vcfToFritz')}
                </button>
            </div>
        </div>
    );
}