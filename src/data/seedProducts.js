const products = [

  // ===== GOLD COLLECTION =====

  {
    id: 1,
    name: "Classic Gold Necklace",
    slug: "classic-gold-necklace",
    category: "Necklace",
    price: 125000,
    material: "22K Gold",
    weight: "22g",
    stock: 5,
    nonReturnable: false,
    rating: 0,
    reviewCount: 0,
    isTopSelling: false,
    isNewArrival: true,
    images: [
      "/images/necklace1.jpg",
      "/images/necklace2.jpg"
    ],
    shortDescription:
      "Elegant 22K gold necklace perfect for traditional occasions.",
    description:
      "This handcrafted 22K gold necklace features intricate detailing inspired by traditional South Indian bridal designs.",
    details: [
      "22K Hallmarked Gold",
      "Traditional South Indian Design",
      "Perfect for weddings & special occasions",
      "Premium handcrafted finish"
    ]
  },

  {
    id: 2,
    name: "Diamond Bridal Set",
    slug: "diamond-bridal-set",
    category: "Bridal Set",
    price: 285000,
    material: "18K Gold with Certified Diamonds",
    weight: "35g",
    stock: 3,
    nonReturnable: false,
    rating: 0,
    reviewCount: 0,
    isTopSelling: true,
    isNewArrival: false,
    images: [
      "/images/bridal1.jpg",
      "/images/bridal2.jpg"
    ],
    shortDescription:
      "Premium diamond bridal set for wedding collections.",
    description:
      "Luxury bridal set crafted with certified diamonds and 18K gold base.",
    details: [
      "Certified Diamonds",
      "18K Gold Base",
      "Bridal premium collection",
      "Elegant finishing"
    ]
  },

  {
    id: 3,
    name: "Gold Bangles Pair",
    slug: "gold-bangles-pair",
    category: "Bangles",
    price: 89000,
    material: "22K Gold",
    weight: "18g",
    stock: 8,
    nonReturnable: false,
    rating: 0,
    reviewCount: 0,
    isTopSelling: false,
    isNewArrival: true,
    images: [
      "/images/bangles1.jpg"
    ],
    shortDescription:
      "Minimal gold bangles suitable for daily wear.",
    description:
      "Simple yet elegant 22K gold bangles designed for comfort and durability.",
    details: [
      "22K Hallmarked Gold",
      "Lightweight daily wear",
      "Comfort-fit design",
      "Durable craftsmanship"
    ]
  },

  // ===== 1 GRAM GOLD POLISH =====

  {
    id: 4,
    name: "1-Gram Gold Plated Kemp and AD Stone Manga Necklace",
    slug: "1-gram-gold-plated-kemp-ad-manga-necklace",
    category: "1 Gram Gold Polish Necklace",
    price: 3890,
    originalPrice: 4500,
    material: "1 Gram Gold Polish",
    weight: "22g",
    stock: 5,
    nonReturnable: true,
    rating: 0,
    reviewCount: 0,
    isTopSelling: true,
    isNewArrival: false,
    images: [
      "https://cdn1.zohoecommerce.com/product-images/mango+1.jpg/5668212000001458052/800x800?storefront_domain=www.sagunthalajewellers.com",
      "https://cdn1.zohoecommerce.com/product-images/mango.jpg/5668212000001458055/800x800?storefront_domain=www.sagunthalajewellers.com"
    ],
    shortDescription:
      "Exquisite 1-gram gold plated temple jewellery with Kemp and American Diamond stones.",
    description:
      "Antique temple finish design crafted with vibrant Kemp stones and brilliant American Diamonds for timeless elegance.",
    details: [
      "Durable copper base",
      "Premium 1-gram gold polish coating",
      "Temple antique finish",
      "Handcrafted Kemp stones",
      "High-grade American Diamonds"
    ]
  },

  // ===== STUDS =====

  {
    id: 5,
    name: "7 Stone Diamond Big Studs",
    slug: "7-stone-diamond-big-studs",
    category: "Studs",
    price: 599,
    originalPrice: 1000,
    material: "Gold Finish with American Diamonds",
    weight: "Lightweight",
    stock: 20,
    nonReturnable: true,
    rating: 0,
    reviewCount: 0,
    isTopSelling: true,
    isNewArrival: true,
    images: [
      "https://cdn1.zohoecommerce.com/product-images/IMG_8822.jpg/5668212000001584070/600x600?storefront_domain=www.sagunthalajewellers.com",
      "https://cdn1.zohoecommerce.com/product-images/big+stud.png/5668212000001572207/800x800?storefront_domain=www.sagunthalajewellers.com"
    ],
    shortDescription:
      "Premium big 7-Stone Diamond Studs crafted in high-shine gold finish.",
    description:
      "Bold floral shine studs set with premium American Diamond (CZ) stones, perfect for bridal and festive wear.",
    details: [
      "Premium gold polish",
      "High-grade CZ stones",
      "Bridal & festive wear",
      "Lightweight comfort"
    ]
  },

  // ===== STUD ATTACHERS =====

  {
    id: 6,
    name: "Round Ruby Stud Attacher – Premium Gold Finish",
    slug: "round-ruby-stud-attacher",
    category: "Stud Attachments",
    price: 299,
    originalPrice: 500,
    material: "Gold Polish with Ruby Stones",
    weight: "Lightweight",
    stock: 30,
    nonReturnable: true,
    rating: 0,
    reviewCount: 0,
    isTopSelling: true,
    isNewArrival: false,
    images: [
      "https://cdn1.zohoecommerce.com/product-images/IMG_8868.jpg/5668212000001822593/800x800?storefront_domain=www.sagunthalajewellers.com"
    ],
    shortDescription:
      "Round ruby stone attacher for bridal and temple jewellery styling.",
    description:
      "Gold-polished copper base surrounded by vibrant ruby-toned stones arranged in a halo pattern.",
    details: [
      "Premium gold polish",
      "Ruby halo design",
      "Compatible with all studs",
      "Temple & dance styling"
    ]
  },

  {
    id: 7,
    name: "Ruby Stone Stud Attacher – Premium Gold Finish",
    slug: "ruby-stone-stud-attacher",
    category: "Stud Attachments",
    price: 299,
    originalPrice: 500,
    material: "Gold Polish with Ruby Stones",
    weight: "Lightweight",
    stock: 25,
    nonReturnable: true,
    rating: 0,
    reviewCount: 0,
    isTopSelling: false,
    isNewArrival: true,
    images: [
      "https://cdn1.zohoecommerce.com/product-images/IMG_8382.jpg/5668212000001120063/800x800?storefront_domain=www.sagunthalajewellers.com"
    ],
    shortDescription:
      "Elegant ruby stud attacher for a fuller traditional look.",
    description:
      "Half-crescent ruby stone design crafted in premium gold polish for bridal and temple aesthetics.",
    details: [
      "Half-crescent ruby pattern",
      "Premium gold polish",
      "Enhances all stud types",
      "Traditional South Indian look"
    ]
  }

];

export default products;