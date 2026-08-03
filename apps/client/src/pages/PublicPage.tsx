import { ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BLOG_ARTICLE_PATHS,
  publicFaqItems,
  publicPageContent,
  publicUiText,
  parseLocalizedPublicPath,
  routeMeta,
  type ContentPagePath,
  type Locale,
  type PublicPath,
} from "@synapai/shared";
import BookCallButton from "../components/BookCallButton";
import { PublicPageMetadata } from "../components/PageMetadata";
import StartCta from "../components/StartCta";
import { localizedPath } from "../lib/i18n";
import { trackPublicEvent } from "../lib/publicAnalytics";
import LandingFooter from "./landing/LandingFooter";
import LandingNav from "./landing/LandingNav";

function linkFor(path: PublicPath): string {
  return localizedPath(path);
}

function Breadcrumbs({ path, locale, h1 }: { path: ContentPagePath; locale: Locale; h1: string }): JSX.Element {
  const ui = publicUiText(locale);
  const parent = path.startsWith("/use-cases/")
    ? { path: "/use-cases" as const, label: ui.useCases }
    : path.startsWith("/blogs/")
      ? { path: "/blogs" as const, label: ui.blogs }
      : null;
  return (
    <nav aria-label={ui.breadcrumbs} className="text-sm text-sub">
      <ol className="flex flex-wrap items-center gap-2">
        <li><Link to={linkFor("/")} className="hover:text-ink">{ui.home}</Link></li>
        {parent && (
          <>
            <li aria-hidden><ChevronRight size={14} /></li>
            <li><Link to={linkFor(parent.path)} className="hover:text-ink">{parent.label}</Link></li>
          </>
        )}
        <li aria-hidden><ChevronRight size={14} /></li>
        <li aria-current="page" className="max-w-[60ch] truncate text-ink">{h1}</li>
      </ol>
    </nav>
  );
}

