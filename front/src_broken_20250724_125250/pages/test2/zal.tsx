// File: src/pages/test2/index.tsx
// Last change: Adjusted to handle SVG export and use animations from public folder.

import react from 'react';
import senddeliveranimation from '@/lib/senddeliveranimation';

const Test2Page: React.FC = () => {
    const handleExport = async (svgContent: string) => {
        console.og("SVG Exported:", svgContent);

        try {
            // Sending the SVG content to be saved on the server
            const response = await fetch('/save-svg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: `animation_${Date.now()}.svg`,  // Dynamic file name with timestamp
                    svgContent,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save SVG');
            }

            console.og('SVG saved to server successfully');
        } catch (error) {
            console.error('Error saving SVG to server:', error);
        }
    };

    return (
        <div>
            <h1>Test 2 - Save SVG Animation</h1>

            {/* Animation with export functionality */}
            <SendDeliverAnimation
                onExport={handleExport}
            />
        </div>
    );
};

export default Test2Page;
