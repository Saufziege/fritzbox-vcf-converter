import type { FritzContact, VCardContact } from "../utils/converters";
import { useTranslation } from "react-i18next";

type ContactPreviewListProps = {
    contacts: (VCardContact | FritzContact)[];
    direction: "fritz-to-vcf" | "vcf-to-fritz";
};

const ContactCard = ({ contact }: { contact: VCardContact | FritzContact }) => {
    const { t } = useTranslation();

    const isVCard = 'fullName' in contact;
    const name = isVCard ? contact.fullName : contact.realName;
    const emails = contact.emails;
    const phones = 'phones' in contact ? contact.phones : contact.numbers;

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
            <h3 className="font-bold text-sky-400">{name}</h3>
            <div className="space-y-1">
                {phones.map((phone, index) => (
                    <p key={index} className="text-sm text-slate-300">
                        <span className="font-semibold text-slate-400">{t(`phoneTypes.${'type' in phone ? phone.type : 'default'}`)}:</span> {phone.value}
                    </p>
                ))}
            </div>
            {emails.length > 0 && (
                <div className="space-y-1">
                    {emails.map((email, index) => (
                        <p key={index} className="text-sm text-slate-300">
                            <span className="font-semibold text-slate-400">{t('email')}:</span> {email}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function ContactPreviewList({ contacts }: ContactPreviewListProps) {
    const { t } = useTranslation();

    if (contacts.length === 0) {
        return <p className="text-slate-400">{t('preview.noContacts')}</p>;
    }

    return (
        <div className="space-y-4 h-64 overflow-y-auto p-1">
            {contacts.map((contact, index) => (
                <ContactCard key={index} contact={contact} />
            ))}
        </div>
    );
}
