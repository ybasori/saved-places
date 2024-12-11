// components/GoogleMapsProvider.tsx
import React, { createContext, useContext } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const GoogleMapsContext = createContext<boolean | null>(null);

export const GoogleMapsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    libraries: ["marker"], // Include the marker library
  });

  if (loadError)
    return (
      <>
        {children}
        <p>Error loading Google Maps</p>
      </>
    );
  if (!isLoaded)
    return (
      <>
        {children}
        <p>Loading...</p>
      </>
    );

  return (
    <GoogleMapsContext.Provider value={isLoaded}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => useContext(GoogleMapsContext);
