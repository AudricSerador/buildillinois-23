import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { FaCheck, FaChevronDown, FaTimes } from 'react-icons/fa';
import { useAtom } from 'jotai';
import {
  sortFieldAtom, sortOrderAtom, diningHallAtom, mealTypeAtom,
  dateServedAtom, allergensAtom, preferencesAtom
} from '@/atoms/filterAtoms';
import { 
  sortFields, sortOrders, allergenOptions, 
  preferenceOptions, diningOptions, mealTypeOptions 
} from "./allfood/filter_options";

export function FilterBar() {
  const [sortField, setSortField] = useAtom(sortFieldAtom);
  const [sortOrder, setSortOrder] = useAtom(sortOrderAtom);
  const [diningHall, setDiningHall] = useAtom(diningHallAtom);
  const [mealType, setMealType] = useAtom(mealTypeAtom);
  const [dateServed, setDateServed] = useAtom(dateServedAtom);
  const [allergens, setAllergens] = useAtom(allergensAtom);
  const [preferences, setPreferences] = useAtom(preferencesAtom);

  const [isAllFiltersOpen, setIsAllFiltersOpen] = useState(false);

  const clearAllFilters = () => {
    setSortField('');
    setSortOrder('');
    setDiningHall('');
    setMealType('');
    setDateServed('');
    setAllergens([]);
    setPreferences('');
  };

  const renderFilterBadges = () => {
    const badges = [];
    if (sortField) badges.push({ label: `Sort: ${sortField} ${sortOrder}`, onRemove: () => { setSortField(''); setSortOrder(''); } });
    if (diningHall) badges.push({ label: `Dining Hall: ${diningHall}`, onRemove: () => setDiningHall('') });
    if (mealType) badges.push({ label: `Meal Type: ${mealType}`, onRemove: () => setMealType('') });
    if (dateServed) badges.push({ label: `Date: ${dateServed}`, onRemove: () => setDateServed('') });
    allergens.forEach(allergen => badges.push({ label: `Allergen: ${allergen}`, onRemove: () => setAllergens(allergens.filter(a => a !== allergen)) }));
    if (preferences) badges.push({ label: `Preference: ${preferences}`, onRemove: () => setPreferences('') });

    return badges.map((badge, index) => (
      <Badge key={index} variant="secondary" className="mr-2 mb-2">
        {badge.label}
        <Button variant="ghost" size="sm" className="ml-2 h-auto p-0" onClick={badge.onRemove}>
          <FaTimes className="h-3 w-3" />
        </Button>
      </Badge>
    ));
  };

  const renderFilterPopover = (title: string, options: any[], currentValue: string | string[], onChange: (value: string | string[]) => void, isMulti = false) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="mr-2 mb-2">
          {title} <FaChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => {
                if (isMulti) {
                  onChange(currentValue.includes(option.value)
                    ? (currentValue as string[]).filter(v => v !== option.value)
                    : [...currentValue as string[], option.value]);
                } else {
                  onChange(option.value);
                }
              }}
            >
              {isMulti ? (
                <input
                  type="checkbox"
                  checked={(currentValue as string[]).includes(option.value)}
                  readOnly
                  className="mr-2"
                />
              ) : (
                currentValue === option.value && <FaCheck className="mr-2 h-4 w-4" />
              )}
              {option.label}
            </Button>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center mb-2">
        {renderFilterPopover('Sort', sortFields, sortField, (value) => setSortField(value as string))}
        {renderFilterPopover('Dining Hall', diningOptions, diningHall, (value) => setDiningHall(value as string))}
        {renderFilterPopover('Meal Type', mealTypeOptions, mealType, (value) => setMealType(value as string))}
        {renderFilterPopover('Allergens', allergenOptions, allergens, (value) => setAllergens(value as string[]), true)}
        {renderFilterPopover('Preferences', preferenceOptions, preferences, (value) => setPreferences(value as string))}
        <Button variant="outline" className="mr-2 mb-2" onClick={() => setIsAllFiltersOpen(!isAllFiltersOpen)}>
          All Filters
        </Button>
        <Button variant="secondary" className="mb-2" onClick={clearAllFilters}>
          Clear All
        </Button>
      </div>
      <div className="flex flex-wrap">
        {renderFilterBadges()}
      </div>
      {isAllFiltersOpen && (
        <div className="mt-4 p-4 border rounded-md">
          {/* Add more complex filter options here */}
        </div>
      )}
    </div>
  );
}