import React from 'react';
import { CheckCircleIcon } from '../../components/ui/icons';

type CashBoxToastProps = {
  message: string | null;
};

export const CashBoxToast: (props: CashBoxToastProps) => React.ReactNode = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
      <div className="bg-success text-white px-5 py-3 rounded-xl shadow-lifted font-semibold text-sm flex items-center gap-2">
        <CheckCircleIcon className="w-5 h-5" />
        {message}
      </div>
    </div>
  );
};
