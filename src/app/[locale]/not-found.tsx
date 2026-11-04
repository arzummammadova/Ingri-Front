import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="grid min-h-[50vh] place-items-center px-4 text-center">
      <div>
        <p className="text-display font-semibold">404</p>
        <Link href="/" className="mt-4 inline-flex rounded-full bg-lilac px-5 py-3 font-semibold text-ink">Ingri</Link>
      </div>
    </div>
  );
}
