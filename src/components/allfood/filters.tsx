import React from "react";
import Select from "react-select";
import { useAtom } from 'jotai';
import {
  sortFieldAtom, sortOrderAtom, allergensAtom, preferencesAtom,
  diningHallAtom, mealTypeAtom, dateServedAtom, datesAtom
} from '@/atoms/filterAtoms';
import {
  sortFields,
  sortOrders,
  allergenOptions,
  preferenceOptions,
  diningOptions,
  mealTypeOptions,
} from "./filter_options";

export const Filters: React.FC = () => {
  const [sortField, setSortField] = useAtom(sortFieldAtom);
  const [sortOrder, setSortOrder] = useAtom(sortOrderAtom);
  const [selectedAllergens, setSelectedAllergens] = useAtom(allergensAtom);
  const [diningHall, setDiningHall] = useAtom(diningHallAtom);
  const [mealType, setMealType] = useAtom(mealTypeAtom);
  const [selectedPreference, setSelectedPreference] = useAtom(preferencesAtom);
  const [dateServed, setDateServed] = useAtom(dateServedAtom);
  const [dates] = useAtom(datesAtom);

  const dateOptions = React.useMemo(
    () => [
      { value: "", label: "All Dates" },
      ...dates
        .slice()
        .reverse()
        .map((date) => ({ value: date, label: date })),
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
          isSearchable={false}
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
            isSearchable={false}
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
          isSearchable={false}
          styles={customStyles}
          classNamePrefix="select"
          options={allergenOptions}
          value={allergenOptions.filter((option) =>
            selectedAllergens.includes(option.value)
          )}
          onChange={(selectedOptions) =>
            setSelectedAllergens(
              selectedOptions.map((option) => option.value)
            )
          }
        />
      </div>
      <div style={{ flexGrow: 1, flexBasis: 0 }}>
        <label>Preferences</label>
        <Select
          isSearchable={false}
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
          isSearchable={false}
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
          isSearchable={false}
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
          isSearchable={false}
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