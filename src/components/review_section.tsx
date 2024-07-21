import { useState, useEffect } from "react";
import Select from "react-select";
import { useAuth } from "@/components/layout/auth.service";
import { toast } from "react-toastify";
import LoadingSpinner from "@/components/loading_spinner";

interface Review {
  id: number;
  userId: string;
  foodId: string;
  rating: number;
  text?: string;
  location: string;
  meal: string;
  createdAt: string;
}

interface ReviewSectionProps {
  foodId: string;
}

const MAX_REVIEW_LENGTH = 200;

const diningHalls = [
    { value: "Ikenberry Dining Center (Ike)", label: "Ikenberry Dining Center (Ike)" },
    { value: "Illinois Street Dining Center (ISR)", label: "Illinois Street Dining Center (ISR)" },
    { value: "Pennsylvania Avenue Dining Hall (PAR)", label: "Pennsylvania Avenue Dining Hall (PAR)" },
    { value: "Lincoln Avenue Dining Hall (Allen)", label: "Lincoln Avenue Dining Hall (Allen)" },
    { value: "Field of Greens (LAR)", label: "Field of Greens (LAR)" },
    { value: "InfiniTEA", label: "InfiniTEA" },
    { value: "Urbana South Market", label: "Urbana South Market" },
    { value: "57 North", label: "57 North" },
    { value: "TerraByte", label: "TerraByte" },
  ];
  
  const mealOptions = {
    "Ikenberry Dining Center (Ike)": [
      { value: "Breakfast", label: "Breakfast" },
      { value: "Lunch", label: "Lunch" },
      { value: "Light Lunch", label: "Light Lunch" },
      { value: "Dinner", label: "Dinner" },
    ],
    "Illinois Street Dining Center (ISR)": [
      { value: "Breakfast", label: "Breakfast" },
      { value: "Lunch", label: "Lunch" },
      { value: "Dinner", label: "Dinner" },
    ],
    "Pennsylvania Avenue Dining Hall (PAR)": [
      { value: "Breakfast", label: "Breakfast" },
      { value: "Lunch", label: "Lunch" },
      { value: "Dinner", label: "Dinner" },
    ],
    "Lincoln Avenue Dining Hall (Allen)": [
      { value: "Breakfast", label: "Breakfast" },
      { value: "Lunch", label: "Lunch" },
      { value: "Kosher Lunch", label: "Kosher Lunch" },
      { value: "Dinner", label: "Dinner" },
      { value: "Kosher Dinner", label: "Kosher Dinner" },
    ],
    "Field of Greens (LAR)": [
      { value: "Lunch", label: "Lunch" },
    ],
    "InfiniTEA": [
      { value: "a la Carte", label: "A la Carte" },
    ],
    "Urbana South Market": [
      { value: "a la Carte", label: "A la Carte" },
    ],
    "57 North": [
      { value: "a la Carte", label: "A la Carte" },
    ],
    "TerraByte": [
      { value: "a la Carte", label: "A la Carte" },
    ],
  };

const ReviewSection: React.FC<ReviewSectionProps> = ({ foodId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [location, setLocation] = useState(null);
  const [meal, setMeal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const res = await fetch(`/api/review/get_reviews?foodId=${foodId}`);
      const data = await res.json();
      setReviews(data.data);
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
      setReviews([newReview.data, ...reviews]);
      setRating(0);
      setText("");
      setLocation(null);
      setMeal(null);
    } else {
      toast.error("Failed to submit review.");
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-custombold mb-2">Reviews</h2>
      {isLoading ? (
        <LoadingSpinner text="loading reviews"/>
      ) : (
        <div>
          <div className="mb-4">
            {user && (
              <div className="mb-4">
                <h3 className="text-xl font-custombold">Add Your Review</h3>
                <div className="flex items-center mb-2">
                  <label className="mr-2">Rating:</label>
                  <div className="rating rating-lg">
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
                    options={diningHalls}
                    value={location}
                    onChange={setLocation}
                    placeholder="Select dining hall"
                  />
                </div>
                {location && (
                  <div className="mb-2">
                    <label className="mr-2">Meal:</label>
                    <Select
                      options={mealOptions[location.value]}
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
                  className="btn mt-2"
                  disabled={text.length > MAX_REVIEW_LENGTH}
                >
                  Submit Review
                </button>
              </div>
            )}
            {!user && (
              <div className="alert alert-info">
                Please log in to submit a review.
              </div>
            )}
          </div>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="mb-4 p-4 border rounded">
                <div className="flex justify-between items-center mb-2">
                  <div className="rating rating-lg">
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
                  <div className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p>Location: {review.location}</p>
                <p>Meal: {review.meal}</p>
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
