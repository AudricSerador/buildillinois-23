import { useEffect, useState } from 'react';
import { useAuth } from '@/auth/auth.service';
import { FoodItemDisplay } from '@/components/allfood/food_item_display';
import { FoodItem } from '@/pages/food/[id]';
import { useRouter } from 'next/router';

function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const res = await fetch(`/api/favorite/get_favorite?userId=${user.id}`);
        const data = await res.json();
        console.log(data);
        setFavorites(data.data);
      } else {
        router.push('/login');
      }
    };

    fetchFavorites();
  }, [user]);

  return (
    <div className="px-4 sm:px-8 font-custom md:px-16 lg:px-64 mt-4">
      <p className="text-4xl font-custombold mt-4 mb-4">
        My Favorites
      </p>
      {favorites && favorites.length > 0 ? (
        favorites.map((favorite: { foodId: string; food: FoodItem }) => (
          <FoodItemDisplay key={favorite.foodId} foodItem={favorite.food} includeEntries={false} />
        ))
      ) : (
        <p className="text-center text-lg">No favorites yet.</p>
      )}
    </div>
  );
}

export default FavoritesPage;