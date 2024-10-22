import React from 'react';
import { Link } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player'; // Lottie React Player

// Importuj tvoju JSON animáciu
import animationData from '../animations/notfound.json'; 
const NotFound = () => {
  return (
    <div style={styles.container}>
      {/* Lottie animácia */}
      <Player
        autoplay
        loop
        src={animationData}
        style={{ height: '300px', width: '300px' }}
      />

      {/* Nadpis */}
      <h1 style={styles.heading}>Táto stránka sa na serveri nenachádza</h1>
      <p>
        Použite rozcestník <Link to="/" style={styles.link}>www.sendeliver.com</Link>
      </p>

      {/* Tlačidlo */}
      <Link to="/">
        <button style={styles.button}>Home</button>
      </Link>
    </div>
  );
};

// Štýly pre komponent
const styles = {
  container: {
    textAlign: 'center',
    marginTop: '50px',
  },
  heading: {
    fontSize: '24px',
    marginBottom: '20px',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  button: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default NotFound;
