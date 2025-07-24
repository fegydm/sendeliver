// File: src/shared/components/maps/shared.boundary-colors.comp.tsx
// Last change: Replaced axios with fetch

import { useEffect, useState } from 'react';

interface Boundary {
  id: number;
  country_id: number | null;
  colour: string;
  name_sk?: string;
  code_2?: string;
}

const BoundaryColors = () => {
  const [boundaries, setBoundaries] = useState<boundary[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/boundaries`);
        if (!response.ok) throw new Error('Failed to fetch boundaries');
        const data = await response.json();
        setBoundaries(data);
      } catch (error) {
        console.error('Failed to fetch boundaries:', error);
      }
    };
    fetchData();
  }, []);

  const handleColorChange = async (id: number, colour: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/boundaries/${id}/color`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colour }),
      });
      if (!response.ok) throw new Error('Failed to update color');
      setBoundaries((prev) =>
        prev.map((b) => (b.id === id ? { ...b, colour } : b))
      );
    } catch (error) {
      console.error('Failed to update color:', error);
    }
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Country</th>
          <th>Code</th>
          <th>Color</th>
        </tr>
      </thead>
      <tbody>
        {boundaries.map((boundary) => (
          <tr key={boundary.id}>
            <td>{boundary.name_sk || `Boundary ${boundary.id}`}</td>
            <td>{boundary.code_2 || '-'}</td>
            <td>
              <input
                type="color"
                value={boundary.colour || '#cccccc'}
                onChange={(e) => handleColorChange(boundary.id, e.target.value)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default BoundaryColors;