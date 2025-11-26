import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { APP_CONFIG } from "@/lib/config";

const faqs = [
  {
    question: "Is this really free to use?",
    answer: `Yes! The entire planning process is completely free. You can create your full ${APP_CONFIG.year} plan at no cost. The optional full blueprint unlock and downloads are available for $9 (early access price) if you want a beautifully formatted version to keep and track.`,
  },
  {
    question: "How is this different from other planning tools?",
    answer: "Most planners are either too vague or too complex. This system combines 4 proven frameworks (Wheel of Life, SMART Goals, OKRs, and Atomic Habits) into one guided process. You get structure without overwhelm, and actionable steps without guessing.",
  },
  {
    question: "Do I need any planning experience?",
    answer: "Not at all! The system guides you through every step with clear questions and examples. Whether you're a planning pro or this is your first time, you'll finish with a complete, professional plan.",
  },
  {
    question: "How long does it really take?",
    answer: "About 10 minutes on average. Some people finish in 8, others take 12. The system is designed to be quick but thorough - you get the benefits of hours of planning in a fraction of the time.",
  },
  {
    question: "What if I want to change my plan later?",
    answer: "Your plan is flexible! If you get the Notion template, you can update goals, add new habits, and track progress throughout the year. The system grows with you.",
  },
  {
    question: "What exactly do I get when I unlock?",
    answer: `The unlocked blueprint includes your complete ${APP_CONFIG.year} plan beautifully formatted: Wheel of Life assessment, SMART goals, action breakdown, daily habits, motivation plan, and progress tracking sections. Plus the Notion template to track everything digitally.`,
  },
  {
    question: "Is there a refund policy?",
    answer: "Yes! 30-day money-back guarantee, no questions asked. If you're not satisfied with your PDF and template, simply email us for a full refund.",
  },
  {
    question: "Can I use this for business goals too?",
    answer: `Absolutely! The frameworks work for personal goals, business objectives, career development, health targets - any area where you want structured progress in ${APP_CONFIG.year}.`,
  },
];

export const FAQSection = () => {
  return (
    <div className="py-12 md:py-20 bg-secondary/30 scroll-fade-in">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Common Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know before starting
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-card border border-border rounded-lg px-6"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold text-foreground">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};
