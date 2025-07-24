// File: src/domains/drivers/components/team.comp.tsx
// Účel: Komponent pre pod-kartu "Tím" v rámci "Zdroje".

import React, { useState, useEffect, useMemo } from 'react';
import { Person, Document, Trip, mockPeople, getTripsForPerson, getDocumentsForPerson } from '@/data/mockPeople';
import './team.comp.css';

const TeamComponent: React.FC = () => {
  const [people, setPeople] = useState<person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<person | null>(null);
  const [personTrips, setPersonTrips] = useState<trip[]>([]);
  const [personDocuments, setPersonDocuments] = useState<document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Nahradiť reálnym API volaním
    setIsLoading(true);
    setTimeout(() => {
      const allPeople = mockPeople;
      setPeople(allPeople);
      if (allPeople.length > 0) {
        handleSelectPerson(allPeople[0]);
      }
      setIsLoading(false);
    }, 500);
  }, []);

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
    setPersonTrips(getTripsForPerson(person.id));
    setPersonDocuments(getDocumentsForPerson(person.id));
  };
  
  const filteredPeople = useMemo(() => {
    return people.filter(p => {
      const matchesSearch = `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = positionFilter === "all" || p.position === positionFilter;
      return matchesSearch && matchesPosition;
    });
  }, [people, searchTerm, positionFilter]);

  const positions = useMemo(() => ["Všetky", ...Array.from(new Set(people.map(p => p.position)))], [people]);
  
  if (isLoading) {
    return <div className="team__loader">Načítavam...</div>;
  }

  return (
    <div className="team">
      <aside className="team__sidebar">
        <div className="team__filters">
          <input
            type="text"
            className="team__search"
            placeholder="Hľadať osobu..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select 
            className="team__select" 
            value={positionFilter}
            onChange={e => setPositionFilter(e.target.value)}
          >
            {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
          </select>
        </div>
        <div className="team__list">
          {filteredPeople.map(person => (
            <div
              key={person.id}
              className={`person-card ${selectedPerson?.id === person.id ? 'person-card--active' : ''}`}
              onClick={() => handleSelectPerson(person)}
            >
              <img src={person.image} alt="" className="person-card__avatar" />
              <div className="person-card__info">
                <p className="person-card__name">{person.firstName} {person.lastName}</p>
                <p className="person-card__position">{person.position}</p>
              </div>
              <span className={`person-card__status person-card__status--${person.status.toLowerCase()}`}></span>
            </div>
          ))}
        </div>
      </aside>

      <main className="team__main-content">
        {selectedPerson ? (
          <>
            <div className="profile-header">
              <img src={selectedPerson.image} alt="" className="profile-header__avatar" />
              <div className="profile-header__info">
                <h1 className="profile-header__name">{selectedPerson.firstName} {selectedPerson.lastName}</h1>
                <p className="profile-header__position">{selectedPerson.position}</p>
              </div>
              <div className="profile-header__actions">
                <button className="button">Upraviť Profil</button>
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-card">
                <h3 className="detail-card__title">Dokumenty</h3>
                <div className="detail-card__content">
                  {personDocuments.map(doc => <div key={doc.id}>{doc.type} - Platnosť: {doc.validUntil}</div>)}
                </div>
              </div>
              <div className="detail-card">
                <h3 className="detail-card__title">História Jázd</h3>
                <div className="detail-card__content">
                  {personTrips.map(trip => <div key={trip.id}>{trip.date}: {trip.destination}</div>)}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="placeholder-content">Vyberte osobu zo zoznamu</div>
        )}
      </main>
    </div>
  );
};

export default TeamComponent;