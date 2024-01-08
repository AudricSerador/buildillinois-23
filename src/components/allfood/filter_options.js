export const sortFields = [
  { value: "", label: "Sort by Nutrient" },
  { value: "calories", label: "Calories" },
  { value: "totalCarbohydrates", label: "Carbohydrates" },
  { value: "protein", label: "Protein" },
  { value: "totalFat", label: "Total Fats" },
  { value: "sugars", label: "Sugars" },
  { value: "cholesterol", label: "Cholesterol" },
  { value: "sodium", label: "Sodium" },
  { value: "fiber", label: "Dietary Fiber" },
];

export const sortOrders = [
  { value: "", label: "Sort order"},
  { value: "asc", label: "Low to High" },
  { value: "desc", label: "High to Low" },
];

export const allergenOptions = [
  { value: "Milk", label: "Milk" },
  { value: "Eggs", label: "Eggs" },
  { value: "Peanuts", label: "Peanuts" },
  { value: "Tree nuts", label: "Tree Nuts" },
  { value: "Soy", label: "Soy" },
  { value: "Wheat", label: "Wheat" },
  { value: "Fish", label: "Fish" },
  { value: "Shellfish", label: "Shellfish" },
  { value: "Sesame", label: "Sesame" },
  { value: "Gluten", label: "Gluten" },
  { value: "Alcohol", label: "Alcohol" },
  { value: "Coconut", label: "Coconut" },
  { value: "Corn", label: "Corn" },
  { value: "Gelatin", label: "Gelatin" },
  { value: "Msg", label: "MSG" },
  { value: "Pork", label: "Pork" },
  { value: "Red Dye", label: "Red Dye" },
  { value: "Sulfites", label: "Sulfites" },
];


export const preferenceOptions = [
  { value: "", label: "All Preferences" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "kosher", label: "Kosher" },
  { value: "halal", label: "Halal" },
];

export const diningOptions = [
  {
    label: "Dining Halls",
    options: [
      {
        value: "Ikenberry Dining Center (Ike)",
        label: "Ikenberry Dining Center (Ike)",
      },
      {
        value: "Illinois Street Dining Center (ISR)",
        label: "Illinois Street Dining Center (ISR)",
      },
      {
        value: "Pennsylvania Avenue Dining Hall (PAR)",
        label: "Pennsylvania Avenue Dining Hall (PAR)",
      },
      {
        value: "Lincoln Avenue Dining Hall (LAR)",
        label: "Lincoln Avenue Dining Hall (LAR)",
      },
    ],
  },
  {
    label: "A la Carte",
    options: [
      { value: "TerraByte", label: "TerraByte (ISR)" },
      { value: "Urbana South Market", label: "Urbana South Market (PAR)" },
      { value: "57 North", label: "57 North (Ike)" },
      { value: "InfiniTEA", label: "InfiniTEA (ISR)" },
    ],
  },
];

export const mealTypeOptions = [
  {
    label: "Meal Times",
    options: [
      { value: "Breakfast", label: "Breakfast" },
      { value: "Light Lunch", label: "Light Lunch" },
      { value: "Lunch", label: "Lunch" },
      { value: "Dinner", label: "Dinner" },
      { value: "Kosher Lunch", label: "Kosher Lunch" },
      { value: "Kosher Dinner", label: "Kosher Dinner" },
      { value: "A la Carte", label: "A la Carte" },
    ],
  },
  {
    label: "Food Stations (Always Available)",
    options: [
      { value: "Deli & Bagel Bar", label: "Deli & Bagel Bar" },
      { value: "Waffle Bar", label: "Waffle Bar" },
      { value: "Salad Bar", label: "Salad Bar" },
      { value: "Cereal", label: "Cereal" },
      { value: "Ice Cream", label: "Ice Cream" },
      { value: "Beverages", label: "Beverages" },
      { value: "Condiments", label: "Condiments" },
    ],
  }
];