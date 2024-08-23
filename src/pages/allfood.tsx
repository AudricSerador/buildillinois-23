import React, { useState, useEffect, useCallback, useRef } from "react";
import { debounce } from 'lodash';
import { FoodItemCard } from "@/components/food_card_display";
import { FilterBar } from "@/components/FilterBar";
import { useAtom } from 'jotai';
import { filterAtom, searchTermAtom } from '@/atoms/filterAtoms';
import { FoodItem } from '@/utils/constants';
import { useInView } from 'react-intersection-observer';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { Badge } from "@/components/ui/badge";

interface FilterBadge {
  type: string;
  label: string;
}

export default function AllFood(): JSX.Element {
  const pageSize = 10;
  const [filters, setFilters] = useAtom(filterAtom);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const maxPages = 5;

  const isFetchingRef = useRef(false);
  const debouncedFetchRef = useRef<ReturnType<typeof debounce>>();

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const fetchFoodItems = useCallback(async (loadMore = false) => {
    if (isFetchingRef.current || (!loadMore && foodItems.length > 0 && !hasMore)) return;
    isFetchingRef.current = true;
    setIsLoadingMore(loadMore);
    if (!loadMore) {
      setIsLoading(true);
      setFoodItems([]);
    }

    try {
      const queryParams = new URLSearchParams({
        page: loadMore ? (page + 1).toString() : '1',
        pageSize: pageSize.toString(),
        searchTerm: searchTerm,
      });

      // Handle sortFields
      if (filters.sortFields && filters.sortFields.length > 0) {
        const sortFieldsParam = filters.sortFields.map(sf => ({
          field: sf.field,
          order: sf.order
        }));
        queryParams.append('sortFields', JSON.stringify(sortFieldsParam));
      }

      // Add other filter parameters
      if (filters.diningHall) queryParams.append('diningHall', filters.diningHall);
      if (filters.mealType) queryParams.append('mealType', filters.mealType);
      if (filters.dateServed) queryParams.append('dateServed', filters.dateServed);
      if (filters.allergens && filters.allergens.length > 0) queryParams.append('allergens', filters.allergens.join(','));
      if (filters.preferences) queryParams.append('preferences', filters.preferences);
      if (filters.serving) queryParams.append('serving', filters.serving);
      if (filters.ratingFilter) queryParams.append('ratingFilter', filters.ratingFilter);

      const response = await fetch(`/api/get_allfood?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch food items');

      const data = await response.json();

      const processedFoodItems = data.foodItems.map((item: FoodItem) => ({
        ...item,
        reviewSummary: item.reviewSummary || { count: 0, averageRating: 0 }
      }));

      let newFoodItems;
      if (loadMore) {
        newFoodItems = [...foodItems, ...processedFoodItems];
        setPage(prevPage => prevPage + 1);
      } else {
        newFoodItems = processedFoodItems;
        setPage(1);
      }

      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
      setHasMore(data.currentPage < data.totalPages);
      setAvailableDates(data.availableDates);

      // Fetch images for all food items, including newly loaded ones
      if (newFoodItems.length > 0) {
        const foodIds = newFoodItems.map((item: FoodItem) => item.id).join(',');
        const imagesResponse = await fetch(`/api/image/get_images?foodIds=${foodIds}`);
        const imagesData = await imagesResponse.json();

        newFoodItems = newFoodItems.map((item: FoodItem) => ({
          ...item,
          topImage: imagesData.images?.[item.id]?.[0] || null
        }));
      }

      setFoodItems(newFoodItems);

    } catch (error) {
      setError('Failed to fetch food items. Please try again later.');
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filters, searchTerm, page, pageSize, foodItems, hasMore]);

  useEffect(() => {
    debouncedFetchRef.current = debounce(() => {
      console.log('Debounced search term changed, fetching new data');
      setPage(1);
      setFoodItems([]);
      setHasMore(true);
      fetchFoodItems();
    }, 300);

    return () => {
      debouncedFetchRef.current?.cancel();
    };
  }, [fetchFoodItems]);

  useEffect(() => {
    debouncedFetchRef.current?.();
  }, [searchTerm]);

  useEffect(() => {
    if (filtersApplied) {
      console.log('Filters applied, fetching new data');
      setPage(1);
      setHasMore(true);
      fetchFoodItems();
      setFiltersApplied(false);
    }
  }, [filtersApplied, fetchFoodItems]);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  useEffect(() => {
    if (!isInitialLoad && page > 1) {
      fetchFoodItems(true);
    }
  }, [page, isInitialLoad, fetchFoodItems]);

  useEffect(() => {
    if (inView && isMobile && !isLoadingMore && hasMore && foodItems.length > 0) {
      fetchFoodItems(true);
    }
  }, [inView, isMobile, isLoadingMore, hasMore, fetchFoodItems, foodItems.length]);

  const handleShowMore = () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      fetchFoodItems(true);
    }
  };

  const renderVisualBadges = () => {
    const selectedFilters: FilterBadge[] = [
      ...filters.sortFields.map(s => ({ type: 'sort', label: `${s.field} ${s.order === 'desc' ? '↓' : '↑'}` })),
      ...(filters.diningHall ? [{ type: 'diningHall', label: filters.diningHall }] : []),
      ...(filters.mealType ? [{ type: 'mealType', label: filters.mealType }] : []),
      ...filters.allergens.map(a => ({ type: 'allergen', label: a })),
      ...(filters.preferences ? [{ type: 'preference', label: filters.preferences }] : []),
      ...(filters.serving ? [{ type: 'serving', label: filters.serving }] : []),
      ...(filters.ratingFilter !== 'any' ? [{ type: 'rating', label: 'Rated Only' }] : []),
    ];

    if (selectedFilters.length === 0) {
      return <div className="text-gray-500">No filters selected</div>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {selectedFilters.map((filter, index) => (
          <Badge key={`${filter.type}-${index}`} variant="secondary">
            {filter.label}
          </Badge>
        ))}
      </div>
    );
  };

  const countAppliedFilters = () => {
    return [
      filters.sortFields.length,
      filters.diningHall ? 1 : 0,
      filters.mealType ? 1 : 0,
      filters.allergens.length,
      filters.preferences ? 1 : 0,
      filters.serving ? 1 : 0,
      filters.ratingFilter !== 'any' ? 1 : 0
    ].reduce((a, b) => a + b, 0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 mt-4">
      <div className="sticky top-0 sm:top-16 z-10 py-4">
        <div className="flex justify-center items-center">
          <div className="relative w-full max-w-3xl">
            <div className="join w-full">
              <div className="join-item flex items-center pl-4 w-12 bg-base-200 h-12">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="join-item flex-grow input input-bordered focus:outline-none pl-2 h-12"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search food..."
              />
              <FilterBar 
                onApplyFilters={() => setFiltersApplied(true)}
                availableDates={availableDates}
                renderButton={(onClick) => (
                  <button className="join-item btn btn-primary h-12" onClick={onClick}>
                    <FaFilter className="mr-2" />
                    <span>({countAppliedFilters()})</span>
                  </button>
                )}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-lg font-custombold mb-2 sm:mb-0">Displaying {totalItems} results</p>
          {renderVisualBadges()}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
        {foodItems.map((foodItem: FoodItem) => (
          <FoodItemCard 
            key={foodItem.id} 
            foodItem={{
              ...foodItem,
              reviewSummary: foodItem.reviewSummary || { count: 0, averageRating: 0 }
            }} 
            loading={false} 
            sortFields={filters.sortFields} 
            futureDates={[]} 
          />
        ))}
        {(isLoading || isLoadingMore) && 
          Array(10).fill(null).map((_, index) => (
            <FoodItemCard key={`skeleton-${index}`} foodItem={{} as FoodItem} loading={true} sortFields={filters.sortFields} futureDates={[]} />
          ))
        }
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