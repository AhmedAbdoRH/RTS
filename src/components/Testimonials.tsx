import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Testimonial } from '../types/database';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Constants for styling and animation
const VISIBLE_CARDS = 3; // How many cards to prepare for the stack effect (current + next ones)
const CARD_OFFSET_X = '8%'; // Horizontal offset for stacked cards
const CARD_OFFSET_Y = '10px'; // Vertical offset for stacked cards
const CARD_SCALE_DECREMENT = 0.08; // How much smaller each stacked card gets
const ANIMATION_DURATION = 500; // ms, ensure this matches Tailwind duration class

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  // No isAnimating state needed for this specific slide approach if transitions are handled by CSS
  // and we prevent rapid clicks on buttons if desired. For simplicity, we'll keep it if needed for button debouncing.
  const [isAnimating, setIsAnimating] = useState(false);
  const { currentLanguage } = useLanguage();


  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('id, image_url, is_active, created_at')
          .order('created_at', { ascending: false });
        if (error) throw error;
        // Filter testimonials with valid image URLs (regardless of is_active status)
        const validTestimonials = (data || []).filter(t => t.image_url && t.image_url.trim() !== '');
        setTestimonials(validTestimonials);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const testimonialsWithImages = testimonials.filter(t => t.image_url);
  const totalTestimonials = testimonialsWithImages.length;

  const handleNavigation = useCallback((direction: 'next' | 'prev') => {
    if (isAnimating || totalTestimonials <= 1) return;
    setIsAnimating(true);

    setCurrentIndex((prevIndex) => {
      if (direction === 'next') {
        return (prevIndex + 1) % totalTestimonials;
      } else {
        return (prevIndex - 1 + totalTestimonials) % totalTestimonials;
      }
    });

    setTimeout(() => setIsAnimating(false), ANIMATION_DURATION);
  }, [isAnimating, totalTestimonials, ANIMATION_DURATION]);

  const nextTestimonial = useCallback(() => handleNavigation('next'), [handleNavigation]);
  const prevTestimonial = useCallback(() => handleNavigation('prev'), [handleNavigation]);

  const goToTestimonial = useCallback((index: number) => {
    if (isAnimating || index === currentIndex || totalTestimonials <= 1) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), ANIMATION_DURATION);
  }, [isAnimating, currentIndex, totalTestimonials, ANIMATION_DURATION]);


  useEffect(() => {
    if (totalTestimonials <= 1) return;
    const timer = setInterval(nextTestimonial, 3000);
    return () => clearInterval(timer);
  }, [totalTestimonials, nextTestimonial]); // currentIndex removed, nextTestimonial is memoized

  if (loading) {
    return (
      <div className="relative py-12 px-4 md:px-0 border-t border-[#ffd453]/20 overflow-hidden bg-[#1c594e]">
        <div className="text-center text-white py-8 backdrop-blur-xl bg-white/5 max-w-4xl mx-auto rounded-lg p-8 border border-white/10">

        </div>
      </div>
    );
  }

  if (totalTestimonials === 0) {
    return (
      <section className="relative py-12 px-4 md:px-0 border-t border-[#ffd453]/20 mt-16 overflow-hidden bg-[#1c594e]">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl font-bold text-center text-[#ffd453] mb-10 drop-shadow-lg">{currentLanguage === 'ar' ? 'آراء عملائنا' : "Our Customers' Opinions"}</h2>
          <div className="text-center text-white/80 backdrop-blur-xl bg-white/5 rounded-lg shadow-2xl p-8 border border-white/10">
            {currentLanguage === 'ar' ? 'لا توجد آراء لعرضها حالياً' : 'No testimonial images to display currently.'}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-12 px-4 md:px-0 border-t border-[#ffd453]/20 mt-16 overflow-x-hidden bg-[#1c594e]"> {/* overflow-x-hidden is important */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[#ffd453] mb-10">{currentLanguage === 'ar' ? 'آراء عملائنا' : "Our Customers' Opinions"}</h2>

        <div className="relative h-[400px] md:h-[500px] w-full"> {/* Fixed height container for cards */}
          {/* Testimonial Cards */}
          {testimonialsWithImages.map((testimonial, index) => {
            let positionFactor = index - currentIndex;
            if (positionFactor < -totalTestimonials / 2) {
              positionFactor += totalTestimonials;
            } else if (positionFactor > totalTestimonials / 2) {
              positionFactor -= totalTestimonials;
            }
            
            // Determine card state based on its position relative to currentIndex
            // We want to style cards that are current, next, and one after next
            // And also the one that is previous (for exiting animation)
            let zIndex = totalTestimonials - Math.abs(positionFactor);
            let scale = 1 - Math.abs(positionFactor) * CARD_SCALE_DECREMENT;
            let opacity = positionFactor === 0 ? 1 : (Math.abs(positionFactor) < VISIBLE_CARDS ? 0.7 - Math.abs(positionFactor) * 0.2 : 0);
            let translateX = `${positionFactor * 100}%`; // Default for current, prev, next for simple slide
            let cardOffsetY = `${Math.abs(positionFactor) * parseFloat(CARD_OFFSET_Y)}px`;

            // More refined positioning for stack effect
            if (positionFactor === 0) { // Current card
              translateX = '0%';
              cardOffsetY = '0px';
              scale = 1;
              opacity = 1;
              zIndex = VISIBLE_CARDS + 1;
            } else if (positionFactor > 0 && positionFactor < VISIBLE_CARDS) { // Stacked upcoming cards
              translateX = `calc(${positionFactor * parseFloat(CARD_OFFSET_X)}% + ${positionFactor * 10}px)`; // Add small gap
              cardOffsetY = `${positionFactor * parseFloat(CARD_OFFSET_Y)}px`;
              scale = 1 - positionFactor * CARD_SCALE_DECREMENT;
              opacity = 1 - positionFactor * 0.3; // More gradual fade
              zIndex = VISIBLE_CARDS - positionFactor;
            } else if (positionFactor < 0) { // Exiting card (to the left)
              translateX = '-100%';
              opacity = 0;
              scale = 0.8;
              zIndex = 0;
            } else { // Cards far in the future (to the right, hidden)
              translateX = '100%';
              opacity = 0;
              scale = 0.8;
              zIndex = 0;
            }


            return (
              <div
                key={testimonial.id}
                className="absolute inset-0 transition-all origin-center"
                style={{
                  transform: `translateX(${translateX}) translateY(${cardOffsetY}) scale(${scale})`,
                  opacity: opacity,
                  zIndex: zIndex,
                  transitionDuration: `${ANIMATION_DURATION}ms`,
                }}
              >
                <div className="w-full h-full flex justify-center items-center p-2 md:p-4">
                  <img
                    src={testimonial.image_url || undefined}
                    alt={`testimonial by client ${testimonial.id}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    style={{ background: 'white' }} // Keep background for non-transparent parts of image
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Controls */}
        {totalTestimonials > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-4 rtl:space-x-reverse">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-[#ffd453] text-[#1c594e] hover:brightness-110 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              disabled={isAnimating}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-[#ffd453] text-[#1c594e] hover:brightness-110 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              disabled={isAnimating}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* Indicators */}
        {totalTestimonials > 1 && (
          <div className="flex justify-center mt-6 space-x-2 rtl:space-x-reverse">
            {testimonialsWithImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-[#ffd453] w-6' : 'bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
