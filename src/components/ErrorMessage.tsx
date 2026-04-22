type ErrorMessageProps = {
    errorMessage: string;
};

export default function ErrorMessage({ errorMessage }: ErrorMessageProps) {
    return (
        <div className="mt-6 p-4 bg-red-900/90 text-white border border-red-500 rounded-lg">
            <p>
                <strong>Fehler:</strong> {errorMessage}
            </p>
        </div>
    );
}