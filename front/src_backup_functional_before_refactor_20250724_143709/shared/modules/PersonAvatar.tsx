// File: front/src/components/shared/modules/PersonAvatar.tsx
// Účel: Znovupoužiteľný komponent pre zobrazenie avatara osoby.

import React from "react";
// ZMENA: Importujeme správny komponent "PhotoCard"
import { PhotoCard } from "@/shared/elements/PhotoCard";

interface PersonAvatarProps {
  src: string;
  alt: string;
  className?: string;
}

export const PersonAvatar: React.FC<PersonAvatarProps> = ({ src, alt, className }) => (
  // ZMENA: Používame správny komponent <PhotoCard /> a správnu vlastnosť "shape"
  <PhotoCard
    src={src}
    alt={alt}
    shape="circle" 
    fallbackSrc="/people/placeholder.jpg"
    className={className}
  />
);

export default PersonAvatar;