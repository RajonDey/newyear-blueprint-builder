import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FileText, Quote, Target, TrendingUp } from "lucide-react";

const previewItems = [
  {
    type: "testimonial",
    icon: Quote,
    content: "This framework helped me finally stick to my goals. I achieved 80% of what I planned!",
    author: "Sarah M.",
  },
  {
    type: "stat",
    icon: TrendingUp,
    content: "Users report 3.5x higher goal achievement rates compared to traditional planning",
    author: "2024 User Study",
  },
  {
    type: "feature",
    icon: Target,
    content: "Get a beautifully designed PDF with monthly check-ins, habit trackers, and motivation pages",
    author: "Premium PDF Output",
  },
  {
    type: "testimonial",
    icon: Quote,
    content: "The SMART framework and action breakdown made my big goals feel actually achievable!",
    author: "James K.",
  },
  {
    type: "feature",
    icon: FileText,
    content: "Your plan includes: Goal roadmap, monthly reviews, habit tracker, and emergency motivation page",
    author: "Complete Blueprint",
  },
];

export const ValuePreviewCarousel = () => {
  return (
    <div className="my-8">
      <h3 className="text-lg font-semibold text-center mb-4 text-foreground">
        What You'll Create
      </h3>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {previewItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <Card className="p-6 h-full bg-secondary/30 backdrop-blur-sm border-primary/10 hover-lift">
                  <div className="flex flex-col h-full">
                    <Icon className="w-8 h-8 text-primary mb-3" />
                    <p className="text-sm text-foreground leading-relaxed mb-3 flex-grow">
                      "{item.content}"
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      — {item.author}
                    </p>
                  </div>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};
