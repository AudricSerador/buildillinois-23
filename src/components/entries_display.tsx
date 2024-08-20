import React from "react";
import { format, isToday, parseISO } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MealEntry {
  dateServed: string;
  diningHall: string;
  diningFacility: string;
  mealType: string;
}

interface EntriesDisplayProps {
  mealEntries: MealEntry[];
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
  "Lincoln Avenue Dining Hall (Allen)": {
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
  "TerraByte": {
    "A la Carte--APP DISPLAY": "10:00AM - 10:30PM",
    "A la Carte--POS Feed": "10:00AM - 10:30PM",
  },
};

const MealTimeDisplay: React.FC<{ mealType: string; time: string }> = ({ mealType, time }) => (
  <div className="flex justify-between items-center py-1">
    <span className="font-medium">{mealType}</span>
    <span className="text-sm text-gray-600">{time}</span>
  </div>
);

const DiningFacility: React.FC<{ facility: string; entries: MealEntry[]; diningHall: string }> = ({
  facility,
  entries,
  diningHall,
}) => {
  const facilityName = [
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
    : facility;

  // Get unique meal types from the actual entries
  const availableMealTypes = [...new Set(entries.map(entry => entry.mealType))];

  return (
    <div className="mb-4 border rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 font-semibold">{facilityName}</div>
      <div className="px-4 py-2">
        {availableMealTypes.map(mealType => (
          <MealTimeDisplay 
            key={mealType}
            mealType={mealType}
            time={diningHallTimes[diningHall]?.[mealType] || "Not Available"}
          />
        ))}
      </div>
    </div>
  );
};

const DiningHall: React.FC<{ hall: string; facilities: { [key: string]: MealEntry[] } }> = ({
  hall,
  facilities,
}) => {
  const facilitiesCount = Object.keys(facilities).length;

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2">{hall}</h2>
      <div className={`grid ${facilitiesCount === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
        {Object.entries(facilities).map(([facility, entries]) => (
          <DiningFacility 
            key={facility} 
            facility={facility} 
            entries={entries} 
            diningHall={hall}
          />
        ))}
      </div>
    </div>
  );
};

export const EntriesDisplay: React.FC<EntriesDisplayProps> = ({
  mealEntries,
}) => {
  const groupedEntries = mealEntries.reduce((acc: any, entry: MealEntry) => {
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      
      if (isToday(date)) {
        return "Today";
      }
      
      return format(date, "EEEE, MMMM d, yyyy");
    } catch (error) {
      console.error("Error parsing date:", dateString, error);
      return dateString; // Fall back to the original string if parsing fails
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 font-custom">
      <Accordion type="single" collapsible className="w-full space-y-2">
        {Object.entries(groupedEntries).reverse().map(([date, diningHalls], index, array) => (
          <AccordionItem key={date} value={date} className="rounded-lg overflow-hidden">
            <AccordionTrigger className="bg-uiucorange text-white p-4 rounded-t-lg">
              <h1 className="text-xl font-custombold">{formatDate(date)}</h1>
            </AccordionTrigger>
            <AccordionContent className="bg-white rounded-b-lg shadow p-4">
              {Object.entries(diningHalls as { [key: string]: any }).map(
                ([hall, facilities]) => (
                  <DiningHall key={hall} hall={hall} facilities={facilities} />
                )
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};