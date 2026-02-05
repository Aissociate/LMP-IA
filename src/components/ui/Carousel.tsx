import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_IMAGES = [
  '/caroussel-1.png',
  '/caroussel-2.png',
  '/caroussel-3.png',
  '/caroussel-5.png',
  '/caroussel-6.png',
  '/caroussel-7.png',
  '/caroussel-8.png'
];

export interface CarouselProps {
  images?: string[];
  interval?: number;
  className?: string;
}

export const Carousel: React.FC<CarouselProps> = ({
  images = DEFAULT_IMAGES,
  interval = 4000,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className={`relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-100 group ${className}`}>
      <img
        src={images[currentIndex]}
        alt={`Aperçu ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-500"
      />
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-6 h-6 text-gray-800" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-6 h-6 text-gray-800" />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? 'bg-white w-8' : 'bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
