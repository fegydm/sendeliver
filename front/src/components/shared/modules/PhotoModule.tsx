// File: front/src/components/shared/modules/PhotoModule.tsx
import React, { useRef, useState } from "react";

/* ---------- types ---------- */
export interface PhotoModuleProps {
  src: string;
  alt: string;
  /** "square" (default) | "circle" */
  mask?: "square" | "circle";
  /** Fallback image if load fails */
  fallbackSrc: string;
  /** Optional className for wrapper */
  className?: string;

  /* upload-to-WebP settings */
  onUpload?: (file: File) => void;
  maxWidth?: number;
  quality?: number;
}

/* ---------- component ---------- */
export const PhotoModule: React.FC<PhotoModuleProps> = ({
  src,
  alt,
  mask = "square",
  fallbackSrc,
  className = "",
  onUpload,
  maxWidth = 1000,
  quality = 0.8,
}) => {
  const [preview, setPreview] = useState(src);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = fallbackSrc;
    e.currentTarget.classList.add("fallback-image");
  };

  const chooseFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const webpFile = await convertToWebP(file, maxWidth, quality);
    setPreview(URL.createObjectURL(webpFile));
    onUpload?.(webpFile);
  };

  return (
    <div className={`photo-module ${mask} ${className}`}>
      <img
        src={preview}
        alt={alt}
        onError={handleError}
        loading="lazy"
        onClick={chooseFile}
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
};

/* --- helper --- */
async function convertToWebP(
  file: File,
  maxWidth: number,
  quality: number
): Promise<File> {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();

  const scale = Math.min(1, maxWidth / img.width);
  const canvas = document.createElement("canvas");
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);

  const blob: Blob = await new Promise((res) =>
    canvas.toBlob(b => res(b as Blob), "image/webp", quality)
  );

  return new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
    type: "image/webp",
  });
}
