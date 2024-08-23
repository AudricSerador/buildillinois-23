import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FoodItemCard } from "@/components/food_card_display";
import { diningHallTimes } from "@/components/entries_display";
import LoadingSpinner from "@/components/loading_spinner";
import { GetServerSideProps } from "next";
import prisma from "../../../lib/prisma";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  }, [dateIndex, foodDates]);

  // Add this new state variable
  const [futureDates, setFutureDates] = useState<string[]>([]);

  // Add this useEffect to update futureDates when foodDates changes
  useEffect(() => {
    const currentDate = new Date();
    const filteredDates = foodDates.filter(date => new Date(date) >= currentDate);
    setFutureDates(filteredDates);
  }, [foodDates]);

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
    <Card className="mx-auto max-w-4xl mt-8">
      <CardHeader>
        <CardTitle className="text-4xl font-custombold text-center">{id}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            onClick={decrementDate}
            className="btn btn-circle btn-outline"
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
            className="btn btn-circle btn-outline"
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

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {[
            "TerraByte",
            "57 North",
            "Urbana South Market",
            "InfiniTEA",
          ].includes(id as string) ? (
            <button
              className={`btn ${
                mealType === "A la Carte" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setMealType("A la Carte")}
            >
              A la Carte
            </button>
          ) : (
            <>
              <button
                className={`btn ${
                  mealType === "Breakfast" ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setMealType("Breakfast")}
              >
                Breakfast
              </button>
              <button
                className={`btn ${
                  mealType === "Lunch" ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setMealType("Lunch")}
              >
                Lunch
              </button>
              {id === "Ikenberry Dining Center (Ike)" && (
                <button
                  className={`btn ${
                    mealType === "Light Lunch" ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => setMealType("Light Lunch")}
                >
                  Light Lunch
                </button>
              )}
              {id === "Lincoln Avenue Dining Hall (Allen, LAR)" && (
                <button
                  className={`btn ${
                    mealType === "Kosher Lunch" ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => setMealType("Kosher Lunch")}
                >
                  Kosher Lunch
                </button>
              )}
              <button
                className={`btn ${
                  mealType === "Dinner" ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setMealType("Dinner")}
              >
                Dinner
              </button>
              {id === "Lincoln Avenue Dining Hall (Allen/LAR)" && (
                <button
                  className={`btn ${
                    mealType === "Kosher Dinner" ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => setMealType("Kosher Dinner")}
                >
                  Kosher Dinner
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {mealTypes &&
            mealTypes
              .filter(
                (mealTypeItem) => !defaultMealTypes.includes(mealTypeItem)
              )
              .map((mealTypeItem) => (
                <button
                  key={mealTypeItem}
                  className={`btn btn-sm ${
                    mealType === mealTypeItem ? "btn-primary" : "btn-outline"
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

        <div className="mt-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <LoadingSpinner text="Loading hall data"/>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
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
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(foodData).map(([facility, foodItems], index) => (
                <AccordionItem key={facility} value={`item-${index}`}>
                  <AccordionTrigger className="text-xl font-custombold">
                    {facility}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {foodItems &&
                        (foodItems as any[]).map((foodItem: any) => (
                          <FoodItemCard
                            key={foodItem.id}
                            foodItem={foodItem}
                            loading={false}
                            futureDates={futureDates}
                          />
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </CardContent>
    </Card>
  );
}