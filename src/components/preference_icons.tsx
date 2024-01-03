interface PreferenceIconsProps {
    preferences: string;
    allergens: string;
}

export const PreferenceIcons: React.FC<PreferenceIconsProps> = ({
    preferences,
    allergens,
}) => {
    const preferencesList = preferences.split(' ');
    const allergensList = allergens.toLowerCase().split(', ');

    return (
        <div className="flex bg-white">
            {preferencesList.map(preference => (
                preference.trim() !== '' && (
                    <div className="mr-2" key={preference}>
                        <img 
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
                        <img 
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