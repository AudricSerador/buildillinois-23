import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NutritionFacts from "@/components/nutrition_facts";
import { EntriesDisplay } from "@/components/entries_display";
import LoadingSpinner from "@/components/loading_spinner";
import { useAuth } from "@/auth/auth.service";
import FavoriteBtn from "@/components/favorites/favorite_btn";

interface FoodItem {
  calories: number;
  servingSize: string;
  caloriesFat: number;
  totalFat: number;
  saturatedFat: number;
  transFat: number;
  cholesterol: number;
  sodium: number;
  totalCarbohydrates: number;
  fiber: number;
  sugars: number;
  protein: number;
  calciumDV: number;
  ironDV: number;
  name: string;
  ingredients: string;
  allergens: string;
  mealEntries: string[];
}

export default function FoodItemPage() {
  const router = useRouter();
  const { id: foodId } = router.query;
  const [userId, setUserId] = useState("");
  const [foodItem, setFoodItem] = useState<FoodItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFoodItem = async () => {
      if (foodId) {
        const res = await fetch(`/api/food/${foodId}`);
        const data = await res.json();
  
        if (!data) {
          router.push("/404");
        } else {
          setFoodItem(data);
          setIsLoading(false);
        }
      }
    };
  
    if (foodId) {
      fetchFoodItem();
    }

    if (user) {
      setUserId(user.id);
    }
  }, [foodId, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <LoadingSpinner />
        <p className="mt-4 font-custom text-xl">Loading food data...</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 font-custom md:px-16 lg:px-64 mt-4">
<div className="flex items-center space-x-4 mb-4">
  <h1 className="text-4xl font-custombold">{foodItem?.name}</h1>
  <FavoriteBtn userId={userId} foodId={foodId as string} foodName={foodItem?.name as string} />
</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 items-start justify-items-center sm:justify-items-start">
        {foodItem && <NutritionFacts foodItem={foodItem} />}
        <div>
          <p className="mb-4 font-custombold">
            Ingredients:{" "}
            <span className="font-custom">{foodItem?.ingredients}</span>
            <br />
            Allergens:{" "}
            <span className="font-custom">{foodItem?.allergens}</span>
          </p>
          <h2 className="text-2xl font-custombold mb-2">Dates Served</h2>
          {foodItem?.mealEntries && (
            <EntriesDisplay mealEntries={foodItem.mealEntries} />
          )}
        </div>
      </div>
    </div>
  );
}
