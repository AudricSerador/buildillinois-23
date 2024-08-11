import React, { useState, useEffect, useRef, useCallback } from "react";
import { FoodItemCard } from "@/components/food_card_display";
import { useRouter } from "next/router";
import { Filters } from "../components/allfood/filters";
import { IconLegend } from "@/components/icon_legend";

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
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [diningHall, setDiningHall] = useState("");
  const [mealType, setMealType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateServed, setDateServed] = useState("");
  const [allergens, setAllergens] = useState<string[]>([]);
  const [preferences, setPreferences] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [food, setFood] = useState([]);
  const [foodCount, setFoodCount] = useState(0);
  const [dates, setDates] = useState<string[]>([]);
  const [error, setError] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  const debouncedFetchData = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
    }, 500),
    [setDebouncedSearchTerm]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSortField(localStorage.getItem("sortField") || "");
      setSortOrder(localStorage.getItem("sortOrder") || "");
      setDiningHall(localStorage.getItem("diningHall") || "");
      setMealType(localStorage.getItem("mealType") || "");
      setSearchTerm(localStorage.getItem("searchTerm") || "");
      setDateServed(localStorage.getItem("dateServed") || "");
      setPreferences(localStorage.getItem("preferences") || "");

      const allergensFromLocalStorage = localStorage.getItem("allergens");
      if (allergensFromLocalStorage) {
        setAllergens(JSON.parse(allergensFromLocalStorage));
      } else {
        setAllergens([]);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sortField", sortField);
      localStorage.setItem("sortOrder", sortOrder);
      localStorage.setItem("diningHall", diningHall);
      localStorage.setItem("mealType", mealType);
      localStorage.setItem("searchTerm", searchTerm);
      localStorage.setItem("dateServed", dateServed);
      localStorage.setItem("preferences", preferences);
      localStorage.setItem("allergens", JSON.stringify(allergens));
    }
  }, [sortField, sortOrder, diningHall, mealType, searchTerm, dateServed, preferences, allergens]);

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
    <div className="px-4 sm:px-8 md:px-16 lg:px-64 mt-4">
      <IconLegend />
      <p className="text-4xl font-custombold mt-4 mb-4">Filters</p>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-custom">        
      <Filters
          sortField={sortField}
          setSortField={setSortField}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          selectedAllergens={allergens}
          setSelectedAllergens={setAllergens}
          diningHall={diningHall}
          setDiningHall={setDiningHall}
          mealType={mealType}
          setMealType={setMealType}
          selectedPreference={preferences}
          setSelectedPreference={setPreferences}
          dateServed={dateServed}
          setDateServed={setDateServed}
          dates={dates}
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <p className="text-4xl font-custombold mt-4">All Food ({foodCount})</p>
        <input
          type="text"
          className="input input-bordered w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl ml-auto mt-4"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            debouncedFetchData(e.target.value);
          }}
          placeholder="Search food..."
        />
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, index) => (
            <FoodItemCard key={index} foodItem={{} as any} loading={true} />
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
                <FoodItemCard
                  key={foodItem.id}
                  foodItem={foodItem}
                  loading={false}
                />
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
