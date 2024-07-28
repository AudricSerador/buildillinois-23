import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FoodItemCard } from "@/components/food_card_display";
import { diningHallTimes } from "@/components/entries_display";
import { IconLegend } from "@/components/icon_legend";
import LoadingSpinner from "@/components/loading_spinner";
import { GetServerSideProps } from "next";
import prisma from "../../../lib/prisma";

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { id } = context.query;

    let dates = (
      await prisma.$queryRaw<
        { dateServed: string }[]
      >`SELECT DISTINCT "dateServed" FROM "mealDetails";`
    ).map((date) => date.dateServed);

    const parseDate = (dateString: any) => {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const parts = dateString.split(", ").slice(1).join(", ");
      const dateParts = parts.split(" ");
      return new Date(
        parseInt(dateParts[2]),
        months.indexOf(dateParts[0]),
        parseInt(dateParts[1])
      );
    };

    dates.sort((a, b) => parseDate(a).getTime() - parseDate(b).getTime());

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

const defaultMealTypes = [
  "Breakfast",
  "Lunch",
  "Light Lunch",
  "Dinner",
  "Kosher Lunch",
  "Kosher Dinner",
  "A la Carte--POS Feed",
  "A la Carte--APP DISPLAY",
];

export default function HallFoodPage({
  foodDates,
  mealTypes,
}: {
  foodDates: string[];
  mealTypes: string[];
}): JSX.Element {
  const router = useRouter();
  const { id } = router.query;
  const [mealType, setMealType] = useState("");
  const [foodData, setFoodData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateServed, setDateServed] = useState(
    foodDates && foodDates.length > 0 ? foodDates[0] : ""
  );
  const [error, setError] = useState(null);
  const [expandedFacility, setExpandedFacility] = useState<string | null>(null);

  const [dateIndex, setDateIndex] = useState(0);
  const incrementDate = () => {
    if (dateIndex < foodDates.length - 1) {
      setDateIndex(dateIndex + 1);
    }
  };
  const decrementDate = () => {
    if (dateIndex > 0) {
      setDateIndex(dateIndex - 1);
    }
  };
  useEffect(() => {
    setDateServed(foodDates[dateIndex]);
  }, [dateIndex]);

  useEffect(() => {
    const fetchFoodData = async () => {
      if (id && mealType && dateServed) {
        setIsLoading(true);
        try {
          const response = await fetch(
            `/api/get_halldata?id=${id}&mealType=${encodeURIComponent(mealType)}&dateServed=${dateServed}`
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
    <div className="px-4 sm:px-8 font-custom md:px-16 lg:px-64 mt-4">
      <p className="text-4xl font-custombold mt-4 mb-4">{id}</p>
      <div className="mb-4">
        <IconLegend />
      </div>
      <div className="bg-cloud p-2">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <button
            onClick={decrementDate}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="text-3xl font-custombold text-uiucblue">
            {foodDates[dateIndex]}
          </span>
          <button
            onClick={incrementDate}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <div className="flex flex-wrap justify-center px-4">
          {[
            "TerraByte",
            "57 North",
            "Urbana South Market",
            "InfiniTEA",
          ].includes(id as string) ? (
            <button
              className={`m-2 px-4 py-2 text-xl rounded-full focus:outline-none whitespace-nowrap ${
                mealType === "A la Carte"
                  ? "bg-uiucblue text-white"
                  : "bg-white text-uiucblue border border-uiucblue"
              }`}
              onClick={() => setMealType("A la Carte")}
            >
              A la Carte
            </button>
          ) : (
            <div className="flex flex-wrap justify-center px-4">
              <button
                className={`m-2 px-4 py-2 text-xl rounded-full focus:outline-none whitespace-nowrap ${
                  mealType === "Breakfast"
                    ? "bg-uiucblue text-white"
                    : "bg-white text-uiucblue border border-uiucblue"
                }`}
                onClick={() => setMealType("Breakfast")}
              >
                Breakfast
              </button>
              <button
                className={`m-2 px-4 py-2 text-xl rounded-full focus:outline-none whitespace-nowrap ${
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
                  className={`m-2 px-4 py-2 text-xl rounded-full focus:outline-none whitespace-nowrap ${
                    mealType === "Light Lunch"
                      ? "bg-uiucblue text-white"
                      : "bg-white text-uiucblue border border-uiucblue"
                  }`}
                  onClick={() => setMealType("Light Lunch")}
                >
                  Light Lunch
                </button>
              )}
              {id === "Lincoln Avenue Dining Hall (Allen, LAR)" && (
                <button
                  className={`m-2 px-4 py-2 text-xl rounded-full focus:outline-none whitespace-nowrap ${
                    mealType === "Kosher Lunch"
                      ? "bg-uiucblue text-white"
                      : "bg-white text-uiucblue border border-uiucblue"
                  }`}
                  onClick={() => setMealType("Kosher Lunch")}
                >
                  Kosher Lunch
                </button>
              )}
              <div className="text-center">
                <button
                  className={`m-2 px-4 py-2 text-xl rounded-full focus:outline-none whitespace-nowrap ${
                    mealType === "Dinner"
                      ? "bg-uiucblue text-white"
                      : "bg-white text-uiucblue border border-uiucblue"
                  }`}
                  onClick={() => setMealType("Dinner")}
                >
                  Dinner
                </button>
              </div>
              {id === "Lincoln Avenue Dining Hall (Allen/LAR)" && (
                <div className="text-center">
                  <button
                    className={`m-2 px-4 py-2 text-xl rounded-full focus:outline-none whitespace-nowrap ${
                      mealType === "Kosher Dinner"
                        ? "bg-uiucblue text-white"
                        : "bg-white text-uiucblue border border-uiucblue"
                    }`}
                    onClick={() => setMealType("Kosher Dinner")}
                  >
                    Kosher Dinner
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center">
          {mealTypes &&
            mealTypes
              .filter(
                (mealTypeItem) => !defaultMealTypes.includes(mealTypeItem)
              )
              .map((mealTypeItem) => (
                <button
                  key={mealTypeItem}
                  className={`m-2 px-2 py-1 text-lg focus:outline-none ${
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
        <p className="font-custombold text-center text-xl mt-2 text-uiucblue">
          {mealType === ""
            ? "Select a meal above"
            : mealType === "A la Carte"
            ? diningHallTimes[id as string]?.["A la Carte--POS Feed"]
            : defaultMealTypes.includes(mealType)
            ? diningHallTimes[id as string]?.[mealType as string]
            : `${
                diningHallTimes[id as string]?.["Breakfast"].split(" - ")[0]
              } - ${
                diningHallTimes[id as string]?.["Dinner"].split(" - ")[1]
              } (Open for all meals)`}
        </p>
        <div className="flex flex-col p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-screen">
              <LoadingSpinner text="Loading hall data"/>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-screen">
              <div className="font-custombold text-xl text-red-500">
                Error loading data: {error}
              </div>
            </div>
          ) : Object.entries(foodData).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-16">
              <div className="font-custombold text-xl text-gray-500">
                No food data found :&#40;
              </div>
            </div>
          ) : (
            <div className="w-auto my-8 font-custom">
              {Object.entries(foodData).map(([facility, foodItems]) => (
                <div key={facility} className="mb-3">
                  <div
                    className={`bg-uiucblue text-white p-4 flex justify-between items-center cursor-pointer ${
                      expandedFacility === facility
                        ? "rounded-t-lg"
                        : "rounded-lg"
                    }`}
                    onClick={() =>
                      setExpandedFacility((currentFacility) =>
                        currentFacility === facility ? null : facility
                      )
                    }
                  >
                    <h1 className="text-xl font-custombold">{facility}</h1>
                    <span className="text-white">
                      {expandedFacility === facility ? "▲" : "▼"}
                    </span>
                  </div>
                  <div
                    className={`collapse-css-transition bg-cloud rounded-b-lg shadow ${
                      expandedFacility === facility ? "open" : ""
                    }`}
                    style={
                      expandedFacility === facility
                        ? { maxHeight: "60vh", overflowY: "auto" }
                        : {}
                    }
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 px-2 py-2 lg:grid-cols-3 gap-x-4">
                      {foodItems &&
                        (foodItems as any[]).map((foodItem: any) => (
                          <FoodItemCard
                            key={foodItem.id}
                            foodItem={foodItem}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
