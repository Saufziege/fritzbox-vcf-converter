import React from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

interface HeaderProps {
    children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
    const { t } = useTranslation();

    return (
        <header className="pt-8 pb-6 text-center border-b-2 border-slate-700/80">
            <div className="container mx-auto">
                <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 tracking-wider">{t("header.title")}</h1>
                <p className="mt-3 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">{t("header.description")}</p>
                <LanguageSwitcher />
                {children}
            </div>
        </header>
    );
};

export default Header;
