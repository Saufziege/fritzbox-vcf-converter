type FileOutputSectionProps = {
    outputText: string;
    onDownload: () => void;
};

export default function FileOutputSection({ outputText, onDownload }: FileOutputSectionProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-100">Ausgabe</h2>
            <textarea
                className="w-full h-64 p-4 bg-slate-900/80 border-2 border-slate-700/80 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300"
                value={outputText}
                readOnly
                placeholder="Das Ergebnis der Konvertierung wird hier angezeigt."
            />
            {outputText && (
                <div className="mt-4">
                    <button
                        onClick={onDownload}
                        className="btn btn-primary w-full text-lg font-semibold px-8 py-3 transition-transform transform hover:scale-105"
                    >
                        Herunterladen
                    </button>
                </div>
            )}
        </div>
    );
}