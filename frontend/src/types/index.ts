export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: number;
  name: string;
  category: 'ski' | 'snowboard' | 'boots' | 'helmet' | 'clothing';
  size: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  daily_rate: number;
  total_quantity: number;
  available_quantity: number;
  description: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: number;
  user_id: number;
  equipment_id: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
  equipment_name?: string;
  category?: string;
  size?: string;
  image_url?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface CreateReservationRequest {
  equipment_id: number;
  start_date: string;
  end_date: string;
  notes?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
} 