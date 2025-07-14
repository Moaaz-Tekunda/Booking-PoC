// Utility for generating placeholder hotel images
export const generateHotelImages = (hotelId: string, hotelName: string): string[] => {
  // Use Unsplash for high-quality hotel images
  const baseUrl = 'https://images.unsplash.com';
  const imageParams = '?auto=format&fit=crop&w=800&q=80';
  
  // Create a simple hash from hotel ID for consistent image selection
  const hash = hotelId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Hotel image categories with specific photo IDs for consistency
  const hotelImages = [
    // Luxury hotels
    `${baseUrl}/photo-1566073771259-6a8506099945${imageParams}`, // Luxury hotel lobby
    `${baseUrl}/photo-1571003123894-1f0594d2b5d9${imageParams}`, // Hotel room
    `${baseUrl}/photo-1578661996442-374dcbcf39e8${imageParams}`, // Hotel exterior
    `${baseUrl}/photo-1520250497591-112f2f40a3f4${imageParams}`, // Hotel restaurant
    `${baseUrl}/photo-1564501049412-61c2a3083791${imageParams}`, // Hotel pool
    
    // Boutique hotels
    `${baseUrl}/photo-1582719478250-c89cae4dc85b${imageParams}`, // Boutique hotel room
    `${baseUrl}/photo-1581974267369-3f2fe3b4545c${imageParams}`, // Hotel lounge
    `${baseUrl}/photo-1563013544-824ae1b704d3${imageParams}`, // Hotel balcony
    `${baseUrl}/photo-1571896349842-33c89424de2d${imageParams}`, // Hotel bathroom
    `${baseUrl}/photo-1590490360182-c33d57733427${imageParams}`, // Hotel reception
    
    // Modern hotels
    `${baseUrl}/photo-1542314831-068cd1dbfeeb${imageParams}`, // Modern hotel exterior
    `${baseUrl}/photo-1561501900-3701fa6a0864${imageParams}`, // Modern hotel room
    `${baseUrl}/photo-1576013551627-0cc20b96c2a7${imageParams}`, // Hotel gym
    `${baseUrl}/photo-1571019613454-1cb2f99b2d8b${imageParams}`, // Hotel spa
    `${baseUrl}/photo-1586611292717-f828b167408c${imageParams}`, // Hotel conference room
    
    // Resort hotels
    `${baseUrl}/photo-1577740195269-7c0d8b74e5a8${imageParams}`, // Resort exterior
    `${baseUrl}/photo-1570197788417-0e82375c9371${imageParams}`, // Resort pool area
    `${baseUrl}/photo-1544717297-fa95b6ee9643${imageParams}`, // Resort beach view
    `${baseUrl}/photo-1602217294988-ad9219739b3e${imageParams}`, // Resort room
    `${baseUrl}/photo-1571019613454-1cb2f99b2d8b${imageParams}`, // Resort lobby
  ];
  
  // Select 3-5 images based on hotel hash for consistency
  const imageCount = 3 + (hash % 3); // 3-5 images
  const selectedImages: string[] = [];
  
  for (let i = 0; i < imageCount; i++) {
    const index = (hash + i) % hotelImages.length;
    selectedImages.push(hotelImages[index]);
  }
  
  return selectedImages;
};

// Fallback for when no images are available
export const getPlaceholderImage = (hotelName: string): string => {
  return `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80`;
};

// Get rating for hotel (placeholder function)
export const generateHotelRating = (hotelId: string): number => {
  const hash = hotelId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 3.5 + (hash % 15) / 10; // Rating between 3.5 and 5.0
};

// Get price per night (placeholder function)
export const generateHotelPrice = (hotelId: string, city: string): number => {
  const hash = hotelId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const cityHash = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Base price varies by location
  let basePrice = 80;
  const cityLower = city.toLowerCase();
  
  if (['new york', 'london', 'paris', 'tokyo'].some(c => cityLower.includes(c))) {
    basePrice = 200;
  } else if (['dubai', 'singapore', 'hong kong'].some(c => cityLower.includes(c))) {
    basePrice = 150;
  } else if (['bangkok', 'cairo', 'budapest'].some(c => cityLower.includes(c))) {
    basePrice = 60;
  }
  
  // Add variation based on hotel hash
  const variation = (hash + cityHash) % 100;
  return Math.round(basePrice + variation);
};
