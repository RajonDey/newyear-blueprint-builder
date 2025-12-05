import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const posters = [
  "/assets/posters/yearinreview-poster-1.png",
  "/assets/posters/yearinreview-poster-2.png",
  "/assets/posters/yearinreview-poster-3.png",
  "/assets/posters/yearinreview-poster-4.png",
  "/assets/posters/yearinreview-poster-5.png",
  "/assets/posters/yearinreview-poster-6.png",
];

export const ShowcaseSection = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-secondary/20 overflow-hidden">
      <div className="container mx-auto px-4 mb-12 md:mb-20">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-primary"
          >
            What You'll Receive
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground"
          >
            Your comprehensive 2025 Blueprint includes a personalized PDF Report and an interactive Notion Template. 
            Everything you need to turn your dreams into reality.
          </motion.p>
        </div>
      </div>

      {/* Marquee Effect Container */}
      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-background to-transparent z-10" />
        
        <div className="flex gap-6 md:gap-8 animate-scroll-left hover:[animation-play-state:paused] w-max px-4">
          {/* Double the posters for seamless loop */}
          {[...posters, ...posters].map((poster, index) => (
            <div 
              key={index}
              className={cn(
                "relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 transition-transform hover:scale-[1.02] duration-300",
                // Handle the tall image (poster 6) differently if needed, but for a horizontal scroll, fixed height is better
                "h-[400px] md:h-[600px] w-auto aspect-[1587/2245]"
              )}
            >
              <img 
                src={poster} 
                alt={`Blueprint Bundle Preview ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
