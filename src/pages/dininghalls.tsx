import React, { useRef } from "react";
import { diningHallTimes } from "@/components/entries_display";

export default function DiningHalls(): JSX.Element {
  const currentTime = new Date();

  const isTimeInRange = (timeRange: string) => {
    const [start, end] = timeRange.split(" - ").map((time) => {
      let [hours, minutesPeriod] = time.split(":");
      let hoursNum = Number(hours);
      let minutes = Number(minutesPeriod.slice(0, -2));
      const period = minutesPeriod.slice(-2);
      if (period.toUpperCase() === "PM" && hoursNum !== 12) hoursNum += 12;
      if (period.toUpperCase() === "AM" && hoursNum === 12) hoursNum = 0;
      const date = new Date();
      date.setHours(hoursNum);
      date.setMinutes(minutes);
      return date.getTime();
    });
    const currentTime = new Date().getTime();
    return currentTime >= start && currentTime <= end;
  };

  const getMessage = (times: any) => {
    const timeKeys = Object.keys(times);
    for (let i = 0; i < timeKeys.length; i++) {
      if (isTimeInRange(times[timeKeys[i]])) {
        if (timeKeys[i].includes("A la Carte")) {
          return `Open until ${times[timeKeys[i]].split(" - ")[1]}`;
        } else {
          return `Serving ${timeKeys[i]} until ${
            times[timeKeys[i]].split(" - ")[1]
          }`;
        }
      }
    }
    for (let i = 0; i < timeKeys.length; i++) {
      if (
        currentTime.getTime() <
        new Date(times[timeKeys[i]].split(" - ")[0]).getTime()
      ) {
        if (timeKeys[i].includes("A la Carte")) {
          return `Opening at ${times[timeKeys[i]].split(" - ")[0]}`;
        } else {
          return `Opening at ${times[timeKeys[i]].split(" - ")[0]} for ${
            timeKeys[i]
          }`;
        }
      }
    }
    return "Closed for today";
  };

  const openDiningHalls = Object.entries(diningHallTimes)
    .map(([hall, times]) => {
      return {
        hall,
        message: getMessage(times),
      };
    })
    .filter((diningHall) => diningHall.message !== "Closed for today");

  const allDiningHalls = Object.entries(diningHallTimes).map(
    ([hall, times]) => {
      return {
        hall,
        message: getMessage(times),
      };
    }
  );

  const scrollContainer = useRef<HTMLDivElement>(null);

  const scroll = (direction: number) => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollTo({
        left:
          scrollContainer.current.scrollLeft +
          scrollContainer.current.offsetWidth * direction,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-64 mt-4 font-custom">
      <p className="text-4xl font-custombold mt-4 mb-4">
        Open Now (
        {currentTime.toLocaleTimeString([], {
          hour: "numeric",
          minute: "numeric",
        })}
        )
      </p>

      <div className="flex items-center overflow-hidden">
        <button onClick={() => scroll(-1)} className="md:block hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div
          ref={scrollContainer}
          className="flex overflow-x-auto pb-4 scrollbar-hide p-4 bg-gray-100 border border-gray-300 rounded-lg min-h-[200px] w-full"
        >
          {openDiningHalls.length > 0 ? (
            openDiningHalls.map(({ hall, message }) => (
              <div
                key={hall}
                className="flex-none w-64 m-3 bg-white shadow-md rounded-lg overflow-hidden"
              >
                <div className="h-2 bg-uiucorange"></div>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2">{hall}</h2>
                  <p className="text-gray-700 text-sm">{message}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="grid place-items-center w-full h-[200px]">
              <p>No dining halls open :(</p>
            </div>
          )}
        </div>
        <button onClick={() => scroll(1)} className="md:block hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
      <p className="text-4xl font-custombold mt-4 mb-4">All Dining Halls</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allDiningHalls.map(({ hall, message }) => (
          <div
            key={hall}
            className="card bg-white shadow-md rounded-lg overflow-hidden"
          >
            <img
              src="https://via.placeholder.com/150"
              alt="Dining Hall"
              className="w-full h-32 object-cover"
            />
            <div className="h-2 bg-uiucorange"></div>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{hall}</h2>
              <p className="text-gray-700 text-sm">{message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
