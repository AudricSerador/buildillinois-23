import { useState } from "react";
import { toast } from "react-toastify";

interface FavoriteBtnProps {
  userId: string;
  foodId: string;
  foodName: string;
  isFavorited: boolean;
  setIsFavorited: (isFavorited: boolean) => void;
  className?: string;
}

const FavoriteBtn: React.FC<FavoriteBtnProps> = ({
  userId,
  foodId,
  foodName,
  isFavorited,
  setIsFavorited,
  className,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);

  const handleFavorite = async () => {
    if (!userId) {
      setShowModal(true);
      return;
    }

    if (isCooldown) {
      toast.error("Please wait a bit before toggling favorites!", {
        icon: <span role="img" aria-label="star" style={{ fontSize: "20px" }}>🌟</span>,
      });
      return;
    }

    setIsCooldown(true);
    setTimeout(() => setIsCooldown(false), 1000);

    const response = await fetch("/api/favorite/create_favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, foodId }),
    });

    if (response.ok) {
      setIsFavorited(true);
      toast.success(<><strong>{foodName}</strong> has been favorited!</>, {
        icon: <span role="img" aria-label="heart" style={{ fontSize: "20px" }}>❤️</span>,
      });
    } else {
      console.error("Failed to favorite");
      toast.error("Failed to favorite food.");
    }
  };

  const handleUnfavorite = async () => {
    if (isCooldown) return;

    setIsCooldown(true);
    setTimeout(() => setIsCooldown(false), 1000);

    const response = await fetch("/api/favorite/delete_favorite", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, foodId }),
    });

    if (response.ok) {
      setIsFavorited(false);
      toast.success(<><strong>{foodName}</strong> removed from favorites.</>, {
        icon: <span role="img" aria-label="trash" style={{ fontSize: "20px" }}>🗑️</span>,
      });
    } else {
      console.error("Failed to unfavorite");
      toast.error("Failed to unfavorite food.");
    }
  };

  const handleToggle = () => {
    if (isFavorited) {
      handleUnfavorite();
    } else {
      handleFavorite();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <label className="swap">
        <input type="checkbox" checked={isFavorited} onChange={handleToggle} disabled={isCooldown} />
        {/* Heart full icon */}
        <svg
          className="swap-on fill-current w-10 h-10 text-red-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>

        {/* Heart empty icon */}
        <svg
          className="swap-off fill-current w-10 h-10 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35zM7.5 5c2 0 3.5 1.5 3.5 3.5 0 1.33-1.24 2.67-3.5 4.5-2.26-1.83-3.5-3.17-3.5-4.5C4 6.5 5.5 5 7.5 5z" />
        </svg>
      </label>
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="font-bold text-lg">Log In Required</h2>
            <p>You need to log in to favorite items.</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoriteBtn;