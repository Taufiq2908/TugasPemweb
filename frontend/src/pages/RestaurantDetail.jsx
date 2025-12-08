import React, { useState, useEffect, useMemo } from "react";
import { StarRating } from "../components/StarRating";

// =========================
// CONFIG API + SUPABASE
// =========================
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const reviewBucket =
  import.meta.env.VITE_SUPABASE_REVIEW_BUCKET || "review-photos";

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Helper upload gambar ke Supabase Storage
async function uploadReviewImage(file, placeId, userId) {
  if (!supabase) {
    console.warn("Supabase client belum dikonfigurasi di frontend.");
    return null;
  }

  const ext = file.name.split(".").pop();
  const filePath = `reviews/${placeId}/${userId || "anon"}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(reviewBucket)
    .upload(filePath, file);

  if (uploadError) {
    console.error("Upload Supabase gagal:", uploadError);
    throw uploadError;
  }

  const { data: publicData } = supabase.storage
    .from(reviewBucket)
    .getPublicUrl(filePath);

  return publicData?.publicUrl || null;
}

// Helper konversi format review backend -> frontend
function mapBackendReview(raw) {
  const userName = raw.is_anonymous
    ? "Pengguna Anonim"
    : raw.user_name || "Pengguna";

  const avatarUrl =
    raw.user_avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userName
    )}&background=e11d48&color=fff`;

  return {
    id: raw.id,
    userId: raw.user_id,
    userName,
    userAvatar: avatarUrl,
    rating: raw.rating,
    comment: raw.comment,
    isAnonymous: raw.is_anonymous,
    date: raw.created_at,
    likes: raw.thumbs_up_count || 0,
    photos: raw.photo_urls || [],
  };
}

import { toggleWishlist } from "../utils/wishlist";

const handleWishlist = async () => {
  const result = await toggleWishlist(user?.id, restaurantData.id, isFavorite);
  if (result.success) {
    onToggleFavorite && onToggleFavorite(restaurantData.id);
  }
};

