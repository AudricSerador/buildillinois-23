import { useEffect, useState } from 'react';
import { useAuth } from '@/components/layout/auth.service';
import { FoodItemCard } from '@/components/food_card_display';
import { FoodItem } from '@/pages/food/[id]';
import { useRouter } from 'next/router';
import { FaSearch } from 'react-icons/fa';

function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<{ foodId: string; food: FoodItem }[]>([]);
  const [futureDates, setFutureDates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const getServingStatus = (foodItem: FoodItem) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.setDate(now.getDate() + 1)).toISOString().split('T')[0];

    if (foodItem.mealEntries?.some(entry => entry.dateServed === today)) {
      return { status: 'Serving Now', order: 1 };
    } else if (foodItem.mealEntries?.some(entry => entry.dateServed === tomorrow)) {
      return { status: 'Serving Tomorrow', order: 2 };
    } else {
      return { status: 'Serving Later', order: 3 };
    }
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const res = await fetch(`/api/favorite/get_favorite?userId=${user.id}`);
        const data = await res.json();
        setFavorites(data.data);

        const datesRes = await fetch('/api/get_future_dates');
        const datesData = await datesRes.json();
        setFutureDates(datesData.futureDates);
      } else {
        router.push('/login');
      }
    };

    fetchFavorites();
  }, [user, router]);

  const sortedFavorites = favorites.sort((a, b) => {
    const aServing = getServingStatus(a.food);
    const bServing = getServingStatus(b.food);
    return aServing.order - bServing.order;
  });

  const filteredFavorites = sortedFavorites.filter(favorite =>
    favorite.food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 sm:px-8 font-custom md:px-16 lg:px-24 mt-16 sm:mt-4">
      <p className="text-4xl font-custombold mt-4 mb-4">
        My Favorites ({favorites.length})
      </p>
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search favorites..."
          className="input input-bordered w-full pr-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      {filteredFavorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFavorites.map((favorite) => (
            <FoodItemCard 
              key={favorite.foodId} 
              foodItem={favorite.food} 
              loading={false} 
              futureDates={futureDates}
              disableVerticalLayout={true}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-lg">No favorites found.</p>
      )}
    </div>
  );
}

export default FavoritesPage;