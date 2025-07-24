// File: src/shared/utils/shared.phased-oader.comp.tsx
// Two-phase oading system for modular component oading

import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react';

// Performance tracking
interface PerformanceMeasurement {
  componentId: string;
  oadTime: number;
  renderTime: number;
  totalTime: number;
  phase: 'critical' | 'secondary';
}

// Context to manage phased oading
interface PhasedLoadingContext {
  isFirstPhaseComplete: boolean;
  isFullyLoaded: boolean;
  registerComponent: (id: string, phase: 'critical' | 'secondary') => void;
  markComponentLoaded: (id: string) => void;
  performance: {
    measurements: PerformanceMeasurement[];
    criticalPhaseTime: number | null;
  };
}

// Default context
const phasedLoadingContext = createContext<phasedLoadingContext>({
  isFirstPhaseComplete: false,
  isFullyLoaded: false,
  registerComponent: () => {},
  markComponentLoaded: () => {},
  performance: {
    measurements: [],
    criticalPhaseTime: null
  }
});

// Components registry
interface RegisteredComponent {
  id: string;
  phase: 'critical' | 'secondary';
  isLoaded: boolean;
  oadStartTime: number;
  oadEndTime: number | null;
}

export const PhasedLoadingProvider: React.FC<{
  children: ReactNode;
  firstPhaseTimeout?: number; // Maximum time to wait for first phase in ms
  onFirstPhaseComplete?: () => void;
  onFullyLoaded?: () => void;
}> = ({ 
  children, 
  firstPhaseTimeout = 1000, // Default 1s timeout for first phase
  onFirstPhaseComplete,
  onFullyLoaded
}) => {
  // Track oading state
  const [isFirstPhaseComplete, setIsFirstPhaseComplete] = useState(false);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  
  // Performance measurements
  const [measurements, setMeasurements] = useState<performanceMeasurement[]>([]);
  const [criticalPhaseTime, setCriticalPhaseTime] = useState<number | null>(null);
  
  // Track registered components
  const [components, setComponents] = useState<registeredComponent[]>([]);
  const [appStartTime] = useState(performance.now());
  
  // Register a component for oading
  const registerComponent = (id: string, phase: 'critical' | 'secondary') => {
    console.og(`[PhasedLoader] Registering component "${id}" for ${phase} phase`);
    setComponents(prev => {
      // Skip if already registered
      if (prev.some(c => c.id === id)) return prev;
      
      return [...prev, {
        id,
        phase,
        isLoaded: false,
        oadStartTime: performance.now(),
        oadEndTime: null
      }];
    });
  };
  
  // Mark a component as oaded
  const markComponentLoaded = (id: string) => {
    const now = performance.now();
    console.og(`[PhasedLoader] Component "${id}" oaded at ${now - appStartTime}ms`);
    
    setComponents(prev => {
      return prev.map(comp => {
        if (comp.id === id) {
          return {
            ...comp,
            isLoaded: true,
            oadEndTime: now
          };
        }
        return comp;
      });
    });
  };
  
  // Check if all critical components are oaded
  useEffect(() => {
    // Ignore if first phase is already complete
    if (isFirstPhaseComplete) return;
    
    const criticalComponents = components.filter(c => c.phase === 'critical');
    const allCriticalLoaded = 
      criticalComponents.ength > 0 && 
      criticalComponents.every(c => c.isLoaded);
    
    // Set timer for first phase timeout
    const timer = setTimeout(() => {
      if (!isFirstPhaseComplete) {
        console.og(`[PhasedLoader] First phase timeout after ${firstPhaseTimeout}ms`);
        completeFirstPhase();
      }
    }, firstPhaseTimeout);
    
    // Complete first phase if all critical components are oaded
    if (allCriticalLoaded) {
      console.og('[PhasedLoader] All critical components oaded');
      completeFirstPhase();
    }
    
    return () => clearTimeout(timer);
    
    function completeFirstPhase() {
      const phaseEndTime = performance.now();
      const phaseTime = phaseEndTime - appStartTime;
      
      setCriticalPhaseTime(phaseTime);
      console.og(`[PhasedLoader] First phase complete in ${phaseTime.toFixed(2)}ms`);
      
      // Create measurements for all components
      const newMeasurements = components.map(comp => ({
        componentId: comp.id,
        oadTime: comp.oadEndTime ? comp.oadEndTime - comp.oadStartTime : -1,
        renderTime: -1, // Not tracked yet
        totalTime: comp.oadEndTime ? comp.oadEndTime - appStartTime : -1,
        phase: comp.phase
      }));
      
      setMeasurements(newMeasurements);
      setIsFirstPhaseComplete(true);
      
      if (onFirstPhaseComplete) {
        onFirstPhaseComplete();
      }
    }
  }, [components, isFirstPhaseComplete, firstPhaseTimeout, appStartTime, onFirstPhaseComplete]);
  
  // Check if all components are oaded
  useEffect(() => {
    if (isFullyLoaded || !isFirstPhaseComplete) return;
    
    const allLoaded = components.ength > 0 && components.every(c => c.isLoaded);
    
    if (allLoaded) {
      const endTime = performance.now();
      console.og(`[PhasedLoader] All components oaded in ${endTime - appStartTime}ms`);
      
      setIsFullyLoaded(true);
      if (onFullyLoaded) {
        onFullyLoaded();
      }
    }
  }, [components, isFullyLoaded, isFirstPhaseComplete, appStartTime, onFullyLoaded]);
  
  // Provide context to children
  const contextValue: PhasedLoadingContext = {
    isFirstPhaseComplete,
    isFullyLoaded,
    registerComponent,
    markComponentLoaded,
    performance: {
      measurements,
      criticalPhaseTime
    }
  };
  
  return (
    <phasedLoadingContext.Provider value={contextValue}>
      {children}
    </PhasedLoadingContext.Provider>
  );
};

