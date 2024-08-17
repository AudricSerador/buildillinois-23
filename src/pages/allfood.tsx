import React, { useState, useEffect, useCallback, useRef } from "react";
import { FoodItemCard } from "@/components/food_card_display";
import { FilterBar } from "@/components/FilterBar";
import { useAtom } from 'jotai';
import {
  sortFieldsAtom, diningHallAtom, mealTypeAtom,
  searchTermAtom, dateServedAtom, allergensAtom, preferencesAtom, datesAtom, servingAtom, availableDatesAtom, ratingFilterAtom
} from '@/atoms/filterAtoms';
import { FoodItem } from '@/utils/constants';
import { useInView } from 'react-intersection-observer';
import debounce from 'lodash/debounce';

export default function AllFood(): JSX.Element {
  const pageSize = 10;
  const [sortFields] = useAtom(sortFieldsAtom);
  const [diningHall] = useAtom(diningHallAtom);
  const [mealType] = useAtom(mealTypeAtom);
  const [searchTerm, setSearchTerm] = useAtom(searchTermAtom);
  const [dateServed] = useAtom(dateServedAtom);
  const [allergens] = useAtom(allergensAtom);
  const [preferences] = useAtom(preferencesAtom);
  const [dates, setDates] = useAtom(datesAtom);
  const [serving] = useAtom(servingAtom);
  const [availableDates, setAvailableDates] = useAtom(availableDatesAtom);
  const [ratingFilter] = useAtom(ratingFilterAtom);

  const [isLoading, setIsLoading] = useState(true);  // Start with loading true
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const maxPages = 5;

  const isFetchingRef = useRef(false);
  const prevFiltersRef = useRef({ sortFields, diningHall, mealType, debouncedSearchTerm, dateServed, allergens, preferences, serving, ratingFilter });

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // Adjust this breakpoint as needed
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const debouncedFetchData = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
    }, 500),
    [setDebouncedSearchTerm]
  );

  const fetchFoodItems = useCallback(async (loadMore = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoadingMore(loadMore);
    if (!loadMore) setIsLoading(true);

    try {
      const queryParams = new URLSearchParams({
        page: loadMore ? (page + 1).toString() : '1',
        pageSize: pageSize.toString(),
        sortFields: JSON.stringify(sortFields),
        diningHall: diningHall || '',
        mealType: mealType || '',
        searchTerm: debouncedSearchTerm,
        dateServed: dateServed || '',
        allergens: Array.isArray(allergens) ? allergens.join(',') : allergens || '',
        preferences: Array.isArray(preferences) ? preferences.join(',') : preferences || '',
        serving: serving || '',
        ratingFilter: ratingFilter || ''
      });

      console.log('Fetching with params:', queryParams.toString());

      const response = await fetch(`/api/get_allfood?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch food items');

      const data = await response.json();
      console.log('Received data from API:', data);

      const processedFoodItems = data.foodItems.map((item: FoodItem) => {
        console.log(`Processing food item: ${item.name}, Review Summary:`, item.reviewSummary);
        return {
          ...item,
          reviewSummary: item.reviewSummary || { count: 0, averageRating: 0 }
        };
      });

      if (loadMore) {
        setFoodItems(prev => [...prev, ...processedFoodItems]);
        setPage(prevPage => prevPage + 1);
      } else {
        setFoodItems(processedFoodItems);
        setPage(1);
      }

      setTotalPages(data.totalPages);
      setAvailableDates(data.availableDates || []);
      setHasMore(data.currentPage < data.totalPages);

      // Fetch images for the new food items
      if (data.foodItems.length > 0) {
        const foodIds = data.foodItems.map((item: FoodItem) => item.id).join(',');
        const imagesResponse = await fetch(`/api/image/get_images?foodIds=${foodIds}`);
        const imagesData = await imagesResponse.json();

        setFoodItems(prevItems => 
          prevItems.map(item => ({
            ...item,
            topImage: imagesData.images?.[item.id]?.[0] || null
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching food items:', error);
      setError('Failed to fetch food items. Please try again later.');
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [sortFields, diningHall, mealType, debouncedSearchTerm, dateServed, allergens, preferences, serving, ratingFilter, page, pageSize]);

  const debouncedFetchFoodItems = useCallback(
    debounce(() => {
      fetchFoodItems();
    }, 300),
    [fetchFoodItems]
  );

  useEffect(() => {
    const currentFilters = { sortFields, diningHall, mealType, debouncedSearchTerm, dateServed, allergens, preferences, serving, ratingFilter };
    const prevFilters = prevFiltersRef.current;

    if (JSON.stringify(currentFilters) !== JSON.stringify(prevFilters)) {
      console.log('Filters changed, triggering fetch');
      debouncedFetchFoodItems();
      prevFiltersRef.current = currentFilters;
    } else {
      console.log('Filters unchanged, skipping fetch');
    }
  }, [sortFields, diningHall, mealType, debouncedSearchTerm, dateServed, allergens, preferences, serving, ratingFilter, debouncedFetchFoodItems]);

  useEffect(() => {
    return () => {
      debouncedFetchFoodItems.cancel();
    };
  }, [debouncedFetchFoodItems]);

  useEffect(() => {
    console.log('Component mounted, triggering initial fetch');
    fetchFoodItems();
  }, []);

  useEffect(() => {
    console.log('Current state:', {
      isLoading,
      foodItems: foodItems.length,
      page,
      totalPages,
      hasMore,
      error
    });
  }, [isLoading, foodItems, page, totalPages, hasMore, error]);

  useEffect(() => {
    if (!isInitialLoad) {
      setPage(1);
      setFoodItems([]);
      setHasMore(true);
      fetchFoodItems();
    }
  }, [sortFields, diningHall, mealType, debouncedSearchTerm, dateServed, allergens, preferences, serving, ratingFilter, fetchFoodItems, isInitialLoad]);

  useEffect(() => {
    if (!isInitialLoad && page > 1) {
      fetchFoodItems(true);
    }
  }, [page, isInitialLoad, fetchFoodItems]);

  useEffect(() => {
    if (!isInitialLoad && page > 1) {
      fetchFoodItems(true);
    }
  }, [page, isInitialLoad, fetchFoodItems]);

  useEffect(() => {
    if (inView && isMobile && !isLoadingMore && hasMore) {
      fetchFoodItems(true);
    }
  }, [inView, isMobile, isLoadingMore, hasMore, fetchFoodItems]);

  const handleShowMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchFoodItems(true);
    }
  };

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 mt-4">
      <FilterBar availableDates={availableDates} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <p className="text-4xl font-custombold mt-4">All Food ({foodItems.length})</p>
        <input
          type="text"
          className="input input-bordered w-full sm:w-64 md:w-80 lg:w-96 mt-4 sm:mt-0"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            debouncedFetchData(e.target.value);
          }}
          placeholder="Search food..."
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {isLoading ? (
          Array(10).fill(null).map((_, index) => (
            <FoodItemCard key={`skeleton-${index}`} foodItem={{} as FoodItem} loading={true} sortFields={sortFields} futureDates={availableDates} />
          ))
        ) : (
          foodItems.map((foodItem: FoodItem) => (
            <FoodItemCard 
              key={foodItem.id} 
              foodItem={{
                ...foodItem,
                reviewSummary: foodItem.reviewSummary || { count: 0, averageRating: 0 }
              }} 
              loading={false} 
              sortFields={sortFields} 
              futureDates={availableDates} 
            />
          ))
        )}
      </div>
      {!isLoading && foodItems.length === 0 && (
        <p className="font-custom text-center my-6 col-span-full">
          No results found. Please try again with a different filter query.
        </p>
      )}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      {hasMore && (
        <div ref={ref} className="mt-4 flex justify-center">
          {!isMobile && (
            <button
              onClick={handleShowMore}
              className="btn btn-primary"
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading...' : 'Show More'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}