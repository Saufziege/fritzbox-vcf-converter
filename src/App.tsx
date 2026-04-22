import { useRef, useState } from "react";
import Header from "./components/Header";
import { fritzXmlToVcf, vcfToFritzXml } from "./utils/converters";

function App() {
    const [direction, setDirection] = useState<"fritz-to-vcf" | "vcf-to-fritz">("fritz-to-vcf");
    const [inputText, setInputText] = useState("");
    const [outputText, setOutputText] = useState("");
    const [areaCode, setAreaCode] = useState("");
    const [countryCode, setCountryCode] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleConversion = () => {
        try {
            setErrorMessage("");
            if (direction === "fritz-to-vcf") {
                const result = fritzXmlToVcf(inputText);
                setOutputText(result);
            } else {
                const result = vcfToFritzXml(inputText);
                setOutputText(result);
            }
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("Ein unbekannter Fehler ist aufgetreten.");
            }
            setOutputText("");
        }
    };

    const loadFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setInputText(content);
        };
        reader.onerror = () => {
            setErrorMessage("Fehler beim Lesen der Datei.");
        };
        reader.readAsText(file);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            loadFile(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        setIsDragActive(true);
    };

    const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragActive(false);
    };

    const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragActive(false);
        const file = event.dataTransfer.files?.[0];
        if (file) {
            loadFile(file);
        }
    };

    const handleDownload = () => {
        const blob = new Blob([outputText], { type: direction === "fritz-to-vcf" ? "text/vcard" : "application/xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = direction === "fritz-to-vcf" ? "phonebook.vcf" : "phonebook.xml";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-slate-950/70 rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-xs">
                <Header />
                <main className="p-6 md:p-8">
                    <div className="flex justify-center mb-8">
                        <div className="flex rounded-lg bg-slate-900/80 p-1 border border-slate-700/80">
                            <button
                                onClick={() => setDirection("fritz-to-vcf")}
                                className={`btn text-sm font-medium ${
                                    direction === "fritz-to-vcf" ? "btn-active" : "btn-secondary"
                                }`}
                            >
                                FritzBox → vCard
                            </button>
                            <button
                                onClick={() => setDirection("vcf-to-fritz")}
                                className={`btn text-sm font-medium ${
                                    direction === "vcf-to-fritz" ? "btn-active" : "btn-secondary"
                                }`}
                            >
                                vCard → FritzBox
                            </button>
                        </div>
                    </div>

                    <div
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragEnter={onDragOver}
                        onDragLeave={onDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full p-6 rounded-lg transition-all duration-150 cursor-pointer select-none mb-8 ${
                            isDragActive
                                ? "border-4 border-dashed border-sky-400 bg-slate-800/70"
                                : "border-2 border-dashed border-slate-700/80 bg-slate-900/60"
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xml,.vcf,text/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <div className="text-center text-slate-300">
                            {inputText ? (
                                <>
                                    <div className="font-medium text-slate-100">Datei geladen</div>
                                    <div className="text-sm mt-2 text-slate-400">
                                        Klicke hier oder ziehe eine neue Datei hinein, um sie zu ersetzen.
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="font-medium text-slate-100">
                                        Datei hierher ziehen oder klicken
                                    </div>
                                    <div className="text-sm mt-2 text-slate-400">
                                        Unterstützte Formate: .xml, .vcf oder Textdateien
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Input Section */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold text-slate-100">Eingabe</h2>
                            <textarea
                                className="w-full h-64 p-4 bg-slate-900/80 border-2 border-slate-700/80 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={
                                    direction === "fritz-to-vcf"
                                        ? "Fügen Sie hier den Inhalt Ihrer FritzBox XML-Datei ein."
                                        : "Fügen Sie hier den Inhalt Ihrer vCard-Datei (.vcf) ein."
                                }
                            />
                            <div className="mt-4">
                                <button
                                    onClick={handleConversion}
                                    className="btn btn-primary w-full text-lg font-semibold px-8 py-3 transition-transform transform hover:scale-105"
                                >
                                    Konvertieren
                                </button>
                            </div>
                        </div>

                        {/* Output Section */}
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
                                        onClick={handleDownload}
                                        className="btn btn-primary w-full text-lg font-semibold px-8 py-3 transition-transform transform hover:scale-105"
                                    >
                                        Herunterladen
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {direction === "vcf-to-fritz" && (
                        <div className="mt-8 p-6 bg-slate-900/80 border-2 border-slate-700/80 rounded-lg">
                            <h3 className="text-xl font-semibold mb-4 text-slate-100">Optionen für vCard → FritzBox</h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="text"
                                    placeholder="Landesvorwahl (z.B. 49)"
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="flex-1 p-3 bg-slate-900/80 border-2 border-slate-700/80 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300"
                                />
                                <input
                                    type="text"
                                    placeholder="Ortsvorwahl (z.B. 30)"
                                    value={areaCode}
                                    onChange={(e) => setAreaCode(e.target.value)}
                                    className="flex-1 p-3 bg-slate-900/80 border-2 border-slate-700/80 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300"
                                />
                            </div>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="mt-6 p-4 bg-red-900/90 text-white border border-red-500 rounded-lg">
                            <p>
                                <strong>Fehler:</strong> {errorMessage}
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;
