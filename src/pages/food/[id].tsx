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
  });

  return { props: { foodItem } };
};

export default function FoodItemPage({ foodItem }: { foodItem: any }) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div className="px-32 mt-4">
      <h1 className="text-4xl font-custom-bold">{foodItem.name || 'Loading...'}</h1>
      {/* Display other properties of the food item here */}
    </div>
  );
}