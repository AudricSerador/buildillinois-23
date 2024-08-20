import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import NutritionFacts from "@/components/nutrition_facts";
import { EntriesDisplay } from "@/components/entries_display";
import LoadingSpinner from "@/components/loading_spinner";
import { useAuth } from "@/components/layout/auth.service";
import FavoriteBtn from "@/components/favorites/favorite_btn";
import ReviewSection from "@/components/review_section";
import ImageCarousel from "@/components/image_carousel";
import UploadImageModal from "@/components/image_upload";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import ServingAlert from "@/components/serving_alert";
import { Button } from "@/components/ui/button";
import { FaCamera } from "react-icons/fa";

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

export interface FoodImage {
  id: number;
  url: string;
  userId: string;
  userName: string;
  description: string;
  likes: number;
  created_at: string;
}

export interface MealEntry {
  dateServed: string;
  diningHall: string;
  diningFacility: string;
  mealType: string;
}

export default function FoodItemPage() {
  const router = useRouter();
  const { id: foodId } = router.query;
  const [foodItem, setFoodItem] = useState<FoodItem | null>(null);
  const [images, setImages] = useState<FoodImage[]>([]);
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { user } = useAuth();
  const headerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("nutrition");
  const [isNavSticky, setIsNavSticky] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

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
        setMealEntries(data.mealEntries || []);
        setIsLoading(false);
      }
    };

    const fetchImages = async () => {
      if (foodId) {
        try {
          const res = await fetch(`/api/image/get_images?foodIds=${foodId}`);
          if (!res.ok) {
            throw new Error('Failed to fetch images');
          }
          const data = await res.json();
          if (data.success && data.images && data.images[foodId as string]) {
            const sortedImages = data.images[foodId as string].sort((a: FoodImage, b: FoodImage) => b.likes - a.likes);
            setImages(sortedImages);
          }
        } catch (error) {
          console.error('Error fetching images:', error);
        }
      }
    };

    const fetchFavoriteStatus = async () => {
      if (user?.id && foodId) {
        try {
          const res = await fetch(`/api/favorite/get_favorite?userId=${user.id}&foodId=${foodId}`);
          const data = await res.json();
          setIsFavorited(data.success && data.data !== null);
        } catch (error) {
          console.error('Error fetching favorite status:', error);
        }
      }
    };

    const handleScroll = () => {
      if (headerRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;
        setIsSticky(headerBottom <= 0);
      }
    };

    const handleNavScroll = () => {
      if (navRef.current) {
        const navTop = navRef.current.getBoundingClientRect().top;
        setIsNavSticky(navTop <= 64); // 64px to account for the existing sticky header
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleNavScroll);
    fetchFoodItem();
    fetchImages();
    fetchFavoriteStatus();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleNavScroll);
    };
  }, [foodId, router, user?.id]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(`${sectionId}-divider`);
    if (section) {
      const yOffset = -96; // Adjust this value to account for the sticky headers
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
      setActiveSection(sectionId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <LoadingSpinner text="Loading food data" />
      </div>
    );
  }

  const topImages = images.slice(0, 3);

  return (
    <div className="font-custom">
      <div ref={headerRef} className="relative h-64 w-full flex flex-col justify-end">
        {isLoading ? (
          <div className="absolute inset-0 flex">
            {[...Array(3)].map((_, index) => (
              <Skeleton 
                key={index}
                className={`h-full flex-grow ${
                  index === 1 ? 'border-l border-r border-white' : ''
                }`}
              />
            ))}
          </div>
        ) : topImages.length === 0 ? (
          <div className="absolute inset-0 bg-gray-800" />
        ) : topImages.length === 1 ? (
          <Image
            src={topImages[0].url}
            alt={`${foodItem?.name} image`}
            layout="fill"
            objectFit="cover"
          />
        ) : (
          <div className="absolute inset-0 flex">
            {topImages.map((image, index) => (
              <div 
                key={image.id} 
                className={`relative flex-grow ${
                  index === 1 ? 'border-l border-r border-white' : ''
                }`}
              >
                <Image
                  src={image.url}
                  alt={`${foodItem?.name} image ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70 z-10"></div>
        <div className="relative z-20 container mx-auto px-4 sm:px-8 md:px-16 lg:px-64 pb-8">
          <div className="flex items-end space-x-4">
            {isLoading ? (
              <Skeleton className="h-24 w-2/3" />
            ) : (
              <>
                <h1 className="text-5xl font-custombold text-white max-w-2xl leading-tight">
                  {foodItem?.name}
                </h1>
                <FavoriteBtn
                  userId={user?.id || ''}
                  foodId={foodId as string}
                  foodName={foodItem?.name as string}
                  isFavorited={isFavorited}
                  setIsFavorited={setIsFavorited}
                  className="text-4xl text-white flex-shrink-0"
                />
              </>
            )}
          </div>
        </div>
      </div>
      {isSticky && (
        <div className="fixed top-0 left-0 right-0 h-16 bg-primary z-50 shadow-md">
          <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-64 h-full flex items-center justify-between">
            <h2 className="text-lg font-custombold text-white truncate max-w-2xl">
              {foodItem?.name}
            </h2>
            <FavoriteBtn
              userId={user?.id || ''}
              foodId={foodId as string}
              foodName={foodItem?.name as string}
              isFavorited={isFavorited}
              setIsFavorited={setIsFavorited}
              className="text-xl text-white"
            />
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-64 mt-4">
        <ServingAlert mealEntries={mealEntries} />
        
        <div ref={navRef} className={`bg-custombg ${isNavSticky ? 'sticky top-16 z-40' : ''}`}>
          <div className="flex justify-between">
            <button
              className={`btn btn-sm ${activeSection === "nutrition" ? "btn-primary" : "btn-outline"} px-4 py-2 h-auto min-h-2`}
              onClick={() => scrollToSection("nutrition")}
            >
              Nutrition
            </button>
            <button
              className={`btn btn-sm ${activeSection === "reviews" ? "btn-primary" : "btn-outline"} px-4 py-2 h-auto min-h-2`}
              onClick={() => scrollToSection("reviews")}
            >
              Reviews
            </button>
            <button
              className={`btn btn-sm ${activeSection === "photos" ? "btn-primary" : "btn-outline"} px-4 py-2 h-auto min-h-2`}
              onClick={() => scrollToSection("photos")}
            >
              Photos
            </button>
            <button
              className={`btn btn-sm ${activeSection === "servings" ? "btn-primary" : "btn-outline"} px-4 py-2 h-auto min-h-2`}
              onClick={() => scrollToSection("servings")}
            >
              Servings
            </button>
          </div>
          <div className="divider m-0"></div>
        </div>

        <div id="nutrition-divider" className="divider invisible"></div>
        <div id="nutrition">
          <h2 className="text-2xl font-custombold my-4">Nutrition</h2>
          {foodItem && <NutritionFacts foodItem={foodItem} />}
          <p className="mb-4 font-custombold">
            Ingredients: <span className="font-custom">{foodItem?.ingredients}</span>
            <br />
            Allergens: <span className="font-custom">{foodItem?.allergens}</span>
          </p>
        </div>

        <div id="reviews-divider" className="divider"></div>
        <div id="reviews">
          <h2 className="text-2xl font-custombold my-4">Reviews</h2>
          {foodItem && <ReviewSection foodId={foodItem.id} />}
        </div>

        <div id="photos-divider" className="divider"></div>
        <div id="photos">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-custombold">Photos</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowUploadModal(true)}
            >
              <FaCamera className="mr-2" /> Add a Photo
            </button>
          </div>
          <ImageCarousel images={images} />
          {user && (
            <UploadImageModal
              isOpen={showUploadModal}
              onClose={() => setShowUploadModal(false)}
              foodId={foodItem?.id ?? ''}
              userId={user.id}
            />
          )}
        </div>

        <div id="servings-divider" className="divider"></div>
        <div id="servings">
          <h2 className="text-2xl font-custombold my-4">Servings</h2>
          {mealEntries.length > 0 ? (
            <EntriesDisplay mealEntries={mealEntries} />
          ) : (
            <div className="max-w-2xl my-8 font-custom text-lg text-center">
              <p>This food item has not been served yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}