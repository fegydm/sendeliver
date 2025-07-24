// CarMap.tsx
import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import obrázkov – uprav cesty, ak to potrebuješ (napr. podľa relatívnej cesty v tvojom projekte)
import lorryImage from '@/assets/lorry.webp';
import truckImage from '@/assets/truck.webp';
import vanImage from '@/assets/van.webp';

// Definícia typu pre vozidlo
type Vehicle = {
  id: string;
  lat: number;
  lng: number;
  image: string;
  location: string;
};

// Pole vozidiel s prednastavenými súradnicami a obrázkami
const vehicles: Vehicle[] = [
  { id: 'vehicle1', lat: 50.0755, lng: 14.4378, image: lorryImage, location: 'Prague' },
  { id: 'vehicle2', lat: 51.5136, lng: 7.4653, image: truckImage, location: 'Dortmund' },
  { id: 'vehicle3', lat: 48.5734, lng: 7.7521, image: vanImage, location: 'Strasbourg' },
];

const CarMap: React.FC = () => {
  useEffect(() => {
    // Nastavíme mapu s centrom, ktoré odráža priemerné hodnoty alebo približnú polohu medzi týmito mestami
    const mapCenter = [50.0, 11.0]; // Toto môžeš upraviť podľa potreby
    const map = L.map('map').setView(mapCenter, 5);

    // Pridáme OpenStreetMap dlaždice
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // Pole na uloženie markerov (pre neskoršie použitie, ak by to bolo potrebné)
    const markers: L.Marker[] = [];

    // Funkcia na vytvorenie vlastnej ikony pre vozidlo s vlastným obrázkom
    const createVehicleIcon = (imageUrl: string): L.Icon => {
      return L.icon({
        iconUrl: imageUrl,
        iconSize: [50, 50],       // Rozmery ikony – uprav podľa potreby
        iconAnchor: [25, 25],     // Stred ikony
        popupAnchor: [0, -25],    // Pozícia popupu
      });
    };

    // Pridáme vozidlá na mapu s vlastnými ikonami a popupmi
    vehicles.forEach(vehicle => {
      const icon = createVehicleIcon(vehicle.image);
      const marker = L.marker([vehicle.lat, vehicle.lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${vehicle.location}</b><br>(${vehicle.lat}, ${vehicle.lng})`);
      markers.push(marker);
    });

    // Vypočítame vzdialenosti medzi každým párom vozidiel pomocou metódy distanceTo (v metroch)
    for (let i = 0; i < vehicles.length; i++) {
      for (let j = i + 1; j < vehicles.length; j++) {
        const point1 = L.latLng(vehicles[i].lat, vehicles[i].lng);
        const point2 = L.latLng(vehicles[j].lat, vehicles[j].lng);
        const distance = point1.distanceTo(point2); // Vzdialenosť v metroch
        console.log(
          `Distance between ${vehicles[i].location} and ${vehicles[j].location}: ${distance.toFixed(2)} meters.`
        );
      }
    }

    // Cleanup – odstránenie mapy pri odmontovaní komponenty, aby sa predišlo únikom pamäti
    return () => {
      map.remove();
    };
  }, []);

  return <div id="map" style={{ height: '600px' }} />;
};

export default CarMap;
