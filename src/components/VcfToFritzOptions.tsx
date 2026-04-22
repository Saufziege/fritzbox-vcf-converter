type VcfToFritzOptionsProps = {
    areaCode: string;
    countryCode: string;
    onAreaCodeChange: (value: string) => void;
    onCountryCodeChange: (value: string) => void;
};

export default function VcfToFritzOptions({
    areaCode,
    countryCode,
    onAreaCodeChange,
    onCountryCodeChange,
}: VcfToFritzOptionsProps) {
    return (
        <div className="mt-8 p-6 bg-slate-900/80 border-2 border-slate-700/80 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-slate-100">Optionen für vCard → FritzBox</h3>
            <div className="flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Landesvorwahl (z.B. 49)"
                    value={countryCode}
                    onChange={(e) => onCountryCodeChange(e.target.value)}
                    className="flex-1 p-3 bg-slate-900/80 border-2 border-slate-700/80 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300"
                />
                <input
                    type="text"
                    placeholder="Ortsvorwahl (z.B. 30)"
                    value={areaCode}
                    onChange={(e) => onAreaCodeChange(e.target.value)}
                    className="flex-1 p-3 bg-slate-900/80 border-2 border-slate-700/80 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300"
                />
            </div>
            <p className="mt-3 text-sm text-slate-300">
                Beim Eingeben einer Landes- oder Ortsvorwahl werden Zahlen in den vCards, die noch keine Vorwahl haben, damit ergänzt.
            </p>
        </div>
    );
}