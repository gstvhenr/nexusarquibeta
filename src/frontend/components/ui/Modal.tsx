import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { uiInteractionLockService } from '../../services/uiInteractionLockService';

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
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const modalBodyRef = useRef<HTMLDivElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);
  const releaseInteractionLockRef = useRef<(() => void) | null>(null);
  const handleClose = useCallback(() => {
    setIsClosing(true);
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      onClose();
      setIsClosing(false);
      closeTimerRef.current = null;
    }, 300); // match animation duration
  }, [onClose]);

  useEffect(() => {
    if (!isOpen && !isClosing) {
      if (releaseInteractionLockRef.current) {
        releaseInteractionLockRef.current();
        releaseInteractionLockRef.current = null;
      }
      return;
    }

    if (!releaseInteractionLockRef.current) {
      releaseInteractionLockRef.current = uiInteractionLockService.acquire();
    }

    return () => {
      if (releaseInteractionLockRef.current) {
        releaseInteractionLockRef.current();
        releaseInteractionLockRef.current = null;
      }
    };
  }, [isOpen, isClosing]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      const previousFocusedElement = previousFocusedElementRef.current;
      if (previousFocusedElement && document.contains(previousFocusedElement)) {
        previousFocusedElement.focus();
      }
      previousFocusedElementRef.current = null;
      return;
    }

    previousFocusedElementRef.current = document.activeElement as HTMLElement | null;
    const focusableSelector =
      'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
    const focusTarget =
      modalBodyRef.current?.querySelector<HTMLElement>(focusableSelector) ??
      modalContentRef.current;

    focusTarget?.focus();
  }, [isOpen]);

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
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex justify-center items-center p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={modalContentRef}
        className={`bg-surface rounded-xl shadow-lifted w-full max-h-full overflow-y-auto p-6 sm:p-8 relative transform transition-all ${sizeClasses[size] || sizeClasses['lg']} ${animationClass}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDownCapture={(e) => e.stopPropagation()}
        onKeyUpCapture={(e) => e.stopPropagation()}
        role="document"
        tabIndex={-1}
      >
        <header className="mb-6 pb-4 pr-12 border-b border-border-color">
          <h2
            id="modal-title"
            className="font-serif text-3xl font-bold leading-tight text-secondary break-words [overflow-wrap:anywhere]"
          >
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
        <div ref={modalBodyRef}>{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalRoot);
};

export default Modal;
