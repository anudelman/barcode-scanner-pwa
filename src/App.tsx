import React, { useState } from 'react';
import { CameraScreen } from './components/CameraScreen';
import { ServiceWorkerRegistration } from './components/ServiceWorkerRegistration';

export default function App() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleOpenCamera = () => {
    setIsCameraOpen(true);
  };

  const handleCloseCamera = () => {
    setIsCameraOpen(false);
  };

  if (isCameraOpen) {
    return (
      <>
        <ServiceWorkerRegistration />
        <CameraScreen onClose={handleCloseCamera} />
      </>
    );
  }

  return (
    <>
      <ServiceWorkerRegistration />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <button
          onClick={handleOpenCamera}
          className="bg-[rgb(184,24,24)] text-white px-12 py-8 rounded-2xl shadow-lg hover:opacity-90 active:scale-98 transition-all px-[24px] py-[16px]"
        >
          <span className="text-2xl">Scan Rx Barcode</span>
        </button>
      </div>
    </>
  );
}
