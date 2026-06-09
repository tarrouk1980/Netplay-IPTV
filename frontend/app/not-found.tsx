import {Link} from '@/i18n/navigation';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-bold text-indigo-200">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-neutral-800">Page introuvable</h1>
      <p className="mt-2 text-neutral-500">La page que vous cherchez n&apos;existe pas ou a été déplacée.</p>
      <Link href="/" className="mt-6 rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
