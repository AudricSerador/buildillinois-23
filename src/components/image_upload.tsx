import { useState } from "react";
import imageCompression from "browser-image-compression";
import { toast } from "react-toastify";

interface ImageUploadProps {
  foodId: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ foodId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const imageFile = e.target.files[0];
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(imageFile, options);
        setFile(compressedFile);
        setPreview(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error("Error compressing image:", error);
        toast.error("Failed to compress image");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("food_id", foodId);

    const res = await fetch("/api/upload_image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      toast.success("Image uploaded successfully");
      setFile(null);
      setPreview(null);
      setIsOpen(false);
    } else {
      toast.error(data.error || "Failed to upload image");
    }
  };

  return (
    <div>
      <button className="btn" onClick={() => setIsOpen(true)}>
        Upload Image
      </button>
      <div className={`modal ${isOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="text-lg font-bold">Upload Image</h3>
          <input type="file" onChange={handleFileChange} className="my-4" />
          {preview && <img src={preview} alt="Image preview" className="w-full h-auto my-4" />}
          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleSubmit}>
              Upload
            </button>
            <button className="btn" onClick={() => setIsOpen(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
