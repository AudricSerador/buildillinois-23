import React, { useState } from "react";

interface EntriesDisplayProps {
  mealEntries: any[];
}

export const diningHallTimes: { [key: string]: { [key: string]: string } } = {
  "Ikenberry Dining Center (Ike)": {
    Breakfast: "7:00AM - 10:00AM",
    Lunch: "10:30AM - 1:30PM",
    "Light Lunch": "1:30PM - 3:00PM",
    Dinner: "4:30PM - 8:00PM",
  },
  "Illinois Street Dining Center (ISR)": {
    Breakfast: "7:00AM - 10:00AM",
    Lunch: "10:30AM - 2:00PM",
    Dinner: "4:30PM - 8:00PM",
  },
  "Pennsylvania Avenue Dining Hall (PAR)": {
    Breakfast: "7:00AM - 10:00AM",
    Lunch: "10:30AM - 2:30PM",
    Dinner: "4:30PM - 8:00PM",
  },
  "Lincoln Avenue Dining Hall (Allen)": {
    Breakfast: "7:00AM - 10:00AM",
    Lunch: "10:30AM - 1:30PM",
    "Kosher Lunch": "10:45AM - 1:30PM",
    Dinner: "4:30PM - 7:00PM",
    "Kosher Dinner": "4:45PM - 6:15PM",
  },
  "Field of Greens (LAR)": {
    Lunch: "10:00AM - 3:00PM",
  },
  InfiniTEA: {
    "A la Carte--APP DISPLAY": "7:00AM - 11:30PM",
    "A la Carte--POS Feed": "7:00AM - 10:30PM",
  },
  "Urbana South Market": {
    "A la Carte--APP DISPLAY": "10:00AM - 9:00PM",
    "A la Carte--POS Feed": "10:00AM - 9:00PM",
  },
  "57 North": {
    "A la Carte--APP DISPLAY": "9:00AM - 10:00PM",
    "A la Carte--POS Feed": "9:00AM - 10:00PM",
  },
  TerraByte: {
    "A la Carte--APP DISPLAY": "10:00AM - 10:30PM",
    "A la Carte--POS Feed": "10:00AM - 10:30PM",
  },
};

const EntriesDates: React.FC<{ diningHalls: { [key: string]: any } }> = ({
  diningHalls,
}) => {
  return (
    <div className="pt-0">
      {Object.entries(diningHalls as { [key: string]: any }).map(
        ([hall, facilities]) => (
          <div key={hall} className="border border-gray-300 p-3">
            <h2 className="text-xl font-custombold mb-2 text-center mt-1">
              {hall}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(facilities).map(([facility, entries]) => (
                <div key={facility}>
                  <h2 className="font-bold mb-2">
                    {[
                      "InfiniTEA",
                      "Urbana South Market",
                      "TerraByte",
                      "57 North",
                    ].includes(facility)
                      ? "Daily Menu"
                      : facility.startsWith("Build Your Own")
                      ? `${facility.substring(0, facility.indexOf(" ("))}: ${
                          (entries as any[])[0].mealType
                        }`
                      : facility.includes("(")
                      ? facility.substring(0, facility.indexOf("("))
                      : facility}
                  </h2>
                  <ul className="list-disc pl-5">
                    {(entries as any[]).map((entry: any) => {
                      const mealTypes = [
                        "Breakfast",
                        "Lunch",
                        "Light Lunch",
                        "Kosher Lunch",
                        "Kosher Dinner",
                        "Dinner",
                        "A la Carte--APP DISPLAY",
                        "A la Carte--POS Feed",
                      ];
                      const defaultMealTypes = ["Breakfast", "Lunch", "Dinner"];
                      if (hall === "Ikenberry Dining Center (Ike)") {
                        defaultMealTypes.push("Light Lunch");
                      } else if (hall === "Lincoln Avenue Dining Hall (Allen)") {
                        defaultMealTypes.push("Kosher Lunch", "Kosher Dinner");
                      }
                      let displayMealType;
                      if (mealTypes.includes(entry.mealType)) {
                        displayMealType = [
                          {
                            type: entry.mealType.startsWith("A la Carte")
                              ? entry.mealType.substring(
                                  0,
                                  entry.mealType.indexOf("--")
                                )
                              : entry.mealType,
                            time:
                              (diningHallTimes[hall] &&
                                diningHallTimes[hall][entry.mealType]) ||
                              "Not Available",
                          },
                        ];
                      } else {
                        let existingMealTypes = (entries as any[]).map(
                          (entry: any) => entry.mealType
                        );
                        displayMealType = defaultMealTypes
                          .filter(
                            (mealType) => !existingMealTypes.includes(mealType)
                          )
                          .map((mealType) => ({
                            type: mealType,
                            time:
                              (diningHallTimes[hall] &&
                                diningHallTimes[hall][mealType]) ||
                              "Not Available",
                          }));
                        (entries as any[]).push(
                          ...displayMealType.map((meal) => ({
                            mealType: meal.type,
                          }))
                        );
                      }

                      return displayMealType.map((meal, index) => (
                        <li key={index}>
                          {meal.type} ({meal.time})
                        </li>
                      ));
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export const EntriesDisplay: React.FC<EntriesDisplayProps> = ({
  mealEntries,
}) => {
  const groupedEntries = mealEntries.reduce((acc: any, entry: any) => {
    if (!acc[entry.dateServed]) {
      acc[entry.dateServed] = {};
    }
    if (!acc[entry.dateServed][entry.diningHall]) {
      acc[entry.dateServed][entry.diningHall] = {};
    }
    if (!acc[entry.dateServed][entry.diningHall][entry.diningFacility]) {
      acc[entry.dateServed][entry.diningHall][entry.diningFacility] = [];
    }
    acc[entry.dateServed][entry.diningHall][entry.diningFacility].push(entry);
    return acc;
  }, {});

  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  return (
    <div className="max-w-2xl my-8 font-custom">
      {Object.entries(groupedEntries).map(([date, diningHalls]) => (
        <div key={date} className="mb-3">
          <div
            className={`bg-uiucorange text-white p-4 flex justify-between items-center cursor-pointer ${
              expandedDate === date ? "rounded-t-lg" : "rounded-lg"
            }`}
            onClick={() =>
              setExpandedDate((currentDate) =>
                currentDate === date ? null : date
              )
            }
          >
            <h1 className="text-xl font-custombold">{date}</h1>
            <span className="text-white">
              {expandedDate === date ? "▲" : "▼"}
            </span>
          </div>
          <div
            className={`collapse-css-transition bg-cloud rounded-b-lg shadow ${
              expandedDate === date ? "open" : ""
            }`}
          >
            <EntriesDates diningHalls={diningHalls as { [key: string]: any }} />
          </div>
        </div>
      ))}
    </div>
  );
};
