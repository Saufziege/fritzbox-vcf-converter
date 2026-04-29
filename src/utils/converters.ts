export type FritzTelephonyType = 'home' | 'work' | 'fax_work' | 'mobile' | ''

export interface FritzTelephonyNumber {
    type: FritzTelephonyType
    value: string
}

export interface FritzContact {
    realName: string
    numbers: FritzTelephonyNumber[]
    emails: string[]
}

export interface VCardPhone {
    types: string[]
    value: string
}

export interface VCardContact {
    fullName: string
    firstName: string
    lastName: string
    emails: string[]
    phones: VCardPhone[]
}

const fritzToVCardTypeMap: Record<FritzTelephonyType, string> = {
    home: 'HOME',
    work: 'WORK',
    fax_work: 'WORK,FAX',
    mobile: 'CELL',
    '': 'VOICE',
}

function mapVCardTypesToFritzType(types: string[]): FritzTelephonyType {
    const normalized = types.map((type) => type.toLowerCase())
    if (normalized.includes('fax') || normalized.includes('fax_work')) {
        return 'fax_work'
    }
    if (normalized.includes('cell') || normalized.includes('mobile')) {
        return 'mobile'
    }
    if (normalized.includes('home')) {
        return 'home'
    }
    if (normalized.includes('work')) {
        return 'work'
    }
    return ''
}

function normalizeText(input: string): string {
    return input.trim()
}

function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

function normalizePhone(value: string): string {
    return value.replace(/[()\s-]/g, '').trim()
}

function needsAreaCode(number: string): boolean {
    return /^[1-9]\d+$/.test(number)
}

function needsCountryCode(number: string): boolean {
    return /^[0-9][1-9]\d+$/.test(number)
}

function formatPhoneNumber(
    rawNumber: string,
    areaCode?: string,
    countryCode?: string,
): string {
    const cleaned = normalizePhone(rawNumber)
    if (!cleaned) {
        return rawNumber.trim()
    }

    let number = cleaned
    const hasPlus = /^\+/.test(number)
    if (hasPlus) {
        return number
    }

    const normalizedArea = normalizeText(areaCode || '')
    const normalizedCountry = normalizeText(countryCode || '')

    if (
        normalizedCountry &&
        needsCountryCode(number) &&
        (normalizedArea || !needsAreaCode(number))
    ) {
        number = number.replace(/^0+/, '')
        return `+${normalizedCountry} ${normalizedArea ? `${normalizedArea} ` : ''}${number}`.trim()
    }

    if (normalizedArea && needsAreaCode(number)) {
        return `${normalizedArea} ${number}`.trim()
    }

    return number
}

function decodeQuotedPrintable(input: string, charset: string = 'utf-8'): string {
    // 1. Remove soft line breaks (equals sign at end of line)
    const folded = input.replace(/=\r?\n/g, '');

    // 2. Extract hex values into a byte array
    const bytes: number[] = [];
    for (let i = 0; i < folded.length; i++) {
        if (folded[i] === '=' && i + 2 < folded.length) {
            const hex = folded.substring(i + 1, i + 3);
            bytes.push(parseInt(hex, 16));
            i += 2;
        } else {
            bytes.push(folded.charCodeAt(i));
        }
    }

    // 3. Decode to UTF-8 (or other charset) using TextDecoder
    return new TextDecoder(charset).decode(new Uint8Array(bytes));
}

export function parseFritzXml(xmlString: string): FritzContact[] {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlString, 'application/xml')
    const parserError = doc.querySelector('parsererror')
    if (parserError) {
        throw new Error('errors.invalidFritzXml')
    }

    const contacts = Array.from(doc.querySelectorAll('phonebook > contact'))
    if (contacts.length === 0) {
        throw new Error('errors.noContactsFound')
    }

    return contacts.map((contact) => {
        const realNameNode = contact.querySelector('person > realName')
        const realName = realNameNode?.textContent?.trim() || ''

        const numbers = Array.from(contact.querySelectorAll('telephony > number')).map((numberNode) => ({
            type: (numberNode.getAttribute('type') || '') as FritzTelephonyType,
            value: numberNode.textContent?.trim() || '',
        }))

        const emailNodes = Array.from(contact.querySelectorAll('services > email'))
        const emails = emailNodes
            .map((emailNode) => {
                const dataNode = emailNode.querySelector('_Data')
                return dataNode?.textContent?.trim() || emailNode.textContent?.trim() || ''
            })
            .filter(Boolean)

        return { realName, numbers, emails }
    })
}

