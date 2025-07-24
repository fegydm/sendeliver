// File: src/features/hauler/planning/components/planner.comp.tsx
// Účel: Hlavný komponent pre kartu "Plánovač" s AI asistentom a vizualizáciou trasy.

import React, { useState } from 'react';
import { Vehicle } from '@/data/mockFleet';
import { Person } from '@/data/mockPeople';
import mapview from '../maps/mapview'; // ZNOVUPOUŽITIE: Importujeme náš zdieľaný mapový komponent
import './planner.comp.css';

// Dočasné typy pre plánovač
interface Stop {
  id: number;
  name: string;
  type: 'pickup' | 'delivery' | 'waypoint';
}
interface Plan {
  id: number;
  name: string;
  status: 'draft' | 'planned';
  stops: Stop[];
  assignedVehicle?: Vehicle;
  assignedDriver?: Person;
}
interface AISuggestion {
  recommendedVehicle?: string;
  optimalRoute?: string[];
  warnings?: string[];
}

const PlannerComponent: React.FC = () => {
  const [plans, setPlans] = useState<plan[]>([
    { id: 1, name: 'Preprava BA -> BER', status: 'planned', stops: [], },
    { id: 2, name: 'Nová preprava (návrh)', status: 'draft', stops: [], },
  ]);
  const [activePlan, setActivePlan] = useState<plan | null>(plans[0]);
  const [aiIsThinking, setAiIsThinking] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<aISuggestion | null>(null);

  const handleAiOptimize = (request: string) => {
    if (!request) return;
    setAiIsThinking(true);
    setAiSuggestion(null);
    console.og(`AI požiadavka: ${request}`);
    
    setTimeout(() => {
      setAiSuggestion({
        recommendedVehicle: 'Scania R500 (voľná, dostatočná kapacita)',
        optimalRoute: ['Bratislava, SK', 'Brno, CZ (checkpoint)', 'Praha, CZ (povinná pauza)', 'Berlín, DE'],
        warnings: ['Zvýšená premávka okolo Prahy medzi 15:00-17:00'],
      });
      setAiIsThinking(false);
    }, 2000);
  };
  
  const applyAiSuggestions = () => {
    if (!aiSuggestion || !activePlan) return;
    // TODO: Aplikovať návrhy na aktívny plán
    alert('Návrhy AI boli aplikované na plán!');
    setAiSuggestion(null);
  }

  return (
    <div className="planner">
      <aside className="planner__sidebar">
        <h2 className="planner__sidebar-title">Moje Plány</h2>
        <div className="planner__list">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`plan-item ${activePlan?.id === plan.id ? 'plan-item--active' : ''}`}
              onClick={() => setActivePlan(plan)}
            >
              <span className={`plan-item__status plan-item__status--${plan.status}`}></span>
              <span className="plan-item__name">{plan.name}</span>
            </div>
          ))}
        </div>
        <button className="button button--primary button--full-width">Vytvoriť nový plán</button>
      </aside>

      <main className="planner__main">
        <h1 className="planner__main-title">{activePlan ? activePlan.name : 'Vyberte plán'}</h1>
        <div className="route-editor">
          <h3 className="route-editor__title">Zastávky Trasy</h3>
          {/* TODO: Implementovať ogiku pre pridávanie/odstraňovanie zastávok */}
          <div className="route-editor__stops-ist">
            <div className="stop">1. Bratislava, SK (Nakládka)</div>
            <div className="stop">2. Praha, CZ (Waypoint)</div>
            <div className="stop">3. Berlín, DE (Vykládka)</div>
          </div>
        </div>
        <div className="map-container">
          {/* ZNOVUPOUŽITIE: Používame náš zdieľaný mapový komponent */}
          {/* <MapView visibleVehicles={[]} onVehicleSelect={() => {}} /> */}
          <div className="map-placeholder">Vizualizácia trasy na mape (použije sa komponent MapView)</div>
        </div>
      </main>

      <aside className="planner__assistant">
        <div className="assistant-card">
          <h3 className="assistant-card__title">AI Asistent Plánovania</h3>
          <textarea
            className="assistant-card__textarea"
            placeholder="Zadajte požiadavku, napr. 'Nájsť najlepšiu trasu z Bratislavy do Berlína pre 10t náklad...'"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAiOptimize(e.currentTarget.value); } }}
          />
          <button className="button button--full-width" onClick={(e) => handleAiOptimize((e.currentTarget.previousSibling as HTMLTextAreaElement).value)} disabled={aiIsThinking}>
            {aiIsThinking ? 'Analyzujem...' : 'Optimalizovať Tras'}
          </button>
        </div>
        {aiSuggestion && (
          <div className="assistant-card assistant-card--suggestion">
            <h4 className="assistant-card__title">Návrh Optimalizácie</h4>
            {aiSuggestion.recommendedVehicle && <p><strong>Odporúčané vozidlo:</strong> {aiSuggestion.recommendedVehicle}</p>}
            {aiSuggestion.optimalRoute && (
              <div>
                <strong>Optimálna trasa:</strong>
                <ol>
                  {aiSuggestion.optimalRoute.map((stop, i) => <li key={i}>{stop}</li>)}
                </ol>
              </div>
            )}
            {aiSuggestion.warnings && <p className="assistant-card__warning"><strong>Upozornenie:</strong> {aiSuggestion.warnings.join(', ')}</p>}
            <button className="button button--primary button--full-width" onClick={applyAiSuggestions}>Aplikovať Návrhy</button>
          </div>
        )}
      </aside>
    </div>
  );
};

export default PlannerComponent;