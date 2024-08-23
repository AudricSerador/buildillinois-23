import React, { useCallback, useState } from "react";
import Image from 'next/image';
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FaTimes } from "react-icons/fa";

interface IngredientsCardProps {
  ingredients: string[];
  allergens: string[];
  searchIngredient: string;
  setSearchIngredient: (value: string) => void;
  onClose?: () => void;
}

const IngredientsCard: React.FC<IngredientsCardProps> = React.memo(({ ingredients, allergens, searchIngredient, setSearchIngredient, onClose }) => {
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchIngredient(e.target.value);
  }, [setSearchIngredient]);

  return (
    <Card className="p-4 bg-white relative">
      {onClose && (
        <button onClick={onClose} className="absolute top-2 right-2 p-1">
          <FaTimes size={20} />
        </button>
      )}
      <h3 className="font-custombold text-xl mb-2">Ingredients ({ingredients.length})</h3>
      <input
        type="text"
        placeholder="Search ingredients..."
        value={searchIngredient}
        onChange={handleSearchChange}
        className="input input-bordered w-full mb-2"
      />
      <ScrollArea className="h-72 w-full rounded-md border">
        <div className="p-4">
          {ingredients.length > 0 ? (
            ingredients.map((ingredient, index) => (
              <React.Fragment key={index}>
                <div className="text-sm">
                  <span className="font-bold">
                    {ingredient.split(/\s*\(/)[0]}
                  </span>
                  {ingredient.includes('(') && (
                    <span className="font-normal">
                      {' ' + ingredient.substring(ingredient.indexOf('('))}
                    </span>
                  )}
                </div>
                {index < ingredients.length - 1 && <Separator className="my-2" />}
              </React.Fragment>
            ))
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500">
              No results
            </div>
          )}
        </div>
      </ScrollArea>
      <h3 className="font-custombold text-xl mt-4 mb-2">Allergens</h3>
      <div className="flex flex-wrap gap-2">
        {allergens.map((allergen) => (
            <div key={allergen} className="badge flex items-center gap-1 p-3">
            <Image 
                src={`/images/icons/${allergen.toLowerCase()}.svg`} 
                alt={allergen} 
                width={20}
                height={20}
            />
            <span className="text-sm capitalize">{allergen}</span>
            </div>
        ))}
    </div>
    </Card>
  );
});
IngredientsCard.displayName = 'IngredientsCard';

interface IngredientsSectionProps {
  ingredients: string[];
  allergens: string[];
  searchIngredient: string;
  setSearchIngredient: (value: string) => void;
}

export const IngredientsSection: React.FC<IngredientsSectionProps> = ({ ingredients, allergens, searchIngredient, setSearchIngredient }) => {
  const [ingredientsDialogOpen, setIngredientsDialogOpen] = useState(false);

  return (
    <div className="lg:flex-1 mt-4 lg:mt-0">
      <div className="hidden lg:block">
        <IngredientsCard 
          ingredients={ingredients}
          allergens={allergens}
          searchIngredient={searchIngredient}
          setSearchIngredient={setSearchIngredient}
        />
      </div>
      <div className="lg:hidden">
        <Dialog open={ingredientsDialogOpen} onOpenChange={setIngredientsDialogOpen}>
          <DialogTrigger asChild>
            <button className="btn btn-primary w-full">See Ingredients & Allergens</button>
          </DialogTrigger>
          <DialogContent className="p-0 bg-transparent border-none">
            <IngredientsCard 
              ingredients={ingredients}
              allergens={allergens}
              searchIngredient={searchIngredient}
              setSearchIngredient={setSearchIngredient}
              onClose={() => setIngredientsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
IngredientsSection.displayName = 'IngredientsSection';