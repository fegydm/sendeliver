// File: front/src/components/hauler/people/modules/PeopleImageModule.tsx
import React from "react";
import { PhotoModule } from "@/components/shared/elements/PhotoCard";

interface PeopleImageModuleProps {
  src: string;
  alt: string;
}

export const PeopleImageModule: React.FC<PeopleImageModuleProps> = ({ src, alt }) => (
  <PhotoModule
    src={src}
    alt={alt}
    mask="circle"
    fallbackSrc="/people/placeholder.jpg"
  />
);