export const RestaurantDetail = ({
  restaurant, // initial data dari mock / list
  reviews: initialReviews = [], // masih dipakai sebagai fallback kalau API gagal
  isFavorite,
  onToggleFavorite,
  onBack,
  onUserClick,
  user,
  onAuthRequest,
}) => {
  const [place, setPlace] = useState(restaurant || null);
  const [loadingPlace, setLoadingPlace] = useState(false);
  const [placeError, setPlaceError] = useState("");

  const [localReviews, setLocalReviews] = useState(
    (initialReviews || []).map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.userName,
      userAvatar: r.userAvatar,
      rating: r.rating,
      comment: r.comment,
      isAnonymous: r.isAnonymous,
      date: r.date,
      likes: r.likes || 0,
      photos: r.photos || [],
    }))
  );
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  // Form ulasan
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const [activeSection, setActiveSection] = useState("overview"); // 'overview' | 'reviews'
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const placeId = restaurant?.id;

  // ==========================
  // Fetch DETAIL TEMPAT
  // ==========================
  useEffect(() => {
    if (!placeId) return;
    let isCancelled = false;

    const fetchPlace = async () => {
      setLoadingPlace(true);
      setPlaceError("");

      try {
        const res = await fetch(`${API_BASE}/places/${placeId}`);
        if (!res.ok) {
          throw new Error("Gagal mengambil data tempat.");
        }
        const data = await res.json();
        if (!isCancelled) {
          setPlace(data);
        }
      } catch (err) {
        console.error(err);
        if (!isCancelled) {
          setPlaceError("Gagal memuat detail tempat. Menggunakan data awal.");
          setPlace(restaurant || null); // fallback ke props
        }
      }
      if (!isCancelled) setLoadingPlace(false);
    };

    fetchPlace();
    return () => {
      isCancelled = true;
    };
  }, [placeId, restaurant]);

  // ==========================
  // Fetch ULASAN DARI BACKEND
  // ==========================
  const loadReviews = async () => {
    if (!placeId) return;
    setLoadingReviews(true);
    setReviewsError("");
    try {
      const res = await fetch(`${API_BASE}/reviews/place/${placeId}`);
      if (!res.ok) {
        throw new Error("Gagal mengambil ulasan.");
      }
      const data = await res.json(); // getReviewsByPlace mengembalikan array langsung
      const mapped = (data || []).map(mapBackendReview);
      setLocalReviews(mapped);
    } catch (err) {
      console.error(err);
      setReviewsError("Gagal memuat ulasan. Menampilkan data lokal jika ada.");
      // fallback: biarkan localReviews dari props
    }
    setLoadingReviews(false);
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId]);

  // ==========================
  // Statistik rating dari ulasan
  // ==========================
  const reviewStats = useMemo(() => {
    if (!localReviews.length) {
      return {
        average: place?.average_rating || 0,
        count: place?.review_count || 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const count = localReviews.length;
    const total = localReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const average = total / count;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    localReviews.forEach((r) => {
      const rt = Math.round(r.rating || 0);
      if (distribution[rt] != null) distribution[rt] += 1;
    });

    return { average, count, distribution };
  }, [localReviews, place]);

  // ==========================
  // Handle perubahan file foto
  // ==========================
  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreviewUrl(URL.createObjectURL(file));
  };

  // ==========================
  // Submit Ulasan Baru
  // ==========================
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!user) {
      if (onAuthRequest) onAuthRequest();
      return;
    }

    if (!newRating) {
      setSubmitError("Silakan beri rating terlebih dahulu.");
      return;
    }
    if (newComment.trim().length < 10) {
      setSubmitError("Ulasan minimal 10 karakter.");
      return;
    }

    setSubmittingReview(true);

    try {
      const token = localStorage.getItem("makanKi_token");
      if (!token) {
        setSubmitError("Session login berakhir. Silakan login kembali.");
        setSubmittingReview(false);
        if (onAuthRequest) onAuthRequest();
        return;
      }

      // 1. Upload foto ke Supabase (jika ada)
      let photoUrls = [];
      if (mediaFile) {
        try {
          const url = await uploadReviewImage(mediaFile, placeId, user.id);
          if (url) {
            photoUrls = [url];
          }
        } catch (err) {
          console.error("Upload foto gagal:", err);
          // Tidak fatal, tetap lanjut kirim ulasan tanpa foto
        }
      }

      // 2. Kirim ulasan ke backend
      const res = await fetch(`${API_BASE}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          place_id: placeId,
          rating: newRating,
          comment: newComment.trim(),
          is_anonymous: isAnonymous,
          photo_urls: photoUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.message || "Gagal mengirim ulasan.");
        setSubmittingReview(false);
        return;
      }

      // Backend mengirim satu review baru -> map dan prepend
      const mapped = mapBackendReview(data.review);
      setLocalReviews((prev) => [mapped, ...prev]);

      setSubmitSuccess("Ulasan berhasil dikirim. Terima kasih! 🙌");
      setNewRating(0);
      setNewComment("");
      setIsAnonymous(false);
      setMediaFile(null);
      setMediaPreviewUrl(null);
    } catch (err) {
      console.error(err);
      setSubmitError("Terjadi kesalahan koneksi ke server.");
    }

    setSubmittingReview(false);
  };

  // ==========================
  // Like / Bantu Ulasan
  // ==========================
  const handleLikeReview = async (reviewId) => {
    if (!user) {
      if (onAuthRequest) onAuthRequest();
      return;
    }
    const token = localStorage.getItem("makanKi_token");
    if (!token) {
      if (onAuthRequest) onAuthRequest();
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/review-likes/${reviewId}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.warn("Gagal like ulasan:", data.message || data.error);
        // tetap coba refresh count
      }

      // Refresh total like
      const resLikes = await fetch(
        `${API_BASE}/review-likes/${reviewId}/likes`
      );
      if (resLikes.ok) {
        const likesData = await resLikes.json();
        const totalLikes =
          likesData.total_likes ??
          likesData.likeCount ??
          likesData.count ??
          0;
        setLocalReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId ? { ...r, likes: totalLikes } : r
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================
  // Helper tampilan
  // ==========================
  const restaurantData = place || restaurant || {};
  const photos = restaurantData.photos || restaurant?.photos || [];
  const mainPhoto =
    photos[activePhotoIndex] ||
    restaurantData.image_url ||
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80";

  const avgRatingDisplay = reviewStats.average
    ? reviewStats.average.toFixed(1)
    : (restaurantData.average_rating || restaurantData.rating || 0).toFixed
    ? (restaurantData.average_rating || restaurantData.rating || 0).toFixed(1)
    : "0.0";

  const reviewCountDisplay =
    reviewStats.count || restaurantData.review_count || 0;

  const openInMaps = () => {
    if (restaurantData.google_maps_url) {
      window.open(restaurantData.google_maps_url, "_blank");
      return;
    }
    if (restaurantData.lat && restaurantData.lng) {
      window.open(
        `https://www.google.com/maps?q=${restaurantData.lat},${restaurantData.lng}`,
        "_blank"
      );
      return;
    }
    if (restaurantData.address) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          restaurantData.address
        )}`,
        "_blank"
      );
    }
  };

  // ==========================
  // RENDER
  // ==========================
  return (
    <div className="py-4 sm:py-6 lg:py-8">
      {/* Bar atas */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600"
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
            ←
          </span>
          <span>Kembali</span>
        </button>

        <button
          onClick={handleWishlist}
          className={`inline-flex items-center justify-center w-9 h-9 rounded-full border ${
            isFavorite ? "bg-rose-600 text-white" : "bg-white text-gray-500"
          } shadow-sm hover:shadow-md transition`}
        >
          {isFavorite ? "♥" : "♡"}
        </button>

      </div>

      {/* Error detail tempat */}
      {placeError && (
        <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 text-sm">
          {placeError}
        </div>
      )}

      {/* Hero & info utama */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        {/* Foto utama + thumbnail */}
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gray-100 h-64 sm:h-80 lg:h-[360px]">
            <img
              src={mainPhoto}
              alt={restaurantData.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2">
              <span>⭐ {avgRatingDisplay}</span>
              <span>({reviewCountDisplay} ulasan)</span>
            </div>
            <button
              onClick={openInMaps}
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-medium text-gray-800 shadow hover:bg-white"
            >
              Lihat di Maps
            </button>
          </div>

          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative w-20 h-16 rounded-xl overflow-hidden border ${
                    activePhotoIndex === idx
                      ? "border-rose-500 ring-2 ring-rose-300"
                      : "border-gray-200"
                  } flex-shrink-0`}
                >
                  <img
                    src={url}
                    alt={`Foto ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info text */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
              {restaurantData.name || "Nama Restoran"}
            </h1>
            <p className="text-sm text-gray-500">
              {restaurantData.city_name ||
                restaurantData.city ||
                "Kota tidak diketahui"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <StarRating value={Number(avgRatingDisplay)} size="lg" />
              <span className="font-semibold text-gray-900">
                {avgRatingDisplay}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {reviewCountDisplay} ulasan
            </span>
          </div>

          {restaurantData.address && (
            <p className="text-sm text-gray-700 flex items-start gap-2">
              <span>📍</span>
              <span>{restaurantData.address}</span>
            </p>
          )}

          {/* Tag / kategori sederhana */}
          <div className="flex flex-wrap gap-2 mt-2">
            {(restaurantData.categories || []).map((cat) => (
              <span
                key={cat.id || cat}
                className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-medium border border-rose-100"
              >
                {cat.name || cat}
              </span>
            ))}
          </div>

          {/* Info harga opsional */}
          {restaurantData.min_price || restaurantData.max_price ? (
            <div className="mt-2 text-sm text-gray-700">
              💸 Perkiraan harga:{" "}
              <span className="font-semibold">
                {restaurantData.min_price
                  ? `Rp${restaurantData.min_price.toLocaleString("id-ID")}`
                  : "?"}{" "}
                -{" "}
                {restaurantData.max_price
                  ? `Rp${restaurantData.max_price.toLocaleString("id-ID")}`
                  : "?"}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Tab navigasi konten */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex gap-4 text-sm">
          <button
            onClick={() => setActiveSection("overview")}
            className={`pb-3 border-b-2 ${
              activeSection === "overview"
                ? "border-rose-600 text-rose-600 font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Ringkasan
          </button>
          <button
            onClick={() => setActiveSection("reviews")}
            className={`pb-3 border-b-2 ${
              activeSection === "reviews"
                ? "border-rose-600 text-rose-600 font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Ulasan Pengunjung
          </button>
        </nav>
      </div>

      {/* Konten Ringkasan */}
      {activeSection === "overview" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-lg font-bold mb-2 text-gray-900">
              Ringkasan Tempat
            </h2>
            <p className="text-sm text-gray-600">
              {restaurantData.description ||
                "Belum ada deskripsi lengkap. Namun restoran ini sudah terdaftar dan siap kamu coba!"}
            </p>
          </div>

          {/* Stat rating di ringkasan */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Statistik Rating
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl font-extrabold text-rose-600">
                  {avgRatingDisplay}
                </div>
                <div className="text-sm text-gray-600">
                  <div>{reviewCountDisplay} ulasan</div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <StarRating value={Number(avgRatingDisplay)} size="sm" />
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviewStats.distribution[star] || 0;
                  const percent = reviewStats.count
                    ? (count / reviewStats.count) * 100
                    : 0;
                  return (
                    <div
                      key={star}
                      className="flex items-center gap-2 text-xs text-gray-500"
                    >
                      <span className="w-10 text-right">{star}★</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-10 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Konten Ulasan */}
      {activeSection === "reviews" && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] gap-6">
          {/* Daftar ulasan */}
          <div className="space-y-4">
            {loadingReviews ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-gray-500">
                Memuat ulasan...
              </div>
            ) : localReviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-gray-500">
                Belum ada ulasan. Jadilah yang pertama menulis review!
              </div>
            ) : (
              localReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() =>
                        rev.isAnonymous
                          ? null
                          : onUserClick && onUserClick(rev.userId)
                      }
                      className={`flex items-center gap-3 ${
                        rev.isAnonymous ? "" : "hover:opacity-80"
                      }`}
                    >
                      <img
                        src={rev.userAvatar}
                        alt={rev.userName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900">
                          {rev.userName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {rev.date
                            ? new Date(rev.date).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "Baru saja"}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 text-yellow-500 text-sm">
                      <StarRating value={rev.rating} size="sm" />
                      <span className="text-xs font-semibold text-gray-700">
                        {rev.rating?.toFixed ? rev.rating.toFixed(1) : rev.rating}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">
                    {rev.comment}
                  </p>

                  {rev.photos && rev.photos.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {rev.photos.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0"
                        >
                          <img
                            src={url}
                            alt={`Foto review ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <button
                      onClick={() => handleLikeReview(rev.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-gray-200 hover:border-rose-500 hover:text-rose-600 transition text-xs"
                    >
                      👍{" "}
                      <span className="font-medium">
                        Bantu ({rev.likes || 0})
                      </span>
                    </button>
                  </div>
                </div>
              ))
            )}

            {reviewsError && (
              <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-lg">
                {reviewsError}
              </div>
            )}
          </div>

          {/* Form tambah ulasan */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-3">
              Tulis Ulasanmu
            </h3>

            {!user && (
              <div className="mb-3 text-xs text-gray-600 bg-gray-50 border border-dashed border-gray-200 px-3 py-2 rounded-lg">
                Kamu perlu login sebelum bisa menulis ulasan.
              </div>
            )}

            {submitError && (
              <div className="mb-2 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="mb-2 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                {submitSuccess}
              </div>
            )}

            <form
              className="space-y-4 mt-2"
              onSubmit={handleSubmitReview}
            >
              {/* Rating */}
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">
                  Rating
                </p>
                <StarRating
                  value={newRating}
                  onChange={setNewRating}
                  interactive
                />
              </div>

              {/* Komentar */}
              <div>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                  rows={4}
                  placeholder="Ceritakan pengalamanmu makan di sini..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </div>

              {/* Upload foto */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">
                  Tambah Foto (opsional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center px-3 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-600 cursor-pointer hover:border-rose-500 hover:text-rose-600">
                    📷 Upload Foto
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleMediaChange}
                    />
                  </label>
                  {mediaPreviewUrl && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={mediaPreviewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">
                  Maksimal 1 foto untuk demo ini. Foto akan di-upload ke
                  Supabase Storage.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-rose-600"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  Tampilkan sebagai anonim
                </label>

                <button
                  type={user ? "submit" : "button"}
                  onClick={
                    user ? undefined : () => onAuthRequest && onAuthRequest()
                  }
                  disabled={submittingReview}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-semibold shadow hover:bg-rose-700 disabled:opacity-70"
                >
                  {submittingReview ? "Mengirim..." : "Kirim Ulasan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
