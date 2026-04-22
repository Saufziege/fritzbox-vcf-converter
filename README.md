# vcf2Fritz

A lightweight React + TypeScript + Vite app for converting contacts between vCard (`.vcf`) and FritzBox phonebook XML (`.xml`).

## Features

- Convert FritzBox XML -> vCard
- Convert vCard -> FritzBox XML
- Upload and preview `.xml` / `.vcf` files
- Optional country and area code normalization for vCard -> FritzBox conversion
- Automatic conversion direction selection when a file is uploaded
- Multilingual UI support with English and German translations
- Built with React, TypeScript, Vite and `react-i18next`

## Supported Formats

- Input: FritzBox phonebook XML (`.xml`)
- Output: vCard (`.vcf`)
- Input: vCard (`.vcf`)
- Output: FritzBox phonebook XML (`.xml`)

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open the app in your browser at `http://localhost:5173`.

## Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Usage

1. Upload a `.xml` or `.vcf` file, or paste the content into the input area.
2. The conversion direction is automatically selected when a valid file type is detected.
3. Click `Convert`.
4. Download the result as `phonebook.vcf` or `phonebook.xml`.

### vCard -> FritzBox Options

- `Country Code`: used to format phone numbers that are missing a country prefix.
- `Area Code`: used for local phone numbers that need an area code.

## Project Structure

- `src/App.tsx` - main application logic
- `src/components` - UI components, preview and file handling
- `src/utils/converters.ts` - conversion functions for vCard and FritzBox XML
- `src/locales` - translation files for German and English

## Notes

- The preview shows parsed contact data before conversion.
- When a phone type cannot be determined, a default phone label is used.
- The app handles both vCard 2.1 and vCard 3.0 input formats.

## License

This project is available under the MIT License.
