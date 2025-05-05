// File: front/src/components/hauler/fleet/sections/DetailForm.tsx
import React from "react";

export interface DetailFormProps {
  editForm: React.ReactNode;
}

export const DetailForm: React.FC<DetailFormProps> = ({ editForm }) => {
  return <div className="detail-form">{editForm}</div>;
};
