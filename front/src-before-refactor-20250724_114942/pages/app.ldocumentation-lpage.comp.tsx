// File: src/pages/app.ldocumentation-lpage.comp.tsx
// This page displays the documentation for the language system.
// Access is protected using the PinForm element (instead of a PIN modal).
// The required PIN is set to "1221".

import React, { useState } from "react";
import PinForm from "@/components/shared/elements/pin-form.comp";
import "@/styles/sections/video.page.css";
import "./documentation.page.css";

const DocumentationPage: React.FC = () => {
  // State to track if the user has entered the correct PIN
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  return (
    <div className="documentation-page">
      {/* Display PIN form overlay until access is granted */}
      {!hasAccess ? (
        <div className="documentation-pin-overlay">
          <PinForm 
            onCorrectPin={() => setHasAccess(true)} 
          />
        </div>
      ) : (
        // Once access is granted, show the documentation content
        <div className="documentation-content">
          <h1>Dokumentácia jazykového systému</h1>
          
          <h2>Úvod</h2>
          <p>
            Jazykový systém umožňuje lokalizáciu aplikácie prostredníctvom dynamického načítania prekladov
            na základe dvojmiestneho jazykového kódu (lc). Systém je optimalizovaný pre rýchlosť – databáza
            používa <code>language_id</code> (integer) pre efektívne dotazy, zatiaľ čo frontend a backend
            komunikujú pomocou <code>lc</code> (napr. "en", "sk").
          </p>

          <h2>Architektúra</h2>
          
          <h3>Databáza</h3>
          <p><strong>Tabuľky:</strong></p>
          <ul>
            <li>
              <strong>geo.languages</strong>
              <pre>{`
id: integer PRIMARY KEY
code_2: text – dvojmiestny kód jazyka (napr. "en", "sk")
code_3: text – trojmiestny kód jazyka (napr. "eng", "slo")
name_en: text – názov jazyka v angličtine
name_sk: text – názov jazyka v slovenčine
name_local: text – lokálny názov jazyka
native_name: text – názov v natívnom jazyku
is_rtl: boolean – označuje smer písma
primary_country_code: text – dvojmiestny kód krajiny veľkými písmenami
              `}</pre>
            </li>
            <li>
              <strong>geo.translations_keys</strong>
              <pre>{`
id: integer PRIMARY KEY
key_name: text UNIQUE – názov kľúča (napr. "welcome")
key_description: text – popis významu kľúča
notes: text – poznámky, kde sa kľúč používa
              `}</pre>
            </li>
            <li>
              <strong>geo.translations</strong>
              <pre>{`
id: integer PRIMARY KEY
key_id: integer – odkaz na geo.translations_keys.id
language_id: integer – odkaz na geo.languages.id
text: text – preložený výraz
is_verified: boolean – či je preklad overený
created_by: text – autor prekladu
created_at: timestamp – dátum vytvorenia záznamu
              `}</pre>
            </li>
          </ul>

          <h3>Backend</h3>
          <p>Dotazy na načítanie prekladov:</p>
          <pre>{`
GET_TRANSLATIONS_QUERY:
SELECT k.key_name AS key, t.text
FROM geo.translations t
JOIN geo.translations_keys k ON t.key_id = k.id
WHERE t.language_id = $1;

GET_LANGUAGE_ID_BY_LC_QUERY:
SELECT id FROM geo.languages WHERE code_2 = $1;
          `}</pre>
          <p>Výsledok je mapovaný na objekt typu:</p>
          <pre>{`
{
  "welcome": "Vitaj",
  "logout": "Odhlásiť sa",
  ...
}
          `}</pre>

          <h3>Frontend</h3>
          <p>Hlavné súbory:</p>
          <ul>
            <li><strong>LanguageContext.tsx</strong> – spravuje currentLanguage, changeLanguage a funkciu t(key)</li>
            <li><strong>useTranslationsPreload.ts</strong> – načítava preklady z API a ukladá do pamäťovej/LS cache</li>
            <li><strong>NavbarLanguage.tsx</strong> – dropdown na výber jazyka s prepnutím currentLanguage</li>
          </ul>

          <h3>API Endpoint</h3>
          <pre>{`
GET /api/geo/translations?lc=sk
Výstup:
{
  "ai_button_ask": "Opýtať sa AI",
  "ai_modal_close": "Zavrieť",
  ...
}
          `}</pre>

          <h3>Optimalizácia a rozšíriteľnosť</h3>
          <p>
            Indexy na <code>language_id</code> a <code>key_id</code> zabezpečujú rýchlosť. Oddelenie kľúčov 
            (<code>translations_keys</code>) a textov (<code>translations</code>) uľahčuje správu. Na pridanie 
            nového jazyka stačí vložiť nové záznamy do <code>geo.translations</code>.
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentationPage;