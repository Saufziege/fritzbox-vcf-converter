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

    for (const rawLine of rawLines) {
        if (/^[ \t]/.test(rawLine) && unfolded.length > 0) {
            unfolded[unfolded.length - 1] += rawLine.trim()
        } else {
            unfolded.push(rawLine)
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

        const value = valueParts.join(':').trim()
        const [property, ...parameterParts] = keyPart.split(';')
        const propName = property.toUpperCase().trim()
        const rawParams = parameterParts.join(';')

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
    options?: { areaCode?: string; countryCode?: string },
): string {
    const contacts = parseVCardContacts(vcfText)

    const xmlLines: string[] = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<phonebooks>',
        '  <phonebook name="Telefonbuch">',
    ]

    for (const contact of contacts) {
        const realName = contact.lastName
            ? `${contact.lastName}, ${contact.firstName}`.trim()
            : contact.fullName

        xmlLines.push('    <contact>')
        xmlLines.push('      <person>')
        xmlLines.push(`        <realName>${escapeXml(realName)}</realName>`)
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

