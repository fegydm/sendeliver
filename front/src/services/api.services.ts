// .front/src/services/api.service.ts
const apiUrl = 'https://dminvest.onrender.com';

// Typ for product
interface Product {
  id?: string; 
  name: string;
  price: number;
  description: string;
  // add next here
}

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${apiUrl}/api/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const addProduct = async (product: Product): Promise<Product> => {
  try {
    const response = await fetch(`${apiUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error('Failed to add product');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};
