import React, { useState, useEffect, useMemo } from "react";
import "./hauler.cards.css";
import "./webcards.css";

// Mock dáta pre WebCardy
interface WebCard {
  id: number;
  name: string;
  domain: string; // napr. johntransport.sendeliver.com
  subDomain?: string; // napr. akcia (pre akcia.johntransport.sendeliver.com)
  status: "Aktívna" | "Neaktívna" | "Čaká na schválenie";
  views: number;
  color: string;
  modules: string[];
  createdAt: string;
  customDomain?: string; // napr. johntransport.com
}

const mockWebCards: WebCard[] = [
  {
    id: 1,
    name: "Hlavná stránka",
    domain: "johntransport.sendeliver.com",
    status: "Aktívna",
    views: 245,
    color: "#4caf50",
    modules: ["Úvod", "Flotila", "Kontakt", "Voľné vozidlá"],
    createdAt: "2023-04-01",
  },
  {
    id: 2,
    name: "Promo stránka",
    domain: "johntransport.sendeliver.com",
    subDomain: "akcia",
    status: "Aktívna",
    views: 120,
    color: "#ff9800",
    modules: ["Úvod", "Služby", "Novinky"],
    createdAt: "2023-04-15",
    customDomain: "promo.johntransport.com",
  },
];

// Dostupné moduly
const AVAILABLE_MODULES = [
  "Úvod",
  "Flotila",
  "Poslanie",
  "Kontakt",
  "Voľné vozidlá",
  "Služby",
  "O nás",
  "Referencie",
  "Novinky",
  "Kariéra",
];

