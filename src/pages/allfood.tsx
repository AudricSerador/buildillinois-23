import React, { useState, useEffect, useCallback } from "react";
import { FoodItemCard } from "@/components/food_card_display";
import { useRouter } from "next/router";
import { FilterBar } from "@/components/FilterBar";
import { useAtom } from 'jotai';
import {
  sortFieldAtom, sortOrderAtom, diningHallAtom, mealTypeAtom,
  searchTermAtom, dateServedAtom, allergensAtom, preferencesAtom, datesAtom
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

  const [sortField] = useAtom(sortFieldAtom);
  const [sortOrder] = useAtom(sortOrderAtom);
  const [diningHall] = useAtom(diningHallAtom);
  const [mealType] = useAtom(mealTypeAtom);
  const [searchTerm, setSearchTerm] = useAtom(searchTermAtom);
  const [dateServed] = useAtom(dateServedAtom);
  const [allergens] = useAtom(allergensAtom);
  const [preferences] = useAtom(preferencesAtom);
  const [dates, setDates] = useAtom(datesAtom);

  const [isLoading, setIsLoading] = useState(false);
  const [food, setFood] = useState([]);
  const [foodCount, setFoodCount] = useState(0);
  const [error, setError] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  const debouncedFetchData = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
    }, 500),
    [setDebouncedSearchTerm]
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const allergensString = allergens.join(",");

        const res = await fetch(
          `/api/get_allfood?page=${pageNumber}&sortField=${sortField}&sortOrder=${sortOrder}&diningHall=${diningHall}&mealType=${encodeURIComponent(mealType)}&searchTerm=${debouncedSearchTerm}&dateServed=${dateServed}&allergens=${allergensString}&preferences=${preferences}`
        );

        if (!res.ok) {
          throw Error(res.statusText);
        }
        const data = await res.json();
        setFood(data.food);
        setFoodCount(data.foodCount);
        setDates(data.dates);
        setIsLoading(false);
      } catch (error) {
        setError(error as null);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [
    pageNumber,
    sortField,
    sortOrder,
    diningHall,
    mealType,
    debouncedSearchTerm,
    dateServed,
    allergens,
    preferences,
  ]);

  const handlePageChange = (newPageNumber: number) => {
    router.push({
      pathname: "/allfood",
      query: {
        page: newPageNumber,
        sortField: sortField,
        sortOrder: sortOrder,
        diningHall: diningHall,
        mealType: mealType,
        searchTerm: searchTerm,
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
      <FilterBar />
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
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-4 sm:gap-x-4">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="flex">
              <FoodItemCard foodItem={{} as any} loading={true} />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="font-custom text-center my-6">
          Error loading dining hall data: {error}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {food.length > 0 ? (
              food.map((foodItem: any) => (
                <div key={foodItem.id} className="flex">
                  <FoodItemCard
                    foodItem={foodItem}
                    loading={false}
                  />
                </div>
              ))
            ) : (
              <p className="font-custom text-center my-6 col-span-full">
                No results found. Please try again with a different filter
                query.
              </p>
            )}
          </div>
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
        </>
      )}
    </div>
  );
}