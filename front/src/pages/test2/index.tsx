// File: src/pages/test2/index.tsx
// Last change: Lottie animation restricted to 150px height and aligned to the left.

import React from 'react';
import Lottie from 'lottie-react';
import animationData from './animation.json';

const Test2Page: React.FC = () => {
    return (
        <div>
            <h1>Lottie Animation Test</h1>
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Lottie
                    animationData={animationData}
                    loop
                    autoplay
                    style={{ height: '150px', width: 'auto' }}
                    rendererSettings={{
                        preserveAspectRatio: 'xMidYMid meet' // Maintains proportional scaling
                    }}
                />
            </div>
        </div>
    );
};

export default Test2Page;
