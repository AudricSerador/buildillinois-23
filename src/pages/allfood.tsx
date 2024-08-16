import React, { useState, useEffect, useCallback } from "react";
import { FoodItemCard } from "@/components/food_card_display";
import { useRouter } from "next/router";
import { FilterBar } from "@/components/FilterBar";
import { useAtom } from 'jotai';
import {
  sortFieldsAtom, diningHallAtom, mealTypeAtom,
  searchTermAtom, dateServedAtom, allergensAtom, preferencesAtom, datesAtom, servingAtom, availableDatesAtom, ratingFilterAtom
} from '@/atoms/filterAtoms';

function debounce(fn: Function, delay: number) {
  let timer: NodeJS.Timeout;
  return function (this: any, ...args: any[]) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export default function AllFood(): JSX.Element {
  const router = useRouter();
  const pageSize = 10;
  const pageNumber = router.query.page
    ? parseInt(router.query.page as string)
    : 1;

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
  const [food, setFood] = useState([]);
  const [foodCount, setFoodCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  const debouncedFetchData = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
    }, 500),
    [setDebouncedSearchTerm]
  );

  useEffect(() => {
    const fetchFood = async () => {
      setIsLoading(true);  // Set loading to true when fetching starts
      const queryParams = new URLSearchParams({
        page: pageNumber.toString(),
        sortFields: JSON.stringify(sortFields),
        diningHall,
        mealType,
        searchTerm,
        dateServed,
        allergens: allergens.join(','),
        preferences,
        serving,
        ratingFilter
      });

      console.log('Fetching food with params:', queryParams.toString());

      try {
        const response = await fetch(`/api/get_allfood?${queryParams}`);
        const data = await response.json();
        setFood(data.food);
        setFoodCount(data.foodCount);
        setAvailableDates(data.availableDates);
      } catch (error) {
        console.error("Error fetching food:", error);
        setError("Failed to load food data. Please try again later.");
      } finally {
        setIsLoading(false);  // Set loading to false when fetching is done
      }
    };

    fetchFood();
  }, [
    pageNumber,
    sortFields,
    diningHall,
    mealType,
    searchTerm,
    dateServed,
    allergens,
    preferences,
    serving,
    ratingFilter,
    setAvailableDates // Add this
  ]);

  const handlePageChange = (newPageNumber: number) => {
    router.push({
      pathname: "/allfood",
      query: {
        page: newPageNumber,
        sortFields: JSON.stringify(sortFields),
        diningHall: diningHall,
        mealType: mealType,
        searchTerm: searchTerm,
        ratingFilter: ratingFilter
      },
    });
  };

  const totalPages = Math.ceil(foodCount / pageSize);
  const startPage = Math.min(
    Math.max(1, pageNumber - 2),
    Math.max(1, totalPages - 4)
  );
  const endPage = Math.max(
    Math.min(totalPages, pageNumber + 2),
    Math.min(totalPages, startPage + 4)
  );

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 mt-4">
      <FilterBar availableDates={availableDates} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <p className="text-4xl font-custombold mt-4">All Food ({foodCount})</p>
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
        {isLoading
          ? Array(10).fill(null).map((_, index) => (
              <div key={index} className="flex">
                <FoodItemCard foodItem={{} as any} loading={true} sortFields={sortFields} futureDates={availableDates} />
              </div>
            ))
          : food.length > 0
          ? food.map((foodItem: any) => (
              <div key={foodItem.id} className="flex">
                <FoodItemCard
                  foodItem={foodItem}
                  loading={false}
                  sortFields={sortFields}
                  futureDates={availableDates}
                />
              </div>
            ))
          : <p className="font-custom text-center my-6 col-span-full">
              No results found. Please try again with a different filter query.
            </p>
        }
      </div>
      {!isLoading && food.length > 0 && (
        <div className="flex items-center justify-center space-x-2 mt-4 mb-8">
          <button
            onClick={() => handlePageChange(pageNumber - 1)}
            className={`px-4 py-2 rounded-md text-white font-custom ${
              pageNumber === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-uiucorange hover:bg-orange-600"
            }`}
            disabled={pageNumber === 1}
          >
            Back
          </button>
          {[...Array(Math.max(0, endPage + 1 - startPage))].map((e, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + startPage)}
              className={`px-4 py-2 rounded-md text-white font-custom ${
                pageNumber === i + startPage
                  ? "bg-uiucorange"
                  : "bg-gray-300 hover:bg-orange-600"
              }`}
            >
              {i + startPage}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(pageNumber + 1)}
            className={`px-4 py-2 rounded-md text-white font-custom ${
              pageNumber === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-uiucorange hover:bg-orange-600"
            }`}
            disabled={pageNumber === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}