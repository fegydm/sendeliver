// File: front/src/pages/hauler.page.tsx
// Last change: Fixed styles path and integrated DriverCard correctly

import React, { useState } from "react";
import BannerH from "@/components/hauler/content/hauler.content.component";
import DriverCard from "@/components/shared/elements/DriverCard";
// import "@/styles/sections/hauler.page.css";

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
