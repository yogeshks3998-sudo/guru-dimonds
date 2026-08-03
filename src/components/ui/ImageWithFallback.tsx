import React, { useState, useEffect } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
  alt: string;
}

const DEFAULT_JEWELLERY_FALLBACK = 'https://images.unsplash.com/photo-1611591475281-a120023a105f?auto=format&fit=crop&w=800&q=80';

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
