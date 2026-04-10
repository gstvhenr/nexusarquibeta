type TaskToastProps = {
  message: string;
};

export function TaskToast({ message }: TaskToastProps): JSX.Element {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
      <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-surface border border-border-color shadow-lg backdrop-blur-sm">
        <span className="text-warning">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </span>
        <span className="text-sm font-medium text-text-primary">{message}</span>
      </div>
    </div>
  );
}
