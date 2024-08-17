import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { FaCheck, FaChevronDown, FaTimes, FaArrowUp, FaArrowDown, FaSearch, FaStar } from 'react-icons/fa';
import { useAtom } from 'jotai';
import {
  sortFieldsAtom, diningHallAtom, mealTypeAtom,
  dateServedAtom, allergensAtom, preferencesAtom,
  servingAtom, availableDatesAtom, ratingFilterAtom
} from '@/atoms/filterAtoms';
import {
  sortFields as sortFieldOptions, allergenOptions, 
  preferenceOptions, diningOptions, mealTypeOptions,
} from "./allfood/filter_options";

const nutrientLabels: { [key: string]: string } = {
  calories: "Calories",
  protein: "Protein",
  totalCarbohydrates: "Carbohydrates",
  totalFat: "Fat",
  sodium: "Sodium",
  cholesterol: "Cholesterol",
  sugars: "Sugars",
  fiber: "Fiber",
  rating: "Rating",
};

export function FilterBar({ availableDates }: { availableDates: string[] }) {
  const [sortFields, setSortFields] = useAtom(sortFieldsAtom);
  const [diningHall, setDiningHall] = useAtom(diningHallAtom);
  const [mealType, setMealType] = useAtom(mealTypeAtom);
  const [dateServed, setDateServed] = useAtom(dateServedAtom);
  const [allergens, setAllergens] = useAtom(allergensAtom);
  const [preferences, setPreferences] = useAtom(preferencesAtom);
  const [serving, setServing] = useAtom(servingAtom);
  const [ratingFilter, setRatingFilter] = useAtom(ratingFilterAtom);

  const [searchTerm, setSearchTerm] = useState('');
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const servingOptions = [
    { value: "", label: "Anytime" },
    { value: "now", label: "Right Now" },
    { value: "later", label: "Later Today" },
    ...availableDates.map(date => ({ value: date, label: date }))
  ];

  const toggleSort = (field: string) => {
    setSortFields(prevSortFields => {
      const existingSort = prevSortFields.find(s => s.field === field);
      if (existingSort) {
        if (existingSort.order === 'desc') {
          return prevSortFields.map(s => s.field === field ? {...s, order: 'asc'} : s);
        } else {
          return prevSortFields.filter(s => s.field !== field);
        }
      } else {
        return [...prevSortFields, { field, order: 'desc' }];
      }
    });
  };

  const removeSort = (field: string) => {
    setSortFields(prevSortFields => prevSortFields.filter(s => s.field !== field));
  };

  const handleFilterChange = (filterType: string, value: string | string[]) => {
    switch (filterType) {
      case 'diningHall':
        setDiningHall(value as string);
        break;
      case 'mealType':
        setMealType(value as string);
        break;
      case 'allergens':
        setAllergens(value as string[]);
        break;
      case 'preferences':
        setPreferences(value as string);
        break;
      case 'serving':
        setServing(value as string);
        break;
      // Add other cases as needed
    }
  };

  const renderSortPopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="mr-2 mb-2">
          Sort by <FaChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        {sortFieldOptions.map((field) => (
          <Button
            key={field.value}
            variant="ghost"
            className="w-full justify-between mb-2"
            onClick={() => toggleSort(field.value)}
          >
            <span>{nutrientLabels[field.value] || field.label}</span>
            {sortFields.some(s => s.field === field.value) ? 
              (sortFields.find(s => s.field === field.value)?.order === 'desc' ? <FaArrowUp /> : <FaArrowDown />) : 
              <FaChevronDown className="opacity-0" />}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );

  const renderFilterPopover = (
    title: string, 
    options: { value: string; label: string }[] | { label: string; options: { value: string; label: string }[] }[], 
    currentValue: string | string[], 
    onChange: (value: string | string[]) => void, 
    isMulti = false
  ) => {
    // Remove the useState hook from here

    if (title === "Dining Hall") {
      const allOptions = (options as { label: string; options: { value: string; label: string }[] }[]).flatMap(group => group.options);
      const diningHalls = allOptions.filter(option => 
        ['Ikenberry Dining Center (Ike)', 'Illinois Street Dining Center (ISR)', 
         'Pennsylvania Avenue Dining Hall (PAR)', 'Lincoln Avenue Dining Hall (Allen)', 
         'Field of Greens (LAR)'].includes(option.label)
      );
      const diningShops = allOptions.filter(option => !diningHalls.includes(option) && option.value !== '');

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="mr-2 mb-2">
              {title} <FaChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0">
            <div className="grid grid-cols-1 gap-1 p-2 max-h-[75vh] overflow-y-auto">
              {/* All Dining Places option */}
              <Button
                variant="ghost"
                className="justify-start w-full text-left py-2"
                onClick={() => onChange('')}
              >
                <div className="flex items-center w-full">
                  {currentValue === '' && <FaCheck className="mr-2 h-4 w-4 flex-shrink-0" />}
                  <span className="text-sm font-bold">All Dining Places</span>
                </div>
              </Button>

              {/* Dining Halls */}
              <div className="font-bold text-sm mt-2 mb-1">Dining Halls</div>
              <Button
                variant="ghost"
                className="justify-start w-full text-left py-2"
                onClick={() => onChange('all_dining_halls')}
              >
                <div className="flex items-center w-full">
                  {currentValue === 'all_dining_halls' && <FaCheck className="mr-2 h-4 w-4 flex-shrink-0" />}
                  <span className="text-sm">All Dining Halls</span>
                </div>
              </Button>
              {diningHalls.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  className="justify-start w-full text-left py-2 pl-6"
                  onClick={() => onChange(option.value)}
                >
                  <div className="flex items-center w-full">
                    {currentValue === option.value && <FaCheck className="mr-2 h-4 w-4 flex-shrink-0" />}
                    <span className="text-sm">{option.label}</span>
                  </div>
                </Button>
              ))}

              {/* Dining Shops */}
              <div className="font-bold text-sm mt-2 mb-1">Dining Shops (D$)</div>
              <Button
                variant="ghost"
                className="justify-start w-full text-left py-2"
                onClick={() => onChange('all_dining_shops')}
              >
                <div className="flex items-center w-full">
                  {currentValue === 'all_dining_shops' && <FaCheck className="mr-2 h-4 w-4 flex-shrink-0" />}
                  <span className="text-sm">All Dining Shops</span>
                </div>
              </Button>
              {diningShops.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  className="justify-start w-full text-left py-2 pl-6"
                  onClick={() => onChange(option.value)}
                >
                  <div className="flex items-center w-full">
                    {currentValue === option.value && <FaCheck className="mr-2 h-4 w-4 flex-shrink-0" />}
                    <span className="text-sm">{option.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      );
    } else if (title === "Meal Type") {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="mr-2 mb-2">
              {title} <FaChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0">
            <div className="grid grid-cols-1 gap-1 p-2 max-h-[75vh] overflow-y-auto">
              {(options as { label: string; options: { value: string; label: string }[] }[]).map((group, groupIndex) => (
                <div key={groupIndex}>
                  <div className="font-bold text-sm mt-2 mb-1">{group.label}</div>
                  {group.options.map((option) => (
                    <Button
                      key={option.value}
                      variant="ghost"
                      className="justify-start w-full text-left py-2 pl-6"
                      onClick={() => onChange(option.value)}
                    >
                      <div className="flex items-center w-full">
                        {currentValue === option.value && <FaCheck className="mr-2 h-4 w-4 flex-shrink-0" />}
                        <span className="text-sm">{option.label}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      );
    } else if (title === "Allergens") {
      const filteredOptions = (options as { value: string; label: string }[]).filter(option => 
        option.label.toLowerCase().includes(localSearchTerm.toLowerCase())
      );

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="mr-2 mb-2">
              {title} <FaChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="max-h-[75vh] overflow-y-auto">
              <div className="mb-2 relative">
                <input
                  type="text"
                  placeholder="Search allergens..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="w-full p-2 pr-8 border rounded"
                />
                <FaSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {filteredOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  className="w-full justify-between mb-2"
                  onClick={() => {
                    const currentValues = currentValue as string[];
                    const newValue = currentValues.includes(option.value)
                      ? currentValues.filter(v => v !== option.value)
                      : [...currentValues, option.value];
                    onChange(newValue);
                  }}
                >
                  <div className="flex items-center w-full">
                    <input
                      type="checkbox"
                      checked={(currentValue as string[]).includes(option.value)}
                      readOnly
                      className="mr-2"
                    />
                    <span>{option.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      );
    } else if (title === "Serving") {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="mr-2 mb-2">
              {title} <FaChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="max-h-[75vh] overflow-y-auto">
              {servingOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  className="w-full justify-between mb-2"
                  onClick={() => onChange(option.value)}
                >
                  <div className="flex items-center w-full">
                    {currentValue === option.value && <FaCheck className="mr-2 h-4 w-4 flex-shrink-0" />}
                    <span>{option.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      );
    }

    // Default rendering for other filters
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="mr-2 mb-2">
            {title} <FaChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="max-h-[75vh] overflow-y-auto">
            {(options as { value: string; label: string }[]).map((option) => (
              <Button
                key={option.value}
                variant="ghost"
                className="w-full justify-between mb-2"
                onClick={() => onChange(option.value)}
              >
                <div className="flex items-center w-full">
                  {currentValue === option.value && <FaCheck className="mr-2 h-4 w-4 flex-shrink-0" />}
                  <span>{option.label}</span>
                </div>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const renderRatingPopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="mr-2 mb-2">
          Rating <FaChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        {['Any', '50', '75', '90'].map((rating) => (
          <Button
            key={rating}
            variant="ghost"
            className="w-full justify-between mb-2"
            onClick={() => {
              console.log(`Setting rating filter to: ${rating}`);
              setRatingFilter(rating);
            }}
          >
            <span>{rating === 'Any' ? rating : `${rating}%+`}</span>
            {ratingFilter === rating && <FaCheck className="ml-2 h-4 w-4" />}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );

  const renderFilterBadges = () => {
    const badges = [
      ...sortFields.map(s => ({ 
        label: `Sort: ${nutrientLabels[s.field] || s.field} ${s.order === 'desc' ? 'Highest to Lowest' : 'Lowest to Highest'}`, 
        onRemove: () => removeSort(s.field) 
      })),
      diningHall ? { label: `Dining Hall: ${diningHall.toUpperCase()}`, onRemove: () => setDiningHall('') } : null,
      mealType ? { label: `Meal Type: ${mealType.toUpperCase()}`, onRemove: () => setMealType('') } : null,
      dateServed ? { label: `Date: ${dateServed}`, onRemove: () => setDateServed('') } : null,
      ...allergens.map(allergen => ({ label: `Allergen: ${allergen.toUpperCase()}`, onRemove: () => setAllergens(allergens.filter(a => a !== allergen)) })),
      preferences ? { label: `Restriction: ${preferences.toUpperCase()}`, onRemove: () => setPreferences('') } : null,
      serving ? { label: `Serving: ${(servingOptions.find(o => o.value === serving)?.label || serving).toUpperCase()}`, onRemove: () => setServing('') } : null,
      ratingFilter && ratingFilter !== 'Any' ? { label: `Rating: ${ratingFilter}%+`, onRemove: () => setRatingFilter('Any') } : null,
    ];

    return badges.filter((badge): badge is NonNullable<typeof badge> => badge !== null).map((badge, index) => (
      <Badge key={index} variant="info" className="mr-2 mb-2">
        {badge.label}
        <Button variant="ghost" size="sm" className="ml-2 h-auto p-0" onClick={badge.onRemove}>
          <FaTimes className="h-3 w-4" />
        </Button>
      </Badge>
    ));
  };

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center mb-2">
        {renderSortPopover()}
        {renderFilterPopover('Dining Hall', diningOptions, diningHall, (value) => handleFilterChange('diningHall', value))}
        {renderFilterPopover('Meal Type', mealTypeOptions, mealType, (value) => handleFilterChange('mealType', value))}
        {renderFilterPopover('Serving', servingOptions, serving, (value) => handleFilterChange('serving', value))}
        {renderFilterPopover('Allergens', allergenOptions, allergens, (value) => handleFilterChange('allergens', value), true)}
        {renderFilterPopover('Restrictions', preferenceOptions, preferences, (value) => handleFilterChange('preferences', value))}
        {renderRatingPopover()}
        <Button variant="secondary" className="mb-2" onClick={() => {
          setSortFields([]);
          setDiningHall('');
          setMealType('');
          setDateServed('');
          setAllergens([]);
          setPreferences('');
          setServing('');
          setRatingFilter('Any');
        }}>
          Clear All
        </Button>
      </div>
      <div className="flex flex-wrap">
        {renderFilterBadges()}
      </div>
    </div>
  );
}