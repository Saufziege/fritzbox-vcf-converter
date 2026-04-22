import { useState } from "react";
import Header from "./components/Header";
import ConvertDirection from "./components/ConvertDirection";
import UploadBox from "./components/UploadBox";
import FileContent from "./components/FileContent";
import ErrorMessage from "./components/ErrorMessage";
import { fritzXmlToVcf, vcfToFritzXml } from "./utils/converters";

function App() {
    const [direction, setDirection] = useState<"fritz-to-vcf" | "vcf-to-fritz">("fritz-to-vcf");
    const [inputText, setInputText] = useState("");
    const [outputText, setOutputText] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [areaCode, setAreaCode] = useState("");
    const [countryCode, setCountryCode] = useState("");

    const handleFileLoaded = (content: string) => {
        setInputText(content);
        setErrorMessage("");
        setOutputText("");
    };

    const handleConversion = () => {
        try {
            setErrorMessage("");
            if (direction === "fritz-to-vcf") {
                const result = fritzXmlToVcf(inputText);
                setOutputText(result);
            } else {
                const result = vcfToFritzXml(inputText, { areaCode, countryCode });
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
                    <ConvertDirection direction={direction} onDirectionChange={setDirection} />

                    <UploadBox onFileLoaded={handleFileLoaded} />

                    <FileContent
                        direction={direction}
                        inputText={inputText}
                        onInputChange={setInputText}
                        onConvert={handleConversion}
                        outputText={outputText}
                        onDownload={handleDownload}
                    />

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

                    {errorMessage && <ErrorMessage errorMessage={errorMessage} />}
                </main>
            </div>
        </div>
    );
}

export default App;
