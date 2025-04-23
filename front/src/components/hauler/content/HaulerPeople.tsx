// File: ./front/src/components/hauler/content/HaulerPeople.tsx
// Last change: Initial implementation of hauler people component

import React from "react";
import "./hauler.cards.css";

const HaulerPeople: React.FC = () => {
  const people = [
    { id: 1, name: "Peter Anderson", position: "Vodič", photo: "/images/people/person1.jpg" },
    { id: 2, name: "Brett Canaloni", position: "Vodič", photo: "/images/people/person2.jpg" },
    { id: 3, name: "Karen Jones", position: "Dispečer", photo: "/images/people/person3.jpg" },
    { id: 4, name: "Ian Myers", position: "Vodič", photo: "/images/people/person4.jpg" },
  ];
  
  return (
    <div className="hauler-card">
      <div className="people-container">
        <h2>Personál</h2>
        <div className="people-grid">
          {people.map(person => (
            <div key={person.id} className="person-card">
              <div className="person-photo-placeholder"></div>
              <div className="person-info">
                <div className="person-name">{person.name}</div>
                <div className="person-position">{person.position}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HaulerPeople;