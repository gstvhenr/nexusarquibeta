import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'lg' | '2xl' | '4xl' | '5xl' | '6xl';
}

const Modal: (props: ModalProps) => React.ReactNode = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const modalRoot = typeof window !== 'undefined' ? document.getElementById('modal-root') : null;
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // match animation duration
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  if ((!isOpen && !isClosing) || !modalRoot) {
    return null;
  }

  const sizeClasses = {
    lg: 'max-w-lg',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
  };

  const animationClass = isClosing ? 'animate-fade-out-down' : 'animate-fade-in-up';

  const modalContent = (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex justify-center items-center p-4"
      onClick={handleClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className={`bg-surface rounded-xl shadow-lifted w-full p-6 sm:p-8 relative transform transition-all ${sizeClasses[size] || sizeClasses['lg']} ${animationClass}`}
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <header className="mb-6 pb-4 border-b border-border-color">
          <h2 id="modal-title" className="font-serif text-3xl font-bold text-secondary">
            {title}
          </h2>
        </header>
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-text-secondary hover:text-primary hover:bg-background transition-colors"
          aria-label="Fechar modal"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        <div>{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalRoot);
};

export default Modal;
