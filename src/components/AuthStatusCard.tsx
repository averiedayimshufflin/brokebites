import Link from "next/link";

type AuthStatusCardProps = {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
};

export default function AuthStatusCard({
  title,
  message,
  actionHref = "/sign-in",
  actionLabel = "Sign in with Google",
}: AuthStatusCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50 px-6">
      <section className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-orange-600">BrokeBites</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-950">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">{message}</p>
        <Link
          href={actionHref}
          className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          {actionLabel}
        </Link>
      </section>
    </main>
  );
}
