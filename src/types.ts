export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Part {
  id: number;
  part_name: string;
  price: number;
  stock: number;
  category: string;
  shop: {
    id: number;
    name: string;
    address: string;
    location: string;
    latitude: number;
    longitude: number;
  };
}

export interface MechanicPlace {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface OrderResponse {
  success: boolean;
  message: string;
  totalPrice?: number;
}