function BlogList({ locale }: { locale: Locale }): JSX.Element {
  const ui = publicUiText(locale);
  return (
    <section aria-labelledby="blog-articles" className="mt-14">
      <h2 id="blog-articles" className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {ui.articles}
      </h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {BLOG_ARTICLE_PATHS.map((articlePath) => {
          const article = publicPageContent(articlePath, locale);
          const meta = routeMeta(articlePath, locale);
          return (
            <article key={articlePath} className="flex flex-col rounded-2xl border border-line bg-surface p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sub">
                {article.eyebrow}
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">
                <Link to={linkFor(articlePath)} className="hover:underline">
                  {article.h1}
                </Link>
              </h3>
              <p className="mt-4 flex-1 text-[15px] leading-7 text-sub">{article.lead}</p>
              <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-4 text-xs text-sub">
                {article.published && (
                  <span>
                    {ui.published}: <time dateTime={meta.lastModified}>{article.published}</time>
                  </span>
                )}
                <span>
                  {ui.updated}: <time dateTime={meta.lastModified}>{article.updated}</time>
                </span>
              </div>
              <Link
                to={linkFor(articlePath)}
                className="mt-5 inline-flex min-h-[44px] items-center justify-between gap-3 rounded-full border border-line bg-white px-5 text-sm font-semibold hover:border-[#CFCFCF]"
              >
                {ui.readArticle}
                <ChevronRight size={16} aria-hidden />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function FaqList({ locale }: { locale: Locale }): JSX.Element {
  const ui = publicUiText(locale);
  return (
    <section aria-labelledby="faq-list-title" className="mt-14">
      <h2 id="faq-list-title" className="text-2xl font-semibold tracking-tight">
        {ui.answers}
      </h2>
      <div className="mt-6 divide-y divide-line border-y border-line">
        {publicFaqItems(locale).map((item) => (
          <details key={item.question} className="group py-5">
            <summary className="cursor-pointer list-none pr-8 text-[1rem] font-semibold marker:hidden">
              {item.question}
            </summary>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-sub">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default function PublicPage(): JSX.Element {
  const location = useLocation();
  const parsed = parseLocalizedPublicPath(location.pathname);
  const parsedPath = parsed?.path;
  useEffect(() => {
    if (parsedPath && parsedPath !== "/" && parsedPath !== "/login") {
      trackPublicEvent("page_view", parsedPath);
    }
  }, [parsedPath]);
  if (!parsed || parsed.path === "/" || parsed.path === "/login") {
    return <div />;
  }
  const path = parsed.path as ContentPagePath;
  const { locale } = parsed;
  const content = publicPageContent(path, locale);
  const meta = routeMeta(path, locale);
  const ui = publicUiText(locale);
  const showContactAction = path === "/contact" || path === "/pricing";
  const showServiceAction = path === "/services";

  return (
    <div className="min-h-screen bg-base text-ink">
      <PublicPageMetadata path={path} locale={locale} />
      <LandingNav />
      <main className="pt-[calc(var(--nav-h)+3rem)]">
        <article className="mx-auto max-w-4xl px-6 pb-24">
          <Breadcrumbs path={path} locale={locale} h1={content.h1} />
          <header className="mt-12 border-b border-line pb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sub">{content.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
              {content.h1}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-sub">{content.lead}</p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-xs text-sub">
              <span>{ui.publisher}</span>
              {content.published && <span>{ui.published}: {content.published}</span>}
              <span>{ui.updated}: <time dateTime={meta.lastModified}>{content.updated}</time></span>
            </div>
          </header>

          <aside aria-labelledby="page-summary" className="mt-10 rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <h2 id="page-summary" className="text-lg font-semibold">{content.summaryTitle}</h2>
            <p className="mt-3 leading-7 text-sub">{content.summary}</p>
          </aside>

          {path === "/blogs" && <BlogList locale={locale} />}
          {path === "/faq" && <FaqList locale={locale} />}

          {path !== "/blogs" && <div className="mt-14 space-y-14">
            {content.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{section.heading}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-[16px] leading-8 text-sub">{paragraph}</p>
                ))}
                {section.bullets && (
                  <ul className="mt-5 list-disc space-y-3 pl-6 text-[16px] leading-7 text-sub">
                    {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                )}
                {section.examples && (
                  <div className="mt-5 rounded-2xl border border-line bg-surface p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sub">
                      {ui.examples}
                    </p>
                    <ul className="mt-3 space-y-3 text-[15px] leading-7">
                      {section.examples.map((example) => <li key={example}>{example}</li>)}
                    </ul>
                  </div>
                )}
                {section.table && (
                  <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
                    <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                      <thead className="bg-surface">
                        <tr>
                          {section.table.headers.map((header) => (
                            <th key={header} scope="col" className="border-b border-line px-4 py-3 font-semibold">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row) => (
                          <tr key={row.join("|")} className="border-b border-line last:border-0">
                            {row.map((cell, index) => index === 0
                              ? <th key={cell} scope="row" className="px-4 py-3 font-medium">{cell}</th>
                              : <td key={cell} className="px-4 py-3 leading-6 text-sub">{cell}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
          </div>}

          {showContactAction && (
            <section aria-labelledby="contact-action" className="mt-16 rounded-2xl bg-ink p-8 text-white">
              <h2 id="contact-action" className="text-2xl font-semibold">
                {ui.contactHeading}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                {ui.contactBody}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {path === "/contact" && (
                  <StartCta
                    label={ui.serviceCtaButton}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-ink hover:bg-darktext"
                  />
                )}
                <BookCallButton source="landing" variant="secondary" />
              </div>
            </section>
          )}

          {showServiceAction && (
            <section aria-labelledby="service-action" className="mt-16 rounded-2xl bg-ink p-8 text-white">
              <h2 id="service-action" className="text-2xl font-semibold">
                {ui.serviceCtaHeading}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                {ui.serviceCtaBody}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <StartCta
                  label={ui.serviceCtaButton}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-ink hover:bg-darktext"
                />
                <BookCallButton source="landing" variant="dark-outline" />
              </div>
            </section>
          )}

          {path !== "/blogs" && <section aria-labelledby="related-pages" className="mt-16 border-t border-line pt-10">
            <h2 id="related-pages" className="text-xl font-semibold">
              {ui.related}
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {content.related.map((link) => (
                <li key={link.path}>
                  <Link to={linkFor(link.path)} className="flex min-h-[52px] items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium hover:border-[#CFCFCF]">
                    {link.label}<ChevronRight size={16} aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>}

          {!showContactAction && !showServiceAction && path !== "/privacy" && path !== "/terms" && (
            <section className="mt-16 flex flex-col items-start justify-between gap-5 rounded-2xl border border-line bg-surface p-7 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-semibold">{ui.startHeading}</h2>
                <p className="mt-2 text-sm text-sub">{ui.startBody}</p>
              </div>
              <StartCta label={ui.startButton} className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-white" />
            </section>
          )}
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}
