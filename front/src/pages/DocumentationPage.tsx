// File: ./front/src/pages/DocumentationPage.tsx
// This page displays the documentation for the language system.
// Access is protected using the PinForm element (instead of a PIN modal).
// The required PIN is set to "1221".

import React, { useState } from "react";
import PinForm from "@/components/elements/pin-form.element"; // Using PinForm element
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
            na základe dvojmiestneho jazykového kódu (lc). Systém je optimalizovaný pre rýchlosť, pričom databáza
            používa <code>language_id</code> (integer) pre efektívne dotazy, zatiaľ čo frontend a backend
            komunikujú pomocou <code>lc</code> (napr. "en", "sk"). Dizajn zohľadňuje jednoduchú rozšíriteľnosť a
            údržbu prekladov.
          </p>
          <h2>Architektúra</h2>
          <h3>Databáza</h3>
          <p>
            <strong>Tabuľky:</strong>
          </p>
          <ul>
            <li>
              <strong>geo.languages:</strong> Obsahuje informácie o jazykoch.
              <ul>
                <li><code>id</code>: integer PRIMARY KEY – unikátny identifikátor jazyka.</li>
                <li><code>code_2</code>: text – dvojmiestny kód jazyka (napr. "en", "sk").</li>
                <li><code>code_3</code>: text – trojmiestny kód jazyka (napr. "eng", "slo").</li>
                <li><code>name_en</code>: text – názov jazyka v angličtine.</li>
                <li><code>name_sk</code>: text – názov jazyka v slovenčine.</li>
                <li><code>name_local</code>: text – lokálny názov jazyka.</li>
                <li><code>native_name</code>: text – názov v natívnom jazyku.</li>
                <li><code>is_rtl</code>: boolean – označuje smer písma.</li>
                <li><code>primary_country_code</code>: text – kód krajiny (napr. "GB", "SK").</li>
              </ul>
            </li>
            <li>
              <strong>geo.translations:</strong> Obsahuje preklady jednotlivých kľúčov.
              <ul>
                <li><code>id</code>: integer PRIMARY KEY.</li>
                <li><code>key</code>: text – kľúč prekladu (napr. "welcome").</li>
                <li><code>text</code>: text – preklad (napr. "Vitaj").</li>
                <li><code>language_id</code>: integer – cudzí kľúč odkazujúci na geo.languages.id.</li>
              </ul>
            </li>
            <li>
              <strong>geo.translations_metadata:</strong> Slúži na dokumentáciu prekladových kľúčov.
            </li>
          </ul>
          <h3>Backend</h3>
          <p>
            Backend načítava preklady pomocou dotazov, kde sa lc mapuje na <code>language_id</code> a následne
            vykonáva SELECT z <code>geo.translations</code>. Cachovanie mapovania lc na language_id minimalizuje počet dotazov.
          </p>
          <h3>Frontend</h3>
          <p>
            Frontend používa Context API pre správu jazykových nastavení. Hlavné súbory:
          </p>
          <ul>
            <li><strong>LanguageContext.tsx</strong>: Poskytuje centralizovaný prístup k jazykovým nastaveniam a prekladom.</li>
            <li><strong>useTranslationsPreload.ts</strong>: Načítava preklady z API s cachovaním v LS a pamäti.</li>
            <li><strong>NavbarLanguage.tsx</strong>: Umožňuje výber jazyka cez dropdown a prepína aktuálny jazyk.</li>
          </ul>
          <h3>Pracovný tok</h3>
          <p>
            Používateľ vyberie jazyk v dropdown menu (napr. "sk"). Funkcia <code>changeLanguage</code> aktualizuje currentLanguage,
            a preklady sa načítavajú cez useTranslationsPreload z API. Výsledné preklady sa zobrazujú v UI prostredníctvom funkcie <code>t(key)</code>.
          </p>
          <h3>Optimalizácia a rozšíriteľnosť</h3>
          <p>
            Databáza používa indexy pre rýchle SELECT dotazy. Frontend používa in-memory a LS cache pre preklady,
            čo znižuje počet HTTP požiadaviek. Systém je navrhnutý na jednoduchú rozšíriteľnosť (napr. pridanie nových jazykov či regionálnych variantov).
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentationPage;
