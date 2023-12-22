interface FoodItemDisplayProps {
    foodItem: any; 
  }
  
export const FoodItemDisplay: React.FC<FoodItemDisplayProps> = ({ foodItem }) => {
  return (
    <li className="border p-4 rounded-md mb-4">
      <p className="font-bold text-lg">{foodItem.name}</p>
      <p className="text-sm text-gray-500">
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
  );
};