export function fritzXmlToVcf(
    xmlString: string,
    areaCode?: string,
    countryCode?: string,
): string {
    const contacts = parseFritzXml(xmlString)
    const lines: string[] = []

    for (const contact of contacts) {
        const [lastName, ...firstParts] = contact.realName.split(',')
        const firstName = firstParts.join(',').trim()
        const displayName = contact.realName.trim()

        lines.push('BEGIN:VCARD')
        lines.push('VERSION:3.0')
        lines.push(`N:${escapeXml(lastName.trim())};${escapeXml(firstName)};;;`)
        lines.push(`FN:${escapeXml(displayName)}`)

        for (const number of contact.numbers) {
            const type = fritzToVCardTypeMap[number.type]
            const formatted = formatPhoneNumber(number.value, areaCode, countryCode)
            lines.push(`TEL;TYPE=${type}:${escapeXml(formatted)}`)
        }

        for (const email of contact.emails) {
            lines.push(`EMAIL;TYPE=INTERNET:${escapeXml(email)}`)
        }

        lines.push('END:VCARD')
    }

    return lines.join('\r\n')
}

function parseVCardLines(vcfText: string): string[] {
    const rawLines = vcfText.replace(/\r\n/g, '\n').split('\n')
    const unfolded: string[] = []

    for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i]

        // 1. Standard-Unfolding (indented continuation lines)
        if (/^[ \t]/.test(line) && unfolded.length > 0) {
            unfolded[unfolded.length - 1] += line.substring(1)
            continue
        }

        // 2. Quoted-Printable Soft Break Unfolding (line ends with '=')
        // Check if the line ends with '=' AND Quoted-Printable is active
        if (line.endsWith('=') && i + 1 < rawLines.length) {
            let combinedLine = line
            // As long as the line ends with '=', merge the next line
            while (combinedLine.endsWith('=') && i + 1 < rawLines.length) {
                combinedLine = combinedLine.slice(0, -1) + rawLines[++i].trimStart()
            }
            unfolded.push(combinedLine)
        } else {
            unfolded.push(line)
        }
    }

    return unfolded.filter((line) => line.length > 0)
}

function parseVCardBlock(block: string): VCardContact | null {
    const lines = parseVCardLines(block)
    const contact: VCardContact = {
        fullName: '',
        firstName: '',
        lastName: '',
        emails: [],
        phones: [],
    }

    for (const line of lines) {
        const [keyPart, ...valueParts] = line.split(':')
        if (!valueParts.length) {
            continue
        }

        let value = valueParts.join(':').trim()
        const [property, ...parameterParts] = keyPart.split(';')
        const propName = property.toUpperCase().trim()
        const rawParams = parameterParts.join(';')

        if (rawParams.includes('ENCODING=QUOTED-PRINTABLE')) {
            const charsetMatch = rawParams.match(/CHARSET=([^;]+)/);
            const charset = charsetMatch ? charsetMatch[1].toLowerCase() : 'utf-8';
            value = decodeQuotedPrintable(value, charset);
        }

        value = unescapeVCardValue(value);

        if (propName === 'FN') {
            contact.fullName = value
        }

        if (propName === 'N') {
            const [last, first] = value.split(';')
            contact.lastName = (last || '').trim()
            contact.firstName = (first || '').trim()
            if (!contact.fullName) {
                contact.fullName = `${contact.firstName} ${contact.lastName}`.trim()
            }
        }

        if (propName === 'EMAIL') {
            if (value) {
                contact.emails.push(value)
            }
        }

        if (propName === 'TEL') {
            const types: string[] = []
            const paramParts = rawParams.split(';')
            for (const param of paramParts) {
                const [paramName, paramValue] = param.split('=')
                if (!paramValue) {
                    continue
                }
                if (paramName.toLowerCase() === 'type') {
                    types.push(...paramValue.split(',').map((token) => token.trim().toLowerCase()))
                }
            }

            contact.phones.push({
                types,
                value,
            })
        }
    }

    if (!contact.fullName) {
        contact.fullName = 'Unnamed'
    }

    return contact
}

