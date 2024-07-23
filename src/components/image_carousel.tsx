import React, { useState, useEffect } from 'react';
import { FaTimes, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

interface ImageCarouselProps {
  foodId: string;
}

interface ImageData {
  id: number;
  url: string;
  userId: string;
  userName: string;
}

const fetchUserName = async (userId: string) => {
  const res = await fetch(`/api/user/get_user?id=${userId}`);
  const data = await res.json();
  return data.success ? data.data.name : 'Unknown';
};

const ImageCarousel: React.FC<ImageCarouselProps> = ({ foodId }) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!foodId) {
      return;
    }
    const fetchImages = async () => {
      const response = await fetch(`/api/image/get_images?foodId=${foodId}`);
      const data = await response.json();

      if (data.success) {
        const imagesWithUserNames = await Promise.all(
          data.images.map(async (image: ImageData) => {
            const userName = await fetchUserName(image.userId);
            return { ...image, userName };
          })
        );
        setImages(imagesWithUserNames);
      } else {
        console.error('Failed to fetch images:', data.message);
        return {};
      }
    };

    fetchImages();
  }, [foodId]);

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-custombold mb-2">Food Images</h2>
      <div className="relative">
        <button className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 btn btn-circle" onClick={handlePrev}>
          <FaArrowLeft />
        </button>
        <div className="carousel w-full">
          {images.length > 0 ? (
            images.map((image, index) => (
              <div key={image.id} className={`carousel-item w-full ${index === currentIndex ? 'block' : 'hidden'}`}>
                <img
                  src={image.url}
                  className="w-full object-cover cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                  alt="Food Image"
                />
              </div>
            ))
          ) : (
            <p>No images available</p>
          )}
        </div>
        <button className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 btn btn-circle" onClick={handleNext}>
          <FaArrowRight />
        </button>
      </div>

      {selectedImage && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button className="btn btn-sm btn-circle btn-error absolute right-2 top-2" onClick={closeModal}>
              <FaTimes />
            </button>
            <img src={selectedImage.url} alt="Full Image" className="w-full h-auto mb-4" />
            <p className="font-bold">{selectedImage.userName}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
