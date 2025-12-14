import React from "react";

export default function OwnerRestaurantCard({ place, onClick }) {
  return (
    <div
      onClick={() => onClick(place.id)}
      className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition"
    >
      <h3 className="font-bold text-lg">{place.name}</h3>
      <p className="text-sm text-gray-600 mb-2">{place.address}</p>

      <span
        className={`inline-block text-xs px-2 py-1 rounded ${
          place.status === "pending"
            ? "bg-yellow-100 text-yellow-700"
            : place.status === "rejected"
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {place.status}
      </span>
    </div>
  );
}
