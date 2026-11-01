import { notFound } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/config/site";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto flex h-[100dvh] w-full flex-col justify-end gap-10 px-6 pt-28 pb-12 lg:px-[20vw] lg:pb-32">
      <div data-pond-avoid className="fixed inset-x-0 top-0 flex items-center justify-center gap-8 pt-8 text-[13px] lowercase">
        <LanguageSwitcher locale={locale} label={dict.switcher.label} />
        <ThemeToggle label={dict.theme.toggle} light={dict.theme.light} dark={dict.theme.dark} />
      </div>
      <div data-pond-avoid className="flex flex-col gap-3 text-[14px] leading-relaxed lg:text-[15px]">
        <h1>{dict.home.greeting}</h1>
        <p>
          <a
            href={siteConfig.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="ink-link opacity-60 hover:opacity-100 focus-visible:opacity-100"
          >
            github
          </a>
        </p>
      </div>
    </main>
  );
}
