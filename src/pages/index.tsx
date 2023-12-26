import React, { useState, useEffect } from 'react';
import type { InferGetStaticPropsType, GetStaticProps } from 'next'
import { FoodItemDisplay } from '../components/food_item_display';
import prisma from '../../lib/prisma';


export const getStaticProps: GetStaticProps = async () => {
    const food = await prisma.foodInfo.findMany({
        include: {
            mealEntries: {
                where: { dateServed: "Tuesday, January 16, 2024" },
            },
        },
    });
    return {
        props: { food },
        revalidate: 10,
    };
};

export default function Home({ food }: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element {
    const [displayedFood, setDisplayedFood] = useState(food.slice(0, 25));
    const [loadMoreCount, setLoadMoreCount] = useState(1);

    useEffect(() => {
        setDisplayedFood(food.slice(0, 25 * loadMoreCount));
    }, [loadMoreCount]);

    return (
        <div className="px-32 mt-4">
            <p className="text-4xl font-custombold">Serving Today</p>
            <div style={{ paddingBottom: '1rem', borderBottom: '4px solid black', marginBottom: '1rem' }}></div>
            <ul>
                {displayedFood.map((foodItem: any) => (
                    <FoodItemDisplay key={foodItem.id} foodItem={foodItem} />
                ))}
            </ul>   
            {displayedFood.length < food.length && (
                <button 
                    onClick={() => setLoadMoreCount(loadMoreCount + 1)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                    Load More
                </button>
            )}
        </div>
    );
}