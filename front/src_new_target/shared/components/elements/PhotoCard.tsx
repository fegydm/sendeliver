// File: front/src/components/shared/elements/PhotoCard.tsx
// Generic image card with optional upload. BEM block: `photo-card`.
// Variants: `photo-card--square` (default) | `photo-card--circle`
// Elements: `photo-card__overlay`, `photo-card__icon`

import React, { useRef, useState } from "react";
import "./PhotoCard.css";

/* --------------------------------------------------
   Types
---------------------------------------------------*/
export interface PhotoCardProps {
  /** Image source */
  src: string;
  /** Alt text */
  alt: string;
  /** circle | square (rounded square) */
  shape?: "square" | "circle";
  /** Fallback image if load fails */
  fallbackSrc?: string;
  /** Wrapper class override */
  className?: string;
  /** Fixed size in px */
  size?: number;
  /** Enable click‑to‑upload */
  uploadable?: boolean;
  /** Callback with processed file */
  onUpload?: (file: File) => void;
  /** Resize WebP options */
  maxWidth?: number;
  quality?: number;
}

/* --------------------------------------------------
   Component
---------------------------------------------------*/
export const PhotoCard: React.FC<PhotoCardProps> = ({
  src,
  alt,
  shape = "square",
  fallbackSrc = "/img/placeholder.jpg",
  className = "",
  size = 150,
  uploadable = false,
  onUpload,
  maxWidth = 1000,
  quality = 0.8,
}) => {
  const [preview, setPreview] = useState(src);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* -- helpers -- */
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = fallbackSrc;
    e.currentTarget.classList.add("photo-card--fallback");
  };

  const triggerFile = () => uploadable && fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const webp = await convertToWebP(file, maxWidth, quality);
      const url = URL.createObjectURL(webp);
      setPreview(url);
      onUpload?.(webp);
    } catch (err) {
      console.error("PhotoCard: convert error", err);
      const url = URL.createObjectURL(file);
      setPreview(url);
      onUpload?.(file);
    }
  };

  /* -- render -- */
  return (
    <div
      className={`photo-card photo-card--${shape} ${className}`.trim()}
      style={{ width: size, height: size }}
      onClick={triggerFile}
    >
      <img
        src={preview}
        alt={alt}
        onError={handleError}
        loading="lazy"
        className="photo-card__img"
      />

      {uploadable && (
        <>
          <div className="photo-card__overlay">
            <span className="photo-card__icon">📤</span>
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            hidden
          />
        </>
      )}
    </div>
  );
};

export default PhotoCard;

/* --------------------------------------------------
   Helpers
---------------------------------------------------*/
async function convertToWebP(
  file: File,
  maxWidth: number,
  quality: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas ctx"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        blob => {
          if (!blob) return reject(new Error("blob fail"));
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" }));
        },
        "image/webp",
        quality
      );
    };
    img.onerror = () => reject(new Error("img load"));
    img.src = URL.createObjectURL(file);
  });
}
