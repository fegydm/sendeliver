import React, { useState } from "react";
import timecolumn from "@/components/home/content/search-forms/timecolumn";

const Test1Page: React.FC = () => {
  const [useParent, setUseParent] = useState(true); // Toggle state

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Test 1 - timepicker</h1>

      {/* Toggle button */}
      <button 
        onClick={() => setUseParent(prev => !prev)} 
        style={{ marginBottom: '20px', padding: '10px', cursor: 'pointer' }}
      >
        {useParent ? "Switch to Outside Parent" : "Switch to Inside Parent"}
      </button>

      {/* Always visible parent */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '200px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: '100px', 
          height: '200px', 
          border: '2px solid black', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}
      >
        {/* Render inside parent only if `useParent === true` */}
        {useParent && <TimeColumn />}
      </div>

      {/* Render outside parent if `useParent === false` */}
      {!useParent && <TimeColumn />}
    </div>
  );
};

export default Test1Page;
