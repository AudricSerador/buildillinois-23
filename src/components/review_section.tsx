import { useState, useEffect } from "react";
import Select from "react-select";
import { useAuth } from "@/components/layout/auth.service";
import { toast } from "react-toastify";
import LoadingSpinner from "@/components/loading_spinner";
import { FaInfoCircle, FaThumbsUp } from "react-icons/fa";
import { MdPerson } from "react-icons/md";
import * as timeago from "timeago.js";

interface Review {
  id: number;
  userId: string;
  foodId: string;
  rating: number;
  text?: string;
  location: string;
  meal: string;
  createdAt: string;
  likes: number;
  userName?: string;
}

interface ReviewSectionProps {
  foodId: string;
  mealEntries: any;
}

export const diningTags: { [key: string]: string } = {
  "Ikenberry Dining Center (Ike)": "Ikenberry",
  "Illinois Street Dining Center (ISR)": "ISR",
  "Pennsylvania Avenue Dining Hall (PAR)": "PAR",
  "Lincoln Avenue Dining Hall (Allen)": "Allen",
  "Field of Greens (LAR)": "LAR",
  "InfiniTEA": "InfiniTEA",
  "Urbana South Market": "South Market (PAR)",
  "57 North": "57 North (Ike)",
  "TerraByte": "TerraByte (ISR)",
};

const MAX_REVIEW_LENGTH = 200;

const getValidDiningHalls = (mealEntries: any) => {
  if (!mealEntries || mealEntries.length === 0) {
    return [];
  }

  const validDiningHalls = new Set();
  mealEntries.forEach((entry: any) => {
    validDiningHalls.add(entry.diningHall);
  });
  return Array.from(validDiningHalls).map((hall) => ({
    value: hall,
    label: hall,
  }));
};

const getAvailableMeals = (mealEntries: any, selectedDiningHall: string) => {
  if (!selectedDiningHall || !mealEntries || mealEntries.length === 0) {
    return [];
  }

  const availableMeals = new Set();
  mealEntries
    .filter((entry: any) => entry.diningHall === selectedDiningHall)
    .forEach((entry: any) => {
      availableMeals.add(entry.mealType);
    });

  return Array.from(availableMeals).map((meal) => ({
    value: meal,
    label: meal,
  }));
};

const fetchUserName = async (userId: string) => {
  const res = await fetch(`/api/user/get_user?id=${userId}`);
  const data = await res.json();
  return data.success ? data.data.name : "Unknown";
};

