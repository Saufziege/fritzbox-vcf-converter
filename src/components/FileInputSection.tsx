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
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-100">Eingabe</h2>
            <textarea
                className="w-full h-64 p-4 bg-slate-900/80 border-2 border-slate-700/80 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300"
                value={inputText}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder={
                    direction === "fritz-to-vcf"
                        ? "Fügen Sie hier den Inhalt Ihrer FritzBox XML-Datei ein."
                        : "Fügen Sie hier den Inhalt Ihrer vCard-Datei (.vcf) ein."
                }
            />
            <div className="mt-4">
                <button
                    onClick={onConvert}
                    className="btn btn-primary w-full text-lg font-semibold px-8 py-3 transition-transform transform hover:scale-105"
                >
                    Konvertieren
                </button>
            </div>
        </div>
    );
}