import React, { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { X } from 'lucide-react';

interface CameraScreenProps {
  onClose: () => void;
}

export function CameraScreen({ onClose }: CameraScreenProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        // Check if mediaDevices is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported in this browser');
        }

        console.log('Requesting camera access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
        });

        console.log('Camera access granted');
        setHasPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Add event listeners for debugging
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
          };

          videoRef.current.oncanplay = () => {
            console.log('Video can play');
          };

          videoRef.current.onplay = () => {
            console.log('Video playing event fired');
            setIsVideoPlaying(true);
          };

          // Try to play - don't await, let it happen async
          videoRef.current.play().then(() => {
            console.log('Video play() promise resolved');
            setIsVideoPlaying(true);
          }).catch((err) => {
            console.error('Video play() error:', err);
          });
        }

        // Initialize barcode reader
        codeReaderRef.current = new BrowserMultiFormatReader();
        console.log('Barcode reader initialized');

        // Start continuous scanning
        if (videoRef.current) {
          codeReaderRef.current.decodeFromVideoElement(
            videoRef.current,
            (result: any, err: any) => {
              if (result) {
                console.log('Barcode detected:', result.getText());
                setScannedData(result.getText());
                // Auto close after 2 seconds
                setTimeout(() => {
                  onClose();
                }, 2000);
              }
              if (err && err.name !== 'NotFoundException') {
                console.error('Decode error:', err);
              }
            }
          );
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setHasPermission(false);
        const errorMessage = err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings.'
          : err.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : err.message || 'Unable to access camera. Please ensure camera permissions are granted.';
        setError(errorMessage);
      }
    };

    startCamera();

    // Cleanup
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onClose]);

  if (hasPermission === null) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white text-lg">Requesting camera permission...</p>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-white text-lg text-center">{error || 'No access to camera'}</p>
        <button
          onClick={onClose}
          className="bg-[#dc143c] text-white px-6 py-3 rounded-lg hover:bg-[#b01030] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0" style={{ zIndex: 9999, backgroundColor: '#111' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
          backgroundColor: 'transparent'
        }}
      />

      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }} className="flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-12 right-6 z-20 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
        >
          <X color="white" size={32} />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-2 border-white rounded-xl" style={{ borderColor: 'rgba(255,255,255,0.8)' }} />
          <p className="text-white mt-5 text-center px-5">
            Position the barcode within the frame
          </p>
          {!isVideoPlaying && (
            <p className="text-red-400 mt-2 text-sm">Video stream starting...</p>
          )}
        </div>

        {scannedData && (
          <div className="absolute bottom-24 left-5 right-5 bg-black/80 p-5 rounded-xl text-center z-20">
            <p className="text-green-400 text-xl mb-2">Barcode Scanned!</p>
            <p className="text-white">{scannedData}</p>
          </div>
        )}
      </div>
    </div>
  );
}
