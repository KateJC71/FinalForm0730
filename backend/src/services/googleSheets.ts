import axios from 'axios';

interface RenterData {
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  shoeSize: number;
  skillLevel: string;
  skiType: string;
  boardType: string;
  equipmentType: string;
  clothingOption: string;
  helmet: boolean;
  fase: boolean;
  prices: {
    mainEquipment: number;
    boots: number;
    clothing: number;
    helmet: number;
    fase: number;
    subtotal: number;
  };
}

interface ApplicantData {
  name: string;
  phone: string;
  email: string;
  messagingApp: {
    type: string;
    id: string;
  };
  hotel: string;
  transportation: {
    required: boolean;
    details: string[];
  };
}

interface ReservationData {
  reservation_number?: string;
  bookingDate?: string;
  rentalDate: string;
  returnDate: string;
  pickup_date?: string;
  pickup_time?: string;
  pickupLocation: string;
  returnLocation: string;
  rentalDays: number;
  differentLocation?: boolean;
  applicant?: any;
  renters?: any[];
  totalAmount: number;
  discountCode?: string;
  discountAmount?: number;
  originalAmount?: number;
  note?: string;
}

class GoogleSheetsService {
  private gasUrl: string;

  constructor() {
    this.gasUrl = '';
    this.initializeUrl();
  }

  private initializeUrl() {
    this.gasUrl = process.env.GOOGLE_SHEETS_URL || '';
    if (!this.gasUrl) {
      console.warn('⚠️  GOOGLE_SHEETS_URL not configured. Google Sheets integration disabled.');
    } else {
      console.log('✅ Google Sheets URL configured:', this.gasUrl);
    }
  }

  private ensureUrlLoaded() {
    if (!this.gasUrl) {
      this.initializeUrl();
    }
  }

  async sendReservationToSheets(reservationData: ReservationData): Promise<boolean> {
    this.ensureUrlLoaded();
    if (!this.gasUrl) {
      console.log('📝 Google Sheets URL not configured, skipping sheets integration');
      return false;
    }

    try {
      console.log('📊 Sending reservation data to Google Sheets...');
      
      console.log('📤 Sending data to Google Sheets URL:', this.gasUrl);
      console.log('📦 Complete data being sent:', JSON.stringify(reservationData, null, 2));
      
      // Debug field mapping
      console.log('🔍 Field mapping check:');
      console.log('  - reservation_number:', reservationData.reservation_number);
      console.log('  - bookingDate:', reservationData.bookingDate);
      console.log('  - discountCode:', reservationData.discountCode);
      console.log('  - totalAmount:', reservationData.totalAmount);
      console.log('  - applicant structure:', reservationData.applicant);
      console.log('  - renters count:', reservationData.renters?.length || 0);
      
      const response = await axios.post(
        this.gasUrl,
        reservationData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 seconds timeout
        }
      );

      console.log('📨 Google Sheets response:', response.data);
      
      if (response.data?.success) {
        console.log('✅ Reservation data successfully sent to Google Sheets');
        console.log('📋 Reservation ID:', response.data.reservationId);
        return true;
      } else {
        console.error('❌ Google Sheets returned error:', response.data?.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to send data to Google Sheets:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.error('⏱️  Request timeout - Google Sheets may be slow');
        } else if (error.response) {
          console.error('📨 Response status:', error.response.status);
          console.error('📨 Response data:', error.response.data);
        } else if (error.request) {
          console.error('🌐 No response received from Google Sheets');
        }
      }
      
      return false;
    }
  }

  // Convert your current reservation format to GAS expected format
  convertReservationToGASFormat(
    reservationData: any, 
    frontendData: any, 
    equipmentData: any
  ) {
    // Calculate rental days (包含開始和結束日期)
    const startDate = new Date(reservationData.start_date);
    const endDate = new Date(reservationData.end_date);
    const rentalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Process all participants (up to 10) for GAS format
    const renters = [];
    const participants = frontendData.persons || [];
    const detailData = frontendData.detail || [];
    
    for (let i = 0; i < Math.min(participants.length, 10); i++) {
      const person = participants[i];
      const personDetail = detailData[i] || {};

      const renter = {
        name: person.name || `參加者${i + 1}`,
        age: person.age || 25,
        gender: person.gender || '未指定',
        height: person.height || 170,
        weight: person.weight || 65,
        shoeSize: person.footSize || 26,
        skillLevel: person.level || '中級',
        skiType: person.skiType || '雙板',
        boardType: person.boardType || '一般',
        equipmentType: person.equipType || '大全配',
        clothingOption: person.clothingType || '否',
        helmet: person.helmetOnly || '',    // 直接傳送前端選擇的值
        fase: person.fastWear || ''         // 直接傳送前端選擇的值
      };
      
      renters.push(renter);
    }

    // 使用前端傳來的總金額
    let totalAmount = reservationData.total_price || 0;
    if (totalAmount === 0 && frontendData.price) {
      totalAmount = frontendData.price;
    }

    // 處理折扣碼資訊
    const discountCode = frontendData.discountCode || reservationData.discount_code || '';
    const discountAmount = frontendData.discountAmount || reservationData.discount_amount || 0;
    const originalAmount = frontendData.originalPrice || reservationData.original_price || totalAmount;

    console.log('💰 Final amount for Google Sheets:', {
      totalAmount,
      originalAmount,
      discountCode,
      discountAmount
    });

    // 返回完全符合 GAS 腳本期望的扁平化格式
    return {
      reservation_number: reservationData.reservation_number,
      bookingDate: new Date().toISOString().split('T')[0], // 預約日期（今天）
      rentalDate: reservationData.start_date,
      returnDate: reservationData.end_date,
      pickup_date: reservationData.pickup_date,
      pickup_time: reservationData.pickup_time,
      pickupLocation: reservationData.pickupLocation || '富良野店',
      returnLocation: reservationData.returnLocation || '富良野店',
      rentalDays,
      differentLocation: (reservationData.pickupLocation || '富良野店') !== (reservationData.returnLocation || '富良野店'),
      // 扁平化申請人資料以匹配 GAS 腳本
      applicant: {
        name: frontendData.applicant?.name || '',
        phone: `${frontendData.applicant?.countryCode || ''} ${frontendData.applicant?.phone || ''}`.trim(),
        email: frontendData.applicant?.email || '',
        messagingApp: {
          type: frontendData.applicant?.messenger || 'Email',
          id: frontendData.applicant?.messengerId || frontendData.applicant?.email || ''
        },
        hotel: frontendData.applicant?.hotel || '',
        transportation: {
          required: frontendData.applicant?.shuttleMode === 'need',
          details: frontendData.applicant?.shuttle || []
        }
      },
      renters,
      // 確保這兩個欄位的順序和名稱正確
      discountCode: discountCode || '', // R列: 折扣碼（確保不是 undefined）
      totalAmount: totalAmount,         // S列: 總金額
      // 這些欄位不需要傳給 Google Sheets，已移除
      // discountAmount: discountAmount,
      // originalAmount: originalAmount,
      note: reservationData.notes || ''
    };
  }

  // Test connection to Google Sheets
  async testConnection(): Promise<boolean> {
    this.ensureUrlLoaded();
    if (!this.gasUrl) {
      console.log('📝 Google Sheets URL not configured');
      return false;
    }

    try {
      // Send a simple test request
      const testData = {
        test: true,
        timestamp: new Date().toISOString()
      };

      const response = await axios.post(this.gasUrl, testData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });

      console.log('🔗 Google Sheets connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Google Sheets connection test failed:', error);
      return false;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
export { ReservationData, ApplicantData, RenterData };