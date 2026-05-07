"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";

import type { BannerItem } from "@/types/banners";

type BannerCarouselProps = {
  banners: BannerItem[];
};

const BannerCarousel = ({ banners }: BannerCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: banners.length > 1,
    align: "start",
    dragFree: false,    
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const sync = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("init", sync);
    emblaApi.on("select", sync);
    emblaApi.on("reInit", sync);
    return () => {
      emblaApi.off("init", sync);
      emblaApi.off("select", sync);
      emblaApi.off("reInit", sync);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || banners.length <= 1) return;

    const autoplayInterval = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 3000);

    return () => {
      window.clearInterval(autoplayInterval);
    };
  }, [emblaApi, banners.length]);

  if (banners.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Promotional banners"
      className="w-full bg-bk-backdrop"
      role="region"
    >
      <div className="embla">
        <div className="embla__viewport overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex gap-0">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                aria-current={selectedIndex === index ? true : undefined}
                aria-label={`Slide ${index + 1} of ${banners.length}`}
                aria-roledescription="slide"
                className="embla__slide flex min-w-0 shrink-0 grow-0 basis-full flex-[0_0_100%] justify-center"
                role="group"
              >
                <Link
                  href={banner.url}
                  className="relative block h-[140px] w-full max-w-[310px] overflow-hidden outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <Image
                    src={banner.image.url}
                    alt={banner.image.alt}
                    fill
                    className="object-contain"
                    sizes="310px"
                    priority={index === 0}
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerCarousel;
