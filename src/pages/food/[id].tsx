import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NutritionFacts from "@/components/nutrition_facts";
import { EntriesDisplay } from "@/components/entries_display";
import LoadingSpinner from "@/components/loading_spinner";
import { useAuth } from "@/components/layout/auth.service";
import FavoriteBtn from "@/components/favorites/favorite_btn";
import ReviewSection from "@/components/review_section";
import ImageCarousel from "@/components/image_carousel";
import UploadImageModal from "@/components/image_upload";

export interface FoodItem {
  id: string;
  calories: number;
  servingSize: string;
  caloriesFat: number;
  totalFat: number;
  saturatedFat: number;
  transFat: number;
  cholesterol: number;
  sodium: number;
  totalCarbohydrates: number;
  fiber: number;
  sugars: number;
  protein: number;
  calciumDV: number;
  ironDV: number;
  name: string;
  ingredients: string;
  allergens: string;
  preferences: string;
  mealEntries: any[];
  reviewSummary?: {
    count: number;
    averageRating: number;
  };
  topImage?: Image;
}

export interface Image {
  id: string;
  url: string;
  author: string;
}

export default function FoodItemPage() {
  const router = useRouter();
  const { id: foodId } = router.query;
  const [foodItem, setFoodItem] = useState<FoodItem | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFoodItem = async () => {
      if (foodId) {
        const res = await fetch(`/api/food/${foodId}`);

        if (!res.ok) {
          router.push("/404");
          return;
        }

        const data = await res.json();

        if (data.mealEntries) {
          data.mealEntries
            .sort(
              (a: any, b: any) =>
                (new Date(a.dateServed) as any) -
                (new Date(b.dateServed) as any)
            )
            .reverse();
        }

        setFoodItem(data);
        setIsLoading(false);
      }
    };

    const fetchImages = async () => {
      if (foodId) {
        try {
          const res = await fetch(`/api/image/get_images?foodId=${foodId}`);
          if (!res.ok) {
            throw new Error('Failed to fetch images');
          }
          const data = await res.json();
          setImages(data.images[foodId] || []);
        } catch (error) {
          console.error('Error fetching images:', error);
        }
      }
    };

    fetchFoodItem();
    fetchImages();
  }, [foodId, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <LoadingSpinner text="Loading food data" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 font-custom md:px-16 lg:px-64 mt-4">
      <div className="flex items-center space-x-4 mb-4">
        <h1 className="text-4xl font-custombold">{foodItem?.name}</h1>
        <FavoriteBtn
          userId={user?.id || ''}
          foodId={foodId as string}
          foodName={foodItem?.name as string}
        />
        {user && (
          <button className="btn" onClick={() => setShowUploadModal(true)}>
            Upload Image
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 items-start justify-items-center sm:justify-items-start">
        {foodItem && <NutritionFacts foodItem={foodItem} />}
        <div>
          <p className="mb-4 font-custombold">
            Ingredients: <span className="font-custom">{foodItem?.ingredients}</span>
            <br />
            Allergens: <span className="font-custom">{foodItem?.allergens}</span>
          </p>
          <h2 className="text-2xl font-custombold mb-2">Dates Served</h2>
          {foodItem?.mealEntries && foodItem.mealEntries.length > 0 ? (
            <EntriesDisplay mealEntries={foodItem.mealEntries} />
          ) : (
            <div className="max-w-2xl my-8 font-custom text-lg text-center">
              <p>This food item has not been served yet.</p>
            </div>
          )}
        </div>
      </div>
      {foodItem && <ReviewSection foodId={foodItem.id} />}
      {foodItem && <ImageCarousel foodId={foodItem.id} />}
      {user && (
        <UploadImageModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          foodId={foodItem?.id ?? ''}
          userId={user.id}
        />
      )}
    </div>
  );
};