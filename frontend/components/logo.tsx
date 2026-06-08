export function Logo({className = ''}: {className?: string}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="14" fill="#4f46e5" />
        <circle cx="11" cy="11" r="4.5" fill="white" />
        <circle cx="17.5" cy="17.5" r="3" fill="white" fillOpacity="0.85" />
      </svg>
      <span className="text-lg font-semibold text-indigo-600">SKOLZ</span>
    </span>
  );
}
