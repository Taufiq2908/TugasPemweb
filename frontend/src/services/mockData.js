export const CITIES = ['Makassar', 'Jakarta', 'Bandung', 'Yogyakarta', 'Surabaya'];

export const RESTAURANTS = [
  // Makassar
  {
    id: 'mks-1',
    name: 'Coto Nusantara',
    description: 'Warung Coto Makassar legendaris dengan kuah kental yang kaya rempah.',
    city: 'Makassar',
    category: 'Tradisional',
    priceRange: 'Sedang',
    rating: 4.8,
    reviews: 1240,
    imageUrl: 'https://picsum.photos/800/600?random=1',
    address: 'Jl. Nusantara No. 32, Makassar',
    coordinates: { lat: -5.147665, lng: 119.432731 },
    openHours: '08:00 - 22:00',
    facilities: ['Parkir Luas', 'AC', 'Toilet Bersih']
  },
  {
    id: 'mks-2',
    name: 'Pallubasa Serigala',
    description: 'Hidangan daging sapi dengan kelapa sangrai khas Makassar.',
    city: 'Makassar',
    category: 'Tradisional',
    priceRange: 'Sedang',
    rating: 4.7,
    reviews: 980,
    imageUrl: 'https://picsum.photos/800/600?random=2',
    address: 'Jl. Serigala No. 54, Makassar',
    coordinates: { lat: -5.1587, lng: 119.4156 },
    openHours: '09:00 - 21:00',
    facilities: ['Outdoor', 'Parkir Luas']
  },
  // Jakarta
  {
    id: 'jkt-1',
    name: 'Sate Khas Senayan',
    description: 'Restoran keluarga menyajikan sate ayam dan kambing premium.',
    city: 'Jakarta',
    category: 'Indonesian',
    priceRange: 'Mahal',
    rating: 4.5,
    reviews: 500,
    imageUrl: 'https://picsum.photos/800/600?random=3',
    address: 'Jl. Kebon Sirih No. 31, Jakarta Pusat',
    coordinates: { lat: -6.182, lng: 106.83 },
    openHours: '10:00 - 22:00',
    facilities: ['AC', 'WiFi', 'VIP Room', 'Toilet Bersih', 'Musholla']
  },
  {
    id: 'jkt-2',
    name: 'Gado-Gado Bon Bin',
    description: 'Gado-gado legendaris di Cikini sejak tahun 1960.',
    city: 'Jakarta',
    category: 'Street Food',
    priceRange: 'Sedang',
    rating: 4.6,
    reviews: 320,
    imageUrl: 'https://picsum.photos/800/600?random=4',
    address: 'Jl. Cikini IV No. 5, Jakarta Pusat',
    coordinates: { lat: -6.19, lng: 106.84 },
    openHours: '09:00 - 17:00',
    facilities: ['Parkir Terbatas']
  },
  // Bandung
  {
    id: 'bdg-1',
    name: 'Batagor Kingsley',
    description: 'Batagor asli Bandung dengan bumbu kacang yang creamy.',
    city: 'Bandung',
    category: 'Snack',
    priceRange: 'Sedang',
    rating: 4.9,
    reviews: 2100,
    imageUrl: 'https://picsum.photos/800/600?random=5',
    address: 'Jl. Veteran No. 25, Bandung',
    coordinates: { lat: -6.917, lng: 107.619 },
    openHours: '08:00 - 20:00',
    facilities: ['Bawa Pulang', 'Toilet Bersih']
  },
  // Yogyakarta
  {
    id: 'yog-1',
    name: 'Gudeg Yu Djum',
    description: 'Gudeg kering khas Jogja yang manis dan gurih, oleh-oleh wajib.',
    city: 'Yogyakarta',
    category: 'Tradisional',
    priceRange: 'Sedang',
    rating: 4.7,
    reviews: 3500,
    imageUrl: 'https://picsum.photos/800/600?random=6',
    address: 'Jl. Wijilan No. 167, Yogyakarta',
    coordinates: { lat: -7.8, lng: 110.36 },
    openHours: '06:00 - 22:00',
    facilities: ['Lesehan', 'Musholla']
  },
  // Surabaya
  {
    id: 'sby-1',
    name: 'Rawon Setan',
    description: 'Rawon dengan potongan daging besar dan kuah hitam pekat pedas.',
    city: 'Surabaya',
    category: 'Tradisional',
    priceRange: 'Sedang',
    rating: 4.6,
    reviews: 1800,
    imageUrl: 'https://picsum.photos/800/600?random=7',
    address: 'Jl. Embong Malang No. 78, Surabaya',
    coordinates: { lat: -7.26, lng: 112.75 },
    openHours: '18:00 - 04:00',
    facilities: ['AC', 'Parkir Luas', 'Buka Malam']
  }
];

export const MOCK_USER_REVIEWS = [
  {
    id: 'rv-1',
    restaurantId: 'mks-1',
    restaurantName: 'Coto Nusantara',
    user: 'Anda',
    userLevel: 'Explorer',
    rating: 5,
    comment: 'Kuahnya mantap sekali! Dagingnya empuk.',
    date: '2024-05-10',
    likes: 12,
    dislikes: 0
  },
  {
    id: 'rv-2',
    restaurantId: 'bdg-1',
    restaurantName: 'Batagor Kingsley',
    user: 'Anda',
    userLevel: 'Explorer',
    rating: 4,
    comment: 'Enak tapi antriannya panjang banget pas weekend.',
    date: '2024-04-22',
    likes: 5,
    dislikes: 1
  }
];

export const getRestaurantReviews = (restaurantId) => {
  const restaurant = RESTAURANTS.find(r => r.id === restaurantId);
  const name = restaurant ? restaurant.name : 'Restoran';
  
  return [
    {
      id: `mock-1-${restaurantId}`,
      restaurantId,
      restaurantName: name,
      user: 'Mas Rusdi',
      userLevel: 'Legend',
      rating: 5,
      comment: 'Rasanya yahaha hayyuk banget! Wajib coba.',
      date: '2024-02-10',
      likes: 45,
      dislikes: 2,
      mediaUrl: 'https://picsum.photos/400/300?random=101'
    },
    {
      id: `mock-2-${restaurantId}`,
      restaurantId,
      restaurantName: name,
      user: 'Bukan Penimpa',
      userLevel: 'Foodie',
      rating: 4,
      comment: 'Tempatnya bersih, pelayanannya ramah.',
      date: '2024-01-25',
      likes: 12,
      dislikes: 0
    }
  ];
};

export const getUserProfile = (username) => {
    const levels = ['Newbie', 'Explorer', 'Foodie', 'Expert', 'Legend'];
    const cities = ['Makassar', 'Jakarta', 'Surabaya', 'Bandung', 'Yogyakarta'];
    const levelIndex = username.length % levels.length;
    const cityIndex = username.length % cities.length;
    
    return {
        name: username,
        email: 'hidden@email.com',
        city: cities[cityIndex],
        level: levels[levelIndex],
        joinDate: '2023',
        reviewCount: (username.length * 12) + 5,
        totalUpvotes: (username.length * 5) + 10
    };
};