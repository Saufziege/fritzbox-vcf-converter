import React from 'react';

interface HeaderProps {
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  return (
    <header className="pt-8 pb-6 text-center border-b-2 border-slate-700/80">
      <div className="container mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 tracking-wider">
          vcf ⇄ FritzBox XML Konverter
        </h1>
        <p className="mt-3 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
          Konvertieren Sie Ihre Kontakte schnell und einfach zwischen dem vCard-Format (.vcf) und dem
          FritzBox-Telefonbuchformat (.xml).
        </p>
        {children}
      </div>
    </header>
  );
};

export default Header;