import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

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
  const diningHall = req.query.diningHall as string;
  const mealType = req.query.mealType as string;
  const searchTerm = req.query.searchTerm as string;
  const dateServed = req.query.dateServed as string;
  const allergens = req.query.allergens as string;
  const preferences = req.query.preferences as string;

  const allergensArray = allergens ? allergens.split(",") : [];

  const allergensConditions = allergensArray.map((allergen) => ({
    allergens: {
      not: {
        contains: allergen.trim(),
      },
    },
  }));

  const food = await prisma.foodInfo.findMany({
    skip: pageNumber * pageSize,
    take: pageSize,
    orderBy:
      sortField && sortField !== "undefined"
        ? { [sortField]: sortOrder === "desc" ? "desc" : "asc" }
        : { id: "asc" },
    where: {
      AND: [
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
                        ? ["A la Carte--APP DISPLAY", "A la Carte--POS FEED"]
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
        {
          AND: allergensConditions,
        },
        preferences && preferences !== "undefined"
          ? {
              preferences: { contains: preferences },
            }
          : {},
      ],
    },
    include: {
      mealEntries: true,
    },
  });

  const foodCount = await prisma.foodInfo.count({
    where: {
      AND: [
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
                  mealType:
                    mealType === "A la Carte"
                      ? { startsWith: "A la Carte" }
                      : { equals: mealType },
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
        {
          AND: allergensConditions,
        },
        preferences && preferences !== "undefined"
          ? {
              preferences: { contains: preferences },
            }
          : {},
      ],
    },
  });

  const dates = (
    await prisma.$queryRaw<
      { dateServed: string }[]
    >`SELECT DISTINCT "dateServed" FROM "mealDetails";`
  ).map((date) => date.dateServed);

  res.status(200).json({ food, foodCount, dates });
}