const HaulerWebCards: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingCard, setEditingCard] = useState<WebCard | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [domainInput, setDomainInput] = useState<string>("");

  // Simulácia načítania
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Načítanie demo dát pre neregov
  useEffect(() => {
    const savedData = localStorage.getItem("neregWebCards");
    if (savedData) {
      console.log("Načítané demo dáta:", JSON.parse(savedData));
    }
    localStorage.setItem("neregWebCards", JSON.stringify(mockWebCards));
  }, []);

  // Reset domainInput pri otváraní editora
  useEffect(() => {
    if (showEditor) {
      setDomainInput(editingCard?.domain.replace(".sendeliver.com", "") || "");
    }
  }, [showEditor, editingCard]);

  // Formátovanie dátumu
  const formatDate = (dateStr: string): string => {
    return new Intl.DateTimeFormat("sk-SK", { day: "numeric", month: "long", year: "numeric" }).format(new Date(dateStr));
  };

  // Validácia domény (mock)
  const validateDomain = (domain: string, subDomain?: string): Promise<boolean> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const fullDomain = subDomain ? `${subDomain}.${domain}` : domain;
        const isTaken = mockWebCards.some(card => 
          (card.subDomain ? `${card.subDomain}.${card.domain}` : card.domain) === fullDomain
        );
        resolve(!isTaken);
      }, 500);
    });
  };

  // Filtrovanie a vyhľadávanie WebCardov
  const filteredWebCards = useMemo(() => {
    let result = [...mockWebCards];
    if (filterStatus !== "all") {
      result = result.filter(card => card.status.toLowerCase() === filterStatus.toLowerCase());
    }
    if (searchTerm) {
      result = result.filter(card =>
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (card.subDomain && `${card.subDomain}.${card.domain}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (card.customDomain && card.customDomain.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return result;
  }, [filterStatus, searchTerm]);

  // Formulár na vytvorenie/úpravu WebCardu
  const handleSaveWebCard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const domain = `${formData.get("domain")}.sendeliver.com`;
    const subDomain = formData.get("subDomain") as string || undefined;
    const fullDomain = subDomain ? `${subDomain}.${domain}` : domain;

    const isDomainAvailable = await validateDomain(domain, subDomain);
    if (!isDomainAvailable && (!editingCard || editingCard.domain !== domain || editingCard.subDomain !== subDomain)) {
      setDomainError(`Doména ${fullDomain} je už obsadená.`);
      return;
    }

    const newCard: WebCard = {
      id: editingCard ? editingCard.id : Date.now(),
      name: formData.get("name") as string,
      domain,
      subDomain,
      status: editingCard ? editingCard.status : "Čaká na schválenie",
      views: editingCard ? editingCard.views : 0,
      color: formData.get("color") as string,
      modules: AVAILABLE_MODULES.filter(mod => formData.get(mod) === "on"),
      createdAt: editingCard ? editingCard.createdAt : new Date().toISOString().split("T")[0],
      customDomain: formData.get("customDomain") as string || undefined,
    };
    console.log("Uložený WebCard:", newCard);
    setShowEditor(false);
    setDomainError(null);
    alert("WebCard uložený (placeholder)");
  };

  return (
    <div className="hauler-card webcards-container">
      <div className="webcards-header animate-in">
        <h2>Webové stránky</h2>
        <div className="webcards-actions">
          <button
            className="webcards-action-button"
            aria-label="Vytvoriť novú webovú stránku"
            onClick={() => {
              setEditingCard(null);
              setShowEditor(true);
            }}
          >
            + Nová stránka
          </button>
          <button
            className="webcards-action-button secondary"
            aria-label="Exportovať štatistiky"
            onClick={() => alert("Export štatistík (placeholder)")}
          >
            Export
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="webcards-loading animate-in">
          <div className="spinner"></div>
          <p>Načítavam webové stránky...</p>
        </div>
      ) : (
        <div className="webcards-content">
          {/* Prémiová sekcia */}
          <div className="premium-section animate-in">
            <h3>Vaša vlastná webová stránka</h3>
            <p>
              Vytvorte si profesionálnu stránku na unikátnej subdoméne <strong>xyz.sendeliver.com</strong> alebo podsubdoméne ako <strong>akcia.xyz.sendeliver.com</strong>. Presmerujte vlastnú doménu a prispôsobte moduly. Len za <strong>98 € ročne</strong>!
            </p>
          </div>

          {/* Filtrovanie a vyhľadávanie */}
          <div className="webcards-filters animate-in">
            <div className="filter-group">
              <label htmlFor="status-filter">Stav:</label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filtrovať podľa stavu"
              >
                <option value="all">Všetky</option>
                <option value="Aktívna">Aktívne</option>
                <option value="Neaktívna">Neaktívne</option>
                <option value="Čaká na schválenie">Čaká na schválenie</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="search">Hľadať:</label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Hľadať podľa názvu alebo domény"
                aria-label="Vyhľadávanie webových stránok"
              />
            </div>
          </div>

          {/* Zoznam WebCardov */}
          <div className="webcards-list">
            {filteredWebCards.map(card => (
              <div key={card.id} className="webcard-item animate-in">
                <div className="webcard-info">
                  <div className="webcard-name">{card.name}</div>
                  <div className="webcard-domain">
                    {card.subDomain ? `${card.subDomain}.${card.domain}` : card.customDomain || card.domain}
                  </div>
                  <div className="webcard-stats">
                    <span className={`status-badge status-${card.status.toLowerCase().replace(" ", "-")}`}>
                      {card.status}
                    </span>
                    <div className="webcard-views">{card.views} zobrazení</div>
                    <div className="webcard-created">Vytvorené: {formatDate(card.createdAt)}</div>
                  </div>
                </div>

                {/* Taby s modulmi */}
                <div className="webcard-modules">
                  <div className="module-tabs">
                    {card.modules.map((module, index) => (
                      <button
                        key={module}
                        className={`module-tab ${activeTab === index ? "active" : ""}`}
                        onClick={() => setActiveTab(index)}
                        aria-label={`Zobraziť modul ${module}`}
                      >
                        {module}
                      </button>
                    ))}
                  </div>
                  <div className="module-content">
                    <div
                      className="module-card animate-in"
                      style={{ backgroundColor: card.color }}
                    >
                      <h3>{card.modules[activeTab]}</h3>
                      <p>
                        {card.modules[activeTab] === "Voľné vozidlá"
                          ? "Dynamický zoznam vozidiel z administrátorského režimu (napr. ID, dostupnosť)."
                          : `Prispôsobiteľný obsah pre modul ${card.modules[activeTab]}. Pridajte texty, obrázky a ďalšie prvky.`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="webcard-actions">
                  <button
                    onClick={() => {
                      setEditingCard(card);
                      setShowEditor(true);
                    }}
                    aria-label={`Upraviť stránku ${card.name}`}
                  >
                    Upraviť
                  </button>
                  <button
                    onClick={() => alert(`Štatistiky pre ${card.name} (placeholder)`)}
                    aria-label={`Zobraziť štatistiky ${card.name}`}
                  >
                    Štatistiky
                  </button>
                  <button
                    onClick={() => alert(`Deaktivovať ${card.name} (placeholder)`)}
                    aria-label={`Deaktivovať stránku ${card.name}`}
                    className="secondary"
                  >
                    Deaktivovať
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modál pre editor */}
          {showEditor && (
            <div className={`webcard-editor-modal ${showEditor ? "animate-in" : "animate-out"}`}>
              <div className="editor-content">
                <h3>{editingCard ? `Úprava: ${editingCard.name}` : "Nová webová stránka"}</h3>
                <form onSubmit={handleSaveWebCard}>
                  <div className="form-group">
                    <label htmlFor="name">Názov stránky:</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      defaultValue={editingCard?.name || ""}
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="domain">Subdoména:</label>
                    <div className="domain-input">
                      <input
                        id="domain"
                        name="domain"
                        type="text"
                        value={domainInput}
                        onChange={(e) => {
                          setDomainInput(e.target.value);
                          setDomainError(null);
                        }}
                        placeholder="napr. johntransport"
                        required
                        aria-required="true"
                      />
                      <span>.sendeliver.com</span>
                    </div>
                    {domainError && <div className="error-message">{domainError}</div>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="subDomain">Podsubdoména (voliteľné):</label>
                    <div className="domain-input">
                      <input
                        id="subDomain"
                        name="subDomain"
                        type="text"
                        defaultValue={editingCard?.subDomain || ""}
                        placeholder="napr. akcia"
                        onChange={() => setDomainError(null)}
                      />
                      {domainInput && <span>.{domainInput}.sendeliver.com</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="customDomain">Vlastná doména (voliteľné):</label>
                    <input
                      id="customDomain"
                      name="customDomain"
                      type="text"
                      defaultValue={editingCard?.customDomain || ""}
                      placeholder="napr. moja.domena.sk"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="color">Farba:</label>
                    <input
                      id="color"
                      name="color"
                      type="color"
                      defaultValue={editingCard?.color || "#4caf50"}
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="form-group">
                    <label>Moduly:</label>
                    <div className="modules-checkboxes">
                      {AVAILABLE_MODULES.map(module => (
                        <div key={module} className="module-checkbox">
                          <input
                            type="checkbox"
                            id={module}
                            name={module}
                            defaultChecked={editingCard?.modules.includes(module)}
                          />
                          <label htmlFor={module}>{module}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="editor-actions">
                    <button type="button" onClick={() => {
                      setShowEditor(false);
                      setDomainError(null);
                    }}>
                      Zrušiť
                    </button>
                    <button type="submit">Uložiť</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HaulerWebCards;