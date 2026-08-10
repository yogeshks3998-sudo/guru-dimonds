import React from 'react';

interface CubeButtonProps {
  frontText: string;
  topText?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'gold' | 'green';
  target?: string;
  rel?: string;
}

export const CubeButton: React.FC<CubeButtonProps> = ({
  frontText,
  topText,
  onClick,
  href,
  className = '',
  variant = 'primary',
  target,
  rel,
}) => {
  const displayTopText = topText || frontText;

  const content = (
    <div className={`cube-scene ${className}`}>
      <div className={`cube-button cube-variant-${variant}`}>
        <span className="cube-side cube-side-top">{displayTopText}</span>
        <span className="cube-side cube-side-front">{frontText}</span>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className="inline-block">
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className="inline-block bg-transparent border-0 p-0 cursor-pointer">
      {content}
    </button>
  );
};

export default CubeButton;
