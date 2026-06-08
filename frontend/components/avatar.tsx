export function Avatar({
  name,
  url,
  size = 'md',
}: {
  name: string;
  url?: string | null;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dimensions = size === 'sm' ? 'h-12 w-12 text-base' : size === 'lg' ? 'h-16 w-16 text-xl' : 'h-12 w-12 text-base';

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        className={`${dimensions} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`flex ${dimensions} items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600`}>
      {name.charAt(0)}
    </div>
  );
}
