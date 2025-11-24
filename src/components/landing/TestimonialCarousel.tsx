import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, Quote } from "lucide-react";
import { useState, useEffect } from "react";
import { SkeletonCard } from "@/components/ui/skeleton-card";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Marketing Director",
    image: "SC",
    rating: 5,
    text: "This is the first planning system that actually helped me follow through. The breakdown from goals to daily habits was exactly what I needed.",
  },
  {
    name: "Michael Rodriguez",
    role: "Software Engineer",
    image: "MR",
    rating: 5,
    text: "I've tried countless planning tools. This one is different - it's structured, actionable, and the PDF keeps me on track every day.",
  },
  {
    name: "Emma Thompson",
    role: "Freelance Designer",
    image: "ET",
    rating: 5,
    text: "The 10-minute investment changed my entire year. Having everything in Notion makes it so easy to track progress and stay motivated.",
  },
  {
    name: "James Park",
    role: "Entrepreneur",
    image: "JP",
    rating: 5,
    text: "Best $12 I spent this year. The frameworks used are proven and the execution is flawless. Already seeing results in week 1.",
  },
];

export const TestimonialCarousel = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading to show skeleton (optional - remove in production)
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="py-12 md:py-20 bg-secondary/30 scroll-fade-in">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Join Thousands Who Transformed Their Year
          </h2>
          <p className="text-lg text-muted-foreground">
            Real results from real people who used this exact system
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <SkeletonCard lines={4} showHeader={false} />
            <SkeletonCard lines={4} showHeader={false} className="hidden md:block" />
          </div>
        ) : (
          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
                <Card className="p-5 md:p-6 h-full bg-card/80 backdrop-blur-sm border-primary/10 hover-lift touch-feedback hover:bg-card/90 transition-all">
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />
                  
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-focus-primary fill-focus-primary" />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-foreground mb-6 leading-relaxed">
                    "{testimonial.text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {testimonial.image}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="tap-target" />
            <CarouselNext className="tap-target" />
          </Carousel>
        )}
      </div>
    </div>
  );
};
