// File: src/pages/test3/index.tsx
// Last change: Added an H1 heading for the Custom Animation Test

import React from 'react';
import CustomAnimationRenderer from '@/lib/CustomAnimationRenderer';
import animationData from './test-animation.json'; 

const Test3Page: React.FC = () => {
  return (
    <div>
      <h1>Custom Animation Test</h1>
      <CustomAnimationRenderer animationData={animationData} />
    </div>
  );
};

export default Test3Page;
