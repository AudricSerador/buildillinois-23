import { useState } from 'react';
import axios from 'axios';
import Compressor from 'compressorjs';
import { toast } from 'react-toastify';

interface UploadImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodId: string;
  userId: string;
}

const UploadImageModal: React.FC<UploadImageModalProps> = ({ isOpen, onClose, foodId, userId }) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = () => {
    if (!image) {
      toast.error('Please select an image to upload.');
      return;
    }

    new Compressor(image, {
      quality: 0.8,
      success: async (compressedImage) => {
        const formData = new FormData();
        formData.append('file', compressedImage);
        formData.append('userId', userId);
        formData.append('foodId', foodId);

        try {
          const response = await axios.post('/api/image/upload_image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.data.success) {
            toast.success('Image uploaded successfully!');
            onClose();
          } else {
            toast.error('Failed to upload image.');
          }
        } catch (error) {
          toast.error('Error uploading image: ' + error.message);
        }
      },
      error(err) {
        toast.error('Compression failed: ' + err.message);
      },
    });
  };

  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h2 className="font-bold text-lg">Upload Image</h2>
        {preview && <img src={preview} alt="Preview" className="mb-4" />}
        <input type="file" accept="image/*" onChange={handleImageChange} className="mb-4" />
        <div className="modal-action">
          <button className="btn btn-primary" onClick={handleUpload}>Upload</button>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default UploadImageModal;
