/**
 * Full-page centered spinner shown while lazy-loaded route chunks are fetched.
 */
const LoadingFallback: () => React.ReactNode = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

export default LoadingFallback;
