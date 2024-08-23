import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaFilter, FaTimes, FaChevronDown, FaCheck, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import { useAtom } from 'jotai';
import { filterAtom } from '@/atoms/filterAtoms';
import {
  sortFields as sortFieldOptions, allergenOptions, 
  preferenceOptions, diningOptions, mealTypeOptions,
} from "./allfood/filter_options";
import { allergens as allergenIcons } from '@/components/icon_legend';
import { isEqual } from 'lodash';
import { useMediaQuery } from '@/hooks/use_media_query';

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

interface Filter {
  sortFields: { field: string; order: 'asc' | 'desc' }[];
  diningHall: string;
  mealType: string;
  dateServed: string;
  allergens: string[];
  preferences: string;
  serving: string;
  ratingFilter: string;
}

interface FilterBarProps {
  onApplyFilters: () => void;
  availableDates: string[];
  renderButton?: (onClick: () => void) => React.ReactNode;
}

export function FilterBar({ onApplyFilters, availableDates, renderButton }: FilterBarProps): JSX.Element {
  const [filters, setFilters] = useAtom(filterAtom);
  const [pendingFilters, setPendingFilters] = useState<Filter>({
    ...filters,
    sortFields: filters.sortFields as Filter['sortFields'],
    allergens: filters.allergens as string[]
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    setHasChanges(!isEqual(filters, pendingFilters));
  }, [filters, pendingFilters]);

  const closeFilters = () => {
    setPendingFilters(filters);
    setIsFilterOpen(false);
  };

  const applyFilters = () => {
    setFilters(pendingFilters);
    setIsFilterOpen(false);
    onApplyFilters();
  };

  const clearAllFilters = () => {
    setPendingFilters({
      sortFields: [],
      diningHall: '',
      mealType: '',
      dateServed: '',
      allergens: [],
      preferences: '',
      serving: '',
      ratingFilter: 'any'
    });
  };

  const renderFilterSection = (title: string, content: React.ReactNode) => (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {content}
    </div>
  );

  const renderButtonGroup = (options: { value: string; label: string }[], currentValue: string, onChange: (value: string) => void) => (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option.value}
          variant={currentValue === option.value ? "default" : "outline"}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );

  const renderCheckboxGroup = (options: { value: string; label: string; src?: string }[], currentValues: string[], onChange: (values: string[]) => void) => (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <div key={option.value} className="flex items-center">
          <Checkbox
            id={option.value}
            checked={currentValues.includes(option.value)}
            onCheckedChange={(checked) => {
              if (checked) {
                onChange([...currentValues, option.value]);
              } else {
                onChange(currentValues.filter(v => v !== option.value));
              }
            }}
          />
          <label htmlFor={option.value} className="ml-2 flex items-center">
            {option.src && <img src={option.src} alt={option.label} className="w-6 h-6 mr-2" />}
            <span>{option.label}</span>
          </label>
        </div>
      ))}
    </div>
  );

  const toggleSort = (field: string) => {
    setPendingFilters(prevFilters => {
      const existingSort = prevFilters.sortFields.find(s => s.field === field);
      if (existingSort) {
        if (existingSort.order === 'desc') {
          return { ...prevFilters, sortFields: prevFilters.sortFields.map(s => s.field === field ? {...s, order: 'asc'} : s) };
        } else {
          return { ...prevFilters, sortFields: prevFilters.sortFields.filter(s => s.field !== field) };
        }
      } else {
        return { ...prevFilters, sortFields: [...prevFilters.sortFields, { field, order: 'desc' }] };
      }
    });
  };

  const removeSort = (field: string) => {
    setPendingFilters(prevFilters => ({ ...prevFilters, sortFields: prevFilters.sortFields.filter(s => s.field !== field) }));
  };

  const removeFilter = (type: string, value: string) => {
    setPendingFilters(prev => {
      const newFilters = { ...prev };
      switch (type) {
        case 'sort':
          newFilters.sortFields = prev.sortFields.filter(s => `${nutrientLabels[s.field] || s.field} ${s.order === 'desc' ? '↓' : '↑'}` !== value);
          break;
        case 'diningHall':
          newFilters.diningHall = '';
          break;
        case 'mealType':
          newFilters.mealType = '';
          break;
        case 'allergen':
          newFilters.allergens = prev.allergens.filter(a => a !== value);
          break;
        case 'preference':
          newFilters.preferences = '';
          break;
        case 'serving':
          newFilters.serving = '';
          break;
        case 'rating':
          newFilters.ratingFilter = 'any';
          break;
      }
      return newFilters;
    });
  };

  const filterContent = (
    <ScrollArea className="h-full">
      {renderFilterSection('Nutrients', 
        <div className="space-y-2">
          {sortFieldOptions.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              className="w-full justify-between"
              onClick={() => toggleSort(option.value)}
            >
              <span>{nutrientLabels[option.value] || option.label}</span>
              <span className="flex items-center">
                {!pendingFilters.sortFields.find(s => s.field === option.value) && <FaMinus className="mr-2" />}
                {pendingFilters.sortFields.find(s => s.field === option.value)?.order === 'desc' && <>High to Low <FaArrowDown className="ml-2" /></>}
                {pendingFilters.sortFields.find(s => s.field === option.value)?.order === 'asc' && <>Low to High <FaArrowUp className="ml-2" /></>}
              </span>
            </Button>
          ))}
        </div>
      )}
      {renderFilterSection('Place', (
        <>
          <div className="mb-4">
            <Button
              variant={pendingFilters.diningHall === '' ? "default" : "outline"}
              onClick={() => setPendingFilters(prev => ({ ...prev, diningHall: '' }))}
              className="mb-2"
            >
              All Places
            </Button>
          </div>
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Dining Halls</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={pendingFilters.diningHall === 'all_dining_halls' ? "default" : "outline"}
                onClick={() => setPendingFilters(prev => ({ ...prev, diningHall: 'all_dining_halls' }))}
                className="mb-2"
              >
                All Dining Halls
              </Button>
              {diningOptions.find(group => group.label === 'Dining Halls')?.options.slice(1).map((option) => (
                <Button
                  key={option.value}
                  variant={pendingFilters.diningHall === option.value ? "default" : "outline"}
                  onClick={() => setPendingFilters(prev => ({ ...prev, diningHall: option.value }))}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Dining Shops</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={pendingFilters.diningHall === 'all_dining_shops' ? "default" : "outline"}
                onClick={() => setPendingFilters(prev => ({ ...prev, diningHall: 'all_dining_shops' }))}
                className="mb-2"
              >
                All Dining Shops
              </Button>
              {diningOptions.find(group => group.label === 'A la Carte')?.options.map((option) => (
                <Button
                  key={option.value}
                  variant={pendingFilters.diningHall === option.value ? "default" : "outline"}
                  onClick={() => setPendingFilters(prev => ({ ...prev, diningHall: option.value }))}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </>
      ))}
      {renderFilterSection('Meal Type', renderButtonGroup(mealTypeOptions.flatMap(group => group.options), pendingFilters.mealType, value => setPendingFilters(prev => ({ ...prev, mealType: value }))))}
      {renderFilterSection('Allergens', renderCheckboxGroup(
        allergenOptions.map(allergen => ({ 
          value: allergen.value, 
          label: allergen.label, 
          src: allergenIcons.find(a => a.label.toLowerCase() === allergen.value.toLowerCase())?.src 
        })),
        pendingFilters.allergens,
        values => setPendingFilters(prev => ({ ...prev, allergens: values }))
      ))}
      {renderFilterSection('Restriction', (
        <div className="flex flex-wrap gap-2">
          {(preferenceOptions as Array<{ value: string; label: string; src?: string }>).map((option) => (
            <Button
              key={option.value}
              variant={pendingFilters.preferences === option.value ? "default" : "outline"}
              onClick={() => setPendingFilters(prev => ({ ...prev, preferences: prev.preferences === option.value ? '' : option.value }))}
              className="flex items-center"
            >
              {option.src && <img src={option.src} alt={option.label} className="w-6 h-6 mr-2" />}
              {option.label}
            </Button>
          ))}
        </div>
      ))}
      {renderFilterSection('Serving', renderButtonGroup([
        { value: "", label: "Anytime" },
        { value: "now", label: "Right Now" },
        { value: "later", label: "Later Today" },
        ...availableDates.map(date => ({ value: date, label: date }))
      ], pendingFilters.serving, value => setPendingFilters(prev => ({ ...prev, serving: value }))))}
      {renderFilterSection('Rating', renderButtonGroup([
        { value: 'any', label: 'Any Rating' },
        { value: 'rated_only', label: 'Rated Only' }
      ], pendingFilters.ratingFilter, value => setPendingFilters(prev => ({ ...prev, ratingFilter: value }))))}
    </ScrollArea>
  );

  return (
    <div className="mb-4">
      {isMobile ? (
        <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DrawerTrigger asChild>
            {renderButton ? renderButton(() => setIsFilterOpen(true)) : (
              <Button onClick={() => setIsFilterOpen(true)}>Filters</Button>
            )}
          </DrawerTrigger>
          <DrawerContent className="h-[85vh] flex flex-col">
            <DrawerHeader className="flex-shrink-0">
              <DrawerTitle>Filters</DrawerTitle>
            </DrawerHeader>
            <div className="flex-grow overflow-auto px-4">
              {filterContent}
            </div>
            <div className="flex-shrink-0 p-4 border-t">
              <div className="flex justify-between">
                <Button onClick={clearAllFilters} variant="outline">Clear All</Button>
                <Button onClick={applyFilters} disabled={!hasChanges}>Apply Filters</Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <>
          {renderButton ? renderButton(() => setIsFilterOpen(true)) : (
            <Button onClick={() => setIsFilterOpen(true)}>Filters</Button>
          )}
          <Dialog open={isFilterOpen} onOpenChange={closeFilters}>
            <DialogContent className="max-w-3xl w-full max-h-[80vh] flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Filters</DialogTitle>
              </DialogHeader>
              <div className="flex-grow overflow-auto px-6">
                {filterContent}
              </div>
              <div className="flex-shrink-0 p-6 border-t">
                <div className="flex justify-between">
                  <Button onClick={clearAllFilters} variant="outline">Clear All</Button>
                  <Button onClick={applyFilters} disabled={!hasChanges}>Apply Filters</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}