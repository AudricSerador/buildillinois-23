import React from "react";
import Select from "react-select";
import {
  sortFields,
  sortOrders,
  allergenOptions,
  preferenceOptions,
  diningOptions,
  mealTypeOptions,
} from "./filter_options";

interface FiltersProps {
  sortField: string;
  setSortField: (field: string) => void;
  sortOrder: string;
  setSortOrder: (field: string) => void;
  selectedAllergens: string[];
  setSelectedAllergens: (allergens: string[]) => void;
  diningHall: string;
  setDiningHall: (field: string) => void;
  mealType: string;
  setMealType: (field: string) => void;
  selectedPreference: string;
  setSelectedPreference: (field: string) => void;
  dateServed: string;
  setDateServed: (field: string) => void;
  dates: string[];
}

export const Filters: React.FC<FiltersProps> = ({
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  selectedAllergens,
  setSelectedAllergens,
  diningHall,
  setDiningHall,
  mealType,
  setMealType,
  selectedPreference,
  setSelectedPreference,
  dateServed,
  setDateServed,
  dates,
}) => {
  const dateOptions = React.useMemo(
    () => [
      { value: "", label: "All Dates" },
      ...dates
        .slice()
        .reverse()
        .map((date, index) => ({ value: date, label: date })),
    ],
    [dates]
  );

  const customStyles = {
    control: (baseStyles: object) => ({
      ...baseStyles,
    }),
  };

  return (
    <>
      <div style={{ flexGrow: 1, flexBasis: 0 }}>
        <label>Nutrients</label>
        <Select
          styles={customStyles}
          classNamePrefix="select"
          options={sortFields}
          value={sortFields.find((option) => option.value === sortField)}
          onChange={(option) => setSortField(option ? option.value : "")}
        />
      </div>
      {sortField && (
        <div style={{ flexGrow: 1, flexBasis: 0 }}>
          <label>&nbsp;</label>
          <Select
            styles={customStyles}
            classNamePrefix="select"
            options={sortOrders}
            value={sortOrders.find((option) => option.value === sortOrder)}
            onChange={(option) => setSortOrder(option ? option.value : "")}
          />
        </div>
      )}
      <div style={{ flexGrow: 1, flexBasis: 0 }}>
        <label>Allergens</label>
        <Select
          isMulti
          styles={customStyles}
          classNamePrefix="select"
          options={allergenOptions}
          value={allergenOptions.filter((option) =>
            selectedAllergens.includes(option.value)
          )}
          onChange={(selectedOptions) =>
            setSelectedAllergens(selectedOptions.map((option) => option.value))
          }
        />
      </div>
      <div style={{ flexGrow: 1, flexBasis: 0 }}>
        <label>Preferences</label>
        <Select
          styles={customStyles}
          classNamePrefix="select"
          options={preferenceOptions}
          value={preferenceOptions.find(
            (option) => option.value === selectedPreference
          )}
          onChange={(option) =>
            setSelectedPreference(option ? option.value : "")
          }
        />
      </div>
      <div style={{ flexGrow: 1, flexBasis: 0 }}>
        <label>Dining Hall</label>
        <Select
          styles={customStyles}
          classNamePrefix="select"
          options={diningOptions}
          value={diningOptions
            .flatMap((group) => group.options)
            .find((option) => option.value === diningHall)}
          onChange={(option) => setDiningHall(option ? option.value : "")}
        />
      </div>
      <div style={{ flexGrow: 1, flexBasis: 0 }}>
        <label>Meal Type</label>
        <Select
          styles={customStyles}
          classNamePrefix="select"
          options={mealTypeOptions}
          value={mealTypeOptions
            .flatMap((group) => group.options)
            .find((option) => option.value === mealType)}
          onChange={(option) => setMealType(option ? option.value : "")}
        />
      </div>
      <div style={{ flexGrow: 1, flexBasis: 0 }}>
        <label>Date Served</label>
        <Select
          styles={customStyles}
          classNamePrefix="select"
          options={dateOptions}
          value={dateOptions.find((option) => option.value === dateServed)}
          onChange={(option) => setDateServed(option ? option.value : "")}
        />
      </div>
    </>
  );
};
