import FileInputSection from "./FileInputSection";
import FileOutputSection from "./FileOutputSection";
import VcfToFritzOptions from "./VcfToFritzOptions";

type FileContentProps = {
    direction: "fritz-to-vcf" | "vcf-to-fritz";
    inputText: string;
    onInputChange: (text: string) => void;
    onConvert: () => void;
    outputText: string;
    onDownload: () => void;
    areaCode?: string;
    countryCode?: string;
    onAreaCodeChange?: (value: string) => void;
    onCountryCodeChange?: (value: string) => void;
};

export default function FileContent({
    direction,
    inputText,
    onInputChange,
    onConvert,
    outputText,
    onDownload,
    areaCode,
    countryCode,
    onAreaCodeChange,
    onCountryCodeChange,
}: FileContentProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {direction === "vcf-to-fritz" && onAreaCodeChange && onCountryCodeChange && (
                <div className="md:col-span-2">
                    <VcfToFritzOptions
                        areaCode={areaCode ?? ""}
                        countryCode={countryCode ?? ""}
                        onAreaCodeChange={onAreaCodeChange}
                        onCountryCodeChange={onCountryCodeChange}
                    />
                </div>
            )}
            <FileInputSection
                direction={direction}
                inputText={inputText}
                onInputChange={onInputChange}
                onConvert={onConvert}
            />
            <FileOutputSection outputText={outputText} onDownload={onDownload} />
        </div>
    );
}