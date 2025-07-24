// File: ./front/src/components/shared/pages/AboutPage.tsx
// Last change: Fixed and verified the about page code

import React from "react";
import "./AboutPage.css";

const AboutPage: React.FC = () => {
  return (
    <div className="about-page-container">
      <div className="about-content">
        <h1 className="about-title">SenDeliver: Prepájame budúcnosť logistiky</h1>
        
        <div className="about-intro">
          <p>
            SenDeliver je inovatívna platforma, ktorá revolučne mení svet prepravy a logistiky. 
            Spájame dopravcov a klientov vďaka inteligentným technológiám a vytvárame ekosystém, 
            kde každá preprava nachádza svoju optimálnu cestu.
          </p>
        </div>
        
        <div className="about-sections">
          <div className="about-section">
            <h2>Pre klientov</h2>
            <p>
              Potrebujete prepraviť tovar rýchlo, spoľahlivo a za najlepšiu cenu? SenDeliver vám 
              poskytuje prístup k širokej sieti profesionálnych dopravcov. Vďaka našej AI technológii 
              nájdete ideálneho partnera pre každú zásielku, sledujete prepravu v reálnom čase a 
              získate prehľadné reporty pre vaše obchodné rozhodnutia.
            </p>
            <div className="about-features">
              <div className="feature">
                <div className="feature-icon">📊</div>
                <div className="feature-text">Automatizované ponuky od overených dopravcov</div>
              </div>
              <div className="feature">
                <div className="feature-icon">🔍</div>
                <div className="feature-text">Real-time GPS sledovanie vašich zásielok</div>
              </div>
              <div className="feature">
                <div className="feature-icon">📱</div>
                <div className="feature-text">Jednoduchá správa a manažment prepráv</div>
              </div>
            </div>
          </div>
          
          <div className="about-section">
            <h2>Pre dopravcov</h2>
            <p>
              Maximalizujte využitie vašej flotily a minimalizujte prázdne kilometre. 
              SenDeliver vám prináša prístup k rozsiahlej databáze prepravných požiadaviek, 
              inteligentné plánovanie trás a komplexný nástroj na správu vozidiel. Získajte 
              nových zákazníkov, optimalizujte svoju prevádzku a zvýšte ziskovosť vašej spoločnosti.
            </p>
            <div className="about-features">
              <div className="feature">
                <div className="feature-icon">💼</div>
                <div className="feature-text">Burza zákaziek s okamžitými ponukami</div>
              </div>
              <div className="feature">
                <div className="feature-icon">🚚</div>
                <div className="feature-text">Efektívna správa vozového parku a jázd</div>
              </div>
              <div className="feature">
                <div className="feature-icon">📈</div>
                <div className="feature-text">Analytické nástroje pre rast vášho podnikania</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="about-stats">
          <div className="stat">
            <div className="stat-number">15,000+</div>
            <div className="stat-label">Spoločností</div>
          </div>
          <div className="stat">
            <div className="stat-number">35,000+</div>
            <div className="stat-label">Vozidiel</div>
          </div>
          <div className="stat">
            <div className="stat-number">180,000+</div>
            <div className="stat-label">Prepráv mesačne</div>
          </div>
          <div className="stat">
            <div className="stat-number">8</div>
            <div className="stat-label">Krajín v Európe</div>
          </div>
        </div>
        
        <div className="about-outro">
          <p>
            V SenDeliver veríme, že budúcnosť logistiky je v digitalizácii, automatizácii a efektívnej 
            spolupráci. Naša technológia nepredstavuje len prepojenie medzi dopytom a ponukou, 
            ale vytvára komplexný ekosystém pre modernú logistiku 21. storočia – efektívnejšiu, 
            ekologickejšiu a inteligentnejšiu.
          </p>
          <p className="about-tagline">
            <strong>SenDeliver: Logistika zajtrajška, dostupná už dnes.</strong>
          </p>
        </div>
        
        <div className="about-cta">
          <button className="cta-button">Zaregistrujte sa zadarmo</button>
          <button className="cta-button demo">Vyžiadajte si demo</button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;