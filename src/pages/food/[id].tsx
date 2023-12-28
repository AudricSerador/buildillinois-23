import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import prisma from '../../../lib/prisma';

export const getStaticPaths: GetStaticPaths = async () => {
  const foodItems = await prisma.foodInfo.findMany();
  const paths = foodItems.map((foodItem) => ({
    params: { id: foodItem.id.toString() },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async (context) => {
const { id } = context.params as { id: string };
  const foodItem = await prisma.foodInfo.findUnique({
    where: { id: String(id) },
    include: { mealEntries: true }
  });

  return { props: { foodItem } };
};

export default function FoodItemPage({ foodItem }: { foodItem: any }) {
  const router = useRouter();

  if (router.isFallback || !foodItem) {
    return <div>Loading...</div>;
  }

  return (
    <div className="px-32 mt-4 bg-white shadow-md rounded-lg p-6">
      <h1 className="text-4xl font-custombold mb-4">{foodItem.name || 'Loading...'}</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-2xl font-custombold mb-2">Meal Details</h2>
          <p className="mb-4">
            Serving Size: <span className="font-custom">{foodItem.servingSize}</span><br />
            Ingredients: <span className="font-custom">{foodItem.ingredients}</span><br />
            Allergens: <span className="font-custom">{foodItem.allergens}</span>
          </p>
          <h2 className="text-2xl font-custombold mb-2">Dates Served</h2>
          {foodItem.mealEntries.map((mealEntry: any) => ( // Later add a time table-styled display to easily show meal availability?
            <div key={mealEntry.id} className="mb-4">
              <p>
                Dining Hall: <span className="font-custom">{mealEntry.diningHall}</span><br />
                Dining Facility: <span className="font-custom">{mealEntry.diningFacility}</span><br />
                Date Served: <span className="font-custom">{mealEntry.dateServed}</span><br />
                Meal Type: <span className="font-custom">{mealEntry.mealType}</span>
              </p>
            </div>
          ))}
        </div>
        <div>
          <h2 className="text-2xl font-custombold mb-2">Nutritional Information</h2>
          <p>
            Calories: <span className="font-custom">{foodItem.calories}</span><br />
            Calories from Fat: <span className="font-custom">{foodItem.caloriesFat}</span><br />
            Total Fat: <span className="font-custom">{foodItem.totalFat}g</span><br />
            Saturated Fat: <span className="font-custom">{foodItem.saturatedFat}g</span><br />
            Trans Fat: <span className="font-custom">{foodItem.transFat}g</span><br />
            Polyunsaturated Fat: <span className="font-custom">{foodItem.polyFat}g</span><br />
            Monounsaturated Fat: <span className="font-custom">{foodItem.monoFat}g</span><br />
            Cholesterol: <span className="font-custom">{foodItem.cholesterol}mg</span><br />
            Sodium: <span className="font-custom">{foodItem.sodium}mg</span><br />
            Potassium: <span className="font-custom">{foodItem.potassium}mg</span><br />
            Total Carbohydrates: <span className="font-custom">{foodItem.totalCarbohydrates}g</span><br />
            Dietary Fiber: <span className="font-custom">{foodItem.fiber}g</span><br />
            Sugars: <span className="font-custom">{foodItem.sugars}g</span><br />
            Protein: <span className="font-custom">{foodItem.protein}g</span>
          </p>
        </div>
      </div>
    </div>
  );
}