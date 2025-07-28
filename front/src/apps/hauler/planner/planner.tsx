// File: src/apps/hauler/planner/planner.tsx
// Last change: Migrated from planner.component.tsx with fixed imports and removed circular dependencies

import React, { useState } from 'react';
import { Vehicle } from '@/data/mockFleet';
import { Person } from '@/data/mockPeople';
// Removed problematic MapView import - will implement later
import './planner.css';

// Temporary types for planner
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
  const [plans, setPlans] = useState<Plan[]>([
    { id: 1, name: 'Preprava BA -> BER', status: 'planned', stops: [] },
    { id: 2, name: 'Nová preprava (návrh)', status: 'draft', stops: [] },
  ]);
  const [activePlan, setActivePlan] = useState<Plan | null>(plans[0]);
  const [aiIsThinking, setAiIsThinking] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);

  const handleAiOptimize = (request: string) => {
    if (!request.trim()) return;
    setAiIsThinking(true);
    setAiSuggestion(null);
    console.log(`AI požiadavka: ${request}`);
    
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
    // TODO: Apply AI suggestions to active plan
    alert('Návrhy AI boli aplikované na plán!');
    setAiSuggestion(null);
  };

  const handleCreateNewPlan = () => {
    const newPlan: Plan = {
      id: plans.length + 1,
      name: `Nový plán ${plans.length + 1}`,
      status: 'draft',
      stops: []
    };
    setPlans(prev => [...prev, newPlan]);
    setActivePlan(newPlan);
  };

  const handleOptimizeClick = () => {
    const textarea = document.querySelector('.assistant-card__textarea') as HTMLTextAreaElement;
    if (textarea) {
      handleAiOptimize(textarea.value);
    }
  };

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
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActivePlan(plan);
                }
              }}
            >
              <span className={`plan-item__status plan-item__status--${plan.status}`}></span>
              <span className="plan-item__name">{plan.name}</span>
            </div>
          ))}
        </div>
        <button 
          type="button"
          className="button button--primary button--full-width"
          onClick={handleCreateNewPlan}
        >
          Vytvoriť nový plán
        </button>
      </aside>

      <main className="planner__main">
        <header className="planner__header">
          <h1 className="planner__main-title">
            {activePlan ? activePlan.name : 'Vyberte plán'}
          </h1>
        </header>
        
        <section className="route-editor">
          <h3 className="route-editor__title">Zastávky Trasy</h3>
          {/* TODO: Implement logic for adding/removing stops */}
          <div className="route-editor__stops-list">
            <div className="stop">1. Bratislava, SK (Nakládka)</div>
            <div className="stop">2. Praha, CZ (Waypoint)</div>
            <div className="stop">3. Berlín, DE (Vykládka)</div>
          </div>
        </section>
        
        <section className="map-container">
          {/* TODO: Integrate MapView component when available */}
          <div className="map-placeholder">
            <h4>Vizualizácia trasy na mape</h4>
            <p>Integrácia s mapovým komponentom v príprave...</p>
          </div>
        </section>
      </main>

      <aside className="planner__assistant">
        <div className="assistant-card">
          <h3 className="assistant-card__title">AI Asistent Plánovania</h3>
          <textarea
            className="assistant-card__textarea"
            placeholder="Zadajte požiadavku, napr. 'Nájsť najlepšiu trasu z Bratislavy do Berlína pre 10t náklad...'"
            onKeyDown={(e) => { 
              if (e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                handleAiOptimize(e.currentTarget.value); 
              } 
            }}
          />
          <button 
            type="button"
            className="button button--full-width" 
            onClick={handleOptimizeClick}
            disabled={aiIsThinking}
          >
            {aiIsThinking ? 'Analyzujem...' : 'Optimalizovať Trasu'}
          </button>
        </div>
        
        {aiSuggestion && (
          <div className="assistant-card assistant-card--suggestion">
            <h4 className="assistant-card__title">Návrh Optimalizácie</h4>
            
            {aiSuggestion.recommendedVehicle && (
              <p>
                <strong>Odporúčané vozidlo:</strong> {aiSuggestion.recommendedVehicle}
              </p>
            )}
            
            {aiSuggestion.optimalRoute && (
              <div>
                <strong>Optimálna trasa:</strong>
                <ol>
                  {aiSuggestion.optimalRoute.map((stop, i) => (
                    <li key={i}>{stop}</li>
                  ))}
                </ol>
              </div>
            )}
            
            {aiSuggestion.warnings && (
              <p className="assistant-card__warning">
                <strong>Upozornenie:</strong> {aiSuggestion.warnings.join(', ')}
              </p>
            )}
            
            <button 
              type="button"
              className="button button--primary button--full-width" 
              onClick={applyAiSuggestions}
            >
              Aplikovať Návrhy
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};

export { PlannerComponent };
export default PlannerComponent;