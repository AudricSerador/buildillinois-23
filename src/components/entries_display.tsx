import React, { useState } from "react";

interface EntriesDisplayProps {
  mealEntries: any[];
}

export const diningHallTimes: { [key: string]: { [key: string]: string } } = {
  "Ikenberry Dining Center (Ike)": {
    "Breakfast": "7:00AM - 10:00AM",
    "Lunch": "10:30AM - 1:30PM",
    "Light Lunch": "1:30PM - 3:00PM",
    "Dinner": "4:30PM - 8:00PM",
  },
  "Illinois Street Dining Center (ISR)": {
    "Breakfast": "7:00AM - 10:00AM",
    "Lunch": "10:30AM - 2:00PM",
    "Dinner": "4:30PM - 8:00PM",
  },
  "Pennsylvania Avenue Dining Hall (PAR)": {
    "Breakfast": "7:00AM - 10:00AM",
    "Lunch": "10:30AM - 2:30PM",
    "Dinner": "4:30PM - 8:00PM",
  },
  "Lincoln Avenue Dining Hall (LAR)": {
    "Breakfast": "7:00AM - 10:00AM",
    "Lunch": "10:30AM - 1:30PM",
    "Kosher Lunch": "10:45AM - 1:30PM",
    "Dinner": "4:30PM - 7:00PM",
    "Kosher Dinner": "4:45PM - 6:15PM",
  },
  "Field of Greens (LAR)": {
    "Lunch": "10:00AM - 3:00PM",
  },
  "InfiniTEA": {
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
  "Terrabyte": {
    "A la Carte--APP DISPLAY": "10:00AM - 10:30PM",
    "A la Carte--POS Feed": "10:00AM - 10:30PM",
  },
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
    <div className="p-4 border rounded font-custom bg-gray-100">
      {Object.entries(groupedEntries).map(([date, diningHalls]) => (
        <div key={date} className="mb-4 p-4 border rounded bg-white shadow">
          <button
            className="text-lg font-custombold flex justify-between items-center w-full bg-uiucorange text-white rounded p-2"
            onClick={() => setExpandedDate(expandedDate === date ? null : date)}
          >
            <span>{date}</span>
            <span className="text-uiucblue">{expandedDate === date ? "▲" : "▼"}</span>
          </button>
          <div
            style={{
              maxHeight: expandedDate === date ? "1000px" : "0",
              overflow: "hidden",
              transition: "max-height 0.3s ease-in-out",
            }}
          >
            {Object.entries(diningHalls as { [key: string]: any }).map(
              ([hall, facilities]) => (
                <div
                  key={hall}
                  className="mt-2 ml-4 p-2 border rounded bg-gray-200"
                >
                  <h3 className="text-md font-semibold">{hall}</h3>
                  {Object.entries(facilities).map(([facility, entries]) => (
                    <div
                      key={facility}
                      className="mt-1 ml-4 p-2 flex justify-between items-center border rounded bg-gray-100"
                    >
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">
                          {[
                            "InfiniTEA",
                            "Urbana South Market",
                            "Terrabyte",
                            "57 North",
                          ].includes(facility)
                            ? "Daily Menu"
                            : facility.startsWith("Build Your Own")
                            ? `${facility.substring(
                                0,
                                facility.indexOf(" (")
                              )}: ${(entries as any[])[0].mealType}`
                            : facility.includes("(")
                            ? facility.substring(0, facility.indexOf("("))
                            : facility}
                        </h4>
                      </div>
                      <div>
                        {(entries as any[]).map((entry: any) => {
                          const mealTypes = [
                            "Breakfast",
                            "Lunch",
                            "Light Lunch",
                            "Dinner",
                            "A la Carte--APP DISPLAY",
                            "A la Carte--POS Feed",
                          ];
                          let displayMealType = mealTypes.includes(
                            entry.mealType
                          )
                            ? [
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
                              ]
                            : [
                                {
                                  type: "Breakfast",
                                  time:
                                    (diningHallTimes[hall] &&
                                      diningHallTimes[hall]["Breakfast"]) ||
                                    "Not Available",
                                },
                                {
                                  type: "Lunch",
                                  time:
                                    (diningHallTimes[hall] &&
                                      diningHallTimes[hall]["Lunch"]) ||
                                    "Not Available",
                                },
                                {
                                  type: "Dinner",
                                  time:
                                    (diningHallTimes[hall] &&
                                      diningHallTimes[hall]["Dinner"]) ||
                                    "Not Available",
                                },
                              ];

                          return displayMealType.map((meal, index) => (
                            <p
                              key={index}
                              className="text-sm sm:text-base text-gray-700"
                            >
                              {meal.type} ({meal.time})
                            </p>
                          ));
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
