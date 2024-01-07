import Image from 'next/image';

interface PreferenceIconsProps {
    preferences: string;
    allergens: string;
}

export const PreferenceIcons: React.FC<PreferenceIconsProps> = ({
    preferences,
    allergens,
}) => {
    const preferencesList = preferences ? preferences.split(' ') : [];
    const allergensList = allergens ? allergens.toLowerCase().split(', ') : [];

    return (
        <div className="flex flex-wrap bg-white">
            {preferencesList.map(preference => (
                preference.trim() !== '' && preference != 'N/A' && (
                    <div className="mr-2" key={preference}>
                        <Image 
                             src={`/images/icons/${preference}.svg`} 
                            alt={preference} 
                            width={24}
                            height={24}
                        />
                    </div>
                )
            ))}
            {allergensList.map(allergen => (
                allergen.trim() !== '' && allergen !== 'n/a' && (
                    <div className="mr-2" key={allergen}>
                        <Image 
                            src={`/images/icons/${allergen}.svg`} 
                            alt={allergen} 
                            width={24}
                            height={24}
                        />
                    </div>
                )
            ))}
        </div>
    );
}