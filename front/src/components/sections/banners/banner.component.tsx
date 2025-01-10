// File: front/src/components/sections/banners/banner.component.tsx
// Last change: Added detailed console logs for debugging animation loading and rendering

import React from "react";
import CustomPlayer from "@/components/elements/animation/custom-player.element.js";

const Banner: React.FC = () => {
    console.log('Banner component rendered');

    return (
        <section className="banner">
            <div className="banner-content">
                <h1 className="banner-title">
                    Empowering connections between clients and carriers.
                </h1>
                <CustomPlayer
                    src="/animations/sendeliver-text2.json"
                    width={200}
                    height={100}
                    className="banner-animation"
                    loop={true}
                    autoplay={true}
                />
            </div>
        </section>
    );
};

export default Banner;
