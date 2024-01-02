import React, { useState, useEffect } from "react";
import { FoodItemDisplay } from "../components/food_item_display";
import { useRouter } from "next/router";
import LoadingSpinner from '../components/loading_spinner';

export default function AllFood(): JSX.Element {
  const router = useRouter();
  const pageSize = 10;
  const pageNumber = router.query.page
    ? parseInt(router.query.page as string)
    : 1;
    const [sortField, setSortField] = useState(typeof window !== 'undefined' ? localStorage.getItem('sortField') || '' : '');
    const [sortOrder, setSortOrder] = useState(typeof window !== 'undefined' ? localStorage.getItem('sortOrder') || '' : '');
    const [diningHall, setDiningHall] = useState(typeof window !== 'undefined' ? localStorage.getItem('diningHall') || '' : '');
    const [mealType, setMealType] = useState(typeof window !== 'undefined' ? localStorage.getItem('mealType') || '' : '');
    const [searchTerm, setSearchTerm] = useState(typeof window !== 'undefined' ? localStorage.getItem('searchTerm') || '' : '');
    const [dateServed, setDateServed] = useState(typeof window !== 'undefined' ? localStorage.getItem('dateServed') || '' : '');
  const [isLoading, setIsLoading] = useState(false);
  const [food, setFood] = useState([]);
  const [foodCount, setFoodCount] = useState(0);
  const [dates, setDates] = useState<string[]>([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/get_data?page=${pageNumber}&sortField=${sortField}&sortOrder=${sortOrder}&diningHall=${diningHall}&mealType=${mealType}&searchTerm=${searchTerm}&dateServed=${dateServed}`
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

    localStorage.setItem('sortField', sortField);
    localStorage.setItem('sortOrder', sortOrder);
    localStorage.setItem('diningHall', diningHall);
    localStorage.setItem('mealType', mealType);
    localStorage.setItem('searchTerm', searchTerm);
    localStorage.setItem('dateServed', dateServed);
  }, [pageNumber, sortField, sortOrder, diningHall, mealType, searchTerm, dateServed]);

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

  const startPage = pageNumber > 2 ? pageNumber - 2 : 1;
  const endPage = startPage + 4 < totalPages ? startPage + 4 : totalPages;

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-32 mt-4">
      <p className="text-4xl font-custombold mt-4 mb-4">Filters</p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <select
          className="block w-full bg-white border border-gray-200 font-custom text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
        >
          <option value="">Sort by</option>
          <option value="calories">Calories</option>
          <option value="totalCarbohydrates">Carbohydrates</option>
          <option value="protein">Protein</option>
          <option value="totalFat">Total Fats</option>
          <option value="sugars">Sugars</option>
        </select>
        {sortField && (
          <select
            className="block w-full bg-white border border-gray-200 font-custom text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Low to High</option>
            <option value="desc">High to Low</option>
          </select>
        )}
        <select
          className="block w-full bg-white border border-gray-200 font-custom text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          value={diningHall}
          onChange={(e) => setDiningHall(e.target.value)}
        >
          <option value="">All Dining Halls</option>
          <option value="Ikenberry Dining Center (Ike)">
            Ikenberry Dining Center (Ike)
          </option>
          <option value="Illinois Street Dining Center (ISR)">
            Illinois Street Dining Center (ISR)
          </option>
          <option value="Pennsylvania Avenue Dining Hall (PAR)">
            Pennsylvania Avenue Dining Hall (PAR)
          </option>
          <option value="TerraByte">TerraByte (ISR)</option>
          <option value="Urbana South Market">Urbana South Market (PAR)</option>
          <option value="57 North">57 North (Ike)</option>
        </select>
        <select
          className="block w-full bg-white border border-gray-200 font-custom text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
        >
          <option value="">All Meal Types</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="A la Carte">A la Carte</option>
          <option value="Deli & Bagel Bar">Deli & Bagel Bar</option>
          <option value="Waffle Bar">Waffle Bar</option>
          <option value="Salad Bar">Salad Bar</option>
          <option value="Cereal">Cereal</option>
          <option value="Ice Cream">Ice Cream</option>
          <option value="Beverages">Beverages</option>
          <option value="Condiments">Condiments</option>
        </select>
        <select
          className="block w-full bg-white border border-gray-200 font-custom text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          value={dateServed}
          onChange={(e) => setDateServed(e.target.value)}
        >
          <option value="">All Dates</option>
          {dates.map((date, index) => (
            <option key={index} value={date}>
              {date}
            </option>
          ))}
        </select>
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
            {[...Array(endPage + 1 - startPage)].map((e, i) => (
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
