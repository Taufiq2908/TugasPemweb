import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader
} from "@react-google-maps/api";
import { useEffect, useState } from "react";

const containerStyle = {
  width: "100%",
  height: "100%"
};

export default function HomeRestaurantMap({
  restaurants = [],
  center,
  onSelect
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY
  });

  const [active, setActive] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // ===============================
  // AMBIL LOKASI USER DARI STORAGE
  // ===============================
  useEffect(() => {
    const lat = localStorage.getItem("userLat");
    const lng = localStorage.getItem("userLng");

    if (lat && lng) {
      const parsed = {
        lat: Number(lat),
        lng: Number(lng)
      };

      // validasi angka
      if (!Number.isNaN(parsed.lat) && !Number.isNaN(parsed.lng)) {
        setUserLocation(parsed);
      }
    }
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Memuat peta...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={userLocation || center}
      zoom={13}
    >
      {/* ===============================
          MARKER RESTORAN
      =============================== */}
      {restaurants.map((r) => {
        if (!r.lat || !r.lon) return null;

        return (
          <Marker
            key={r.id}
            position={{
              lat: Number(r.lat),
              lng: Number(r.lon)
            }}
            onClick={() => setActive(r)}
          />
        );
      })}

      {/* ===============================
          MARKER USER (BIRU)
      =============================== */}
      {userLocation && (
        <Marker
          position={userLocation}
          title="Lokasi Anda"
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          }}
        />
      )}

      {/* ===============================
          INFO WINDOW
      =============================== */}
      {active && (
        <InfoWindow
          position={{
            lat: Number(active.lat),
            lng: Number(active.lon)
          }}
          onCloseClick={() => setActive(null)}
        >
          <div className="max-w-[200px]">
            <h3 className="font-bold text-sm">{active.name}</h3>
            <p className="text-xs text-gray-600">{active.address}</p>

            <button
              onClick={() => onSelect(active)}
              className="mt-2 text-xs text-rose-600 font-semibold"
            >
              Lihat Detail →
            </button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
