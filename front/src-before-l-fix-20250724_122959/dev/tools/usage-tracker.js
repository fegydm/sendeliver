// File: src/dev-tools/usage-tracker.js
// Last change: Initial implementation of component usage tracking

/**
 * Nástroj, ktorý pridá ku komponentom možnosť sledovania použitia v projekte.
 * Po kliknutí na komponent sa zobrazí informácia, kde je používaný.
 */

// Konfigurácia - komponentom s týmito prefixami sa pridá funkcionalita
const COMPONENT_PREFIXES = [
    'components/',
    'sections/',
    'elements/',
    'ui/'
  ];
  
  // Cache pre uloženie výsledkov analýzy
  let usageCache = null;
  
  /**
   * Analyzuje importy v projekte a vytvorí mapu použitia
   * @returns {Promise<Object>} Mapa komponentov a ich použití
   */
  async function analyzeImports() {
    if (usageCache) return usageCache;
  
    try {
      // V produkčnom prostredí nedostávame informácie
      if (process.env.NODE_ENV === 'production') {
        console.info('Component usage tracking disabled in production');
        return {};
      }
  
      // Získame zoznam všetkých súborov v projekte
      const fileList = await fetchProjectFiles();
      const usageMap = {};
  
      // Analyzujeme každý súbor
      for (const file of fileList) {
        try {
          const content = await fetchFileContent(file);
          const imports = extractImports(content);
  
          // Pre každý import skontrolujeme, či je to sledovaný komponent
          for (const importPath of imports) {
            if (COMPONENT_PREFIXES.some(prefix => importPath.includes(prefix))) {
              if (!usageMap[importPath]) {
                usageMap[importPath] = [];
              }
              usageMap[importPath].push(file);
            }
          }
        } catch (error) {
          console.warn(`Error analyzing imports in ${file}:`, error);
        }
      }
  
      usageCache = usageMap;
      return usageMap;
    } catch (error) {
      console.error('Failed to analyze component usage:', error);
      return {};
    }
  }
  
  /**
   * Získa zoznam súborov v projekte
   * @returns {Promise<string[]>} Zoznam ciest k súborom
   */
  async function fetchProjectFiles() {
    // V reálnom nasadení by sme použili API alebo webpack/vite plugin
    // Pre demo použijeme mock
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          'src/pages/index.tsx',
          'src/components/manual-form.component.tsx',
          'src/sections/search-section.tsx',
          'src/components/sections/content/search-forms/CountrySelect.tsx',
          'src/components/PostalCitySelect.tsx'
        ]);
      }, 100);
    });
  }
  
  /**
   * Získa obsah súboru
   * @param {string} filePath Cesta k súboru
   * @returns {Promise<string>} Obsah súboru
   */
  async function fetchFileContent(filePath) {
    // V reálnom nasadení by sme použili API alebo webpack/vite plugin
    // Pre demo použijeme mock
    return new Promise(resolve => {
      setTimeout(() => {
        if (filePath === 'src/components/manual-form.component.tsx') {
          resolve(`
            import React from 'react';
            import CountrySelect from './sections/content/search-forms/CountrySelect';
            import PostalCitySelect from './PostalCitySelect';
          `);
        } else if (filePath === 'src/sections/search-section.tsx') {
          resolve(`
            import CountrySelect from '../components/sections/content/search-forms/CountrySelect';
          `);
        } else {
          resolve('// No imports found');
        }
      }, 50);
    });
  }
  
  /**
   * Extrahuje importy zo súboru
   * @param {string} content Obsah súboru
   * @returns {string[]} Zoznam importovaných ciest
   */
  function extractImports(content) {
    const imports = [];
    const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
  
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
  
    return imports;
  }
  
  /**
   * Pridá overlay s informáciami o použití
   * @param {string} componentPath Cesta ku komponentu
   * @param {string[]} usages Zoznam použití
   */
  function showUsageOverlay(componentPath, usages) {
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
   * Pridá event listener na komponenty
   * @param {Object} usageMap Mapa použitia
   */
  function addComponentTracking(usageMap) {
    // Pridáme globálny event listener na Alt+klik
    document.addEventListener('click', event => {
      // Ak nebolo stlačené Alt, nič nerobíme
      if (!event.altKey) return;
  
      // Získame element na ktorý bolo kliknuté
      const target = event.target;
      
      // Skúsime získať najbližší komponent
      const component = findClosestComponent(target);
      
      if (component) {
        // Získame cestu ku komponentu
        const path = getComponentPath(component);
        
        // Získame použitia
        const usages = usageMap[path] || [];
        
        // Zobrazíme overlay
        showUsageOverlay(path, usages);
        
        // Zabránime ďalšiemu spracovaniu udalosti
        event.preventDefault();
        event.stopPropagation();
      }
    });
  }
  
  /**
   * Nájde najbližší komponent k elementu
   * @param {HTMLElement} element Element
   * @returns {HTMLElement|null} Komponent
   */
  function findClosestComponent(element) {
    // Implementácia bude závisieť od vášho projektu
    // Ukážkový príklad pre React komponenty
    let current = element;
    
    while (current && current !== document.body) {
      // Kontrolujeme či element má atribút data-component
      if (current.hasAttribute('data-component')) {
        return current;
      }
      
      // Ak používate React DevTools, môžeme skúsiť nájsť React komponent
      if (current.__reactFiber$ || current._reactInternalFiber) {
        return current;
      }
      
      current = current.parentElement;
    }
    
    return null;
  }
  
  /**
   * Získa cestu ku komponentu
   * @param {HTMLElement} component Element komponentu
   * @returns {string} Cesta ku komponentu
   */
  function getComponentPath(component) {
    // V skutočnej implementácii by sme získali cestu z React DevTools
    // Pre ukážku vrátime statický string
    return component.hasAttribute('data-component')
      ? component.getAttribute('data-component')
      : 'components/unknown';
  }
  
  /**
   * Inicializuje tracker
   */
  async function init() {
    try {
      console.info('Initializing component usage tracker...');
      
      // Analyzujeme importy
      const usageMap = await analyzeImports();
      
      // Pridáme tracking
      addComponentTracking(usageMap);
      
      console.info('Component usage tracker initialized. Use Alt+click to see component usage.');
    } catch (error) {
      console.error('Failed to initialize component usage tracker:', error);
    }
  }
  
  // Inicializujeme tracker pri načítaní
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
  
  export default {
    analyzeImports,
    showUsageOverlay
  };