import React from 'react';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { FoodItemDisplay } from '../components/food_item_display';
import prisma from '../../lib/prisma';
import { useRouter } from 'next/router';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const pageSize = 10;
  const pageNumber = context.query.page ? parseInt(context.query.page as string) - 1 : 0;

  const food = await prisma.foodInfo.findMany({
    skip: pageNumber * pageSize,
    take: pageSize,
    include: {
      mealEntries: {
        where: { dateServed: "Tuesday, January 16, 2024" },
      },
    },
  });

  const foodCount = await prisma.foodInfo.count();

  return {
    props: { food, foodCount },
  };
};

export default function AllFood({ food, foodCount }: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const router = useRouter();
  const pageSize = 10;
  const pageNumber = router.query.page ? parseInt(router.query.page as string) : 1;

  const handlePageChange = (page: number) => {
    router.push(`/allfood?page=${page}`);
  };
  
  const totalPages = Math.ceil(foodCount / pageSize);
  
  const startPage = pageNumber > 2 ? pageNumber - 2 : 1;
  const endPage = startPage + 4 < totalPages ? startPage + 4 : totalPages;
  
  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-32 mt-4">
      <p className="text-4xl font-custombold">All Food ({foodCount})</p>
      <div style={{ paddingBottom: '1rem', borderBottom: '4px solid black', marginBottom: '1rem' }}></div>
      <ul>
        {food.map((foodItem: any) => (
          <FoodItemDisplay key={foodItem.id} foodItem={foodItem} />
        ))}
      </ul>
      <div className="flex justify-center space-x-2">
        <button 
          onClick={() => handlePageChange(pageNumber - 1)}
          className={`px-4 py-2 rounded-md text-white font-custom ${pageNumber === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'}`}
          disabled={pageNumber === 1}
        >
          Previous
        </button>
        {[...Array(endPage + 1 - startPage)].map((e, i) => (
          <button 
            key={i} 
            onClick={() => handlePageChange(i + startPage)}
            className={`px-4 py-2 rounded-md text-white font-custom ${pageNumber === i+startPage ? 'bg-blue-500' : 'bg-gray-300'} hover:bg-blue-700`}
          >
            {i + startPage}
          </button>
        ))}
        <button 
          onClick={() => handlePageChange(pageNumber + 1)}
          className={`px-4 py-2 rounded-md text-white font-custom ${pageNumber === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'}`}
          disabled={pageNumber === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}