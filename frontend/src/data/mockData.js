export const mockUser = {
  name: 'Andi Makassar',
  email: 'andi@example.com',
  level: 'Explorer',
  joinDate: 'Januari 2024',
  reviewCount: 12
};

export const mockRestaurants = [
  {
    id: '1',
    name: 'Coto Nusantara',
    category: 'Traditional',
    rating: 4.8,
    reviews: 1240,
    imageUrl: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?q=80&w=600&auto=format&fit=crop', // Gambar contoh
    description: 'Coto Makassar legendaris dengan kuah kental yang kaya rempah. Pilihan daging lokal terbaik disajikan dengan ketupat.',
    city: 'Makassar',
    address: 'Jl. Nusantara No. 32, Makassar',
    openHours: '08:00 - 22:00',
    priceRange: 'Sedang',
    coordinates: { lat: -5.147665, lng: 119.432731 }
  },
  {
    id: '2',
    name: 'Pallubasa Serigala',
    category: 'Traditional',
    rating: 4.9,
    reviews: 2100,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
    description: 'Pallubasa otentik dengan taburan kelapa sangrai yang gurih. Wajib coba pakai telur mentah (alas).',
    city: 'Makassar',
    address: 'Jl. Serigala No. 54, Makassar',
    openHours: '10:00 - 23:00',
    priceRange: 'Murah',
    coordinates: { lat: -5.160123, lng: 119.418901 }
  },
  {
    id: '3',
    name: 'Seafood Apong',
    category: 'Seafood',
    rating: 4.7,
    reviews: 850,
    imageUrl: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=600&auto=format&fit=crop',
    description: 'Ikan bakar parape terbaik di kota ini. Segar dan bumbunya meresap sampai ke tulang.',
    city: 'Makassar',
    address: 'Jl. Boulevard, Panakkukang',
    openHours: '11:00 - 23:00',
    priceRange: 'Mahal',
    coordinates: { lat: -5.155555, lng: 119.444444 }
  }
];

export const mockReviews = [
  {
    id: 'r1',
    restaurantId: '1',
    user: 'Budi Santoso',
    date: '2 Hari lalu',
    rating: 5,
    comment: 'Kuahnya mantap sekali! Dagingnya empuk.'
  },
  {
    id: 'r2',
    restaurantId: '1',
    user: 'Siti Aminah',
    date: '1 Minggu lalu',
    rating: 4,
    comment: 'Enak, tapi antriannya panjang banget pas jam makan siang.'
  }
];