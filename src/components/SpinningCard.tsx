import Autoplay from "embla-carousel-autoplay"
import { useRef } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"




const featureCards = [
    {
    icon: "ti-coin",
    title: "Under $5 meals",
    desc: "Eat well without breaking the bank",
    image: "https://spoonacular.com/recipeImages/716429-312x231.jpg"
  },
  {
    icon: "ti-clock",
    title: "10-minute meals",
    desc: "Fast recipes for busy days",
    image: "https://spoonacular.com/recipeImages/640803-312x231.jpg"
  },
  {
    icon: "ti-microwave",
    title: "Microwave-only meals",
    desc: "No stove or oven needed",
    image: "https://spoonacular.com/recipeImages/649931-312x231.jpg"
  },
  {
    icon: "ti-barbell",
    title: "High-protein meals",
    desc: "Fuel your body and goals",
    image: "https://spoonacular.com/recipeImages/715415-312x231.jpg"
  },
    ]
export default function SpinningCard() {
   const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }))

      return (
  <Carousel className="p-4"  plugins={[plugin.current]}>
      <CarouselContent>
        {featureCards.map((slide) => (
          <CarouselItem key={slide.title} className="md:basis-1/2 lg:basis-1/3">
            <div className="relative rounded-2xl overflow-hidden h-72">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-black/50 backdrop-blur-md">
                <p className="text-white font-medium text-lg">{slide.title}</p>
                <p className="text-white/75 text-sm">{slide.desc}</p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
  
}
    
