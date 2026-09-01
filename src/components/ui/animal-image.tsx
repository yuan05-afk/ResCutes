"use client";

import { useState } from "react";
import Image from "next/image";
import { PawPrint } from "lucide-react";
import { getSpeciesImage } from "@/lib/demo-images";
import { cn } from "@/lib/utils";

interface AnimalImageProps {
  src?: string;
  species: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  sizes?: string;
}

export function AnimalImage({
  src,
  species,
  alt,
  className,
  containerClassName,
  sizes,
}: AnimalImageProps) {
  const speciesFallback = getSpeciesImage(species);
  const initialSrc = src?.trim() ? src : speciesFallback;
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  if (showPlaceholder) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-sage/20",
          containerClassName,
        )}
      >
        <PawPrint className="h-5 w-5 text-sage/70" aria-hidden />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-sage/20", containerClassName)}>
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        unoptimized
        sizes={sizes}
        onError={() => {
          if (imgSrc !== speciesFallback) {
            setImgSrc(speciesFallback);
          } else {
            setShowPlaceholder(true);
          }
        }}
      />
    </div>
  );
}
