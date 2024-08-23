import React, { useEffect, useState } from "react";
import { FoodItemCard } from "@/components/food_card_display";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { FoodItem } from '@/utils/constants';

interface FoodCarouselProps {
  title: string;
  filters?: {
    ratingFilter?: string;
    // Add other filters as needed
  };
  recommendedItems?: FoodItem[];
  isLoading?: boolean;
}

export function FoodCarousel({ title, filters, recommendedItems, isLoading: externalLoading }: FoodCarouselProps) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(externalLoading !== undefined ? externalLoading : true);

  useEffect(() => {
    const fetchFoodItems = async () => {
      setIsLoading(true);
      try {
        let queryParams = new URLSearchParams({
          pageSize: '20',
          ...filters,
        });

        if (!recommendedItems && (!filters || Object.keys(filters).length === 0)) {
          const today = new Date().toISOString().split('T')[0];
          queryParams = new URLSearchParams({
            pageSize: '20',
            date: today,
            sortBy: 'protein',
            sortOrder: 'desc',
          });
        }

        const response = await fetch(`/api/get_allfood?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch food items');

        const data = await response.json();
        
        // If no results, make a default call to get all food items
        if (data.foodItems.length === 0) {
          const defaultResponse = await fetch('/api/get_allfood?pageSize=20');
          if (!defaultResponse.ok) throw new Error('Failed to fetch default food items');
          const defaultData = await defaultResponse.json();
          setFoodItems(defaultData.foodItems);
        } else {
          setFoodItems(data.foodItems);
        }
      } catch (error) {
        console.error('Error fetching food items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (recommendedItems) {
      setFoodItems(recommendedItems);
      setIsLoading(false);
    } else {
      fetchFoodItems();
    }
  }, [filters, recommendedItems, externalLoading]);

  return (
    <div className="my-8">
      <h2 className="text-2xl font-custombold mb-4">{title}</h2>
      <div className="relative">
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <FoodItemCard 
                      foodItem={{} as FoodItem} 
                      loading={true} 
                      futureDates={[]} 
                      disableVerticalLayout={true}
                    />
                  </CarouselItem>
                ))
              : foodItems.map((foodItem) => (
                  <CarouselItem key={foodItem.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <FoodItemCard 
                      foodItem={foodItem}
                      loading={false} 
                      futureDates={foodItem.mealEntries?.map(entry => entry.dateServed) || []}
                      sortFields={[]}
                      disableVerticalLayout={true}
                    />
                  </CarouselItem>
                ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2" />
          <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
        </Carousel>
      </div>
    </div>
  );
}