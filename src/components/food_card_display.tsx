import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PreferenceIcons } from "./preference_icons";
import { FoodItem } from "@/pages/food/[id]";
import { FaSmile, FaMeh, FaFrown } from "react-icons/fa";
import { FaFaceMehBlank } from "react-icons/fa6";
import { diningHallTimes } from "./entries_display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FoodItemCardProps {
  foodItem: FoodItem;
  loading: boolean;
  futureDates: string[];
  sortFields?: { field: string; order: 'asc' | 'desc' }[];
}

export interface ImageData {
  id: number;
  url: string;
  likes: number;
  userName: string;
  description: string;
  created_at: string;
}

export const diningTags: { [key: string]: string } = {
  "Ikenberry Dining Center (Ike)": "Ikenberry",
  "Illinois Street Dining Center (ISR)": "ISR",
  "Pennsylvania Avenue Dining Hall (PAR)": "PAR",
  "Lincoln Avenue Dining Hall (Allen)": "Allen",
  "Field of Greens (LAR)": "LAR",
  "InfiniTEA": "InfiniTEA",
  "Urbana South Market": "South Market (PAR)",
  "57 North": "57 North (Ike)",
  "TerraByte": "TerraByte (ISR)",
};

export interface ReviewData {
  rating: 'bad' | 'mid' | 'good';
}

const parseTime = (time: string): Date => {
  const timePart = time.slice(0, -2);
  const modifier = time.slice(-2);
  
  let [hours, minutes] = timePart.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  } else if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  const parsedTime = new Date();
  parsedTime.setHours(hours, minutes, 0, 0);
  return parsedTime;
};

const isNowBetween = (startTime: string, endTime: string, currentTime: Date): boolean => {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  return currentTime >= start && currentTime <= end;
};

const nutrientLabels: { [key: string]: string } = {
  calories: "Cal",
  protein: "Protein",
  totalCarbohydrates: "Carbs",
  totalFat: "Fat",
  sodium: "Sodium",
  cholesterol: "Cholesterol",
  sugars: "Sugars",
  fiber: "Fiber",
  // Add any other nutrient fields here
};

