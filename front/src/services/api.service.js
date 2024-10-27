// src/api.js
const apiUrl = "https://dminvest.onrender.com";

export const getProducts = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/products`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const addProduct = async (product) => {
  try {
    const response = await fetch(`${apiUrl}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};
