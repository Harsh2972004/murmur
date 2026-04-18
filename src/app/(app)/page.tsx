"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import messages from "@/messages.json";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center grow px-3 md:px-24 py-12 ">
      <section className="text-center mb-8 md:mb-12">
        <h1 className="text-4xl md:text-5xl font-bold">
          Dive into the world of anonymous conversations.
        </h1>
        <p className="mt-4 text-base md:text-lg">
          Explore Mystery Message — Where your identity remains a secret.
        </p>
      </section>
      <Carousel
        plugins={[Autoplay({ delay: 4000 })]}
        className="w-full lg:max-w-2/3"
      >
        <CarouselContent>
          {messages.map((message, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card className="md:w-full min-h-[40vh] lg:min-h-[50vh] relative text-white">
                  <CardHeader>
                    <p className="font-medium">{message.title}</p>
                    <p className="text-sm text-gray-300">{message.received}</p>
                  </CardHeader>
                  <CardContent className="absolute inset-0 flex items-center justify-center p-6">
                    <p className="text-lg md:text-xl lg:text-2xl font-semibold">
                      {message.content}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};

export default Home;
