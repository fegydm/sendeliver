// File: ./front/src/components/hauler/content/HaulerWebCards.tsx
// Last change: Initial implementation of hauler web cards component

import React from "react";
import "./hauler.cards.css";

const HaulerWebCards: React.FC = () => {
  const webCards = [
    { id: 1, name: "Hlavná firemná vizitka", domain: "johntransport.sendeliver.com", status: "Aktívna", views: 245 },
    { id: 2, name: "Promo stránka", domain: "akcia.johntransport.com", status: "Aktívna", views: 120 },
  ];
  
  return (
    <div className="hauler-card">
      <div className="webcards-container">
        <h2>Webové vizitky</h2>
        <div className="webcards-actions">
          <button className="webcards-action-button">+ Nová vizitka</button>
        </div>
        <div className="webcards-list">
          {webCards.map(card => (
            <div key={card.id} className="webcard-item">
              <div className="webcard-preview">
                <div className="webcard-preview-placeholder"></div>
              </div>
              <div className="webcard-info">
                <div className="webcard-name">{card.name}</div>
                <div className="webcard-domain">{card.domain}</div>
                <div className="webcard-stats">
                  <div className="webcard-status">{card.status}</div>
                  <div className="webcard-views">{card.views} zobrazení</div>
                </div>
              </div>
              <div className="webcard-actions">
                <button>Upraviť</button>
                <button>Štatistiky</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HaulerWebCards;