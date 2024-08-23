import React, { useState, useEffect } from "react";
import { FaHeart, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useAuth } from "@/components/layout/auth.service";
import { MdPerson } from "react-icons/md";
import { toast } from "react-toastify";
import { FoodImage } from "@/pages/food/[id]";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageCarouselProps {
  images: FoodImage[];
  loading: boolean;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images: initialImages, loading }) => {
  const { user } = useAuth();
  const [images, setImages] = useState<FoodImage[]>(initialImages);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
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

  const handleOpenDialog = (index: number) => {
    setCurrentIndex(index);
    setIsDialogOpen(true);
  };

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-full h-64 bg-gray-200 animate-pulse"></div>
          ))
        ) : images.length > 0 ? (
          images.map((image, index) => (
            <div
              key={image.id}
              className="relative group cursor-pointer"
              onClick={() => handleOpenDialog(index)}
            >
              <img
                src={image.url}
                className="w-full h-64 object-cover"
                alt="Food Image"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  className="btn btn-ghost text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(image.id);
                  }}
                >
                  <FaHeart className="mr-2" /> {image.likes}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No images available</p>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl w-11/12 h-[80vh] p-4">
          <div className="flex flex-col md:flex-row h-full">
            <div className="relative w-full md:w-2/3 h-1/2 md:h-full flex items-center justify-center bg-black">
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={images[currentIndex]?.url}
                  alt="Full Image"
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              </div>
              <Button
                variant="ghost"
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white z-10"
                onClick={handlePrev}
              >
                <FaArrowLeft />
              </Button>
              <Button
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white z-10"
                onClick={handleNext}
              >
                <FaArrowRight />
              </Button>
            </div>
            <div className="w-full md:w-1/3 h-1/2 md:h-full p-4 flex flex-col justify-between overflow-y-auto bg-white">
              <div>
                <div className="flex items-center mb-2">
                  <MdPerson size={24} className="mr-2" />
                  <p className="font-bold">{images[currentIndex]?.userName}</p>
                </div>
                <p className="text-gray-600">
                  {new Date(images[currentIndex]?.created_at).toLocaleDateString()}
                </p>
                <p className="mt-2">{images[currentIndex]?.description}</p>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => handleLike(images[currentIndex]?.id)}
                disabled={!user}
              >
                <FaHeart className="mr-2" /> {images[currentIndex]?.likes} likes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageCarousel;