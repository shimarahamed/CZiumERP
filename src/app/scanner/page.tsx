'use client';

import { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import type { Product } from '@/types';
import { Barcode, Video, VideoOff, CheckCircle } from 'lucide-react';

export default function ScannerPage() {
  const { products } = useAppContext();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const getCameraPermission = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsScanning(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
    setStream(null);
    setScannedProduct(null);
  }

  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (context) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            const product = products.find(p => p.id === code.data);
            if (product) {
              setScannedProduct(product);
              setIsScanning(false);
              toast({ title: 'Product Found!', description: product.name });
               if (stream) stream.getTracks().forEach(track => track.stop());
               setStream(null);
            } else {
                toast({ variant: 'destructive', title: 'Product Not Found', description: `No product found for barcode: ${code.data}` });
            }
          }
        }
      }
      if (isScanning) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    if (isScanning) {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isScanning, products, toast, stream]);
  
  useEffect(() => {
    // Cleanup stream on component unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [stream]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Barcode Scanner" />
      <main className="flex-1 overflow-auto p-6 flex justify-center items-start">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Scan Product Barcode</CardTitle>
            <CardDescription>
              Point your camera at a product's barcode to look it up.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden">
              {isScanning && hasCameraPermission ? (
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Barcode className="h-16 w-16 mx-auto" />
                  <p>Camera is off</p>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {hasCameraPermission === false && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access in your browser to use this feature.
                </AlertDescription>
              </Alert>
            )}

            {scannedProduct && (
              <Card className="mt-4 bg-primary/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CheckCircle className="text-green-500" />Product Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg font-bold">{scannedProduct.name}</p>
                    <p className="text-muted-foreground">Price: ${scannedProduct.price.toFixed(2)}</p>
                    <p className="text-muted-foreground">Stock: {scannedProduct.stock}</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            {!isScanning ? (
                <Button size="lg" onClick={getCameraPermission}><Video className="mr-2"/>Start Scanning</Button>
            ) : (
                <Button size="lg" variant="destructive" onClick={stopScanning}><VideoOff className="mr-2"/>Stop Scanning</Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
