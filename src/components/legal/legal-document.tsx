import { getTranslations } from "next-intl/server";

type LegalSection = {
  heading: string;
  body: string | string[];
};

type LegalDocumentProps = {
  namespace: string;
};

export async function LegalDocument({ namespace }: LegalDocumentProps) {
  const t = await getTranslations(namespace);
  const sections = t.raw("sections") as LegalSection[];
  const disclaimer = t("disclaimer");

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-[#1a2b48]">{t("title")}</h1>
        <p className="text-sm text-neutral-500">{t("lastUpdated")}</p>
      </header>

      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {disclaimer}
      </p>

      <div className="flex flex-col gap-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        {sections.map((section) => (
          <section className="flex flex-col gap-2" key={section.heading}>
            <h2 className="text-lg font-semibold text-[#1a2b48]">
              {section.heading}
            </h2>
            {Array.isArray(section.body) ? (
              section.body.map((paragraph) => (
                <p
                  className="text-sm leading-relaxed text-neutral-600"
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-sm leading-relaxed text-neutral-600">
                {section.body}
              </p>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
