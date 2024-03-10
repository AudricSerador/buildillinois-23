import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

function generateWhereClause(query: any) {
  const { diningHall, mealType, searchTerm, dateServed, allergens, preferences } = query;
  const allergensArray = allergens ? allergens.split(",") : [];

  const allergensConditions = allergensArray.map((allergen: string) => ({
    allergens: {
      not: {
        contains: allergen.trim(),
      },
    },
  }));

  const conditions = [
    diningHall && diningHall !== "undefined"
      ? {
          mealEntries: {
            some: {
              diningHall: { equals: diningHall },
            },
          },
        }
      : {},
    mealType && mealType !== "undefined"
      ? {
          mealEntries: {
            some: {
              mealType: {
                in:
                  mealType === "A la Carte"
                    ? ["A la Carte--APP DISPLAY", "A la Carte--POS Feed"]
                    : [mealType],
              },
            },
          },
        }
      : {},
    searchTerm && searchTerm !== "undefined"
      ? {
          name: { contains: searchTerm, mode: "insensitive" },
        }
      : {},
    dateServed && dateServed !== "undefined"
      ? {
          mealEntries: {
            some: {
              dateServed: { equals: dateServed },
            },
          },
        }
      : {},
    ...allergensConditions,
    preferences && preferences !== "undefined"
      ? {
          preferences: { contains: preferences },
        }
      : {},
  ];

  return conditions.filter(condition => Object.keys(condition).length > 0);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const pageSize = 10;
  const pageNumber = req.query.page
    ? parseInt(req.query.page as string) - 1
    : 0;
  const sortField = req.query.sortField as string;
  const sortOrder = req.query.sortOrder as string;

  const whereClause = generateWhereClause(req.query);

  const food = await prisma.foodInfo.findMany({
    skip: pageNumber * pageSize,
    take: pageSize,
    orderBy:
      sortField && sortField !== "undefined"
        ? { [sortField]: sortOrder === "desc" ? "desc" : "asc" }
        : { id: "asc" },
    where: {
      AND: whereClause,
    },
    include: {
      mealEntries: true,
    },
  });

  const foodCount = await prisma.foodInfo.count({
    where: {
      AND: whereClause,
    },
  });

  const dates = (
    await prisma.$queryRaw<
      { dateServed: string }[]
    >`SELECT DISTINCT "dateServed" FROM "mealDetails";`
  ).map((date: any) => date.dateServed);

  res.status(200).json({ food, foodCount, dates });
}