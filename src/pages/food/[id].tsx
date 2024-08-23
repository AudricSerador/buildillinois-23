import { useRouter } from "next/router";
import { useEffect, useState, useRef, useCallback, Suspense, useMemo } from "react";
import NutritionFacts from "@/components/nutrition_facts";
import { EntriesDisplay } from "@/components/entries_display";
import { useAuth } from "@/components/layout/auth.service";
import FavoriteBtn from "@/components/favorites/favorite_btn";
import ReviewSection from "@/components/review_section";
import ImageCarousel from "@/components/image_carousel";
import UploadImageModal from "@/components/image_upload";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import ServingAlert from "@/components/serving_alert";
import { Button } from "@/components/ui/button";
import { FaCamera, FaTimes } from "react-icons/fa";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import React from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { IngredientsSection } from "@/components/IngredientsSection";

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
  mealEntries: any[];
  reviewSummary?: {
    count: number;
    averageRating: number;
  };
  topImage?: any;
  preferences?: string;
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
  const [isFavorited, setIsFavorited] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("nutrition");
  const [isNavSticky, setIsNavSticky] = useState(false);
  const [isBannerSticky, setIsBannerSticky] = useState(false);
  const [searchIngredient, setSearchIngredient] = useState("");
  const [ingredientsDialogOpen, setIngredientsDialogOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const [isScrolling, setIsScrolling] = useState(false);

  const fetchData = useCallback(async () => {
    if (foodId && typeof foodId === 'string') {
      setIsLoading(true);
      try {
        const [foodItemData, imagesData, favoriteStatus] = await Promise.all([
          fetchFoodItem(foodId),
          fetchImages(foodId),
          user?.id ? fetchFavoriteStatus(user.id, foodId) : Promise.resolve(false)
        ]);

        setFoodItem(foodItemData);
        setImages(imagesData);
        setIsFavorited(favoriteStatus);
        setMealEntries(foodItemData?.mealEntries || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [foodId, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleScroll = useCallback(() => {
    if (!isScrolling) {
      setIsScrolling(true);
      requestAnimationFrame(() => {
        if (titleRef.current && bannerRef.current) {
          const titleBottom = titleRef.current.getBoundingClientRect().bottom;
          setIsBannerSticky(titleBottom <= 0);
        }
        if (navRef.current) {
          const navTop = navRef.current.getBoundingClientRect().top;
          setIsNavSticky(navTop <= (isBannerSticky ? 64 : 0));
        }
        setIsScrolling(false);
      });
    }
  }, [isBannerSticky, isScrolling]);

  useEffect(() => {
    let scrollTimeout: number;
    const throttledHandleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(handleScroll, 10);
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [handleScroll]);

  const scrollToSection = useCallback((sectionId: string) => {
    const section = document.getElementById(`${sectionId}-divider`);
    if (section) {
      const yOffset = -96;
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
      setActiveSection(sectionId);
    }
  }, []);

  const formatIngredients = useCallback((ingredients: string) => {
    const result: string[] = [];
    let currentIngredient = '';
    let parenthesesCount = 0;

    for (let i = 0; i < ingredients.length; i++) {
      const char = ingredients[i];
      currentIngredient += char;

      if (char === '(') {
        parenthesesCount++;
      } else if (char === ')') {
        parenthesesCount--;
      }

      if ((char === ',' && parenthesesCount === 0) || i === ingredients.length - 1) {
        const trimmed = currentIngredient.trim().replace(/,$/, '');
        const [main, ...details] = trimmed.split(/\s*\(/);
        const mainFormatted = main.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        const detailsFormatted = details.length > 0 ? `(${details.join('(')}` : '';
        result.push(`${mainFormatted} ${detailsFormatted}`.trim());
        currentIngredient = '';
      }
    }

    return result;
  }, []);

  const filteredIngredients = useMemo(() => {
    return foodItem?.ingredients 
      ? formatIngredients(foodItem.ingredients).filter(ingredient => 
          ingredient.toLowerCase().includes(searchIngredient.toLowerCase())
        )
      : [];
  }, [foodItem?.ingredients, searchIngredient, formatIngredients]);

  const allergens = useMemo(() => {
    return foodItem?.allergens ? foodItem.allergens.split(', ').filter(a => a.trim() !== '' && a.toLowerCase() !== 'n/a') : [];
  }, [foodItem?.allergens]);

  const handleAddPhotoClick = () => {
    if (user) {
      setShowUploadModal(true);
    } else {
      setShowLoginDialog(true);
    }
  };

  if (isLoading) {
    return <FoodItemSkeleton />;
  }

  const topImages = images.slice(0, 3);

  return (
    <Suspense fallback={<FoodItemSkeleton />}>
      <div className="font-custom">
        <div ref={bannerRef} className="relative h-64 w-full flex flex-col justify-end">
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
                  <h1 ref={titleRef} className="text-5xl font-custombold text-white max-w-2xl leading-tight">
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
        {isBannerSticky && (
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
          
          <div 
            ref={navRef} 
            className={`bg-custombg transition-all duration-300 ${
              isNavSticky ? 'fixed top-16 left-0 right-0 z-40 px-4 sm:px-8 md:px-16 lg:px-64' : ''
            }`}
            style={{
              position: isNavSticky ? 'fixed' : 'static',
              top: isNavSticky ? '64px' : 'auto',
              transform: isNavSticky ? 'translateZ(0)' : 'none',
              willChange: 'transform',
            }}
          >
            <div className="flex justify-start space-x-2 sm:pt-4 pt-2 overflow-x-auto">
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
            <div className="divider m-0 p-0"></div>
          </div>
          
          {isNavSticky && <div style={{ height: '64px' }} />}

          <div id="nutrition-divider" className="divider invisible"></div>
          <div id="nutrition">
            <h2 className="text-4xl font-custombold my-4">Nutrition</h2>
            <div className="flex flex-col lg:flex-row lg:gap-4">
              <div className="w-full sm:w-auto lg:max-w-xs mb-4 sm:mb-0">
                {foodItem && <NutritionFacts foodItem={foodItem} />}
              </div>
              <div className="w-full lg:flex-1">
                <IngredientsSection 
                  ingredients={filteredIngredients}
                  allergens={allergens}
                  searchIngredient={searchIngredient}
                  setSearchIngredient={setSearchIngredient}
                />
              </div>
            </div>
          </div>

          <div id="reviews-divider" className="divider"></div>
          <div id="reviews">
            <h2 className="text-4xl font-custombold my-4">Reviews</h2>
            {foodItem && <ReviewSection foodId={foodItem.id} />}
          </div>

          <div id="photos-divider" className="divider"></div>
          <div id="photos">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-4xl font-custombold">Photos</h2>
              <button 
                className="btn btn-primary"
                onClick={handleAddPhotoClick}
              >
                <FaCamera className="mr-2" /> Add a Photo
              </button>
            </div>
            <ImageCarousel images={images} loading={isLoading} />
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
            <h2 className="text-4xl font-custombold my-4">Servings</h2>
            {mealEntries.length > 0 ? (
              <EntriesDisplay mealEntries={mealEntries} />
            ) : (
              <div className="max-w-2xl my-8 font-custom text-lg text-center">
                <p>This food item has not been served yet.</p>
              </div>
            )}
          </div>
        </div>

        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Login Required</DialogTitle>
              <DialogDescription>
                You need to be logged in to add a photo. Please log in or create an account to continue.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => router.push('/login')}>
                Go to Login
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Suspense>
  );
}

async function fetchFoodItem(foodId: string) {
  const res = await fetch(`/api/food/${foodId}`);
  if (!res.ok) {
    console.error('Failed to fetch food item');
    return null;
  }
  return res.json();
}

async function fetchImages(foodId: string) {
  const res = await fetch(`/api/image/get_images?foodIds=${foodId}`);
  if (!res.ok) {
    console.error('Failed to fetch images');
    return [];
  }
  const data = await res.json();
  return data.success && data.images && data.images[foodId] 
    ? data.images[foodId].sort((a: FoodImage, b: FoodImage) => b.likes - a.likes)
    : [];
}

async function fetchFavoriteStatus(userId: string, foodId: string) {
  if (!userId || !foodId) return false;
  try {
    const res = await fetch(`/api/favorite/get_favorite?userId=${userId}&foodId=${foodId}`);
    if (!res.ok) {
      console.error('Failed to fetch favorite status');
      return false;
    }
    const data = await res.json();
    return data.success && data.data !== null;
  } catch (error) {
    console.error('Error fetching favorite status:', error);
    return false;
  }
}

function FoodItemSkeleton() {
  return (
    <div className="font-custom">
      <div className="relative h-64 w-full">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-64 mt-4">
        <Skeleton className="h-12 w-full max-w-md mb-4" />
        
        <div className="flex justify-start space-x-2 sm:pt-4 pt-2 overflow-x-auto">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-8 w-24" />
          ))}
        </div>
        
        <div className="divider m-0 p-0"></div>
        
        <div className="mt-8">
          <Skeleton className="h-10 w-40 mb-4" />
          <div className="flex flex-col lg:flex-row lg:gap-4">
            <Skeleton className="w-full sm:w-auto lg:max-w-xs h-96 mb-4 sm:mb-0" />
            <div className="w-full lg:flex-1">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
        
        {['Reviews', 'Photos', 'Servings'].map((section, index) => (
          <div key={section} className="mt-8">
            <Skeleton className="h-10 w-40 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}