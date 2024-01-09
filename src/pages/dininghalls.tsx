import React, { useRef, useState, useEffect } from "react";
import { diningHallTimes } from "@/components/entries_display";
import Link from "next/link";

export default function DiningHalls(): JSX.Element {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [openDiningHalls, setOpenDiningHalls] = useState([
    { hall: "", message: "" },
  ]);
  const [allDiningHalls, setAllDiningHalls] = useState([
    { hall: "", message: "" },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(() => new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const isTimeInRange = (timeRange: string) => {
      const [start, end] = timeRange.split(" - ").map((time) => {
        let [hours, minutesPeriod] = time.split(":");
        let hoursNum = Number(hours);
        let minutes = Number(minutesPeriod.slice(0, -2));
        const period = minutesPeriod.slice(-2);
        if (period.toUpperCase() === "PM" && hoursNum !== 12) hoursNum += 12;
        if (period.toUpperCase() === "AM" && hoursNum === 12) hoursNum = 0;
        const date = new Date(currentTime);
        date.setHours(hoursNum);
        date.setMinutes(minutes);
        return date.getTime();
      });
      const currentTimeInMilliseconds = currentTime.getTime();
      return (
        currentTimeInMilliseconds >= start && currentTimeInMilliseconds <= end
      );
    };

    const getMessage = (times: any) => {
      const timeKeys = Object.keys(times);
      for (let i = 0; i < timeKeys.length; i++) {
        if (isTimeInRange(times[timeKeys[i]])) {
          if (timeKeys[i].includes("A la Carte")) {
            return `Open until ${times[timeKeys[i]].split(" - ")[1]}`;
          } else {
            return `Serving ${timeKeys[i]} until ${times[timeKeys[i]].split(" - ")[1]}`;
          }
        }
      }
      for (let i = 0; i < timeKeys.length; i++) {
        const [start, end] = times[timeKeys[i]].split(" - ").map((time: string) => {
          let [hours, minutesPeriod] = time.split(":");
          let hoursNum = Number(hours);
          let minutes = Number(minutesPeriod.slice(0, -2));
          const period = minutesPeriod.slice(-2);
          if (period.toUpperCase() === "PM" && hoursNum !== 12) hoursNum += 12;
          if (period.toUpperCase() === "AM" && hoursNum === 12) hoursNum = 0;
          const date = new Date(currentTime);
          date.setHours(hoursNum);
          date.setMinutes(minutes);
          return date.getTime();
        });
        if (currentTime.getTime() < start) {
          if (timeKeys[i].includes("A la Carte")) {
            return `Opening at ${times[timeKeys[i]].split(" - ")[0]}`;
          } else {
            return `Opening at ${times[timeKeys[i]].split(" - ")[0]} for ${timeKeys[i]}`;
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
      .filter((diningHall) => diningHall.message.startsWith("Open until") || diningHall.message.startsWith("Serving"));

    const allDiningHalls = Object.entries(diningHallTimes).map(
      ([hall, times]) => {
        return {
          hall,
          message: getMessage(times),
        };
      }
    );

    setOpenDiningHalls(openDiningHalls);
    setAllDiningHalls(allDiningHalls);
  }, [currentTime]);

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

  const getHallName = (hall: string) => {
    switch (hall) {
      case "InfiniTEA":
      case "TerraByte":
        return `${hall} (ISR)`;
      case "Urbana South Market":
        return `${hall} (PAR)`;
      case "57 North":
        return `${hall} (Ike)`;
      default:
        return hall;
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
              <Link key={hall} href={`/hall/${hall}`}>
                <div className="flex-none w-64 h-36 m-3 bg-white shadow-md rounded-lg overflow-hidden flex flex-col">
                  <div className="h-2 bg-uiucorange"></div>
                  <div className="p-6 flex flex-col justify-between h-full">
                    <h2 className="text-xl font-bold mb-2">
                      {getHallName(hall)}
                    </h2>
                    <div></div>
                    <p className="text-gray-700 text-sm">{message}</p>
                  </div>
                </div>
              </Link>
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
          <Link
            key={hall}
            href={`/hall/${hall}`}
            className="card bg-white shadow-md rounded-lg overflow-hidden h-full"
          >
            <div>
              <img
                src="https://via.placeholder.com/150"
                alt="Dining Hall"
                className="w-full h-32 object-cover"
              />
              <div className="h-2 bg-uiucorange"></div>
              <div className="p-6 h-32">
                <h2 className="text-xl font-bold mb-2">{getHallName(hall)}</h2>
                <p className="text-gray-700 text-sm">{message}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
