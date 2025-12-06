// File: src/services/mockData.js

export const CITIES = ['Makassar', 'Jakarta', 'Bandung', 'Yogyakarta', 'Surabaya'];

export const RESTAURANTS = [
  {
    id: '1',
    name: 'Coto Nusantara',
    category: 'Traditional',
    rating: 4.8,
    reviews: 1240,
    imageUrl: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?q=80&w=600&auto=format&fit=crop',
    description: 'Coto Makassar legendaris dengan kuah kental yang kaya rempah. Pilihan daging lokal terbaik.',
    city: 'Makassar',
    address: 'Jl. Nusantara No. 32, Makassar',
    openHours: '08:00 - 22:00',
    priceRange: 'Sedang',
    coordinates: { lat: -5.147665, lng: 119.432731 }
  },
  {
    id: '2',
    name: 'Sate Khas Senayan',
    category: 'Sate',
    rating: 4.7,
    reviews: 890,
    imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=600&auto=format&fit=crop',
    description: 'Sate ayam dengan bumbu kacang yang lembut dan daging yang juicy.',
    city: 'Jakarta',
    address: 'Jl. Pakubuwono VI No. 6, Jakarta Selatan',
    openHours: '10:00 - 22:00',
    priceRange: 'Mahal',
    coordinates: { lat: -6.234567, lng: 106.891234 }
  },
  {
    id: '3',
    name: 'Gudeg Yu Djum',
    category: 'Traditional',
    rating: 4.9,
    reviews: 3500,
    imageUrl: 'https://images.unsplash.com/photo-1634818462211-536098006952?q=80&w=600&auto=format&fit=crop',
    description: 'Gudeg kering khas Jogja yang manis gurih, lengkap dengan krecek pedas.',
    city: 'Yogyakarta',
    address: 'Jl. Wijilan No. 167, Yogyakarta',
    openHours: '06:00 - 22:00',
    priceRange: 'Sedang',
    coordinates: { lat: -7.801234, lng: 110.364567 }
  },
   {
    id: '4',
    name: 'Pallubasa Serigala',
    category: 'Traditional',
    rating: 4.9,
    reviews: 2100,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
    description: 'Pallubasa otentik dengan taburan kelapa sangrai yang gurih.',
    city: 'Makassar',
    address: 'Jl. Serigala No. 54, Makassar',
    openHours: '10:00 - 23:00',
    priceRange: 'Murah',
    coordinates: { lat: -5.160123, lng: 119.418901 }
  }
];

export const MOCK_USER_REVIEWS = [
    {
      id: 'r1',
      restaurantName: 'Coto Nusantara',
      user: 'Budi Santoso',
      date: '2 Hari lalu',
      rating: 5,
      comment: 'Kuahnya mantap sekali! Dagingnya empuk.'
    },
    {
        id: 'r2',
        restaurantName: 'Gudeg Yu Djum',
        user: 'Siti Aminah',
        date: '1 Minggu lalu',
        rating: 4,
        comment: 'Antriannya panjang tapi worth it.'
    }
];

// Helper function untuk detail restoran
export const getRestaurantReviews = (id) => {
    // Di aplikasi nyata, ini akan filter berdasarkan ID restoran
    return [
        {
            id: 'rev1',
            user: 'Pengunjung 1',
            date: 'Kemarin',
            rating: 5,
            comment: 'Sangat direkomendasikan!'
        },
        {
            id: 'rev2',
            user: 'Pengunjung 2',
            date: '3 Hari lalu',
            rating: 4,
            comment: 'Enak tapi agak pedas.'
        }
    ];
};