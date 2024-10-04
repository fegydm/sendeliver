import React from 'react';
import './App.css'; // Importovanie CSS pre App komponentu

function App() {
  return (
    <div className="container">
      <div className="client-section">
        <h1>Pre klientov</h1>
        <form className="form">
          <label htmlFor="location">Zadanie mesta:</label>
          <input type="text" id="location" placeholder="Mesto" required />
          
          <label htmlFor="weight">Hmotnosť tovaru:</label>
          <input type="number" id="weight" placeholder="Hmotnosť (kg)" required />
          
          <label htmlFor="time">Čas prepravy:</label>
          <input type="datetime-local" id="time" required />
          
          <button type="submit">Hľadať prepravu</button>
        </form>
      </div>
      <div className="carrier-section">
        <h1>Pre dopravcov</h1>
        <form className="form">
          <label htmlFor="search-location">Hľadanie mesta:</label>
          <input type="text" id="search-location" placeholder="Mesto" required />
          
          <label htmlFor="search-weight">Hmotnosť tovaru:</label>
          <input type="number" id="search-weight" placeholder="Hmotnosť (kg)" required />
          
          <button type="submit">Hľadať vhodný transport</button>
        </form>
      </div>
    </div>
  );
}

export default App;
