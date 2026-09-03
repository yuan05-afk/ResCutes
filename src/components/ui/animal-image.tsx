"use client";

import { useEffect, useState } from "react";
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
  /**
   * Click to open full-size lightbox. Default true for all animal photos.
   * Pass false only for decorative / non-photo UI.
   */
  expandable?: boolean;
  lightboxCaption?: string;
  /** Show the Expand chip (default true). Small thumbs use a hover zoom icon when false. */
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
  expandable = true,
  lightboxCaption,
  showExpandHint = true,
}: AnimalImageProps) {
  const speciesFallback = getSpeciesImage(species);
  const initialSrc = src?.trim() ? src : speciesFallback;
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setImgSrc(src?.trim() ? src : speciesFallback);
    setShowPlaceholder(false);
  }, [src, speciesFallback]);

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

  const imageEl = (
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
  );

  if (!expandable) {
    return (
      <div
        className={cn(
          "relative overflow-hidden bg-sage/20",
          containerClassName,
        )}
      >
        {imageEl}
      </div>
    );
  }

  return (
    <>
      <ExpandablePhotoTrigger
        onClick={() => setLightboxOpen(true)}
        label={`View full photo of ${alt}`}
        showHint={showExpandHint}
        className={cn(
          "relative overflow-hidden bg-sage/20",
          containerClassName,
        )}
      >
        {imageEl}
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
