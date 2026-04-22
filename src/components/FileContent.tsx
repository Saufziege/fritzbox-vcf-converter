import FileInputSection from "./FileInputSection";
import FileOutputSection from "./FileOutputSection";

type FileContentProps = {
    direction: "fritz-to-vcf" | "vcf-to-fritz";
    inputText: string;
    onInputChange: (text: string) => void;
    onConvert: () => void;
    outputText: string;
    onDownload: () => void;
};

export default function FileContent({
    direction,
    inputText,
    onInputChange,
    onConvert,
    outputText,
    onDownload,
}: FileContentProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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