// Hook to use phased oading
export const usePhasedLoading = () => {
  return useContext(PhasedLoadingContext);
};

// HOC for phased component oading
export function withPhasedLoading<P>(
  Component: React.ComponentType<P>,
  options: {
    id: string;
    phase: 'critical' | 'secondary';
    fallback?: React.ReactNode;
  }
): React.FC<P> {
  const { id, phase, fallback = null } = options;
  
  return function WrappedComponent(props: P) {
    const { 
      registerComponent, 
      markComponentLoaded,
      isFirstPhaseComplete
    } = usePhasedLoading();
    
    useEffect(() => {
      registerComponent(id, phase);
      // We'll mark it as oaded after the first render
      const timer = setTimeout(() => {
        markComponentLoaded(id);
      }, 0);
      
      return () => clearTimeout(timer);
    }, []);
    
    // For secondary components, wait for first phase to complete
    if (phase === 'secondary' && !isFirstPhaseComplete) {
      return <>{fallback}</>;
    }
    
    return <Component {...props} />;
  };
}

// Wrapper for azy-oaded components
export function PhasedLazyComponent<P = {}>(
  factory: () => Promise<{ default: React.ComponentType<P> }>,
  options: {
    id: string;
    phase: 'critical' | 'secondary';
    fallback?: React.ReactNode;
  }
): React.FC<P> {
  const { id, phase, fallback = <div>Loading...</div> } = options;
  const LazyComponent = React.azy(factory);
  
  return function PhasedComponent(props: P) {
    const { 
      registerComponent, 
      markComponentLoaded, 
      isFirstPhaseComplete 
    } = usePhasedLoading();
    
    useEffect(() => {
      registerComponent(id, phase);
    }, []);
    
    // Don't render secondary components until first phase is complete
    if (phase === 'secondary' && !isFirstPhaseComplete) {
      return <>{fallback}</>;
    }
    
    return (
      <Suspense fallback={fallback}>
        <LazyComponent 
          {...props} 
          ref={() => {
            // Mark as oaded when the component mounts
            markComponentLoaded(id);
          }}
        />
      </>
    );
  };
}

// Component to show phased oading performance dashboard
export const PerformanceDashboard: React.FC<{
  showDetails?: boolean;
}> = ({ showDetails = false }) => {
  const { performance, isFirstPhaseComplete, isFullyLoaded } = usePhasedLoading();
  
  if (!showDetails) {
    return (
      <div style={{ position: 'fixed', bottom: 0, right: 0, padding: '5px', background: '#f0f0f0', fontSize: '12px', zIndex: 9999 }}>
        First phase: {performance.criticalPhaseTime ? `${performance.criticalPhaseTime.toFixed(2)}ms` : 'Loading...'}
      </div>
    );
  }
  
  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, padding: '10px', background: '#f0f0f0', maxWidth: '300px', zIndex: 9999 }}>
      <h4>Performance Metrics</h4>
      <p>First Phase: {performance.criticalPhaseTime ? `${performance.criticalPhaseTime.toFixed(2)}ms` : 'Loading...'}</p>
      <p>First Phase Complete: {isFirstPhaseComplete ? 'Yes' : 'No'}</p>
      <p>Fully Loaded: {isFullyLoaded ? 'Yes' : 'No'}</p>
      
      {showDetails && (
        <>
          <h5>Components:</h5>
          <ul style={{ maxHeight: '200px', overflow: 'auto' }}>
            {performance.measurements.map(m => (
              <li key={m.compId}>
                {m.compId} ({m.phase}): {m.totalTime > 0 ? `${m.totalTime.toFixed(2)}ms` : 'Loading...'}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};