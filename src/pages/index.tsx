import React from 'react';
import { Navbar } from '../components/navbar';
import type { InferGetStaticPropsType, GetStaticProps } from 'next'
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
    return (
        <div>
            <Navbar />
            <p className="text-4xl text-center">Serving Today</p>
            <ul>
                {food.map((food_item: any) => (
                <li key={food_item.id}>Food name: {food_item.name} Protein: {food_item.protein}</li>
                ))}
            </ul>
        </div>
    );
}