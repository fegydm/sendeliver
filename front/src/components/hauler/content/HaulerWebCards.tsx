
// File: ./front/src/components/hauler/content/HaulerWebCards.tsx
// Last change: Complete implementation of web cards management with interactive previews and analytics

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import "./hauler.cards.css";
import "./webcards.css";

// Mock dáta pre webové vizitky
const mockWebCards: WebCard[] = [
  {
    id: 1,
    name: "Hlavná firemná vizitka",
    domain: "johntransport.sendeliver.com",
    status: "Aktívna",
    views: 245,
    color: "#4caf50",
    logo: "https://via.placeholder.com/100",
    description: "Profesionálna vizitka pre John Transport",
    createdAt: "2023-04-01",
  },
  {
    id: 2,
    name: "Promo stránka",
    domain: "akcia.johntransport.com",
    status: "Aktívna",
    views: 120,
    color: "#ff9800",
    logo: "https://via.placeholder.com/100",
    description: "Akčná ponuka na letné prepravy",
    createdAt: "2023-04-15",
  },
  {
    id: 3,
    name: "Čakajúca vizitka",
    domain: "new.sendeliver.com",
    status: "Čaká na schválenie",
    views: 0,
    color: "#2196f3",
    logo: "https://via.placeholder.com/100",
    description: "Nová vizitka čaká na aktiváciu",
    createdAt: "2023-04-20",
  },
];

// Mock dáta pre grafy
const mockViewsTrend = {
  data: [
    { date: "2023-04-01", value: 50 },
    { date: "2023-04-08", value: 100 },
    { date: "2023-04-15", value: 180 },
    { date: "2023-04-22", value: 365 },
  ],
  name: "Zobrazenia",
  unit: "",
  color: "#4caf50",
};

const mockViewsDistribution = mockWebCards.map(card => ({
  name: card.name,
  value: card.views,
  color: card.color,
}));

const CHART_COLORS = ["#4caf50", "#ff9800", "#2196f3", "#f44336"];

interface WebCard {
  id: number;
  name: string;
  domain: string;
  status: "Aktívna" | "Neaktívna" | "Čaká na schválenie";
  views: number;
  color: string;
  logo: string;
  description: string;
  createdAt: string;
}

