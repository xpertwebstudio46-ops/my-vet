"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How long does verification take?",
    answer:
      "Our team typically verifies new practice registrations within 24–48 business hours to ensure quality and trust across our platform.",
  },
  {
    question: "Can I upgrade my plan later?",
    answer:
      "Yes. You can upgrade, downgrade or change your subscription whenever you need from your dashboard.",
  },
  {
    question: "How do customer reviews work?",
    answer:
      "Customers can leave verified reviews after using your services. Reviews help build trust and improve your visibility.",
  },
  {
    question: "Is there a long-term contract?",
    answer:
      "No. All plans are flexible and can be cancelled anytime according to your billing cycle.",
  },
  {
    question: "Can I update my practice information after registration?",
    answer:
      "Absolutely. You can edit your profile, services, contact details and other information whenever required.",
  },
];

export default function FaqSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-5xl px-5">

        <h2 className="mb-8 text-center text-[32px] font-bold leading-tight text-[#064071] font-heading sm:mb-12 sm:text-[40px]">
          Frequently Asked Questions
        </h2>

        <Accordion
          defaultValue={["item-0"]}
          className="space-y-5"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <AccordionTrigger
                className="
                  px-6
                  py-6
                  text-left
                  text-[22px]
                  font-normal
                  font-sans
                  hover:no-underline
                  [&>svg]:h-5
                  [&>svg]:w-5
                  [&>svg]:text-gray-500
                "
              >
                {faq.question}
              </AccordionTrigger>

              <AccordionContent className="px-6 pb-6 text-[18px] leading-7 text-[#475569] font-sans">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

      </div>
    </section>
  );
}
