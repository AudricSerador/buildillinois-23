-- CreateTable
CREATE TABLE "FoodInfo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "servingSize" TEXT NOT NULL DEFAULT '',
    "ingredients" TEXT NOT NULL DEFAULT '',
    "allergens" TEXT NOT NULL DEFAULT '',
    "preferences" TEXT NOT NULL DEFAULT '',
    "calories" INTEGER NOT NULL DEFAULT 0,
    "caloriesFat" INTEGER NOT NULL DEFAULT 0,
    "totalFat" INTEGER NOT NULL DEFAULT 0,
    "saturatedFat" INTEGER NOT NULL DEFAULT 0,
    "transFat" INTEGER NOT NULL DEFAULT 0,
    "polyFat" INTEGER NOT NULL DEFAULT 0,
    "monoFat" INTEGER NOT NULL DEFAULT 0,
    "cholesterol" INTEGER NOT NULL DEFAULT 0,
    "sodium" INTEGER NOT NULL DEFAULT 0,
    "potassium" INTEGER NOT NULL DEFAULT 0,
    "totalCarbohydrates" INTEGER NOT NULL DEFAULT 0,
    "fiber" INTEGER NOT NULL DEFAULT 0,
    "sugars" INTEGER NOT NULL DEFAULT 0,
    "protein" INTEGER NOT NULL DEFAULT 0,
    "calciumDV" INTEGER NOT NULL DEFAULT 0,
    "ironDV" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FoodInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mealDetails" (
    "id" SERIAL NOT NULL,
    "diningHall" TEXT NOT NULL DEFAULT '',
    "diningFacility" TEXT NOT NULL DEFAULT '',
    "mealType" TEXT NOT NULL DEFAULT '',
    "dateServed" TEXT NOT NULL DEFAULT '',
    "foodId" TEXT NOT NULL,

    CONSTRAINT "mealDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FoodInfo_name_key" ON "FoodInfo"("name");

-- AddForeignKey
ALTER TABLE "mealDetails" ADD CONSTRAINT "mealDetails_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "FoodInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
