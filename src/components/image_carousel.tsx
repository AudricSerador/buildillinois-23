import React, { useState } from "react";
import { FaTimes, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useAuth } from "@/components/layout/auth.service";
import { MdPerson } from "react-icons/md";
import { toast } from "react-toastify";
import { FoodImage } from "@/pages/food/[id]";

interface ImageCarouselProps {
  images: FoodImage[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images: initialImages }) => {
  const { user } = useAuth();
  const [images, setImages] = useState<FoodImage[]>(initialImages);
  const [selectedImage, setSelectedImage] = useState<FoodImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
    setSelectedImage(
      images[currentIndex === 0 ? images.length - 1 : currentIndex - 1]
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
    setSelectedImage(
      images[currentIndex === images.length - 1 ? 0 : currentIndex + 1]
    );
  };

  const handleLike = async (imageId: number) => {
    if (!user) {
      toast.error("You need to log in to like an image.");
      return;
    }

    // Check if the user has already liked the image
    const likedImages = JSON.parse(localStorage.getItem('likedImages') || '[]');
    if (likedImages.includes(imageId)) {
      toast.error("You have already liked this image.");
      return;
    }

    try {
      const response = await fetch("/api/image/like_image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: imageId }),
      });

      if (response.ok) {
        const updatedImage = await response.json();
        setImages((prevImages) =>
          prevImages.map((image) =>
            image.id === imageId ? { ...image, likes: updatedImage.data.likes } : image
          ).sort((a, b) => b.likes - a.likes)
        );

        // Update the liked images in local storage
        likedImages.push(imageId);
        localStorage.setItem('likedImages', JSON.stringify(likedImages));

        toast.success("Image liked successfully!");
      } else {
        toast.error("Failed to like image.");
      }
    } catch (error: any) {
      toast.error("Error liking image: " + error.message);
    }
  };

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.length > 0 ? (
          images.map((image) => (
            <div key={image.id} className="relative">
              <img
                src={image.url}
                className="w-full h-64 object-cover cursor-pointer"
                onClick={() => {
                  setSelectedImage(image);
                  setCurrentIndex(images.indexOf(image));
                }}
                alt="Food Image"
              />
            </div>
          ))
        ) : (
          <p>No images available</p>
        )}
      </div>

      {selectedImage && (
        <div className="modal modal-open fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative max-w-6xl w-full h-auto md:h-5/6 p-4 rounded-lg flex flex-col md:flex-row items-center justify-center bg-white">
            <div className="relative w-full md:w-5/6 h-80 md:h-full bg-black flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-r-none">
              <button
                className="absolute top-4 right-4 md:hidden text-2xl text-white"
                onClick={closeModal}
              >
                <FaTimes />
              </button>
              <button
                className="btn text-white glass btn-md rounded-full absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl"
                onClick={handlePrev}
              >
                <FaArrowLeft size={15} />
              </button>
              <img
                src={selectedImage.url}
                alt="Full Image"
                className="w-full h-full object-contain"
              />
              <button
                className="btn text-white glass btn-md rounded-full absolute right-4 top-1/2 transform -translate-y-1/2 text-2xl"
                onClick={handleNext}
              >
                <FaArrowRight size={15} />
              </button>
            </div>
            <div className="w-full md:w-1/3 h-80 md:h-full p-4 flex flex-col justify-between rounded-b-lg md:rounded-r-lg md:rounded-l-none">
              <button
                className="absolute btn btn-ghost top-4 right-4 hidden md:block text-2xl text-gray-700"
                onClick={closeModal}
              >
                <FaTimes />
              </button>
              <div>
                <div className="flex items-center mb-2">
                  <MdPerson size={24} className="mr-2" />
                  <p className="font-bold">{selectedImage.userName}</p>
                </div>
                <p className="text-gray-600">
                  {new Date(selectedImage.created_at).toLocaleDateString()}
                </p>
                <p className="mt-2">{selectedImage.description}</p>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-gray-700 mr-2">
                  {selectedImage.likes} likes
                </span>
                {user && (
                  <button
                    className="text-blue-500"
                    onClick={() => handleLike(selectedImage.id)}
                  >
                    Like
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;