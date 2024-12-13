// .front/src/api/themes.api.ts
const API_URL = import.meta.env.VITE_API_URL; // Load backend API URL from .env

// Function to update theme
export const updateTheme = async (theme: any) => {
  const response = await fetch(`${API_URL}/themes/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(theme),
  });

  if (!response.ok) {
    throw new Error(`Failed to update theme: ${response.statusText}`);
  }

  return response.json();
};

// Function to fetch all themes (optional, for listing themes)
export const fetchThemes = async () => {
  const response = await fetch(`${API_URL}/themes`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch themes: ${response.statusText}`);
  }

  return response.json();
};
