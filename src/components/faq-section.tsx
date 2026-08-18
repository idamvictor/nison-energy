import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/reveal";
import { SectionKicker } from "@/components/section-kicker";
import { faqCategories } from "@/lib/faqs";

export function FaqSection() {
  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <SectionKicker center />
          <h2 className="mt-4 text-center text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
            Common Questions, Straight Answers
          </h2>
        </Reveal>

        <div className="mt-12 flex flex-col gap-10">
          {faqCategories.map((category, catIndex) => (
            <Reveal key={category.category} delay={catIndex * 60}>
              <div>
                <h3 className="font-heading text-lg font-semibold text-primary">
                  {category.category}
                </h3>
                <Accordion className="mt-2">
                  {category.items.map((item, i) => (
                    <AccordionItem
                      key={item.question}
                      value={`${category.category}-${i}`}
                      className="border-border"
                    >
                      <AccordionTrigger className="py-4 text-base text-foreground">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
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