// Merge contacts with the same name
function mergeContacts(contacts: VCardContact[]): VCardContact[] {
    const mergedMap = new Map<string, VCardContact>();

    for (const contact of contacts) {
        // Create a robust key by removing commas and spaces
        const key = unescapeVCardValue(contact.fullName)
            .replace(/[,;]/g, ' ') // Replace punctuation with spaces
            .replace(/\s+/g, ' ') // Collapse multiple spaces
            .toLowerCase()
            .trim();

        if (mergedMap.has(key)) {
            const existing = mergedMap.get(key)!;

            // Merge emails, ensuring uniqueness
            existing.emails = Array.from(new Set([...existing.emails, ...contact.emails]));

            // Merge phones, assuming they are already unique within each contact
            contact.phones.forEach(newPhone => {
                const isDuplicate = existing.phones.some(
                    p => getComparableNumber(p.value) === getComparableNumber(newPhone.value)
                );
                if (!isDuplicate) {
                    existing.phones.push(newPhone);
                }
            });
        } else {
            // First time seeing this contact, just add it
            mergedMap.set(key, { ...contact });
        }
    }

    return Array.from(mergedMap.values());
}

// Cleans up contacts by removing duplicate phone numbers and optionally filtering out contacts without any phones.
function cleanupContacts(
    contacts: VCardContact[],
    options: { removeDuplicatePhones?: boolean; filterIfNoPhones?: boolean },
): VCardContact[] {
    let cleaned = contacts;

    if (options.removeDuplicatePhones) {
        cleaned = cleaned.map(contact => {
            const uniquePhones: VCardPhone[] = [];
            contact.phones.forEach(phone => {
                const isInternalDup = uniquePhones.some(
                    up => getComparableNumber(up.value) === getComparableNumber(phone.value)
                );
                if (!isInternalDup) {
                    uniquePhones.push(phone);
                }
            });
            return { ...contact, phones: uniquePhones };
        });
    }

    if (options.filterIfNoPhones) {
        return cleaned.filter(contact => contact.phones.length > 0);
    }

    return cleaned;
}

// Helper to make numbers comparable in mergeContacts
function getComparableNumber(num: string): string {
    return normalizePhone(num).replace(/^\+49/, '0').replace(/^0049/, '0');
}

// Add this helper to clean VCF escape characters
function unescapeVCardValue(value: string): string {
    return value.replace(/\\/g, ''); // Removes all backslashes like in "\;" or "\,"
}

export function parseVCardContacts(vcfText: string): VCardContact[] {
    const contacts = vcfText
        .split('BEGIN:VCARD')
        .map((block) => (block.trim() ? parseVCardBlock(`BEGIN:VCARD\n${block}`) : null))
        .filter((c): c is VCardContact => !!c)

    if (contacts.length === 0) {
        throw new Error('errors.noValidVCardContacts')
    }

    return contacts
}

export function vcfToFritzXml(
    vcfText: string,
    options?: { areaCode?: string; countryCode?: string, mergeDuplicates?: boolean, removeDuplicatePhones?: boolean, filterNoPhone?: boolean },
): string {
    let contacts = parseVCardContacts(vcfText)

    // 1. Clean up individual contacts (remove duplicate numbers, filter contacts without numbers)
    contacts = cleanupContacts(contacts, {
        removeDuplicatePhones: !!options?.removeDuplicatePhones,
        filterIfNoPhones: !!options?.filterNoPhone
    });

    // 2. Merge contacts with the same name if requested
    if (options?.mergeDuplicates) {
        contacts = mergeContacts(contacts);
    }

    const xmlLines: string[] = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<phonebooks>',
        '  <phonebook name="Telefonbuch">',
    ]

    for (const contact of contacts) {
        const realName = (contact.lastName && contact.firstName)
            ? `${contact.lastName}, ${contact.firstName}`
            : contact.fullName;

        const cleanedName = unescapeVCardValue(realName)
            .replace(/[;,]/g, ' ')       // Replace semicolons AND commas with a space
            .replace(/\s+/g, ' ')       // Collapse multiple spaces into one
            .trim();

        xmlLines.push('    <contact>')
        xmlLines.push('      <person>')
        xmlLines.push(`        <realName>${escapeXml(cleanedName)}</realName>`)
        xmlLines.push('      </person>')
        xmlLines.push('      <telephony>')

        for (const phone of contact.phones) {
            const type = mapVCardTypesToFritzType(phone.types)
            const formatted = formatPhoneNumber(
                phone.value,
                options?.areaCode,
                options?.countryCode,
            )
            xmlLines.push(`        <number type="${type}">${escapeXml(formatted)}</number>`)
        }

        xmlLines.push('      </telephony>')
        xmlLines.push('      <services>')

        for (const email of contact.emails) {
            xmlLines.push(`        <email>${escapeXml(email)}</email>`)
        }

        xmlLines.push('      </services>')
        xmlLines.push('    </contact>')
    }

    xmlLines.push('  </phonebook>')
    xmlLines.push('</phonebooks>')

    return xmlLines.join('\n')
}

