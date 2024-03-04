// In your page or parent component file
import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the MapboxMap component with SSR disabled
const MapboxMapWithNoSSR = dynamic(() => import('@/components/MapboxMap'), {
  ssr: false,
});

export default function Home() {
  return (
    <div>
      <MapboxMapWithNoSSR />
    </div>
  );
}
