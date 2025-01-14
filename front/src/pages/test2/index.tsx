// File: src/pages/test2/index.tsx

import React from 'react';
import Lottie from 'lottie-react';
import animationData from './test-animation.json';

const Test2Page: React.FC = () => {
    return (
        <div>
            <h1>Lottie Animation Test</h1>
            <Lottie animationData={animationData} />
        </div>
    );
};

export default Test2Page;