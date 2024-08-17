export const diningHallTimes: { [key: string]: { [key: string]: string } } = {
    "Ikenberry Dining Center (Ike)": {
      "Breakfast": "7:00AM - 10:00AM",
      "Lunch": "10:30AM - 1:30PM",
      "Light Lunch": "1:30PM - 3:00PM",
      "Dinner": "4:30PM - 8:00PM",
    },
    "Illinois Street Dining Center (ISR)": {
      "Breakfast": "7:00AM - 10:00AM",
      "Lunch": "10:30AM - 2:00PM",
      "Dinner": "4:30PM - 8:00PM",
    },
    "Pennsylvania Avenue Dining Hall (PAR)": {
      "Breakfast": "7:00AM - 10:00AM",
      "Lunch": "10:30AM - 2:30PM",
      "Dinner": "4:30PM - 8:00PM",
    },
    "Lincoln Avenue Dining Hall (Allen)": {
      "Breakfast": "7:00AM - 10:00AM",
      "Lunch": "10:30AM - 1:30PM",
      "Kosher Lunch": "10:45AM - 1:30PM",
      "Dinner": "4:30PM - 7:00PM",
      "Kosher Dinner": "4:45PM - 6:15PM",
    },
    "Field of Greens (LAR)": {
      "Lunch": "10:00AM - 3:00PM",
    },
    "InfiniTEA": {
      "A la Carte--APP DISPLAY": "7:00AM - 11:30PM",
      "A la Carte--POS Feed": "7:00AM - 10:30PM",
    },
    "Urbana South Market": {
      "A la Carte--APP DISPLAY": "10:00AM - 9:00PM",
      "A la Carte--POS Feed": "10:00AM - 9:00PM",
    },
    "57 North": {
      "A la Carte--APP DISPLAY": "9:00AM - 10:00PM",
      "A la Carte--POS Feed": "9:00AM - 10:00PM",
    },
    "TerraByte": {
      "A la Carte--APP DISPLAY": "10:00AM - 10:30PM",
      "A la Carte--POS Feed": "10:00AM - 10:30PM",
    },
  };

  export interface FoodItem {
    id: string;
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
    preferences: string;
    mealEntries: any[];
    reviewSummary?: {
      count: number;
      averageRating: number;
    };
    topImage?: any;
  }