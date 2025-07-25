// File: src/dev-tools/simpleUsageTracker.js
// Last change: Jednoduchý tracker bez závislosti na Webpacku

/**
 * Jednoduchý nástroj na sledovanie používania komponentov
 * Toto funguje bez Webpacku aj akejkoľvek ďalšej konfigurácie
 */

// Mapovanie kľúčov komponentov na ich zobrazované mená 
const COMPONENT_MAPPING = {
    'CountrySelect': 'components/sections/content/search-forms/CountrySelect.tsx',
    'PostalCitySelect': 'components/sections/content/search-forms/PostalCitySelect.tsx',
    'ManualForm': 'components/sections/content/search-forms/manual-form.component.tsx',
    'DateTimeSelect': 'components/sections/content/search-forms/DateTimeSelect.tsx',
    // Tu doplňte ďalšie komponenty podľa potreby
  };
  
  // Mapovanie komponentov na ich používania (vyplníte manuálne alebo automatizovane)
  const USAGE_MAPPING = {
    'components/sections/content/search-forms/CountrySelect.tsx': [
      'components/sections/content/search-forms/manual-form.component.tsx',
      'sections/search-section.tsx'
    ],
    'components/sections/content/search-forms/PostalCitySelect.tsx': [
      'components/sections/content/search-forms/manual-form.component.tsx'
    ],
    // Ostatné mapovanie doplníte podľa vašich znalostí
  };
  
  /**
   * Zobrazí overlay s informáciami o používaní
   * @param {string} componentName Názov komponentu
   */
  function showUsageOverlay(componentName) {
    // Nájdeme cestu komponentu podľa názvu
    const componentPath = COMPONENT_MAPPING[componentName] || componentName;
    
    // Získame zoznam použití
    const usages = USAGE_MAPPING[componentPath] || [];
    
    // Odstránime existujúci overlay ak existuje
    const existingOverlay = document.getElementById('component-usage-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
  
    // Vytvoríme nový overlay
    const overlay = document.createElement('div');
    overlay.id = 'component-usage-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: #1e1e1e;
      color: #ffffff;
      z-index: 9999;
      padding: 8px 16px;
      font-family: monospace;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      max-height: 30vh;
      overflow-y: auto;
    `;
  
    // Vytvoríme obsah
    const content = document.createElement('div');
    content.innerHTML = `
      <div>
        <strong>Component:</strong> ${componentPath}
      </div>
      <div>
        <strong>Used in (${usages.length}):</strong> 
        ${usages.map(usage => `<div>${usage}</div>`).join('')}
      </div>
    `;
  
    // Pridáme tlačidlo na zatvorenie
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 16px;
      cursor: pointer;
      margin-left: 16px;
    `;
    closeButton.onclick = () => overlay.remove();
  
    overlay.appendChild(content);
    overlay.appendChild(closeButton);
    document.body.appendChild(overlay);
  
    // Automaticky zmiznúť po 10 sekundách
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        overlay.remove();
      }
    }, 10000);
  }
  
  /**
   * Pridá sledovanie používania do React komponentu
   * @param {React.ComponentType} Component React komponent 
   * @param {string} componentName Názov komponentu
   * @returns {React.ComponentType} Upravený komponent
   */
  export function withUsageTracking(Component, componentName) {
    // Vraciame nový komponent, ktorý obalí pôvodný
    return function TrackedComponent(props) {
      // Získame React a useRef
      const React = window.React || require('react');
      const { useRef, useEffect } = React;
      
      // Vytvoríme referenciu na div
      const wrapperRef = useRef(null);
      
      // Pridáme event listener na Alt+klik
      useEffect(() => {
        const handleClick = (e) => {
          if (e.altKey) {
            e.preventDefault();
            e.stopPropagation();
            showUsageOverlay(componentName);
          }
        };
        
        // Pridáme event listener
        const wrapper = wrapperRef.current;
        if (wrapper) {
          wrapper.addEventListener('click', handleClick);
        }
        
        // Cleanup
        return () => {
          if (wrapper) {
            wrapper.removeEventListener('click', handleClick);
          }
        };
      }, []);
      
      // Vraciame obalený komponent
      return React.createElement(
        'div',
        { 
          ref: wrapperRef, 
          style: { cursor: 'help' },
          'data-component-name': componentName 
        },
        React.createElement(Component, props)
      );
    };
  }
  
  /**
   * Inicializácia trackeru - pridanie podpory pre Alt+Shift+C na zobrazenie všetkých komponentov 
   */
  function initTracker() {
    // Pridáme globálny event listener
    document.addEventListener('keydown', (e) => {
      // Alt+Shift+C
      if (e.altKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        
        // Zobrazíme zoznam všetkých komponentov
        const componentList = Object.keys(COMPONENT_MAPPING);
        
        // Vytvoríme overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          padding: 20px;
          overflow: auto;
          font-family: monospace;
        `;
        
        // Vytvoríme nadpis
        const header = document.createElement('h2');
        header.textContent = 'Všetky dostupné komponenty';
        overlay.appendChild(header);
        
        // Vytvoríme zoznam
        const list = document.createElement('ul');
        componentList.forEach(component => {
          const item = document.createElement('li');
          item.style.margin = '5px 0';
          item.style.cursor = 'pointer';
          item.textContent = `${component} (${COMPONENT_MAPPING[component]})`;
          
          // Pridáme event listener
          item.addEventListener('click', () => {
            showUsageOverlay(component);
          });
          
          list.appendChild(item);
        });
        overlay.appendChild(list);
        
        // Pridáme tlačidlo zatvoriť
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Zatvoriť (Esc)';
        closeButton.style.cssText = `
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 5px 10px;
          background: #444;
          border: none;
          color: white;
          cursor: pointer;
        `;
        closeButton.onclick = () => document.body.removeChild(overlay);
        overlay.appendChild(closeButton);
        
        // Pridáme listener na Escape
        const escListener = (e) => {
          if (e.key === 'Escape') {
            document.body.removeChild(overlay);
            document.removeEventListener('keydown', escListener);
          }
        };
        document.addEventListener('keydown', escListener);
        
        // Pridáme overlay do dokumentu
        document.body.appendChild(overlay);
      }
    });
    
    console.log('Component usage tracker initialized.');
    console.log('Use Alt+click on a component to see usage.');
    console.log('Use Alt+Shift+C to see all trackable components.');
  }
  
  // Inicializácia po načítaní dokumentu
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTracker);
    } else {
      initTracker();
    }
  }
  
  export default {
    showUsageOverlay,
    withUsageTracking
  };