const ReviewSection: React.FC<ReviewSectionProps> = ({ foodId, mealEntries }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [location, setLocation] = useState(null);
  const [meal, setMeal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const validDiningHalls = getValidDiningHalls(mealEntries);
  const availableMeals = getAvailableMeals(mealEntries, location?.value);

  useEffect(() => {
    const fetchReviews = async () => {
      const res = await fetch(`/api/review/get_review?foodId=${foodId}`);
      const data = await res.json();
      const reviewsWithUserNames = await Promise.all(
        data.data.map(async (review: Review) => {
          const userName = await fetchUserName(review.userId);
          return { ...review, userName };
        })
      );
      setReviews(reviewsWithUserNames);
      setIsLoading(false);
    };

    fetchReviews();
  }, [foodId]);

  const handleReviewSubmit = async () => {
    if (!user) {
      toast.error("You need to log in to submit a review.");
      return;
    }

    if (text.length > MAX_REVIEW_LENGTH) {
      toast.error("Review text exceeds the character limit.");
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const existingReview = reviews.find(
      (review) =>
        review.userId === user.id &&
        review.location === location?.value &&
        review.meal === meal?.value &&
        review.createdAt.split('T')[0] === today
    );

    if (existingReview) {
      toast.error("You have already submitted a review for this meal, dining hall, and day.");
      return;
    }

    const res = await fetch("/api/review/create_review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        foodId,
        rating,
        text,
        location: location?.value,
        meal: meal?.value,
      }),
    });

    if (res.ok) {
      toast.success("Review submitted successfully!");
      const newReview = await res.json();
      const userName = await fetchUserName(user.id);
      setReviews([{ ...newReview.data, userName, likes: 0 }, ...reviews]);
      setRating(null);
      setText("");
      setLocation(null);
      setMeal(null);
    } else {
      toast.error("Failed to submit review.");
    }
  };

  const handleLikeReview = async (reviewId: number) => {
    if (!user) {
      toast.error("You need to log in to like a review.");
      return;
    }

    // Check if the user has already liked the review
    const likedReviews = JSON.parse(localStorage.getItem('likedReviews') || '[]');
    if (likedReviews.includes(reviewId)) {
      toast.error("You have already liked this review.");
      return;
    }

    const res = await fetch("/api/review/like_review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        reviewId,
      }),
    });

    if (res.ok) {
      const updatedReview = await res.json();
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId ? { ...review, likes: updatedReview.data.likes } : review
        )
      );

      // Update the liked reviews in local storage
      likedReviews.push(reviewId);
      localStorage.setItem('likedReviews', JSON.stringify(likedReviews));

      toast.success("Review liked successfully!");
    } else {
      toast.error("Failed to like review.");
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-custombold mb-2">Reviews</h2>
      {isLoading ? (
        <LoadingSpinner text="Loading reviews" />
      ) : (
        <div>
          <div className="mb-4">
            {user && validDiningHalls.length > 0 ? (
              <div className="mb-4 bg-base-200 p-4 rounded-lg shadow-lg">
                <h3 className="text-xl font-custombold">Add Your Review</h3>
                <div className="flex items-center mb-2">
                  <label className="mr-2">Rating:</label>
                  <div className="rating rating-lg">
                    <input
                      type="radio"
                      name="rating-8"
                      className="rating-hidden"
                      checked={rating === null}
                      onChange={() => setRating(null)}
                    />
                    {[1, 2, 3, 4, 5].map((star) => (
                      <input
                        key={star}
                        type="radio"
                        name="rating-8"
                        className="mask mask-star-2 bg-orange-400"
                        checked={rating === star}
                        onChange={() => setRating(star)}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-2">
                  <label className="mr-2">Dining Hall:</label>
                  <Select
                    options={validDiningHalls}
                    value={location}
                    onChange={(selectedOption) => {
                      setLocation(selectedOption);
                      setMeal(null); // Reset meal selection when dining hall changes
                    }}
                    placeholder="Select dining hall"
                  />
                </div>
                {location && (
                  <div className="mb-2">
                    <label className="mr-2">Meal:</label>
                    <Select
                      options={availableMeals}
                      value={meal}
                      onChange={setMeal}
                      placeholder="Select meal"
                    />
                  </div>
                )}
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write your review..."
                  className="textarea textarea-bordered w-full"
                  maxLength={MAX_REVIEW_LENGTH}
                />
                <div className={`text-right ${text.length > MAX_REVIEW_LENGTH ? 'text-red-500' : ''}`}>
                  {MAX_REVIEW_LENGTH - text.length} characters left
                </div>
                <button
                  onClick={handleReviewSubmit}
                  className="btn btn-secondary mt-2"
                  disabled={
                    text.length > MAX_REVIEW_LENGTH ||
                    !location ||
                    !meal ||
                    rating === null
                  }
                >
                  Submit Review
                </button>
              </div>
            ) : user ? (
              <div className="alert alert-warning shadow-lg">
                <FaInfoCircle size={20} />
                <span>
                  Food is not being served at any dining hall right now. Check back later to submit a review.
                </span>
              </div>
            ) : (
              <div className="alert alert-info shadow-lg">
                <FaInfoCircle size={20} />
                <span>
                  You need to log in to submit a review.
                </span>
              </div>
            )}
          </div>
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="mb-4 p-4 border rounded">
                <div className="flex items-center mb-2">
                  <MdPerson size={24} className="mr-2" />
                  <p className="font-bold">{review.userName}</p>
                </div>
                <div className="flex items-center mb-2">
                  <div className="rating mr-2">
                    <input type="radio" name={`rating-${review.id}`} className="rating-hidden" checked={review.rating === null} readOnly />
                    {[1, 2, 3, 4, 5].map((star) => (
                      <input
                        key={star}
                        type="radio"
                        name={`rating-${review.id}`}
                        className="mask mask-star-2 bg-orange-400"
                        checked={review.rating === star}
                        readOnly
                      />
                    ))}
                  </div>
                  <div className="badge badge-primary mr-2">{diningTags[review.location]}</div>
                  <div className="badge badge-secondary mr-2">{review.meal}</div>
                  <div className="text-sm text-gray-500">
                    {timeago.format(new Date(review.createdAt))}
                  </div>
                  <div className="ml-auto">
                    <button
                      onClick={() => handleLikeReview(review.id)}
                      className="flex items-center text-gray-600 hover:text-gray-800"
                    >
                      <FaThumbsUp className="mr-1" />
                      <span>{review.likes}</span>
                    </button>
                  </div>
                </div>
                <p>{review.text}</p>
              </div>
            ))
          ) : (
            <p>No reviews yet. Be the first to add one!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
