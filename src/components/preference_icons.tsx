import { useState } from 'react';
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface PreferenceIconsProps {
    preferences: string;
    allergens: string;
}

export const PreferenceIcons: React.FC<PreferenceIconsProps> = ({
    preferences,
    allergens,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const preferencesList = preferences ? preferences.split(' ') : [];
    const allergensList = allergens ? allergens.toLowerCase().split(', ').filter(a => a.trim() !== '' && a !== 'n/a') : [];

    const dietaryBadges = ['vegan', 'vegetarian', 'halal', 'kosher'].filter(pref => preferencesList.includes(pref));

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
    };

    return (
        <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {allergensList.length > 0 && (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <span 
                            className="text-sm text-gray-500 underline cursor-pointer"
                            onClick={handleClick}
                        >
                            {allergensList.length} Allergen{allergensList.length !== 1 ? 's' : ''}
                        </span>
                    </DialogTrigger>
                    <DialogContent className="w-full max-w-[90vw] sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                        <DialogHeader>
                            <DialogTitle>Allergens</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {allergensList.map(allergen => (
                                <div key={allergen} className="flex items-center gap-2">
                                    <Image 
                                        src={`/images/icons/${allergen}.svg`} 
                                        alt={allergen} 
                                        width={24}
                                        height={24}
                                    />
                                    <span className="capitalize">{allergen}</span>
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
            {dietaryBadges.map(badge => (
                <Badge key={badge} variant="black" className="text-xs py-0 px-1" onClick={(e) => e.stopPropagation()}>{badge.charAt(0).toUpperCase() + badge.slice(1)}</Badge>
            ))}
        </div>
    );
}