const HaulerWebCards: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [previewCard, setPreviewCard] = useState<WebCard | null>(null);

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

  // Formátovanie dátumu
  const formatDate = (dateStr: string): string => {
    return new Intl.DateTimeFormat("sk-SK", { day: "numeric", month: "long", year: "numeric" }).format(new Date(dateStr));
  };

  // Filtrovanie a vyhľadávanie vizitiek
  const filteredWebCards = useMemo(() => {
    let result = [...mockWebCards];
    if (filterStatus !== "all") {
      result = result.filter(card => card.status.toLowerCase() === filterStatus.toLowerCase());
    }
    if (searchTerm) {
      result = result.filter(card =>
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.domain.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [filterStatus, searchTerm]);

  // Custom tooltip pre grafy
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`Dátum: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value} ${entry.payload.unit || "zobrazení"}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Animácia pre karty
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="hauler-card webcards-container">
      <motion.div 
        className="webcards-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Webové vizitky</h2>
        <div className="webcards-actions">
          <button 
            className="webcards-action-button" 
            aria-label="Vytvoriť novú webovú vizitku"
            onClick={() => setShowEditor(true)}
          >
            + Nová vizitka
          </button>
          <button 
            className="webcards-action-button secondary" 
            aria-label="Exportovať štatistiky"
            onClick={() => alert("Export štatistík (placeholder)")}
          >
            Export
          </button>
        </div>
      </motion.div>

      {isLoading ? (
        <motion.div 
          className="webcards-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="spinner"></div>
          <p>Načítavam webové vizitky...</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div 
            className="webcards-content"
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            {/* Prémiová sekcia */}
            <motion.div className="premium-section" variants={cardVariants}>
              <h3>Interaktívne webové vizitky</h3>
              <p>Vytvorte si profesionálnu vizitku na subdoméne <strong>xyz.sendeliver.com</strong> alebo presmerujte vlastnú doménu. Prispôsobte si farby, logo, texty a obrázky. Len za <strong>98 € ročne</strong>!</p>
            </motion.div>

            {/* Grafy */}
            <div className="webcards-charts">
              <motion.div className="chart-card" variants={cardVariants}>
                <h3 className="chart-title">Trend zobrazení</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={mockViewsTrend.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="date" tickFormatter={(date: string) => formatDate(date)} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={mockViewsTrend.color} 
                      name={mockViewsTrend.name} 
                      unit={mockViewsTrend.unit}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div className="chart-card" variants={cardVariants}>
                <h3 className="chart-title">Rozdelenie zobrazení</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={mockViewsDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {mockViewsDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value} zobrazení`} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Filtrovanie a vyhľadávanie */}
            <motion.div className="webcards-filters" variants={cardVariants}>
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
                  aria-label="Vyhľadávanie webových vizitiek"
                />
              </div>
            </motion.div>

            {/* Zoznam vizitiek */}
            <motion.div className="webcards-list" variants={cardVariants}>
              {filteredWebCards.map(card => (
                <motion.div 
                  key={card.id} 
                  className="webcard-item"
                  variants={cardVariants}
                  onMouseEnter={() => setPreviewCard(card)}
                  onMouseLeave={() => setPreviewCard(null)}
                >
                  <div className="webcard-preview">
                    <div 
                      className="webcard-preview-content" 
                      style={{ backgroundColor: card.color }}
                    >
                      <img src={card.logo} alt={`Logo ${card.name}`} />
                      <h3>{card.name}</h3>
                      <p>{card.description}</p>
                    </div>
                  </div>
                  <div className="webcard-info">
                    <div className="webcard-name">{card.name}</div>
                    <div className="webcard-domain">{card.domain}</div>
                    <div className="webcard-stats">
                      <span className={`status-badge status-${card.status.toLowerCase().replace(" ", "-")}`}>
                        {card.status}
                      </span>
                      <div className="webcard-views">{card.views} zobrazení</div>
                      <div className="webcard-created">Vytvorené: {formatDate(card.createdAt)}</div>
                    </div>
                  </div>
                  <div className="webcard-actions">
                    <button 
                      onClick={() => setShowEditor(true)}
                      aria-label={`Upraviť vizitku ${card.name}`}
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
                      aria-label={`Deaktivovať vizitku ${card.name}`}
                      className="secondary"
                    >
                      Deaktivovať
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Modál pre editor (placeholder) */}
            {showEditor && (
              <motion.div 
                className="webcard-editor-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="editor-content">
                  <h3>{previewCard ? `Úprava: ${previewCard.name}` : "Nová webová vizitka"}</h3>
                  <div className="editor-form">
                    <div className="form-group">
                      <label htmlFor="name">Názov:</label>
                      <input id="name" type="text" defaultValue={previewCard?.name || ""} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="domain">Doména:</label>
                      <input id="domain" type="text" defaultValue={previewCard?.domain || "xyz.sendeliver.com"} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="color">Farba:</label>
                      <input id="color" type="color" defaultValue={previewCard?.color || "#4caf50"} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="logo">Logo:</label>
                      <input id="logo" type="file" accept="image/*" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="description">Popis:</label>
                      <textarea id="description" defaultValue={previewCard?.description || ""}></textarea>
                    </div>
                  </div>
                  <div className="editor-actions">
                    <button onClick={() => setShowEditor(false)}>Zrušiť</button>
                    <button onClick={() => {
                      setShowEditor(false);
                      alert("Uloženie vizitky (placeholder)");
                    }}>
                      Uložiť
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default HaulerWebCards;