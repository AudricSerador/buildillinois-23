import React, { useState, useEffect } from 'react';
import { FoodItemDisplay } from '../components/food_item_display';
import { useRouter } from 'next/router';

export default function AllFood(): JSX.Element {
  const router = useRouter();
  const pageSize = 10;
  const pageNumber = router.query.page ? parseInt(router.query.page as string) : 1;
  const [sortField, setSortField] = useState(router.query.sortField as string);
  const [sortOrder, setSortOrder] = useState(router.query.sortOrder as string);
  const [diningHall, setDiningHall] = useState(router.query.diningHall as string);
  const [mealType, setMealType] = useState(router.query.mealType as string);
  const [searchTerm, setSearchTerm] = useState(router.query.searchTerm as string);
  const [isLoading, setIsLoading] = useState(false);
  const [food, setFood] = useState([]);
  const [foodCount, setFoodCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/get_data?page=${pageNumber}&sortField=${sortField}&sortOrder=${sortOrder}&diningHall=${diningHall}&mealType=${mealType}&searchTerm=${searchTerm}`);
        if (!res.ok) {
          throw Error(res.statusText);
        }
        const data = await res.json();
        setFood(data.food);
            setFoodCount(data.foodCount);
            setIsLoading(false);
          } catch (error) {
            setError(error.message);
            setIsLoading(false);
          }
        };
  
    fetchData();
  }, [pageNumber, sortField, sortOrder, diningHall, mealType, searchTerm]);
  
  const handlePageChange = (newPageNumber: number) => {
    router.push({
      pathname: '/allfood',
      query: {
        page: newPageNumber,
        sortField: sortField,
        sortOrder: sortOrder,
        diningHall: diningHall,
        mealType: mealType,
        searchTerm: searchTerm
      }
    });
  };
  
  const totalPages = Math.ceil(foodCount / pageSize);
  
  const startPage = pageNumber > 2 ? pageNumber - 2 : 1;
  const endPage = startPage + 4 < totalPages ? startPage + 4 : totalPages;
  
  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-32 mt-4">
      <div className="flex space-x-4">
        <input 
          type="text" 
          className="block appearance-none w-full bg-white border border-gray-200 font-custom text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Search food..."
        />
        <select className="block appearance-none w-full bg-white border border-gray-200 font-custom text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" value={sortField} onChange={(e) => setSortField(e.target.value)}>
          <option value="">Sort by</option>
          <option value="calories">Calories</option>
          <option value="totalCarbohydrates">Carbohydrates</option>
          <option value="protein">Protein</option>
          <option value="totalFat">Total Fats</option>
          <option value="sugars">Sugars</option>
          
        </select>
        <select className="block appearance-none w-full bg-white border border-gray-200 font-custom text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="asc">Low to High</option>
          <option value="desc">High to Low</option>
        </select>
        <select className="block appearance-none w-full bg-white border border-gray-200 font-custom text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" value={diningHall} onChange={(e) => setDiningHall(e.target.value)}>
          <option value="">Filter by dining hall</option>
          <option value="Ikenberry Dining Center (Ike)">Ikenberry Dining Center (Ike)</option>
          <option value="Illinois Street Dining Center (ISR)">Illinois Street Dining Center (ISR)</option>
          <option value="Pennsylvania Avenue Dining Hall (PAR)">Pennsylvania Avenue Dining Hall (PAR)</option>
          <option value="TerraByte">TerraByte (ISR)</option>
          <option value="Urbana South Market">Urbana South Market (PAR)</option>
          <option value="57 North">57 North (Ike)</option>
        </select>
        <select className="block appearance-none w-full bg-white border border-gray-200 font-custom text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" value={mealType} onChange={(e) => setMealType(e.target.value)}>
          <option value="">Filter by meal type</option>
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
      </div>
      
      <p className="text-4xl font-custombold mt-4">All Food ({foodCount})</p>
      <div style={{ paddingBottom: '1rem', borderBottom: '4px solid black', marginBottom: '1rem' }}></div>
      {isLoading ? (
        <div role="status" className="flex justify-center items-center h-full">
          <svg
            aria-hidden="true"
            className="w-16 h-16 text-uiucblue animate-spin dark:text-uiucblue fill-uiucorange"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      
      ) : error ? (
        <p className="font-custom text-center my-6">Error loading dining hall data: {error}</p>
      ) : (
          <>
            <ul>
              {food.length > 0 ? (
                food.map((foodItem: any) => (
                  <FoodItemDisplay key={foodItem.id} foodItem={foodItem} />
                ))
              ) : (
                <p className="font-custom text-center my-6">No results found. Please try again with a different filter query.</p>
              )}
            </ul>
            <div className="flex justify-center space-x-2">
              <button 
                onClick={() => handlePageChange(pageNumber - 1)}
                className={`px-4 py-2 rounded-md text-white font-custom ${pageNumber === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'}`}
                disabled={pageNumber === 1}
              >
                Back
              </button>
              {[...Array(endPage + 1 - startPage)].map((e, i) => (
                <button 
                  key={i} 
                  onClick={() => handlePageChange(i + startPage)}
                  className={`px-4 py-2 rounded-md text-white font-custom ${pageNumber === i+startPage ? 'bg-blue-500' : 'bg-gray-300'} hover:bg-blue-700`}
                >
                  {i + startPage}
                </button>
              ))}
              <button 
                onClick={() => handlePageChange(pageNumber + 1)}
                className={`px-4 py-2 rounded-md text-white font-custom ${pageNumber === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'}`}
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