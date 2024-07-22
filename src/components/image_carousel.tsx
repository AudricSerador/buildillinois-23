import { useState } from "react";
import { FaUser } from "react-icons/fa";

interface Image {
  id: string;
  url: string;
  author: string;
}

interface ImageCarouselProps {
  images: Image[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  const openModal = (image: Image) => {
    setSelectedImage(image);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedImage(null);
  };

  return (
    <div>
      <div className="carousel w-full">
        {images.map((image) => (
          <div key={image.id} className="carousel-item w-full">
            <img
              src={image.url}
              alt={`Image by ${image.author}`}
              className="w-full h-64 object-cover cursor-pointer"
              onClick={() => openModal(image)}
            />
          </div>
        ))}
      </div>
      {selectedImage && (
        <div className={`modal ${isOpen ? "modal-open" : ""}`}>
          <div className="modal-box">
            <img
              src={selectedImage.url}
              alt={`Image by ${selectedImage.author}`}
              className="w-full h-auto"
            />
            <div className="flex items-center mt-4">
              <FaUser className="mr-2" />
              <p>{selectedImage.author}</p>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