export const FoodItemCard: React.FC<FoodItemCardProps> = ({ foodItem, loading, futureDates, sortFields }) => {
  console.log('Food Item in FoodItemCard:', foodItem);
  console.log('Review Summary:', foodItem.reviewSummary);

  const renderRating = () => {
    console.log('Rendering rating for food item:', foodItem.name);
    console.log('Review summary:', foodItem.reviewSummary);

    if (!foodItem.reviewSummary) {
      console.log('No review summary available');
      return null;
    }

    const { count, averageRating } = foodItem.reviewSummary;
    const scorePercentage = Math.round(averageRating * 100);

    console.log('Calculated score percentage:', scorePercentage);

    return (
      <div className="flex items-center">
        <div className="mr-1">
          {count === 0 ? (
            <FaFaceMehBlank className="text-lg text-gray-500" />
          ) : scorePercentage >= 70 ? (
            <FaSmile className="text-lg text-green-500" />
          ) : scorePercentage >= 40 ? (
            <FaMeh className="text-lg text-yellow-500" />
          ) : (
            <FaFrown className="text-lg text-red-500" />
          )}
        </div>
        <div className="text-sm font-semibold">
          {count === 0 ? 'N/A' : `${scorePercentage}%`}
        </div>
        <div className="ml-1 text-xs text-gray-500">({count})</div>
      </div>
    );
  };

  const [isServingNow, setIsServingNow] = useState(false);
  const [isServingLater, setIsServingLater] = useState(false);

  useEffect(() => {
    if (!loading) {
      const currentCSTTime = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
      const currentTime = new Date(currentCSTTime);
      const currentDateString = currentTime.toISOString().split('T')[0];

      let nowServing = false;
      let servingLater = false;

      if (foodItem.mealEntries) {
        foodItem.mealEntries.forEach(entry => {
          const entryDate = new Date(entry.dateServed).toISOString().split('T')[0];

          if (entryDate === currentDateString) {
            const mealTimes = diningHallTimes[entry.diningHall][entry.mealType];
            const [start, end] = mealTimes.split(" - ");

            if (isNowBetween(start, end, currentTime)) {
              nowServing = true;
            } else if (currentTime < parseTime(end)) {
              servingLater = true;
            }
          }
        });
      }

      setIsServingNow(nowServing);
      setIsServingLater(servingLater);
    }
  }, [loading, foodItem.mealEntries]);

  const renderBadges = () => {
    const mealTypes = new Set(foodItem.mealEntries?.map((entry: any) => entry.mealType) || []);
    const diningHalls = new Set(foodItem.mealEntries?.map((entry: any) => diningTags[entry.diningHall] || entry.diningHall) || []);

    return (
      <>
        {Array.from(mealTypes).map((mealType) => (
          <Badge key={mealType} variant="secondary" className="mr-1 mb-1">{mealType}</Badge>
        ))}
        {Array.from(diningHalls).map((diningHall) => (
          <Badge key={diningHall} variant="default" className="mr-1 mb-1">{diningHall}</Badge>
        ))}
      </>
    );
  };

  const renderServingStatus = () => {
    if (isServingNow) {
      return <Badge variant="success">Serving Now</Badge>;
    } else if (isServingLater) {
      return <Badge variant="warning">Serving Later Today</Badge>;
    } else if (foodItem.mealEntries && foodItem.mealEntries.length > 0) {
      const futureDates = foodItem.mealEntries
        .map(entry => entry.dateServed)
        .filter(date => new Date(date) > new Date())
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      
      if (futureDates.length > 0) {
        return <Badge variant="info">Serving on {new Date(futureDates[0]).toLocaleDateString()}</Badge>;
      }
    }
    return <Badge variant="destructive">Not Available</Badge>;
  };

  const renderNutrientBadges = () => {
    const mainNutrients = ['calories', 'protein', 'totalCarbohydrates', 'totalFat'];
    const additionalNutrients = sortFields
      ?.map(sf => sf.field)
      .filter(field => !mainNutrients.includes(field) && foodItem[field as keyof FoodItem] !== undefined);

    return (
      <div className="flex flex-wrap gap-1">
        {mainNutrients.map(nutrient => (
          <Badge key={nutrient} variant="outline" className="whitespace-nowrap py-0 px-1 sm:py-0 sm:px-1">
            {String(foodItem[nutrient as keyof FoodItem])}{nutrient === 'calories' ? '' : 'g'} {nutrientLabels[nutrient]}
          </Badge>
        ))}
        {additionalNutrients && additionalNutrients.map(nutrient => (
          <Badge key={nutrient} variant="outline" className="whitespace-nowrap py-0 px-1 sm:py-0 sm:px-1">
            {String(foodItem[nutrient as keyof FoodItem])}{nutrient === 'calories' ? '' : 'g'} {nutrientLabels[nutrient]}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <Link href={`/food/${foodItem.id}`} className="w-full" key={foodItem.id}>
      <Card className="overflow-hidden flex flex-row sm:flex-col h-full">
        <div className="w-1/3 sm:w-full h-full sm:h-32 bg-gray-100 overflow-hidden">
          {!loading && foodItem.topImage ? (
            <img 
              src={foodItem.topImage?.url} 
              alt={foodItem.name} 
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                console.error('Image failed to load:', foodItem.topImage?.url);
                e.currentTarget.onerror = null; // Prevent infinite loop
                e.currentTarget.src = '/placeholder-image.jpg'; // Replace with your placeholder image path
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-500 text-sm">
                {loading ? "Loading..." : "No Image"}
              </span>
            </div>
          )}
        </div>
        <CardContent className="p-3 flex flex-col justify-between flex-grow w-2/3 sm:w-full">
          <div>
            <CardHeader className="p-0 mb-1">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-bold truncate w-3/4 md:text-sm">
                  {loading ? <div className="bg-gray-200 animate-pulse h-4 w-full"></div> : foodItem.name}
                </CardTitle>
                <div className={`${loading ? 'bg-gray-200 animate-pulse w-6 h-6 rounded-full' : ''}`}>
                  {!loading && renderRating()}
                </div>
              </div>
            </CardHeader>
            <div className="h-4 md:h-6 mb-4">
              {!loading && (
                <PreferenceIcons
                  preferences={foodItem.preferences}
                  allergens={foodItem.allergens}
                />
              )}
            </div>
          </div>
          <div className="text-[0.6rem] md:text-xs mb-1">
            {loading ? (
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            ) : (
              renderNutrientBadges()
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {loading ? (
              [1, 2].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-10 animate-pulse"></div>
              ))
            ) : (
              <>
                {renderBadges()}
                {renderServingStatus()}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};