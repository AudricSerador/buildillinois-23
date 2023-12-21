import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/navbar';
import type { InferGetStaticPropsType, GetStaticProps } from 'next'
import FoodListDisplay from '../components/food_item_display';
import prisma from '../../lib/prisma';


export const getStaticProps: GetStaticProps = async () => {
    const food = await prisma.foodInfo.findMany({
        where: { dateServed: "Tuesday, December 12, 2023" },
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
        <div>
            <Navbar />
            <p className="text-4xl text-center">Serving Today</p>
            <ul>
                {displayedFood.map((foodItem: any) => (
                    <FoodListDisplay foodData={foodItem} />
                ))}
            </ul>
            {displayedFood.length < food.length && (
                <button onClick={() => setLoadMoreCount(loadMoreCount + 1)}>
                    Load More
                </button>
            )}
        </div>
    );
}