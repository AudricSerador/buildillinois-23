import React, { useState } from "react";

const IconLabel: React.FC<{ src: string; label: string }> = ({
  src,
  label,
}) => (
  <div className="flex items-center mr-4 mb-4">
    <img src={src} width={24} height={24} className="mr-2" />
    <span>{label}</span>
  </div>
);

export const locationPreferences = [
  { src: "/images/icons/dine-in.svg", label: "Allen/LAR" },
  { src: "/images/icons/take-out.svg", label: "PAR" },
  { src: "/images/icons/delivery.svg", label: "ISR" },
  { src: "/images/icons/delivery.svg", label: "Ikenberry" },
];


export const dietaryPreferences = [
  { src: "/images/icons/vegan.svg", label: "Vegan" },
  { src: "/images/icons/vegetarian.svg", label: "Vegetarian" },
  { src: "/images/icons/halal.svg", label: "Halal" },
  { src: "/images/icons/kosher.svg", label: "Kosher" },
];

export const allergens = [
  { src: "/images/icons/milk.svg", label: "Milk" },
  { src: "/images/icons/eggs.svg", label: "Eggs" },
  { src: "/images/icons/peanuts.svg", label: "Peanuts" },
  { src: "/images/icons/tree nuts.svg", label: "Tree Nuts" },
  { src: "/images/icons/soy.svg", label: "Soy" },
  { src: "/images/icons/wheat.svg", label: "Wheat" },
  { src: "/images/icons/fish.svg", label: "Fish" },
  { src: "/images/icons/shellfish.svg", label: "Shellfish" },
  { src: "/images/icons/sesame.svg", label: "Sesame" },
  { src: "/images/icons/gluten.svg", label: "Gluten" },
  { src: "/images/icons/alcohol.svg", label: "Alcohol" },
  { src: "/images/icons/coconut.svg", label: "Coconut" },
  { src: "/images/icons/corn.svg", label: "Corn" },
  { src: "/images/icons/gelatin.svg", label: "Gelatin" },
  { src: "/images/icons/msg.svg", label: "MSG" },
  { src: "/images/icons/pork.svg", label: "Pork" },
  { src: "/images/icons/red dye.svg", label: "Red Dye" },
  { src: "/images/icons/sulfites.svg", label: "Sulfites" },
];

export const IconLegend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-3 bg-uiucorange rounded shadow-lg font-custom">
      <button
        className="flex items-center justify-between w-full text-2xl font-custombold text-white mb-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Icon Legend</span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>
      <div
        className={`overflow-y-hidden bg-white transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-screen" : "max-h-0"
        }`}
      >
        <div className="mb-4 mt-2">
          <span className="text-md ml-2 font-custombold">Dietary Restrictions</span>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 mt-2 ml-3">
            {dietaryPreferences.map((icon, index) => (
              <IconLabel key={index} src={icon.src} label={icon.label} />
            ))}
          </div>
        </div>
        <div>
          <span className="text-md ml-2 font-custombold">Allergens</span>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 mt-2 ml-3">
            {allergens.map((icon, index) => (
              <IconLabel key={index} src={icon.src} label={icon.label} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
