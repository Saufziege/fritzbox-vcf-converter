import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

type UploadBoxProps = {
    onFileLoaded: (content: string) => void;
};

export default function UploadBox({ onFileLoaded }: UploadBoxProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [fileName, setFileName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const loadFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            onFileLoaded(content);
            setFileName(file.name);
            setErrorMessage("");
        };
        reader.onerror = () => {
            setErrorMessage("Fehler beim Lesen der Datei.");
        };
        reader.readAsText(file);
    };

    const onDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        setIsDragActive(true);
    };

    const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragActive(false);
    };

    const onDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragActive(false);
        const file = event.dataTransfer.files?.[0];
        if (file) {
            loadFile(file);
        }
    };

    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            loadFile(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
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
                {errorMessage && <div className="text-sm mb-3 text-red-400">{errorMessage}</div>}
                {fileName ? (
                    <>
                        <div className="font-medium text-slate-100">Datei geladen: {fileName}</div>
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
    );
}