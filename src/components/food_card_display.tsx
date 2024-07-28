import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PreferenceIcons } from "./preference_icons";
import { FoodItem } from "@/pages/food/[id]";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { diningTags } from "./review_section";
import { diningHallTimes } from "./entries_display";

interface FoodItemCardProps {
  foodItem: FoodItem;
}

interface ImageData {
  id: number;
  url: string;
  likes: number;
  userName: string;
  description: string;
  created_at: string;
}

interface ReviewData {
  rating: number;
}

const parseTime = (time: string): Date => {
  // Separate the time part and the modifier (AM/PM)
  const timePart = time.slice(0, -2);
  const modifier = time.slice(-2);
  
  let [hours, minutes] = timePart.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  } else if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  const parsedTime = new Date();
  parsedTime.setHours(hours, minutes, 0, 0); // set the parsed hours and minutes
  return parsedTime;
};

const isNowBetween = (startTime: string, endTime: string, currentTime: Date): boolean => {
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  console.log(`Checking if ${currentTime} is between ${start} and ${end}`);

  return currentTime >= start && currentTime <= end;
};

export const FoodItemCard: React.FC<FoodItemCardProps> = ({ foodItem }) => {
  const [topImage, setTopImage] = useState<ImageData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isServingNow, setIsServingNow] = useState(false);
  const [isServingLater, setIsServingLater] = useState(false);

  useEffect(() => {
    const fetchTopImage = async () => {
      const response = await fetch(`/api/image/get_images?foodId=${foodItem.id}`);
      const data = await response.json();
      if (data.success) {
        const sortedImages = data.images.sort((a: ImageData, b: ImageData) => b.likes - a.likes);
        setTopImage(sortedImages[0] || null);
      }
    };

    const fetchReviews = async () => {
      const response = await fetch(`/api/review/get_review?foodId=${foodItem.id}`);
      const data = await response.json();
      if (data.success) {
        const fetchedReviews = data.data || [];
        setReviews(fetchedReviews);
        const average = fetchedReviews.length > 0
          ? fetchedReviews.reduce((sum: number, review: ReviewData) => sum + review.rating, 0) / fetchedReviews.length
          : 0;
        setAverageRating(average);
      }
    };

    const fetchData = async () => {
      await fetchTopImage();
      await fetchReviews();
      setLoading(false);
    };

    fetchData();
  }, [foodItem.id]);

  useEffect(() => {
    const currentCSTTime = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
    const currentTime = new Date(currentCSTTime);
    const currentDateString = currentTime.toISOString().split('T')[0];

    console.log("Current CST Time:", currentTime);
    console.log("Current Date:", currentDateString);

    let nowServing = false;
    let servingLater = false;

    if (foodItem.mealEntries) {
      foodItem.mealEntries.forEach(entry => {
        console.log(entry);
        const entryDate = new Date(entry.dateServed).toISOString().split('T')[0];
        console.log(`Checking entry: ${entry.diningHall} - ${entry.mealType} - ${entry.dateServed}`);

        if (entryDate === currentDateString) {
          const mealTimes = diningHallTimes[entry.diningHall][entry.mealType];
          const [start, end] = mealTimes.split(" - ");

          console.log(`Meal Times: ${start} to ${end}`);
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
    console.log("isServingNow:", nowServing);
    console.log("isServingLater:", servingLater);
  }, [foodItem.mealEntries]);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <>
        {Array(fullStars).fill(<FaStar className="text-yellow-500" />)}
        {halfStar && <FaStarHalfAlt className="text-yellow-500" />}
        {Array(emptyStars).fill(<FaRegStar className="text-yellow-500" />)}
      </>
    );
  };

  const renderBadges = () => {
    const mealTypes = new Set(
      foodItem.mealEntries?.map((entry: any) => entry.mealType) || []
    );
    const diningHalls = new Set(
      foodItem.mealEntries?.map((entry: any) => diningTags[entry.diningHall] || entry.diningHall) || []
    );

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {Array.from(mealTypes).map((mealType) => (
          <div key={mealType} className="badge badge-secondary">
            {mealType}
          </div>
        ))}
        {Array.from(diningHalls).map((diningHall) => (
          <div key={diningHall} className="badge badge-primary">
            {diningHall}
          </div>
        ))}
        {foodItem.mealEntries === undefined || foodItem.mealEntries.length === 0 && <div className="badge badge-error">Not Available</div>}
      </div>
    );
  };

  return (
    <Link href={`/food/${foodItem.id}`}>
      <div className="card shadow-lg compact side bg-base-100 cursor-pointer mb-2 font-custom">
        {loading ? (
          <div className="card-body">
            <div className="flex flex-row items-center">
              <div className="w-24 h-24 bg-gray-200 rounded-lg mr-4 animate-pulse"></div>
              <div>
                <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-36 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center mt-2">
              <div className="flex space-x-1">
                {Array(5).fill(<FaRegStar className="text-gray-200 animate-pulse" />)}
              </div>
              <p className="ml-2 h-4 bg-gray-200 rounded w-12 animate-pulse"></p>
            </div>
          </div>
        ) : (
          <div className="card-body">
            <div className="flex flex-row items-center">
              {topImage ? (
                <img
                  src={topImage.url}
                  alt="Top Image"
                  className="w-24 h-24 object-cover rounded-lg mr-4"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              <div>
                <h2 className="card-title flex items-center">
                  {foodItem.name}
                  {isServingNow && <div className="badge badge-success ml-2">Serving Now</div>}
                  {!isServingNow && isServingLater && <div className="badge badge-warning ml-2">Serving Later</div>}
                </h2>
                <PreferenceIcons
                  preferences={foodItem.preferences}
                  allergens={foodItem.allergens}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className="badge badge-outline">{foodItem.servingSize}</div>
                  <div className="badge badge-outline">{foodItem.calories} Cal</div>
                  <div className="badge badge-outline">{foodItem.protein}g Protein</div>
                  <div className="badge badge-outline">{foodItem.totalCarbohydrates}g Carbs</div>
                  <div className="badge badge-outline">{foodItem.totalFat}g Fat</div>
                </div>
                {renderBadges()}
              </div>
            </div>
            <div className="flex items-center mt-2">
              {renderStars(averageRating)}
              <p className="ml-2 text-sm text-gray-500">{averageRating} ({reviews.length} reviews)</p>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};
