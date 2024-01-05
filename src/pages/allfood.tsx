import React, { useState, useEffect } from "react";
import { FoodItemDisplay } from "../components/allfood/food_item_display";
import { useRouter } from "next/router";
import LoadingSpinner from "../components/loading_spinner";
import { Filters } from "../components/allfood/filters";
import { IconLegend } from "@/components/icon_legend";

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
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const allergensString = allergens.join(",");

        const res = await fetch(
          `/api/get_data?page=${pageNumber}&sortField=${sortField}&sortOrder=${sortOrder}&diningHall=${diningHall}&mealType=${mealType}&searchTerm=${searchTerm}&dateServed=${dateServed}&allergens=${allergensString}&preferences=${preferences}`
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
    searchTerm,
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
      <div className="flex flex-col sm:flex-row flex-wrap justify-between sm:space-x-4 space-y-4 sm:space-y-0 font-custom">
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

      <div className="flex justify-between items-center">
        <p className="text-4xl font-custombold mt-4">All Food ({foodCount})</p>
        <input
          type="text"
          className="w-48 md:w-64 lg:w-96 xl:w-128 sm:w-auto ml-auto mt-4 block bg-white border border-gray-200 font-custom text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search food..."
        />
      </div>
      <div
        style={{
          paddingBottom: "1rem",
          borderBottom: "4px solid black",
          marginBottom: "1rem",
        }}
      ></div>
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="font-custom text-center my-6">
          Error loading dining hall data: {error}
        </p>
      ) : (
        <>
          <ul>
            {food.length > 0 ? (
              food.map((foodItem: any) => (
                <FoodItemDisplay key={foodItem.id} foodItem={foodItem} />
              ))
            ) : (
              <p className="font-custom text-center my-6">
                No results found. Please try again with a different filter
                query.
              </p>
            )}
          </ul>
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => handlePageChange(pageNumber - 1)}
              className={`px-4 py-2 rounded-md text-white font-custom ${
                pageNumber === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-700"
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
                  pageNumber === i + startPage ? "bg-blue-500" : "bg-gray-300"
                } hover:bg-blue-700`}
              >
                {i + startPage}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(pageNumber + 1)}
              className={`px-4 py-2 rounded-md text-white font-custom ${
                pageNumber === totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-700"
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
