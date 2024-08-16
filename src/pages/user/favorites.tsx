import { useEffect, useState } from 'react';
import { useAuth } from '@/components/layout/auth.service';
import { FoodItemCard } from '@/components/food_card_display';
import { FoodItem } from '@/pages/food/[id]';
import { useRouter } from 'next/router';

function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [futureDates, setFutureDates] = useState<string[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const res = await fetch(`/api/favorite/get_favorite?userId=${user.id}`);
        const data = await res.json();
        console.log(data);
        setFavorites(data.data);

        // Fetch future dates (you may need to adjust this based on your API)
        const datesRes = await fetch('/api/get_future_dates');
        const datesData = await datesRes.json();
        setFutureDates(datesData.futureDates);
      } else {
        router.push('/login');
      }
    };

    fetchFavorites();
  }, [user, router]);

  return (
    <div className="px-4 sm:px-8 font-custom md:px-16 lg:px-64 mt-4">
      <p className="text-4xl font-custombold mt-4 mb-4">
        My Favorites ({favorites.length})
      </p>
      {favorites && favorites.length > 0 ? (
        favorites.map((favorite: { foodId: string; food: FoodItem }) => (
          <FoodItemCard 
            key={favorite.foodId} 
            foodItem={favorite.food} 
            loading={false} 
            futureDates={futureDates}
          />
        ))
      ) : (
        <p className="text-center text-lg">No favorites yet.</p>
      )}
    </div>
  );
}

export default FavoritesPage;