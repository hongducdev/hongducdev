import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { projects } from "@/content/projects";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localeAlternates } from "@/lib/i18n/locale-alternates";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { projects: copy } = getDictionary(locale);
  return { title: `${copy.title} · hongducdev`, description: copy.description, alternates: localeAlternates(locale, "/projects") };
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const years = [...new Set(projects.map((p) => p.year))].sort((a, b) => b - a);

  return (
    <PageShell title={dict.projects.title} description={dict.projects.description}>
      {years.map((year) => (
        <section key={year} data-pond-avoid className="flex flex-col gap-5">
          <h2 className="text-[13px] opacity-40">{year}</h2>
          <ul className="flex flex-col gap-5">
            {projects
              .filter((p) => p.year === year)
              .map((project) => (
                <li key={project.url} className="flex flex-col gap-1">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ink-link w-fit opacity-90 hover:opacity-100 focus-visible:opacity-100"
                  >
                    {project.title}
                    <span className="ml-2 text-[12px] opacity-40">{dict.projects[project.kind]}</span>
                  </a>
                  <p className="opacity-60">{project.description[locale]}</p>
                  <p className="text-[12px] opacity-40">{project.stack.join(" · ")}</p>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </PageShell>
  );
}
