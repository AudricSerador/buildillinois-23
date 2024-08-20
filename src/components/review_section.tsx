import { useState, useEffect } from "react";
import { useAuth } from "@/components/layout/auth.service";
import { toast } from "react-toastify";
import LoadingSpinner from "@/components/loading_spinner";
import { FaInfoCircle, FaThumbsUp, FaFrown, FaMeh, FaSmile, } from "react-icons/fa";
import { FaFaceMehBlank } from "react-icons/fa6";
import { MdPerson } from "react-icons/md";
import * as timeago from "timeago.js";

interface Review {
  id: number;
  userId: string;
  foodId: string;
  rating: 'bad' | 'mid' | 'good';
  text?: string;
  createdAt: string;
  likes: number;
  userName?: string;
}

interface ReviewSectionProps {
  foodId: string;
}

const MAX_REVIEW_LENGTH = 200;
const REVIEWS_PER_PAGE = 5;

const fetchUserName = async (userId: string) => {
  const res = await fetch(`/api/user/get_user?id=${userId}`);
  const data = await res.json();
  return data.success ? data.data.name : "Unknown";
};

const ReviewSection: React.FC<ReviewSectionProps> = ({ foodId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<'bad' | 'mid' | 'good' | null>(null);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'likes' | 'recent'>('likes');
  const [filterRating, setFilterRating] = useState<'all' | 'bad' | 'mid' | 'good'>('all');

  const fetchReviews = async () => {
    try {
      console.log('Fetching reviews for foodId:', foodId);
      const res = await fetch(`/api/review/get_reviews?foodIds=${foodId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await res.json();
      console.log('Received review data:', data);
      if (data.success && data.data && data.data[foodId]) {
        const reviewsWithUserNames = await Promise.all(
          data.data[foodId].map(async (review: Review) => {
            const userName = await fetchUserName(review.userId);
            return { ...review, userName };
          })
        );
        console.log('Reviews with usernames:', reviewsWithUserNames);
        setReviews(reviewsWithUserNames);
      } else {
        console.log("No reviews found for this food item");
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
        review.userId !== user.id &&
        review.createdAt.split('T')[0] === today
    );

    if (existingReview) {
      toast.error("You have already submitted a review for this food item today.");
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
      }),
    });

    if (res.ok) {
      toast.success("Review submitted successfully!");
      const newReview = await res.json();
      const userName = await fetchUserName(user.id);
      setReviews([{ ...newReview.data, userName, likes: 0 }, ...reviews]);
      setRating(null);
      setText("");
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

  const calculateReviewStats = () => {
    const totalReviews = reviews.length;
    const ratingCounts = { bad: 0, mid: 0, good: 0 };
    let totalScore = 0;

    reviews.forEach((review) => {
      ratingCounts[review.rating]++;
      totalScore += review.rating === 'bad' ? -1 : review.rating === 'mid' ? 1 : 2;
    });

    const overallScore = totalReviews > 0 ? Math.round(totalScore / totalReviews) : 0;

    return { totalReviews, ratingCounts, overallScore };
  };

  const { totalReviews, ratingCounts, overallScore } = calculateReviewStats();

  const reviewsWithText = reviews.filter(review => review.text && review.text.trim() !== '');
  
  const sortedAndFilteredReviews = reviewsWithText
    .filter(review => filterRating === 'all' || review.rating === filterRating)
    .sort((a, b) => {
      if (sortBy === 'likes') {
        return b.likes - a.likes;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const totalPages = Math.ceil(sortedAndFilteredReviews.length / REVIEWS_PER_PAGE);
  const currentReviews = sortedAndFilteredReviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  const getScorePercentage = () => {
    if (totalReviews === 0) return 0;
    const totalScore = reviews.reduce((sum, review) => {
      return sum + (review.rating === 'good' ? 100 : review.rating === 'mid' ? 50 : 0);
    }, 0);
    return Math.round(totalScore / totalReviews);
  };

  const scorePercentage = getScorePercentage();

  return (
    <div className="mt-8">
      {isLoading ? (
        <LoadingSpinner text="Loading reviews" />
      ) : (
        <div>
          {user && (
            <div className="alert alert-warning border mb-4">
              <FaInfoCircle size={20} />
              <span>
                Your NetID will be recorded when you submit a review.
              </span>
            </div>
          )}
          <div className="mb-4 flex flex-col lg:flex-row lg:space-x-4">
            <div className="lg:w-1/2 mb-4 lg:mb-0 lg:h-full">
              {user ? (
                <div className="mb-4 bg-base-100 p-4 rounded-lg border shadow-md h-full">
                  <h3 className="text-xl font-custombold">How was the food?</h3>
                  <div className="flex items-center mb-2">
                    <div className="flex space-x-4 justify-center items-center w-full">
                      <button
                        className={`btn btn-ghost ${rating === 'bad' ? 'btn-active' : ''}`}
                        onClick={() => setRating('bad')}
                      >
                        <FaFrown className="text-4xl text-red-500" />
                      </button>
                      <button
                        className={`btn btn-ghost ${rating === 'mid' ? 'btn-active' : ''}`}
                        onClick={() => setRating('mid')}
                      >
                        <FaMeh className="text-4xl text-yellow-500" />
                      </button>
                      <button
                        className={`btn btn-ghost ${rating === 'good' ? 'btn-active' : ''}`}
                        onClick={() => setRating('good')}
                      >
                        <FaSmile className="text-4xl text-green-500" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Share your thoughts (optional)"
                    className="textarea textarea-bordered w-full textarea-base-200"
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
                      rating === null
                    }
                  >
                    Submit Review
                  </button>
                </div>
              ) : (
                <div className="alert alert-info shadow-lg h-full">
                  <FaInfoCircle size={20} />
                  <span>
                    You need to log in to submit a review.
                  </span>
                </div>
              )}
            </div>
            <div className="lg:w-1/2 lg:h-full">
              <div className="mb-4 p-4 border rounded-lg bg-base-100 shadow-md h-full">
                <h3 className="text-xl font-custombold mb-4 lg:mb-6">Overall rating</h3>
                <div className="flex items-center mb-4 lg:mb-9">
                  <div className="text-5xl mr-4">
                    {totalReviews === 0 ? (
                      <FaFaceMehBlank className="text-gray-500" />
                    ) : scorePercentage >= 70 ? (
                      <FaSmile className="text-green-500" />
                    ) : scorePercentage >= 40 ? (
                      <FaMeh className="text-yellow-500" />
                    ) : (
                      <FaFrown className="text-red-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-4xl font-custombold">{totalReviews === 0 ? "n/a" : `${scorePercentage}%`}</div>
                    <div className="text-sm text-gray-500">({totalReviews} reviews)</div>
                  </div>
                </div>
                {['good', 'mid', 'bad'].map((rating) => (
                  <div key={rating} className="flex items-center mb-2">
                    <span className="mr-2 capitalize w-10">{rating}</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded">
                      <div
                        className={`h-2 rounded ${rating === 'good' ? 'bg-green-400' : rating === 'mid' ? 'bg-yellow-400' : 'bg-red-400'}`}
                        style={{ width: `${(ratingCounts[rating as keyof typeof ratingCounts] / totalReviews) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mb-4 flex justify-between items-center">
            <div className="btn-group">
              <button
                className={`btn btn-sm ${sortBy === 'likes' ? 'btn-active' : ''}`}
                onClick={() => setSortBy('likes')}
              >
                Most Likes
              </button>
              <button
                className={`btn btn-sm ${sortBy === 'recent' ? 'btn-active' : ''}`}
                onClick={() => setSortBy('recent')}
              >
                Most Recent
              </button>
            </div>
            <div className="btn-group">
              <button
                className={`btn btn-sm ${filterRating === 'all' ? 'btn-active' : ''}`}
                onClick={() => setFilterRating('all')}
              >
                All
              </button>
              <button
                className={`btn btn-sm ${filterRating === 'bad' ? 'btn-active' : ''}`}
                onClick={() => setFilterRating('bad')}
              >
                Bad
              </button>
              <button
                className={`btn btn-sm ${filterRating === 'mid' ? 'btn-active' : ''}`}
                onClick={() => setFilterRating('mid')}
              >
                Mid
              </button>
              <button
                className={`btn btn-sm ${filterRating === 'good' ? 'btn-active' : ''}`}
                onClick={() => setFilterRating('good')}
              >
                Good
              </button>
            </div>
          </div>
          {currentReviews && currentReviews.length > 0 ? (
            currentReviews.map((review) => (
              <div key={review.id} className="mb-2 p-4 border bg-base-100">
                <div className="flex items-center mb-2">
                  <MdPerson size={24} className="mr-2" />
                  <p className="font-bold">{review.userName}</p>
                </div>
                <div className="flex items-center mb-2">
                  <div className={`badge ${review.rating === 'good' ? 'badge-success' : review.rating === 'mid' ? 'badge-warning' : 'badge-error'} mr-2`}>
                    {review.rating}
                  </div>
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
            <p>No reviews with text yet. Be the first to add one!</p>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="join">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`join-item btn ${currentPage === i + 1 ? "btn-active" : ""}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
