import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NutritionFacts from "@/components/nutrition_facts";
import { EntriesDisplay } from "@/components/entries_display";
import LoadingSpinner from "@/components/loading_spinner";

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
  const { id } = router.query;
  const [foodItem, setFoodItem] = useState<FoodItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFoodItem = async () => {
      if (id) {
        const res = await fetch(`/api/food/${id}`);
        const data = await res.json();
  
        if (!data) {
          router.push("/404");
        } else {
          setFoodItem(data);
          setIsLoading(false);
        }
      }
    };
  
    if (id) {
      fetchFoodItem();
    }
  }, [id, router]);

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
      <h1 className="text-4xl font-custombold mb-4">{foodItem?.name}</h1>
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
