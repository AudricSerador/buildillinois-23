import React from "react";

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
}

interface NutritionFactsProps {
  foodItem: FoodItem;
}

const DAILY_VALUES = {
  totalFat: 70,
  saturatedFat: 20,
  cholesterol: 300,
  sodium: 2400,
  totalCarbohydrates: 310,
  fiber: 25,
  protein: 50,
};

function calculatePercentage(
  value: number,
  nutrient: keyof typeof DAILY_VALUES
) {
  const percentage = Math.round((value / DAILY_VALUES[nutrient]) * 100);
  return percentage;
}

const NutritionFacts: React.FC<NutritionFactsProps> = ({ foodItem }) => {
  return (
    <section className="font-custom text-base leading-normal max-w-xs p-1 border bg-white border-black h-auto">
      <header>
        <h1 className="text-4xl font-custombold leading-relaxed text-normal">
          Nutrition Facts
        </h1>
        <div>
          <div className="ml-1 mt-[-12px] flex justify-between font-custombold">
            <span>Serving Size</span>
            <span>{foodItem.servingSize}</span>
          </div>
        </div>
      </header>
      <div className="border-t-8 border-black"></div>
      <ul className="border-t-10 border-b border-solid mt-0 mb-0 pl-0">
        <li className="flex flex-wrap justify-between px-1 border-t border-solid">
          <span>Amount per serving</span>
        </li>
        <div className="border-t border-gray-500"></div>
        <li className="flex flex-wrap justify-between px-1 border-t border-solid">
          <span className="flex justify-between w-full">
            <span className="font-bold">Calories</span> &nbsp;
            {foodItem.calories}
            <span className="ml-auto">
              Calories from Fat {foodItem.caloriesFat}
            </span>
          </span>
        </li>
        <div className="border-t-4 border-black"></div>
        <li className="text-right"> % Daily Value*</li>
        <div className="border-t border-gray-500"></div>
        <li className="flex flex-wrap justify-between px-1 border-t-5 border-t border-solid">
          <span>
            <span className="font-bold">Total Fat</span> {foodItem.totalFat}g
          </span>
          <b>{calculatePercentage(foodItem.totalFat, "totalFat")}%</b>
        </li>
        <div className="border-t border-gray-500"></div>
        <ul className="flex-0 w-full list-none mt-0 mb-0 pl-0">
          <li className="ml-4 mr-1 flex justify-between">
            <span className="pr-4">Saturated Fat {foodItem.saturatedFat}g</span>{" "}
            <b>{calculatePercentage(foodItem.saturatedFat, "saturatedFat")}%</b>
          </li>
        </ul>
        <div className="border-t border-gray-500"></div>
        <ul className="flex-0 w-full list-none mt-0 mb-0 pl-0">
          <li className="ml-4 mr-1">
            <i>Trans</i> Fat {foodItem.transFat}g
          </li>
        </ul>
        <div className="border-t border-gray-500"></div>
        <li className="flex flex-wrap justify-between px-1 border-t border-solid">
          <span>
            <span className="font-bold">Cholesterol</span>{" "}
            {foodItem.cholesterol}mg
          </span>
          <b>{calculatePercentage(foodItem.cholesterol, "cholesterol")}%</b>
        </li>
        <div className="border-t border-gray-500"></div>
        <li className="flex flex-wrap justify-between px-1 border-t border-solid">
          <span>
            <span className="font-bold">Sodium</span> {foodItem.sodium}mg
          </span>
          <b>{calculatePercentage(foodItem.sodium, "sodium")}%</b>
        </li>
        <div className="border-t border-gray-500"></div>
        <li className="flex flex-wrap justify-between px-1 border-t border-solid">
          <span>
            <span className="font-bold">Total Carbohydrate</span>{" "}
            {foodItem.totalCarbohydrates}g
          </span>
          <b>
            {calculatePercentage(
              foodItem.totalCarbohydrates,
              "totalCarbohydrates"
            )}
            %
          </b>
        </li>
        <div className="border-t border-gray-500"></div>
        <ul className="flex-0 w-full list-none mt-0 mb-0 pl-0">
          <li className="ml-4 mr-1 flex justify-between">
            <span className="pr-4">Dietary Fiber {foodItem.fiber}g</span>{" "}
            <b>{calculatePercentage(foodItem.fiber, "fiber")}%</b>
          </li>
        </ul>
        <div className="border-t border-gray-500"></div>
        <ul className="flex-0 w-full list-none mt-0 mb-0 pl-0">
          <li className="ml-4 mr-1">Sugars {foodItem.sugars}g</li>
        </ul>
        <div className="border-t border-gray-500"></div>
        <li className="flex flex-wrap justify-between px-1 border-t border-solid">
          <span>
            <span className="font-bold">Protein</span> {foodItem.protein}g
          </span>
        </li>
      </ul>
      <div className="border-t-8 border-black"></div>
      <ul className="border-t-10 border-b border-solid mt-0 mb-0 pl-0">
        <li className="flex flex-wrap justify-between px-1 border-t border-solid">
          <span>Vitamin A</span> 0%
        </li>
        <div className="border-t border-gray-500"></div>
        <li className="flex flex-wrap justify-between px-1 border-t border-solid">
          <span>Vitamin C</span> 0%
        </li>
        <div className="border-t border-gray-500"></div>
        <li className="flex flex-wrap justify-between px-1 border-t border-solid">
          <span>Calcium</span> {foodItem.calciumDV}%
        </li>
        <div className="border-t border-gray-500"></div>
        <li className="flex flex-wrap justify-between px-1 border-t border-solid">
          <span>Iron</span> {foodItem.ironDV}%
        </li>
      </ul>
      <div className="border-t-4 border-black"></div>
      <footer className="text-sm mt-2">
        <span className="block ml-4 text-indent-4">
          <span className="inline-block -ml-2">*</span>
          The % Daily Value (DV) tells you how much a nutrient in a serving of
          food contributes to a daily diet. 2,000 calories a day is used for
          general nutrition advice.
        </span>
      </footer>
    </section>
  );
};

export default NutritionFacts;
