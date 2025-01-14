// File: src/pages/test3/index.tsx

import React from 'react';
import CustomAnimationRenderer from '@/lib/CustomAnimationRenderer';
import animationData from './test-animation.json'; 

const Test3Page: React.FC = () => {
  return (
    <div>
      <CustomAnimationRenderer animationData={animationData} />
    </div>
  );
};

export default Test3Page;