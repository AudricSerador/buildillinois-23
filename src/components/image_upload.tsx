import { useState } from 'react';
import axios from 'axios';
import Compressor from 'compressorjs';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { FaInfoCircle } from "react-icons/fa";

interface UploadImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodId: string;
  userId: string;
}
const UploadImageModal: React.FC<UploadImageModalProps> = ({ isOpen, onClose, foodId, userId }) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

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

    setIsUploading(true);

    new Compressor(image, {
      quality: 0.8,
      success: async (compressedImage) => {
        const formData = new FormData();
        formData.append('file', compressedImage);
        formData.append('userId', userId);
        formData.append('foodId', foodId);
        formData.append('description', description);

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
          if (error instanceof Error) {
            toast.error('Error uploading image: ' + error.message);
          } else {
            toast.error('An unknown error occurred while uploading the image.');
          }
        } finally {
          setIsUploading(false);
        }
      },
      error(err) {
        toast.error('Compression failed: ' + err.message);
        setIsUploading(false);
      },
    });
  };

  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h2 className="font-bold text-lg mb-4">Upload Image</h2>
        {preview && (
          <div className="w-full flex justify-center mb-4 bg-black rounded-md">
            <Image src={preview} alt="Preview" width={300} height={300} />
          </div>
        )}
        {!preview && (
          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="border-dashed border-4 border-gray-200 rounded-lg p-4 text-center">
                <Image height={100} width={100} src="/images/upload.png" alt="Upload" className="mx-auto mb-2" />
                <p>Select a photo to upload</p>
              </div>
            </label>
          </div>
        )}
        <textarea
          className="textarea textarea-bordered w-full mb-4"
          placeholder="Add a description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="alert alert-warning text-sm border mb-4">
          <FaInfoCircle size={15} />
          <span>
            Your NetID will be recorded. Please ensure that the image is appropriate and relevant to the food item.
          </span>
        </div>
        <div className="modal-action">
          <button 
            className={`btn btn-primary ${isUploading ? 'btn-disabled' : ''}`} 
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading && <span className="loading loading-spinner loading-sm mr-2"></span>}
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default UploadImageModal;