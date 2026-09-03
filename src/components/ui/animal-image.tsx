"use client";

import { useState } from "react";
import Image from "next/image";
import { PawPrint } from "lucide-react";
import { getSpeciesImage } from "@/lib/demo-images";
import { cn } from "@/lib/utils";
import {
  AnimalPhotoLightbox,
  ExpandablePhotoTrigger,
} from "@/components/ui/animal-photo-lightbox";

interface AnimalImageProps {
  src?: string;
  species: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  sizes?: string;
  objectPosition?: string;
  expandable?: boolean;
  lightboxCaption?: string;
  /** Show the zoom/Expand chip on the thumbnail (default true). */
  showExpandHint?: boolean;
}

export function AnimalImage({
  src,
  species,
  alt,
  className,
  containerClassName,
  sizes,
  objectPosition = "center top",
  expandable = false,
  lightboxCaption,
  showExpandHint = true,
}: AnimalImageProps) {
  const speciesFallback = getSpeciesImage(species);
  const initialSrc = src?.trim() ? src : speciesFallback;
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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

  const imageBlock = (
    <div className={cn("relative overflow-hidden bg-sage/20", containerClassName)}>
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        style={{ objectPosition }}
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

  if (!expandable) {
    return imageBlock;
  }

  return (
    <>
      <ExpandablePhotoTrigger
        onClick={() => setLightboxOpen(true)}
        label={`View full photo of ${alt}`}
        showHint={showExpandHint}
      >
        {imageBlock}
      </ExpandablePhotoTrigger>
      <AnimalPhotoLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        src={imgSrc}
        alt={alt}
        caption={lightboxCaption}
      />
    </>
  );
}
