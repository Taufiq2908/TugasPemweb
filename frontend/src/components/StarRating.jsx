import React from "react";

export const StarRating = ({
  value,
  rating,           // fallback kalau value tidak ada
  onChange = () => {},
  interactive = false,
  size = "md",
}) => {
  const currentValue = value ?? rating ?? 0;
  const stars = [1, 2, 3, 4, 5];

  const sizeClass =
    size === "lg"
      ? "w-7 h-7"
      : size === "sm"
      ? "w-4 h-4"
      : "w-5 h-5";

  const handleClick = (v) => {
    if (!interactive) return;
    onChange(v);
  };

  return (
    <div className="flex items-center space-x-1">
      {stars.map((star) => (
        <svg
          key={star}
          onClick={() => handleClick(star)}
          className={`${sizeClass} ${
            star <= Math.round(currentValue)
              ? "text-yellow-400"
              : "text-gray-300"
          } ${interactive ? "cursor-pointer hover:scale-110 transition" : ""}`}
          fill={star <= Math.round(currentValue) ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};
