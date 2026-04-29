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
    mergeDuplicates?: boolean;
    onMergeDuplicatesChange?: (value: boolean) => void;
    removeDuplicatePhones?: boolean;
    onRemoveDuplicatePhonesChange?: (value: boolean) => void;
    filterNoPhone?: boolean;
    onFilterNoPhoneChange?: (value: boolean) => void;
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
    mergeDuplicates,
    onMergeDuplicatesChange,
    removeDuplicatePhones,
    onRemoveDuplicatePhonesChange,
    filterNoPhone,
    onFilterNoPhoneChange,
}: FileContentProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {direction === "vcf-to-fritz" && onAreaCodeChange && onCountryCodeChange && onMergeDuplicatesChange && onRemoveDuplicatePhonesChange && onFilterNoPhoneChange && (
                <div className="md:col-span-2">
                    <VcfToFritzOptions
                        areaCode={areaCode ?? ""}
                        countryCode={countryCode ?? ""}
                        onAreaCodeChange={onAreaCodeChange}
                        onCountryCodeChange={onCountryCodeChange}
                        mergeDuplicates={mergeDuplicates ?? false}
                        onMergeDuplicatesChange={onMergeDuplicatesChange}
                        removeDuplicatePhones={removeDuplicatePhones ?? false}
                        onRemoveDuplicatePhonesChange={onRemoveDuplicatePhonesChange}
                        filterNoPhone={filterNoPhone ?? false}
                        onFilterNoPhoneChange={onFilterNoPhoneChange}
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