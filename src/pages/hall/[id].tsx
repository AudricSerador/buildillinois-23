import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FoodItemDisplay } from "@/components/allfood/food_item_display";
import LoadingSpinner from "@/components/loading_spinner";
import { GetServerSideProps } from "next";
import prisma from "../../../lib/prisma";

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { id } = context.query;

    const dates = (
      await prisma.$queryRaw<
        { dateServed: string }[]
      >`SELECT DISTINCT "dateServed" FROM "mealDetails";`
    ).map((date) => date.dateServed);

    const mealTypes = (
      await prisma.$queryRaw<
        { mealType: string }[]
      >`SELECT DISTINCT "mealType" FROM "mealDetails" WHERE "diningHall" = ${id};`
    ).map((mealType) => mealType.mealType);

    return {
      props: {
        foodDates: dates,
        mealTypes: mealTypes,
      },
    };
  } catch (error) {
    console.error("Error fetching dates:", error);
    return {
      props: {
        foodDates: [],
        mealTypes: [],
      },
    };
  }
};

export default function HallFoodPage({
  foodDates,
  mealTypes,
}: {
  foodDates: string[];
  mealTypes: string[];
}) {
  const router = useRouter();
  const { id } = router.query;
  const [mealType, setMealType] = useState("");
  const [foodData, setFoodData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateServed, setDateServed] = useState(
    foodDates && foodDates.length > 0 ? foodDates[0] : ""
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFoodData = async () => {
      if (id && mealType && dateServed) {
        setIsLoading(true);
        try {
          const response = await fetch(
            `/api/get_halldata?id=${id}&mealType=${mealType}&dateServed=${dateServed}`
          );
          const data = await response.json();
          setFoodData(data);
        } catch (error) {
          setError(error as null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchFoodData();
  }, [id, mealType, dateServed]);

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-64 mt-4">
      <p className="text-4xl font-custombold mt-4 mb-4">{id}</p>
      <div className="flex flex-row mb-4">
        {foodDates && foodDates.length > 0 ? (
          foodDates.map((date) => (
            <button
              className={`px-4 py-2 text-xl focus:outline-none ${
                dateServed === date
                  ? "bg-uiucblue text-white"
                  : "bg-white text-uiucblue border border-uiucblue"
              }`}
              onClick={() => setDateServed(date)}
            >
              {date}
            </button>
          ))
        ) : (
          <p>No dates found</p>
        )}
      </div>
      <div className="flex flex-row mb-4">
        <button
          className={`px-4 py-2 text-xl rounded-l-lg focus:outline-none ${
            mealType === "Breakfast"
              ? "bg-uiucblue text-white"
              : "bg-white text-uiucblue border border-uiucblue"
          }`}
          onClick={() => setMealType("Breakfast")}
        >
          Breakfast
        </button>
        <button
          className={`px-4 py-2 text-xl focus:outline-none ${
            mealType === "Lunch"
              ? "bg-uiucblue text-white"
              : "bg-white text-uiucblue border border-uiucblue"
          }`}
          onClick={() => setMealType("Lunch")}
        >
          Lunch
        </button>
        {id === "Ikenberry Dining Center (Ike)" && (
          <button
            className={`px-4 py-2 text-xl focus:outline-none ${
              mealType === "Light Lunch"
                ? "bg-uiucblue text-white"
                : "bg-white text-uiucblue border border-uiucblue"
            }`}
            onClick={() => setMealType("Light Lunch")}
          >
            Light Lunch
          </button>
        )}
        {id === "Lincoln Avenue Dining Hall (LAR)" && (
          <button
            className={`px-4 py-2 text-xl focus:outline-none ${
              mealType === "Kosher Lunch"
                ? "bg-uiucblue text-white"
                : "bg-white text-uiucblue border border-uiucblue"
            }`}
            onClick={() => setMealType("Kosher Lunch")}
          >
            Kosher Lunch
          </button>
        )}
        {id === "Lincoln Avenue Dining Hall (LAR)" && (
          <button
            className={`px-4 py-2 text-xl focus:outline-none ${
              mealType === "Kosher Dinner"
                ? "bg-uiucblue text-white"
                : "bg-white text-uiucblue border border-uiucblue"
            }`}
            onClick={() => setMealType("Kosher Dinner")}
          >
            Kosher Dinner
          </button>
        )}

        <button
          className={`px-4 py-2 text-xl rounded-r-lg focus:outline-none ${
            mealType === "Dinner"
              ? "bg-uiucblue text-white"
              : "bg-white text-uiucblue border border-uiucblue"
          }`}
          onClick={() => setMealType("Dinner")}
        >
          Dinner
        </button>

        {mealTypes &&
          mealTypes
            .filter(
              (mealTypeItem) =>
                ![
                  "Breakfast",
                  "Lunch",
                  "Light Lunch",
                  "Dinner",
                  "Kosher Lunch",
                  "Kosher Dinner",
                ].includes(mealTypeItem)
            )
            .map((mealTypeItem) => (
              <button
                className={`px-4 py-2 text-xl focus:outline-none ${
                  mealType === mealTypeItem
                    ? "bg-uiucblue text-white"
                    : "bg-white text-uiucblue border border-uiucblue"
                }`}
                onClick={() => setMealType(mealTypeItem)}
              >
                {mealTypeItem}
              </button>
            ))}
      </div>
      <div className="flex flex-col">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-screen">
            <LoadingSpinner />
            <p className="mt-4 font-custom text-xl">Loading food data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="font-custombold text-xl">
              Error loading data: {error}
            </div>
          </div>
        ) : (
          Object.entries(foodData).map(
            ([facility, foodItems]: [string, any[]]) => (
              <div
                key={facility}
                className="mb-8 bg-white shadow rounded-lg p-6"
              >
                <h2 className="text-2xl font-bold mb-4 text-center">
                  {facility}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {foodItems.map((foodItem: any) => (
                    <FoodItemDisplay
                      foodItem={foodItem}
                      includeEntries={false}
                    />
                  ))}
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}
