import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function importJSONToDatabase(foodData: any[]) {
    try {
        for (const food of foodData) {
            await prisma.foodInfo.create({
                data: {
                    id: uuidv4(),
                    name: food.name,
                    mealEntries: {
                        create: food.mealEntries.map((entry: any) => ({
                            diningHall: entry.diningHall,
                            diningFacility: entry.diningFacility,
                            mealType: entry.mealType,
                            dateServed: entry.dateServed,
                            foodId: food.id,
                        })),
                    },
                    servingSize: food.servingSize,
                    ingredients: food.ingredients,
                    allergens: food.allergens,
                    calories: food.calories,
                    caloriesFat: food.caloriesFat,
                    totalFat: food.totalFat,
                    saturatedFat: food.saturatedFat,
                    transFat: food.transFat,
                    polyFat: food.polyFat,
                    monoFat: food.monoFat,
                    cholesterol: food.cholesterol,
                    sodium: food.sodium,
                    potassium: food.potassium,
                    totalCarbohydrates: food.totalCarbohydrates,
                    fiber: food.fiber,
                    sugars: food.sugars,
                    protein: food.protein,
                },
            });
            console.log(`Created FoodInfo with ID: ${food.id}`);
        }
    } catch (error) {
        console.error('Error appending data to the database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

export { importJSONToDatabase };
