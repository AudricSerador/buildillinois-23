import React, { useRef, useState, useEffect } from "react";
import { diningHallTimes } from "@/components/entries_display";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
    <div className="container mx-auto px-4 sm:px-32 mt-8 font-custom">
      <Card className="mb-8 bg-cloud">
        <CardHeader>
          <CardTitle className="text-4xl font-custombold text-uiucblue">
            Open Now (
            {currentTime.toLocaleTimeString([], {
              hour: "numeric",
              minute: "numeric",
            })}
            )
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex space-x-4 p-4">
              {openDiningHalls.length > 0 ? (
                openDiningHalls.map(({ hall, message }) => (
                  <Link key={hall} href={`/hall/${hall}`}>
                    <Card className="w-[250px] flex-shrink-0 bg-white">
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg text-uiucblue">{getHallName(hall)}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">{message}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="flex items-center justify-center w-full h-[200px]">
                  <p className="text-uiucblue">No dining halls open :(</p>
                </div>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="bg-cloud">
        <CardHeader>
          <CardTitle className="text-4xl font-custombold text-uiucblue">All Dining Halls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allDiningHalls.map(({ hall, message }) => (
              <Link
                key={hall}
                href={`/hall/${hall}`}
                className="block"
              >
                <Card className="h-full bg-white">
                  <CardContent className="p-0">
                    <img
                      src="https://via.placeholder.com/150"
                      alt="Dining Hall"
                      className="w-full h-32 object-cover object-center rounded-t-lg"
                    />
                    <div className="p-4">
                      <h2 className="text-xl font-bold mb-2 text-uiucblue">{getHallName(hall)}</h2>
                      <p className="text-sm text-gray-600">{message}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}