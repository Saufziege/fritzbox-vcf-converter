import { useTranslation } from "react-i18next";

type ErrorMessageProps = {
    errorMessage: string;
};

export default function ErrorMessage({ errorMessage }: ErrorMessageProps) {
    const { t } = useTranslation();
    return (
        <div className="mt-6 p-4 bg-red-900/90 text-white border border-red-500 rounded-lg">
            <p>
                <strong>{t("errors.label")}</strong> {errorMessage}
            </p>
        </div>
    );
}