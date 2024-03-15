import React from 'react';
import { useRouter } from 'next/router';

interface FavOnClickModalProps {
  onClose: () => void;
}

const FavOnClickModal: React.FC<FavOnClickModalProps> = ({ onClose }) => {
  const router = useRouter();

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div className="fixed inset-0 flex items-center font-custombold justify-center bg-black bg-opacity-70" onClick={onClose}>
      <div className="bg-cloud rounded-lg p-8 text-center" onClick={stopPropagation}>
        <h2 className="text-xl font-custom mb-4">Want to save favorite foods? <br></br> Login to IllinEats with your NetID!</h2>
        <button onClick={handleLogin} className="px-4 py-2 px-8 bg-uiucorange text-xl text-white rounded-lg">
          Login
        </button>
      </div>
    </div>
  );
};

export default FavOnClickModal;