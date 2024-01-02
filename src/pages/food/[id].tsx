import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import prisma from '../../../lib/prisma';
import NutritionFacts from '@/components/nutrition_facts';

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
    <div className="px-2 sm:px-32 py-6 mt-4 bg-white shadow-md rounded-lg">
      <h1 className="text-4xl font-custombold mb-4">{foodItem.name || 'Loading...'}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <div>
          <h2 className="text-2xl font-custombold mb-2">Meal Details</h2>
          <p className="mb-4">
            Serving Size: <span className="font-custom">{foodItem.servingSize}</span><br />
            Ingredients: <span className="font-custom">{foodItem.ingredients}</span><br />
            Allergens: <span className="font-custom">{foodItem.allergens}</span>
          </p>
          <h2 className="text-2xl font-custombold mb-2">Dates Served</h2>
          {foodItem.mealEntries.map((mealEntry: any) => (
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
        <NutritionFacts foodItem={foodItem} />
      </div>
    </div>
  );
}