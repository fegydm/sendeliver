// File: front/src/components/sections/main-content.component.tsx
// Main content component for all tabs, consistent layout based on provided design

import React from "react";
import "./banner-h.component.css"; // Reuse the same styles

interface MainContentProps {
  activeTab: string;
  section: "sender" | "hauler";
}

const MainContent: React.FC<MainContentProps> = ({ activeTab, section }) => {
  // Sample data for People tab (can be fetched from backend in real app)
  const peopleData = [
    { name: "Peter Anderson", phone: "123-456-7890", email: "peter@example.com" },
    { name: "Brett Canolani", phone: "234-567-8901", email: "brett@example.com" },
    { name: "Karen Jones", phone: "345-678-9012", email: "karen@example.com" },
  ];

  // Sample data for Fleet tab
  const fleetData = [
    { type: "Dodávka plachtová", licensePlate: "ABC123", status: "Aktívne" },
    { type: "Dodávka skriňová", licensePlate: "DEF456", status: "Servis" },
  ];

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div style={{ display: "flex", gap: "20px" }}>
            <div className="panel" style={{ flex: 1 }}>
              <h3>READY</h3>
              <div style={{ fontSize: "24px", color: "#FFD700" }}>2</div>
            </div>
            <div className="panel" style={{ flex: 1 }}>
              <h3>PARKING</h3>
              <div style={{ fontSize: "24px", color: "#FFD700" }}>5</div>
            </div>
            <div className="panel" style={{ flex: 2 }}>
              <h3>STATUS</h3>
              <div style={{ textAlign: "center" }}>
                {/* Placeholder for pie chart */}
                <div style={{ color: "#D32F2F" }}>Pie chart placeholder (35%, 29%, 11%)</div>
              </div>
            </div>
          </div>
        );

      case "people":
        return (
          <div style={{ display: "flex", gap: "20px" }}>
            {/* Left panel - List of people */}
            <div className="panel" style={{ width: "30%" }}>
              <h3>VODIČI</h3>
              {peopleData.map((person, index) => (
                <div key={index} className="list-item">
                  <div>👤</div>
                  <div>{person.name}</div>
                </div>
              ))}
            </div>
            {/* Center panel - Image placeholder */}
            <div className="content-area" style={{ width: "40%", textAlign: "center" }}>
              <h3>Image Placeholder</h3>
              <div style={{ backgroundColor: "#E0E0E0", height: "150px" }}>
                [Profile Image]
              </div>
            </div>
            {/* Right panel - Details */}
            <div className="panel" style={{ width: "30%" }}>
              <h3>DETAILY</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Kľúč</th>
                    <th>Hodnota</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Meno</td>
                    <td>{peopleData[0].name}</td>
                  </tr>
                  <tr>
                    <td>Telefón</td>
                    <td>{peopleData[0].phone}</td>
                  </tr>
                  <tr>
                    <td>Email</td>
                    <td>{peopleData[0].email}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case "fleet":
        return (
          <div style={{ display: "flex", gap: "20px" }}>
            {/* Left panel - List of vehicles */}
            <div className="panel" style={{ width: "30%" }}>
              <h3>VOZOVÝ PARK</h3>
              {fleetData.map((vehicle, index) => (
                <div key={index} className="list-item">
                  <div>🚛</div>
                  <div>{vehicle.type}</div>
                </div>
              ))}
            </div>
            {/* Center panel - Image placeholder */}
            <div className="content-area" style={{ width: "40%", textAlign: "center" }}>
              <h3>Image Placeholder</h3>
              <div style={{ backgroundColor: "#E0E0E0", height: "150px" }}>
                [Vehicle Image]
              </div>
            </div>
            {/* Right panel - Details */}
            <div className="panel" style={{ width: "30%" }}>
              <h3>DETAILY</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Kľúč</th>
                    <th>Hodnota</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Typ</td>
                    <td>{fleetData[0].type}</td>
                  </tr>
                  <tr>
                    <td>ŠPZ</td>
                    <td>{fleetData[0].licensePlate}</td>
                  </tr>
                  <tr>
                    <td>Stav</td>
                    <td>{fleetData[0].status}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case "shipments":
        return (
          <div>
            <div className="panel">
              <h3>OBJEDNÁVKY</h3>
              <button className="action-button">Export</button>
              <button className="action-button">Import</button>
            </div>
            <div className="content-area">
              <h3>Formulár pre objednávku</h3>
              <div>[Formulár placeholder]</div>
            </div>
          </div>
        );

      case "tracking":
        return (
          <div className="content-area">
            <h3>SLEDOVANIE</h3>
            <div>[Mapa placeholder]</div>
          </div>
        );

      case "directory":
        return (
          <div className="content-area">
            <h3>ADRESÁR</h3>
            <div>[Zoznam adries placeholder]</div>
          </div>
        );

      case "exchange":
        return (
          <div className="content-area">
            <h3>BURZA</h3>
            <div>[Zoznam ponúk placeholder]</div>
          </div>
        );

      case "billing":
        return (
          <div className="content-area">
            <h3>FAKTURÁCIA</h3>
            <div>[Zoznam faktúr placeholder]</div>
          </div>
        );

      case "analytics":
        return (
          <div className="content-area">
            <h3>ANALÝZA</h3>
            <div>[Grafy a štatistiky placeholder]</div>
          </div>
        );

      case "vizitky":
        return (
          <div className="content-area">
            <h3>VIZITKY</h3>
            <div>[Webvizitka placeholder]</div>
          </div>
        );

      case "logbook":
        return (
          <div className="content-area">
            <h3>LOG</h3>
            <div>[Záznamy placeholder]</div>
          </div>
        );

      default:
        return <div>Vyberte kartu</div>;
    }
  };

  return <div style={{ padding: "20px", backgroundColor: "#212121" }}>{renderContent()}</div>;
};

export default MainContent;