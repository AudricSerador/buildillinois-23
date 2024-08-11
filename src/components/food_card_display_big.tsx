import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PreferenceIcons } from "./preference_icons";
import { FoodItem } from "@/pages/food/[id]";
import { FaSmile, FaMeh, FaFrown } from "react-icons/fa";
import { FaFaceMehBlank } from "react-icons/fa6";
import { diningHallTimes } from "./entries_display";

interface FoodItemCardBigProps {
  foodItem: FoodItem;
  loading: boolean;
}

interface ImageData {
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

interface ReviewData {
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

export const FoodItemCardBig: React.FC<FoodItemCardBigProps> = ({ foodItem, loading }) => {
  const [topImage, setTopImage] = useState<ImageData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [scorePercentage, setScorePercentage] = useState(0);
  const [isServingNow, setIsServingNow] = useState(false);
  const [isServingLater, setIsServingLater] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!loading) {
      const fetchTopImage = async () => {
        const response = await fetch(`/api/image/get_images?foodId=${foodItem.id}`);
        const data = await response.json();
        if (data.success) {
          const sortedImages = data.images.sort((a: ImageData, b: ImageData) => b.likes - a.likes);
          setTopImage(sortedImages[0] || null);
          setImageLoaded(true);
        }
      };

      const fetchReviews = async () => {
        const response = await fetch(`/api/review/get_review?foodId=${foodItem.id}`);
        const data = await response.json();
        if (data.success) {
          const fetchedReviews = data.data || [];
          setReviews(fetchedReviews);
          const totalScore = fetchedReviews.reduce((sum: number, review: ReviewData) => {
            return sum + (review.rating === 'good' ? 100 : review.rating === 'mid' ? 50 : 0);
          }, 0);
          const percentage = fetchedReviews.length > 0 ? Math.round(totalScore / fetchedReviews.length) : 0;
          setScorePercentage(percentage);
        }
        setDataLoaded(true);
      };

      fetchTopImage();
      fetchReviews();
    }
  }, [loading, foodItem.id]);

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

  const renderRating = () => {
    return (
      <div className="flex items-center">
        {reviews.length === 0 ? (
          <FaFaceMehBlank className="text-2xl text-gray-500" />
        ) : scorePercentage >= 70 ? (
          <FaSmile className="text-2xl text-green-500" />
        ) : scorePercentage >= 40 ? (
          <FaMeh className="text-2xl text-yellow-500" />
        ) : (
          <FaFrown className="text-2xl text-red-500" />
        )}
        <div className="ml-2">
          <div className="text-lg font-medium">{reviews.length === 0 ? "n/a" : `${scorePercentage}%`}</div>
          <div className="text-sm text-gray-500">({reviews.length})</div>
        </div>
      </div>
    );
  };

  const renderBadges = () => {
    const mealTypes = new Set(foodItem.mealEntries?.map((entry: any) => entry.mealType) || []);
    const diningHalls = new Set(foodItem.mealEntries?.map((entry: any) => diningTags[entry.diningHall] || entry.diningHall) || []);

    return (
      <>
        {Array.from(mealTypes).map((mealType) => (
          <div key={mealType} className="badge badge-secondary mr-1 mb-1">{mealType}</div>
        ))}
        {Array.from(diningHalls).map((diningHall) => (
          <div key={diningHall} className="badge badge-primary mr-1 mb-1">{diningHall}</div>
        ))}
        {(!foodItem.mealEntries || foodItem.mealEntries.length === 0) && 
          <div className="badge badge-error mr-1 mb-1">Not Available</div>
        }
        {isServingNow && <div className="badge badge-success mr-1 mb-1">Now</div>}
        {!isServingNow && isServingLater && <div className="badge badge-warning mr-1 mb-1">Later</div>}
      </>
    );
  };

  return (
    <Link href={`/food/${foodItem.id}`}>
      <div className="card bg-base-100 w-96 shadow-xl">
        <figure className={`${loading || !imageLoaded ? 'bg-gray-200 animate-pulse' : ''}`}>
          {!loading && imageLoaded && topImage ? (
            <img src={topImage.url} alt={foodItem.name} className="w-full h-48 object-cover" />
          ) : !loading && imageLoaded ? (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          ) : null}
        </figure>
        <div className="card-body">
          <h2 className={`card-title ${loading || !dataLoaded ? 'bg-gray-200 animate-pulse h-8 w-3/4' : ''}`}>
            {!loading && dataLoaded ? foodItem.name : ''}
            {isServingNow && <div className="badge badge-secondary">NOW</div>}
          </h2>
          {!loading && dataLoaded && (
            <p className="text-sm">
              {foodItem.calories} Cal | {foodItem.protein}g Protein | {foodItem.totalCarbohydrates}g Carbs | {foodItem.totalFat}g Fat
            </p>
          )}
          <div className="card-actions justify-end">
            {loading || !dataLoaded ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
              ))
            ) : (
              <>
                {Array.from(new Set(foodItem.mealEntries?.map((entry: any) => entry.mealType) || [])).map((mealType) => (
                  <div key={mealType} className="badge badge-outline">{mealType}</div>
                ))}
                {Array.from(new Set(foodItem.mealEntries?.map((entry: any) => diningTags[entry.diningHall] || entry.diningHall) || [])).map((diningHall) => (
                  <div key={diningHall} className="badge badge-outline">{diningHall}</div>
                ))}
              </>
            )}
          </div>
          {!loading && dataLoaded && (
            <div className="mt-2">
              <PreferenceIcons
                preferences={foodItem.preferences}
                allergens={foodItem.allergens}
              />
            </div>
          )}
          <div className="card-actions justify-between items-center mt-4">
            {!loading && dataLoaded && renderRating()}
            <button className="btn btn-primary btn-sm">View Details</button>
          </div>
        </div>
      </div>
    </Link>
  );
};