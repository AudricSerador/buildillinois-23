import Link from "next/link";

interface FoodItemDisplayProps {
  foodItem: any;
}

export const FoodItemDisplay: React.FC<FoodItemDisplayProps> = ({
  foodItem,
}) => {
  return (
    <Link href={`/food/${foodItem.id}`}>
      <li className="border p-4 rounded-md mb-4 font-custom">
        <p className="font-bold text-lg">{foodItem.name}</p>
        <p className="text-sm text-gray-500">
          <span className="font-bold text-md">
            Serving on {foodItem.mealEntries.length} occasions:&nbsp;
            {[
              ...new Set(
                foodItem.mealEntries.map((entry: any) => entry.mealType)
              ),
            ].join(", ")}
          </span>
          <br />
          Serving Size: {foodItem.servingSize}
          <span className="text-gray-500"> | </span>
          {foodItem.calories} Cal
          <span className="text-gray-500"> | </span>
          {foodItem.protein}g Protein
          <span className="text-gray-500"> | </span>
          {foodItem.totalCarbohydrates}g Carbs
          <span className="text-gray-500"> | </span>
          {foodItem.totalFat}g Fat
        </p>
      </li>
    </Link>
  );
};
