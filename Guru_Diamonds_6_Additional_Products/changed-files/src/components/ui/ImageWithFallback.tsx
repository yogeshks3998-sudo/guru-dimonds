import React, { useState, useEffect } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
  alt: string;
}

const DEFAULT_JEWELLERY_FALLBACK = '/images/product-placeholder.svg';

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = DEFAULT_JEWELLERY_FALLBACK,
  alt,
  className = '',
  onError,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  return (
    <img
      src={hasError ? fallbackSrc : imgSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={(e) => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        } else {
          e.currentTarget.onerror = null;
          e.currentTarget.src = DEFAULT_JEWELLERY_FALLBACK;
        }
        if (onError) {
          onError(e);
        }
      }}
      className={className}
      {...props}
    />
  );
};
