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
  const [foodItem, setFoodItem] = useState<FoodItem | null>(null); // Add type annotation to foodItem
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
      } else {
        router.push("/404");
      }
    };

    fetchFoodItem();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <LoadingSpinner />
        <p className="mt-4 font-custom text-xl">Loading food data...</p>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-32 py-6 mt-4 bg-white shadow-md rounded-lg">
      <h1 className="text-4xl font-custombold mb-4">{foodItem.name}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <div>
          <h2 className="text-2xl font-custombold mb-2">Meal Details</h2>
          <p className="mb-4">
            Serving Size:{" "}
            <span className="font-custom">{foodItem.servingSize}</span>
            <br />
            Ingredients:{" "}
            <span className="font-custom">{foodItem.ingredients}</span>
            <br />
            Allergens: <span className="font-custom">{foodItem.allergens}</span>
          </p>
          <h2 className="text-2xl font-custombold mb-2">Dates Served</h2>
          <EntriesDisplay mealEntries={foodItem.mealEntries} />
        </div>
        <NutritionFacts foodItem={foodItem} />
      </div>
    </div>
  );
}
