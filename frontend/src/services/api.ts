import axios from 'axios';
import { 
  User, 
  Equipment, 
  Reservation, 
  LoginRequest, 
  RegisterRequest, 
  CreateReservationRequest,
  AuthResponse 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器：添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 響應攔截器：處理錯誤
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 身份驗證 API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
};

// 雪具 API
export const equipmentAPI = {
  getAll: async (params?: { category?: string; size?: string }): Promise<Equipment[]> => {
    const response = await api.get('/equipment', { params });
    return response.data;
  },
  
  getById: async (id: number): Promise<Equipment> => {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },
  
  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/equipment/categories/list');
    return response.data;
  },
  
  getSizes: async (): Promise<string[]> => {
    const response = await api.get('/equipment/sizes/list');
    return response.data;
  },
};

// 預約 API
export const reservationAPI = {
  create: async (data: CreateReservationRequest): Promise<{ message: string; reservation_id: number; total_price: number }> => {
    const response = await api.post('/reservations', data);
    return response.data;
  },
  
  getMyReservations: async (): Promise<Reservation[]> => {
    const response = await api.get('/reservations/my');
    return response.data;
  },
  
  cancel: async (id: number): Promise<{ message: string }> => {
    const response = await api.patch(`/reservations/${id}/cancel`);
    return response.data;
  },
};

export async function submitReservation(data: any) {
  console.log('🚀 Frontend submitting data:', data);
  console.log('🔍 Frontend discount info check:', {
    discountCode: data.discountCode,
    discountAmount: data.discountAmount,
    originalPrice: data.originalPrice,
    applicantDiscountCode: data.applicant?.discountCode
  });
  
  // Transform frontend data to backend format
  const backendData = {
    user_name: data.applicant?.name || '',
    user_email: data.applicant?.email || '',
    user_phone: `${data.applicant?.countryCode || ''} ${data.applicant?.phone || ''}`.trim(),
    hotel: data.applicant?.hotel || '',
    equipment_id: 1, // Default equipment ID - you may need to adjust this
    start_date: data.startDate,
    end_date: data.endDate,
    pickup_date: data.pickupDate,
    pickup_time: data.pickupTime,
    pickupLocation: data.rentStore || '富良野店',
    returnLocation: data.returnStore || '富良野店',
    notes: data.detail || '',
    // 使用前端計算的總金額
    total_price: data.price || 0,
    // 折扣碼相關資訊
    originalPrice: data.originalPrice || data.price || 0,
    discountCode: data.discountCode || data.applicant?.discountCode || '',
    discountAmount: data.discountAmount || 0,
    // 處理接送服務資料
    pickup_service: data.applicant?.shuttleMode === 'need',
    pickup_location: data.applicant?.shuttleMode === 'need' ? data.applicant?.shuttle?.join('、') || '' : '',
    return_location: data.returnStore || '富良野店',
    // Include complete frontend data for Google Sheets (contains all persons data)
    frontendData: data,
    // Add all persons data for backend processing
    persons: data.persons || [],
    // Keep first person's basic data for backward compatibility
    age: data.persons?.[0]?.age || 25,
    gender: data.persons?.[0]?.gender || '未指定',
    height: data.persons?.[0]?.height || 170,
    weight: data.persons?.[0]?.weight || 65,
    shoeSize: data.persons?.[0]?.shoeSize || 26
  };

  console.log('📤 Sending to backend with discount info:', {
    total_price: backendData.total_price,
    originalPrice: backendData.originalPrice,
    discountCode: backendData.discountCode,
    discountAmount: backendData.discountAmount
  });
  
  console.log('📦 Complete backend data being sent:', JSON.stringify(backendData, null, 2));

  const res = await fetch(`${API_BASE_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backendData),
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.error('Backend error:', errorData);
    throw new Error('送出失敗');
  }
  return res.json();
}

export default api; 