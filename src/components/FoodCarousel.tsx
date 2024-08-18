import React, { useEffect, useState } from "react";
import { FoodItemCard } from "@/components/food_card_display";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { FoodItem } from '@/utils/constants';

interface FoodCarouselProps {
  title: string;
  filters: {
    ratingFilter?: string;
    // Add other filters as needed
  };
}

export function FoodCarousel({ title, filters }: FoodCarouselProps) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFoodItems = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          pageSize: '20',
          ...filters,
        });

        const response = await fetch(`/api/get_allfood?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch food items');

        const data = await response.json();
        setFoodItems(data.foodItems);
      } catch (error) {
        console.error('Error fetching food items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoodItems();
  }, [filters]);

  return (
    <div className="my-8">
      <h2 className="text-2xl font-custombold mb-4">{title}</h2>
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <FoodItemCard foodItem={{} as FoodItem} loading={true} futureDates={[]} />
                </CarouselItem>
              ))
            : foodItems.map((foodItem) => (
                <CarouselItem key={foodItem.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <FoodItemCard 
                    foodItem={foodItem} 
                    loading={false} 
                    futureDates={[]} 
                    sortFields={[]}
                  />
                </CarouselItem>
              ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}