import { notFound } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 p-8">
      <LanguageSwitcher locale={locale} label={dict.switcher.label} />
      <h1 className="text-4xl font-semibold">{dict.home.greeting}</h1>
    </main>
  );
}
