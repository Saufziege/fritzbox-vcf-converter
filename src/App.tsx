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
                        areaCode={areaCode}
                        countryCode={countryCode}
                        onAreaCodeChange={setAreaCode}
                        onCountryCodeChange={setCountryCode}
                    />

                    {errorMessage && <ErrorMessage errorMessage={errorMessage} />}
                </main>
            </div>
        </div>
    );
}

export default App;
