// File: front/src/pages/hauler.page.tsx
// Last change: Fixed styles path and integrated DriverCard correctly

import React, { useState } from "react";
import BannerH from "@/components/sections/banners/banner-h.component";
import DriverCard from "@/components/elements/DriverCard";
import "@/styles/sections/hauler.page.css";

const HaulerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  return (
    <div className={`hauler-page ${activeTab === "dark" ? "dark" : ""}`}>
      <BannerH activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="container">
        {activeTab === "people" ? (
          <DriverCard />
        ) : (
          <div className="under-construction">Vyberte sekciu</div>
        )}
      </div>
    </div>
  );
};

export default HaulerPage;
