import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${maxWidthClasses[maxWidth]}`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E1D7] bg-white">
            <h3 className="text-lg font-serif font-bold text-[#1B1A18]">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 text-[#6F6A62] hover:text-[#1B1A18] hover:bg-[#FAF8F3] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: 'left' | 'right';
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  position = 'right',
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative z-10 w-full max-w-md bg-[#FAF8F3] border-[#E7E1D7] shadow-2xl flex flex-col h-full transition-transform duration-300 ${
          position === 'right' ? 'ml-auto border-l' : 'mr-auto border-r'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E1D7] bg-white">
          <h3 className="text-lg font-serif font-bold text-[#1B1A18]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-[#6F6A62] hover:text-[#1B1A18] hover:bg-[#FAF8F3] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};
