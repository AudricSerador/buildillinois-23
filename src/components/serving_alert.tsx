import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { diningHallTimes } from './entries_display';
import { MealEntry } from '@/pages/food/[id]';
import { parse, isToday, format, set, addDays } from 'date-fns';
import { diningTags } from './food_card_display';
import { FaInfoCircle } from 'react-icons/fa';

interface ServingAlertProps {
  mealEntries: MealEntry[];
}

const getCurrentCSTTime = (): Date => {
  const now = new Date();
  const cstOffset = -6 * 60; // CST is UTC-6
  const localOffset = now.getTimezoneOffset();
  const diffMinutes = localOffset - cstOffset;
  now.setMinutes(now.getMinutes() + diffMinutes);
  return now;
};

const parseTime = (timeString: string, baseDate: Date): Date => {
  const [time, period] = timeString.split(' ');
  const [hoursStr, minutesStr] = time.split(':');
  const hours = parseInt(hoursStr);
  const minutes = parseInt(minutesStr);

  return set(baseDate, {
    hours: period === 'PM' && hours !== 12 ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours,
    minutes: minutes,
    seconds: 0,
    milliseconds: 0
  });
};

const isNowBetween = (startTime: string, endTime: string, currentTime: Date): boolean => {
  let start = parseTime(startTime, currentTime);
  let end = parseTime(endTime, currentTime);

  if (end < start) {
    end = addDays(end, 1);
    if (currentTime < start) {
      currentTime = addDays(currentTime, 1);
    }
  }

  return currentTime >= start && currentTime <= end;
};

const ServingAlert: React.FC<ServingAlertProps> = ({ mealEntries }) => {
  const currentTime = getCurrentCSTTime();

  const currentlyServing = mealEntries.filter(entry => {
    const entryDate = parse(entry.dateServed, 'EEEE, MMMM d, yyyy', new Date());
    if (!isToday(entryDate)) return false;

    const hallTimes = diningHallTimes[entry.diningHall];
    if (!hallTimes) return false;

    const mealTimes = hallTimes[entry.mealType];
    if (!mealTimes) return false;

    const [start, end] = mealTimes.split(" - ");
    return isNowBetween(start, end, currentTime);
  });

  if (currentlyServing.length === 0) return null;

  const getCurrentMealType = () => {
    for (const entry of currentlyServing) {
      return entry.mealType;
    }
    return '';
  };

  const currentMealType = getCurrentMealType();

  const servingHalls = currentlyServing.map(entry => ({
    hall: diningTags[entry.diningHall] || entry.diningHall,
    endTime: diningHallTimes[entry.diningHall][entry.mealType].split(' - ')[1]
  }));

  const uniqueHalls = Array.from(new Set(servingHalls.map(h => h.hall)));
  const latestEndTime = servingHalls.reduce((latest, current) => 
    parseTime(current.endTime, currentTime) > parseTime(latest, currentTime) ? current.endTime : latest
  , servingHalls[0].endTime);

  const hallsString = uniqueHalls.join(', ');

  return (
    <Alert variant="success" className="flex items-start">
      <div className="mr-3 mt-1">
        <FaInfoCircle className="h-5 w-5 text-white" />
      </div>
      <div>
        <AlertTitle className="font-bold text-white">
          Serving Now for {currentMealType}
        </AlertTitle>
        <AlertDescription className="text-white">
          At {hallsString} until {latestEndTime}
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default ServingAlert;