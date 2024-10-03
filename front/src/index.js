import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// src/App.js
import React, { useEffect, useState } from "react";
import { getProducts, addProduct } from "./api"; // Importuj API funkcie

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    }
    fetchData();
  }, []);

  const handleAddProduct = async () => {
    const newProduct = { name: "New Product", price: 100 };
    const addedProduct = await addProduct(newProduct);
    setProducts((prevProducts) => [...prevProducts, addedProduct]);
  };

  return (
    <div className="App">
      <h1>Products</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
      <button onClick={handleAddProduct}>Add Product</button>
    </div>
  );
}

export default App;

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
