// File: src/dev-tools/withUsageTracking.jsx
// Last change: Implementation of HOC for component usage tracking

import React from 'react';
import usageTracker from './usage-tracker';

/**
 * Higher-Order Component, ktorý pridá sledovanie používania komponentu
 * @param {React.ComponentType} Component Komponent, ktorý má byť obalený
 * @param {string} componentPath Cesta ku komponentu (relatívna k src)
 * @returns {React.ComponentType} Obalený komponent
 */
export function withUsageTracking(Component, componentPath) {
  // Vrátime obalený komponent
  return React.forwardRef((props, ref) => {
    // V produkčnom prostredí priamo vraciame komponent bez úprav
    if (process.env.NODE_ENV === 'production') {
      return <Component {...props} ref={ref} />;
    }

    // Funkcia na zobrazenie použitia
    const showUsage = async (e) => {
      if (e.altKey) {
        e.stopPropagation();
        e.preventDefault();
        
        // Analyzujeme importy ak ešte neboli analyzované
        const usageMap = await usageTracker.analyzeImports();
        
        // Získame použitia pre tento komponent
        const usages = usageMap[componentPath] || [];
        
        // Zobrazíme overlay
        usageTracker.showUsageOverlay(componentPath, usages);
      }
    };

    // Vraciame komponent s pridaným data atribútom a event handlerom
    return (
      <div 
        data-component={componentPath}
        onClick={showUsage}
        style={{ cursor: 'help' }}
      >
        <Component {...props} ref={ref} />
      </div>
    );
  });
}

/**
 * Dekorátor pre komponenty s triedou
 * @param {string} componentPath Cesta ku komponentu (relatívna k src)
 * @returns {Function} Dekorátor
 */
export function trackUsage(componentPath) {
  return function(TargetComponent) {
    return withUsageTracking(TargetComponent, componentPath);
  };
}

export default withUsageTracking;