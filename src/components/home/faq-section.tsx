import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";
import { homeFaqCategories, type FaqCategory } from "@/lib/faqs";

export function FaqSection({
  categories = homeFaqCategories,
  title = "Common Questions, Straight Answers",
}: {
  categories?: FaqCategory[];
  title?: string;
}) {
  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Reveal>
          <SectionKicker center />
          <h2 className="mt-3 text-center text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
            {title}
          </h2>
        </Reveal>

        <div className="mt-7 flex flex-col gap-6">
          {categories.map((category, catIndex) => (
            <Reveal key={category.category} delay={catIndex * 60}>
              <div>
                <h3 className="font-heading text-lg font-semibold text-primary">
                  {category.category}
                </h3>
                <Accordion className="mt-1">
                  {category.items.map((item, i) => (
                    <AccordionItem
                      key={item.question}
                      value={`${category.category}-${i}`}
                      className="border-border"
                    >
                      <AccordionTrigger className="py-2.5 text-base text-foreground">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-1.5 pb-2 text-muted-foreground">
                        <p>{item.answer}</p>
                        {item.link && (
                          <Link
                            href={item.link.href}
                            className="inline-flex w-fit items-center gap-1 font-medium text-primary hover:underline"
                          >
                            {item.link.label}
                            <ArrowRight className="size-3.5" />
                          </Link>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
