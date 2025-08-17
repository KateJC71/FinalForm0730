import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { submitReservation } from '../services/api';

const initialPerson = {
  name: '',
  age: '',
  gender: '',
  height: '',
  weight: '',
  footSize: '',
  level: '',
  skiType: '',
  boardType: '',
  equipType: '',
  clothingType: '',
  helmetOnly: '',
  fastWear: '',
};

const levels = ['初學者', '經驗者', '黑線順滑'];
const skiTypes = ['單板', '雙板'];
const boardTypes = ['一般標準板', '進階板(紅線順滑)', '粉雪板(全山滑行)'];
const equipTypes = ['大全配 (板+靴+雪衣&雪褲+安全帽)', '板+靴', '僅租雪板'];
const clothingTypes = ['單租雪衣', '單租雪褲', '租一整套(雪衣及雪褲)', '否'];
const yesNo = ['是', '否'];
const storeOptions = ['富良野店', '旭川店'];

// 獲取12/1開始的最小日期
const getMinReservationDate = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  // 如果現在已經是12月1日或之後，使用當天的日期
  if (currentMonth === 11) {
    // 已經是12月，使用當天日期
    return today.toISOString().split('T')[0];
  } else if (currentMonth < 11) {
    // 12月之前，使用當年的12/1（作為未來日期）
    return `${currentYear}-12-01`;
  } else {
    // 其他情況（不太可能發生），使用下一年12/1
    return `${currentYear + 1}-12-01`;
  }
};

// 獲取取件日期的範圍（開始日當天或前一天）
const getPickupDateRange = (startDate: string) => {
  if (!startDate) return { min: '', max: '' };
  
  const start = new Date(startDate);
  const dayBefore = new Date(start);
  dayBefore.setDate(start.getDate() - 1);
  
  return {
    min: dayBefore.toISOString().split('T')[0],
    max: startDate
  };
};

// 根據取件日期和取件店決定可選的時間
const getAvailablePickupTimes = (pickupDate: string, startDate: string, rentStore: string) => {
  // 富良野店時間選項（08:00開始）
  const furanoAllTimes = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '17:30'
  ];
  
  const furanoAfternoonTimes = [
    '14:00', '15:00', '16:00', '17:00', '17:30'
  ];
  
  // 旭川店時間選項（07:30開始）
  const asahikawaAllTimes = [
    '07:30', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '18:30'
  ];
  
  const asahikawaAfternoonTimes = [
    '14:00', '15:00', '16:00', '17:00', '18:00', '18:30'
  ];
  
  // 根據店鋪選擇時間選項
  const allTimes = rentStore === '旭川店' ? asahikawaAllTimes : furanoAllTimes;
  const afternoonTimes = rentStore === '旭川店' ? asahikawaAfternoonTimes : furanoAfternoonTimes;
  
  if (!pickupDate || !startDate) return allTimes;
  
  // 如果取件日期是開始日期的前一天，只能選擇14:00之後的時間
  const pickup = new Date(pickupDate);
  const start = new Date(startDate);
  const dayBefore = new Date(start);
  dayBefore.setDate(start.getDate() - 1);
  
  if (pickupDate === dayBefore.toISOString().split('T')[0]) {
    return afternoonTimes;
  }
  
  return allTimes;
};

// 價格表型別定義
interface PriceTable {
  adult: {
    standard: Record<'大全配' | '板靴組' | '單租雪板', number[]>;
    advanced: Record<'大全配' | '板靴組' | '單租雪板', number[]>;
    powder: Record<'大全配' | '板靴組' | '單租雪板', number[]>;
    boots: number[];
    clothingSet: number[];
    clothingSingle: number[];
  };
  child: {
    standard: Record<'大全配' | '板靴組' | '單租雪板', number[]>;
    boots: number[];
    clothingSet: number[];
    clothingSingle: number[];
  };
  helmet: number[];
  pole: number[];
  fase: number[];
  crossReturn: number;
}

const priceTable: PriceTable = {
  adult: {
    standard: {
      '大全配':    [12000, 18000, 23000, 28000, 33000, 4000],
      '板靴組':    [8000, 14000, 19000, 24000, 29000, 4000],
      '單租雪板':  [6500, 11500, 16500, 21500, 26500, 4000],
    },
    advanced: {
      '大全配':    [14000, 21500, 28000, 34500, 41000, 5000],
      '板靴組':    [10000, 17500, 24000, 30500, 37000, 5000],
      '單租雪板':  [8500, 15000, 21500, 28000, 34500, 5000],
    },
    powder: {
      '大全配':    [16500, 26000, 34000, 42000, 50000, 6500],
      '板靴組':    [12500, 22000, 30000, 38000, 46000, 6500],
      '單租雪板':  [11000, 19000, 26500, 34000, 42000, 6500],
    },
    boots: [3500, 5500, 7500, 9000, 10500, 1000],
    clothingSet: [5000, 9000, 10500, 12000, 14000, 1500],
    clothingSingle: [3000, 5000, 6500, 8000, 9500, 700],
  },
  child: {
    standard: {
      '大全配':    [9000, 13000, 16000, 19000, 22000, 3000],
      '板靴組':    [6000, 10000, 13000, 16000, 19000, 3000],
      '單租雪板':  [5000, 8500, 11500, 14500, 17500, 3000],
    },
    boots: [2800, 4400, 6000, 7200, 8400, 800],
    clothingSet: [3000, 5000, 6000, 7000, 9500, 700],
    clothingSingle: [2000, 3500, 4000, 4500, 5500, 400],
  },
  helmet: [1500, 2500, 3500, 4000, 4500, 500],
  pole: [500, 1000, 1200, 1400, 1900, 100],
  fase: [2000, 2000, 2000, 2000, 2000, 2000],
  crossReturn: 3000,
};

function getDays(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const days = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return days > 0 ? days : 1;
}

function getPriceIndex(days: number) {
  if (days <= 1) return 0;
  if (days === 2) return 1;
  if (days === 3) return 2;
  if (days === 4) return 3;
  if (days === 5) return 4;
  return 4; // 5天以上先用5天價，追加天數另外加
}

// 檢查第1步未填欄位
function getMissingStep1Fields(data: {
  startDate: string;
  endDate: string;
  rentStore: string;
  returnStore: string;
  pickupDate: string;
  pickupTime: string;
}) {
  const missing = [];
  if (!data.startDate) missing.push('開始日期');
  if (!data.endDate) missing.push('結束日期');
  if (!data.rentStore) missing.push('租借地點');
  if (!data.returnStore) missing.push('歸還地點');
  if (!data.pickupDate) missing.push('取件日期');
  if (!data.pickupTime) missing.push('取件時間');
  return missing;
}

// 檢查申請人未填欄位
function getMissingApplicantFields(applicant: any) {
  const missing = [];
  if (!applicant.name) missing.push('姓名');
  if (!applicant.phone) missing.push('電話');
  if (!applicant.email) missing.push('Email');
  if (!applicant.messenger) missing.push('通訊軟體');
  if (!applicant.messengerId) missing.push('通訊軟體ID');
  if (!applicant.hotel) missing.push('住宿飯店');
  return missing;
}

// 檢查未填欄位，回傳未填欄位名稱陣列
function getMissingFields(person: any) {
  const requiredFields = [
    { key: 'name', label: '姓名' },
    { key: 'age', label: '年齡' },
    { key: 'gender', label: '性別' },
    { key: 'height', label: '身高' },
    { key: 'weight', label: '體重' },
    { key: 'footSize', label: '腳尺寸' },
    { key: 'level', label: '滑雪程度' },
    { key: 'skiType', label: '滑雪種類' },
    { key: 'boardType', label: '雪板類型' },
    { key: 'equipType', label: '裝備類型' },
  ];
  // 若不是大全配，才檢查雪衣/安全帽
  if (!person.equipType || !person.equipType.includes('大全配')) {
    requiredFields.push({ key: 'clothingType', label: '是否需要單租雪衣' });
    requiredFields.push({ key: 'helmetOnly', label: '單租安全帽' });
  }
  requiredFields.push({ key: 'fastWear', label: '是否升級Fase快穿裝備' });

  // 新增 debug 輸出
  requiredFields.forEach(f => {
    console.log(`欄位: ${f.key}, 值:`, person[f.key]);
  });

  return requiredFields.filter(f => !person[f.key]).map(f => f.label);
}

// 幫助函式：取得中文明細名稱
function getItemLabel(p: any, days: number) {
  // 主裝備
  let equipLabel = '';
  if (p.equipType.includes('大全配')) {
    if (p.boardType.includes('進階')) equipLabel = '進階大全配';
    else if (p.boardType.includes('粉雪')) equipLabel = '粉雪大全配';
    else equipLabel = '標準大全配';
  } else if (p.equipType.includes('板+靴') || p.equipType.includes('板靴組')) {
    if (p.boardType.includes('進階')) equipLabel = '進階板靴組';
    else if (p.boardType.includes('粉雪')) equipLabel = '粉雪板靴組';
    else equipLabel = '標準板靴組';
  } else if (p.equipType.includes('僅租雪板')) {
    if (p.boardType.includes('進階')) equipLabel = '進階僅租雪板';
    else if (p.boardType.includes('粉雪')) equipLabel = '粉雪僅租雪板';
    else equipLabel = '標準僅租雪板';
  }
  // 其他
  const clothingLabel = (p.clothingType && p.clothingType !== '否') ? p.clothingType : '';
  const helmetLabel = p.helmetOnly === '是' ? '單租安全帽' : '';
  const faseLabel = p.fastWear === '是' ? 'Fase快穿' : '';
  return { equipLabel, clothingLabel, helmetLabel, faseLabel, days };
}

const Reservation: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [people, setPeople] = useState(1);
  const [persons, setPersons] = useState([{ ...initialPerson }]);
  const [error, setError] = useState('');
  const [price, setPrice] = useState(0);
  const [detail, setDetail] = useState<any[]>([]);
  const [rentStore, setRentStore] = useState('');
  const [returnStore, setReturnStore] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [reservationResponse, setReservationResponse] = useState<any>(null);
  const [discountStatus, setDiscountStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discountInfo, setDiscountInfo] = useState<{
    valid: boolean;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    name?: string;
  } | null>(null);
  
  // 載入狀態管理
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);

  // 初始化時從 localStorage 恢復數據
  useEffect(() => {
    setError(''); // 確保每次進入頁面時先清空錯誤訊息
    
    // 嘗試從 localStorage 恢復表單數據
    const savedData = localStorage.getItem('reservationFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setStartDate(parsedData.startDate || '');
        setEndDate(parsedData.endDate || '');
        setPeople(parsedData.people || 1);
        setPersons(parsedData.persons || [{ ...initialPerson }]);
        setRentStore(parsedData.rentStore || '');
        setReturnStore(parsedData.returnStore || '');
        setApplicant(parsedData.applicant || {
          name: '',
          countryCode: '+81',
          phone: '',
          email: '',
          messenger: '',
          messengerId: '',
          hotel: '',
          shuttle: [],
          shuttleMode: 'none',
          discountCode: '',
        });
      } catch (e) {
        console.error('Failed to restore form data:', e);
      }
    }
  }, []);


  // 自動計算價格與清空錯誤訊息
  useEffect(() => {
    setError('');
    calcPrice();
    // 即時價格計算在第3步會自動觸發重新渲染
  }, [persons, startDate, endDate, rentStore, returnStore, discountInfo]);

  // 在組件卸載時清理事件監聽器
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 如果已經提交成功（在第5步），清除localStorage
      if (step === 5) {
        localStorage.removeItem('reservationFormData');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [step]);

  // 動態調整人數
  const handlePeopleChange = (val: number) => {
    setPeople(val);
    if (val > persons.length) {
      setPersons([...persons, ...Array(val - persons.length).fill(initialPerson).map(() => ({ ...initialPerson }))]);
    } else {
      setPersons(persons.slice(0, val));
    }
  };

  // 處理每位租借者欄位變動
  const handlePersonChange = (idx: number, key: string, value: string) => {
    setPersons(prev => {
      const updated = [...prev];
      let person = { ...updated[idx], [key]: value };
      // 若選擇大全配，自動設否並禁用雪衣/安全帽
      if (key === 'equipType') {
        if (value.includes('大全配')) {
          person = { ...person, clothingType: '否', helmetOnly: '否' };
        }
      }
      // 若選擇雙板，自動設定快穿為否
      if (key === 'skiType') {
        if (value === '雙板') {
          person = { ...person, fastWear: '否' };
        }
      }
      updated[idx] = person;
      return updated;
    });
  };

  // 驗證表單（舊函數，保留給向後相容）
  const validate = () => {
    // 檢查第1步欄位
    const step1Missing = getMissingStep1Fields({
      startDate,
      endDate,
      rentStore,
      returnStore,
      pickupDate,
      pickupTime
    });
    if (step1Missing.length > 0) {
      return `請填寫以下欄位：${step1Missing.join('、')}`;
    }
    
    // 檢查租借者欄位
    for (let i = 0; i < persons.length; i++) {
      const missing = getMissingFields(persons[i]);
      if (missing.length > 0) {
        return `第${i + 1}位租借者缺少：${missing.join('、')}`;
      }
    }
    return '';
  };

  // 折扣碼驗證函數
  const validateDiscountCode = async (code: string) => {
    if (!code) {
      setDiscountStatus(null);
      setDiscountAmount(0);
      setDiscountInfo(null);
      setIsValidatingDiscount(false);
      return;
    }
    
    setIsValidatingDiscount(true);
    setDiscountStatus(null);
    
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    
    console.log('🔍 驗證折扣碼:', code);
    console.log('📡 API URL:', `${API_BASE_URL}/discount/validate`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/discount/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      
      console.log('📥 Response status:', response.status);
      const result = await response.json();
      console.log('📦 Response data:', result);
      
      if (result.valid) {
        setDiscountStatus({
          type: 'success',
          message: `✅ 折扣碼有效！${result.discountType === 'percentage' ? 
            `享有 ${result.discountValue}% 折扣` : 
            `減免 ¥${result.discountValue}`}`
        });
        setDiscountInfo(result);
      } else {
        setDiscountStatus({
          type: 'error',
          message: '❌ 折扣碼無效或已過期'
        });
        setDiscountAmount(0);
        setDiscountInfo(null);
      }
    } catch (error) {
      setDiscountStatus({
        type: 'error',
        message: '❌ 驗證失敗，請稍後再試'
      });
      setDiscountAmount(0);
      setDiscountInfo(null);
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  // 即時價格計算（支援部分欄位）
  const calcRealTimePrice = () => {
    // 如果沒有日期，無法計算
    if (!startDate || !endDate) return { total: 0, details: [] };
    
    const days = getDays(startDate, endDate);
    const priceIdx = getPriceIndex(days);
    const extraDays = days > 5 ? days - 5 : 0;
    const isCrossStore = rentStore && returnStore && rentStore !== returnStore;
    
    let total = 0;
    let details: any[] = [];
    
    persons.forEach((p, idx) => {
      let personTotal = 0;
      let items: any[] = [];
      
      // 只計算已填寫的欄位
      if (p.age && p.equipType && p.boardType) {
        const age = parseInt(p.age, 10);
        const isChild = age <= 12;
        const group = isChild ? 'child' : 'adult';
        
        // 判斷裝備類型
        let equipType = '';
        if (p.equipType.includes('大全配')) equipType = '大全配';
        else if (p.equipType.includes('板+靴') || p.equipType.includes('板靴組')) equipType = '板靴組';
        else if (p.equipType.includes('僅租雪板')) equipType = '單租雪板';
        
        // 判斷雪板類型
        let boardCat = 'standard';
        if (p.boardType.includes('進階')) boardCat = 'advanced';
        else if (p.boardType.includes('粉雪')) boardCat = 'powder';
        
        // 計算主裝備價格
        if (equipType) {
          let main = 0;
          if (group === 'adult') {
            const boardCatKey = boardCat as 'standard' | 'advanced' | 'powder';
            if (equipType in priceTable.adult[boardCatKey]) {
              main = (priceTable.adult[boardCatKey][equipType as '大全配' | '板靴組' | '單租雪板'][priceIdx] ?? 0)
                + (extraDays > 0 ? (priceTable.adult[boardCatKey][equipType as '大全配' | '板靴組' | '單租雪板'][5] ?? 0) * extraDays : 0);
            }
          } else {
            if (equipType in priceTable.child.standard) {
              main = (priceTable.child.standard[equipType as '大全配' | '板靴組' | '單租雪板'][priceIdx] ?? 0)
                + (extraDays > 0 ? (priceTable.child.standard[equipType as '大全配' | '板靴組' | '單租雪板'][5] ?? 0) * extraDays : 0);
            }
          }
          if (main > 0) {
            personTotal += main;
            const label = `${boardCat === 'advanced' ? '進階' : boardCat === 'powder' ? '粉雪' : '標準'}${equipType}`;
            items.push({ label, price: main });
          }
        }
        
        // 計算雪衣褲（如果不是大全配）
        if (!p.equipType.includes('大全配') && p.clothingType && p.clothingType !== '否') {
          let clothing = 0;
          if (p.clothingType === '租一整套(雪衣及雪褲)') {
            clothing = isChild ? priceTable.child.clothingSet[priceIdx] + (extraDays > 0 ? priceTable.child.clothingSet[5] * extraDays : 0)
                               : priceTable.adult.clothingSet[priceIdx] + (extraDays > 0 ? priceTable.adult.clothingSet[5] * extraDays : 0);
            items.push({ label: '雪衣雪褲套裝', price: clothing });
          } else if (p.clothingType === '單租雪衣' || p.clothingType === '單租雪褲') {
            clothing = isChild ? priceTable.child.clothingSingle[priceIdx] + (extraDays > 0 ? priceTable.child.clothingSingle[5] * extraDays : 0)
                               : priceTable.adult.clothingSingle[priceIdx] + (extraDays > 0 ? priceTable.adult.clothingSingle[5] * extraDays : 0);
            items.push({ label: p.clothingType, price: clothing });
          }
          personTotal += clothing;
        }
        
        // 計算安全帽（如果不是大全配）
        if (!p.equipType.includes('大全配') && p.helmetOnly === '是') {
          const helmet = priceTable.helmet[priceIdx] + (extraDays > 0 ? priceTable.helmet[5] * extraDays : 0);
          personTotal += helmet;
          items.push({ label: '安全帽', price: helmet });
        }
        
        // 計算Fase快穿
        if (p.fastWear === '是' && p.skiType !== '雙板') {
          const fase = 2000 * days;
          personTotal += fase;
          items.push({ label: 'Fase快穿', price: fase });
        }
      }
      
      details.push({
        index: idx + 1,
        items,
        subtotal: personTotal
      });
      total += personTotal;
    });
    
    // 加入甲地租乙地還費用
    if (isCrossStore) {
      total += 3000 * persons.filter(p => p.age && p.equipType).length;
    }
    
    return { total, details, days, crossStore: isCrossStore };
  };
  
  // 價格計算主邏輯
  const calcPrice = () => {
    const days = getDays(startDate, endDate);
    const priceIdx = getPriceIndex(days);
    const extraDays = days > 5 ? days - 5 : 0;
    console.log('天數', days);
    console.log('板靴組價格表', priceTable.adult.standard['板靴組']);
    console.log('取用價格索引', priceIdx);
    let total = 0;
    let detailList: any[] = [];
    const isCrossStore = rentStore && returnStore && rentStore !== returnStore;
    persons.forEach((p, idx) => {
      const age = parseInt(p.age, 10);
      const isChild = age <= 12;
      let group = isChild ? 'child' : 'adult';
      let equipType = '';
      if (p.equipType.includes('大全配')) equipType = '大全配';
      else if (p.equipType.includes('板+靴') || p.equipType.includes('板靴組')) equipType = '板靴組';
      else equipType = '單租雪板';
      // 雪板類型
      let boardCat = 'standard';
      if (p.boardType.includes('進階')) boardCat = 'advanced';
      if (p.boardType.includes('粉雪')) boardCat = 'powder';
      // 主裝備
      let main = 0;
      if (group === 'adult') {
        const boardCatKey = boardCat as 'standard' | 'advanced' | 'powder';
        if (equipType in priceTable.adult[boardCatKey]) {
          main = (priceTable.adult[boardCatKey][equipType as '大全配' | '板靴組' | '單租雪板'][priceIdx] ?? 0)
            + (extraDays > 0 ? (priceTable.adult[boardCatKey][equipType as '大全配' | '板靴組' | '單租雪板'][5] ?? 0) * extraDays : 0);
        }
      } else {
        if (equipType in priceTable.child.standard) {
          main = (priceTable.child.standard[equipType as '大全配' | '板靴組' | '單租雪板'][priceIdx] ?? 0)
            + (extraDays > 0 ? (priceTable.child.standard[equipType as '大全配' | '板靴組' | '單租雪板'][5] ?? 0) * extraDays : 0);
        }
      }
      // 雪靴
      let boots = 0;
      // 只有未來有單租雪靴需求時才加 boots，板靴組已含雪靴
      // if (equipType === '板靴組') {
      //   boots = isChild ? priceTable.child.boots[priceIdx] + (extraDays > 0 ? priceTable.child.boots[5] * extraDays : 0)
      //                   : priceTable.adult.boots[priceIdx] + (extraDays > 0 ? priceTable.adult.boots[5] * extraDays : 0);
      // }
      // 雪衣褲
      let clothing = 0;
      if (p.clothingType === '租一整套(雪衣及雪褲)') {
        clothing = isChild ? priceTable.child.clothingSet[priceIdx] + (extraDays > 0 ? priceTable.child.clothingSet[5] * extraDays : 0)
                           : priceTable.adult.clothingSet[priceIdx] + (extraDays > 0 ? priceTable.adult.clothingSet[5] * extraDays : 0);
      } else if (p.clothingType === '單租雪衣' || p.clothingType === '單租雪褲') {
        clothing = isChild ? priceTable.child.clothingSingle[priceIdx] + (extraDays > 0 ? priceTable.child.clothingSingle[5] * extraDays : 0)
                           : priceTable.adult.clothingSingle[priceIdx] + (extraDays > 0 ? priceTable.adult.clothingSingle[5] * extraDays : 0);
      }
      // 安全帽
      let helmet = 0;
      if (p.helmetOnly === '是') {
        helmet = priceTable.helmet[priceIdx] + (extraDays > 0 ? priceTable.helmet[5] * extraDays : 0);
      }
      // 雪杖（如需）
      // let pole = 0; // 可依需求加上
      // Fase快穿
      let fase = 0;
      if (p.fastWear === '是') {
        // Fase快穿是每天2000元
        fase = 2000 * days;
      }
      // 甲地租乙地還
      let cross = 0;
      if (isCrossStore) cross = 3000;
      const subtotal = main + boots + clothing + helmet + fase + cross;
      total += subtotal;
      detailList.push({
        idx: idx + 1,
        group: isChild ? '兒童' : '成人',
        main, boots, clothing, helmet, fase, cross, subtotal,
        ...p,
      });
    });
    // 在 setPrice(total); 之前加入
    setOriginalPrice(total);

    // 計算折扣
    if (discountInfo && discountInfo.valid) {
      let discount = 0;
      if (discountInfo.discountType === 'percentage') {
        discount = Math.round(total * (discountInfo.discountValue / 100));
      } else {
        discount = Math.min(discountInfo.discountValue, total);
      }
      setDiscountAmount(discount);
      setPrice(total - discount);
    } else {
      setDiscountAmount(0);
      setPrice(total);
    }
    
    setDetail(detailList);
  };

  // 調整 step 流程：step 1 日期地點 → step 2 申請人 → step 3 人數與租借者 → step 4 預覽
  // 驗證 applicant 必填欄位
  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      // 第一步檢查日期、地點和取件資訊
      const missingFields = getMissingStep1Fields({
        startDate,
        endDate,
        rentStore,
        returnStore,
        pickupDate,
        pickupTime
      });
      
      if (missingFields.length > 0) {
        setError(`請填寫以下欄位：${missingFields.join('、')}`);
        return;
      }
      
      setStep(step + 1);
      return;
    }
    if (step === 2) {
      // 檢查申請人資料
      const missingFields = getMissingApplicantFields(applicant);
      
      if (missingFields.length > 0) {
        setError(`申請人資料缺少：${missingFields.join('、')}`);
        return;
      }
      
      // shuttleMode 不需驗證 shuttle 細項
      setStep(step + 1);
      return;
    }
    // 第三步才檢查租借者欄位
    for (let i = 0; i < persons.length; i++) {
      const missing = getMissingFields(persons[i]);
      console.log(`第${i + 1}位租借者`, persons[i]);
      console.log(`缺漏欄位`, missing);
      if (missing.length > 0) {
        setError(`第${i + 1}位租借者缺少：${missing.join('、')}`);
        return;
      }
    }
    setStep(step + 1);
  };

  // 上一步
  const handlePrev = () => setStep(step - 1);

  // 送出預約（這裡僅顯示總價，實際可串接API）
  // 重置所有表單狀態
  const resetFormData = () => {
    setStep(1);
    setAgreedToTerms(false);
    setStartDate('');
    setEndDate('');
    setPeople(1);
    setPersons([{ ...initialPerson }]);
    setError('');
    setPrice(0);
    setDetail([]);
    setRentStore('');
    setReturnStore('');
    setPickupDate('');
    setPickupTime('');
    setReservationResponse(null);
    setDiscountStatus(null);
    setDiscountAmount(0);
    setOriginalPrice(0);
    setDiscountInfo(null);
    setApplicant({
      name: '',
      countryCode: '+81',
      phone: '',
      email: '',
      messenger: '',
      messengerId: '',
      hotel: '',
      shuttle: [],
      shuttleMode: 'none',
      discountCode: '',
    });
    // 清除 localStorage 中的表單數據
    localStorage.removeItem('reservationFormData');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const payload = {
        applicant,
        persons,
        startDate,
        endDate,
        rentStore,
        returnStore,
        pickupDate,
        pickupTime,
        price,
        originalPrice,
        discountCode: applicant.discountCode || '',
        discountAmount: discountAmount || 0,
        detail,
      };
      const response = await submitReservation(payload);
      setReservationResponse(response);
      setStep(5);
    } catch (err) {
      setError('送出失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 國碼選項改為 emoji 國旗+國碼
  const countryCodes = [
    { code: '+886', label: '🇹🇼 +886' },
    { code: '+81', label: '🇯🇵 +81' },
    { code: '+852', label: '🇭🇰 +852' },
    { code: '+86', label: '🇨🇳 +86' },
    { code: '+1', label: '🇺🇸 +1' },
    { code: '+44', label: '🇬🇧 +44' },
    { code: '+61', label: '🇦🇺 +61' },
    { code: '+64', label: '🇳🇿 +64' },
    { code: '+65', label: '🇸🇬 +65' },
    { code: '+60', label: '🇲🇾 +60' },
  ];
  const messengerTypes = ['Whatsapp', 'Wechat', 'Line'];
  // shuttleOptions 分組
  const shuttlePickOptions = [
    '租借日:飯店到雪具店',
    '租借日:雪具店到雪場(旭川店僅接送到旭川火車站)',
  ];
  const shuttleDropOptions = [
    '歸還日:雪場到雪具店(旭川店僅從旭川火車站到雪具店)',
    '歸還日:雪具店到飯店',
  ];

  // 申請人接送需求分兩層：第一排單選『不須接送』『需要接送』，選『需要接送』時才顯示下方複選
  const [applicant, setApplicant] = useState<{
    name: string;
    countryCode: string;
    phone: string;
    email: string;
    messenger: string;
    messengerId: string;
    hotel: string;
    shuttle: string[];
    shuttleMode: 'none' | 'need';
    discountCode: string;
  }>(
    {
      name: '',
      countryCode: '+81',
      phone: '',
      email: '',
      messenger: '',
      messengerId: '',
      hotel: '',
      shuttle: [],
      shuttleMode: 'none',
      discountCode: '',
    }
  );

  // 保存表單數據到 localStorage
  const saveFormData = () => {
    const formData = {
      startDate,
      endDate,
      people,
      persons,
      rentStore,
      returnStore,
      applicant,
    };
    localStorage.setItem('reservationFormData', JSON.stringify(formData));
  };

  // 自動保存表單數據到 localStorage
  useEffect(() => {
    saveFormData();
  }, [startDate, endDate, people, persons, rentStore, returnStore, applicant]);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-snow-900 mb-8 text-center">雪具預約</h1>
      <div className="card">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-snow-700 mb-2">開始日期</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input" min={getMinReservationDate()} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-snow-700 mb-2">結束日期</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input" min={startDate || getMinReservationDate()} required />
              </div>
              <div className="mb-4">
                <label className="block mb-1">預約人數</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={people}
                  onChange={e => handlePeopleChange(Number(e.target.value))}
                  className="input w-24"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  ※ 12歲（含）以下為兒童計價，13歲以上為成人計價
                </p>
              </div>
              <div className="mb-4">
                <label className="block mb-1">租借地點</label>
                <select className="input" value={rentStore} onChange={e => {
                  setRentStore(e.target.value);
                  // 當店鋪變更時，清空取件時間讓用戶重新選擇
                  setPickupTime('');
                }} required>
                  <option value="" disabled style={{ color: '#aaa' }}>請選擇租借地點</option>
                  {storeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">歸還地點</label>
                <select className="input" value={returnStore} onChange={e => setReturnStore(e.target.value)} required>
                  <option value="" disabled style={{ color: '#aaa' }}>請選擇歸還地點</option>
                  {storeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
                <h3 className="font-semibold text-blue-800 mb-3">取件時間安排</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">取件日期</label>
                    <input 
                      type="date" 
                      value={pickupDate} 
                      onChange={e => {
                        setPickupDate(e.target.value);
                        // 如果選擇的日期是前一天，清空時間選擇讓用戶重新選擇
                        const range = getPickupDateRange(startDate);
                        if (e.target.value === range.min) {
                          setPickupTime('');
                        }
                      }} 
                      className="input" 
                      min={startDate ? getPickupDateRange(startDate).min : ''}
                      max={startDate || ''}
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">取件時間</label>
                    <select 
                      className="input" 
                      value={pickupTime} 
                      onChange={e => setPickupTime(e.target.value)} 
                      required
                    >
                      <option value="" disabled style={{ color: '#aaa' }}>請選擇取件時間</option>
                      {getAvailablePickupTimes(pickupDate, startDate, rentStore).map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-3 text-sm text-blue-600">
                  <p>💡 <strong>提醒：</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>取件日期只能選擇開始日當天或前一天下午14:00以後(不另外加價)</li>
                    <li>富良野店營業時間：08:00-17:30（最後取件17:30）</li>
                    <li>旭川店營業時間：07:30-18:30（最後取件18:30）</li>
                    <li>8:00-12:00為尖峰時段，預約客戶優先</li>
                  </ul>
                </div>
                
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                  <h4 className="font-semibold text-yellow-800 mb-2">📋 退款與改期政策（以取件日為基準）</h4>
                  
                  <div className="mb-3">
                    <p className="font-medium text-yellow-700 mb-1">退款規則</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-yellow-700">
                      <li><strong>取件日前 14 天（不含當日）以前取消</strong> → 退還扣除刷卡手續費（4%）後的全額</li>
                      <li><strong>取件日前 7～13 天取消</strong> → 退還已付款項的 50%</li>
                      <li><strong>取件日前 4～6 天取消</strong> → 退還已付款項的 20%</li>
                      <li><strong>取件日前 3 天（含當日）取消</strong> → 恕不退款</li>
                    </ul>
                  </div>
                  
                  <div className="mb-3">
                    <p className="font-medium text-yellow-700 mb-1">改期與變更規則</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-yellow-700">
                      <li><strong>更改取件日期：</strong>最晚需在取件日前 3 天（不含當日）辦理，且僅可更改一次</li>
                      <li><strong>更改租借天數或部分人數取消</strong> → 視同整筆訂單取消，需重新預約</li>
                    </ul>
                  </div>
                  
                  <div className="text-xs text-yellow-600 border-t border-yellow-200 pt-2 mt-2">
                    <p>💡 <strong>天數計算方式：</strong>以取件日為第 0 天，往前一天為第 1 天，再依此類推</p>
                    <p>💳 <strong>付款方式：</strong>日圓／僅接受信用卡付款</p>
                  </div>
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <input className="input" placeholder="申請人姓名" value={applicant.name} onChange={e => setApplicant({ ...applicant, name: e.target.value })} required />
              <div className="flex gap-2">
                <select className="input w-28" value={applicant.countryCode} onChange={e => setApplicant({ ...applicant, countryCode: e.target.value })}>
                  {countryCodes.map(opt => <option key={opt.code} value={opt.code}>{opt.label}</option>)}
                </select>
                <input className="input flex-1" placeholder="電話" value={applicant.phone} onChange={e => setApplicant({ ...applicant, phone: e.target.value })} required />
              </div>
              <input className="input" placeholder="Email" type="email" value={applicant.email} onChange={e => setApplicant({ ...applicant, email: e.target.value })} required />
              <div className="flex gap-2">
                <select className="input w-32" value={applicant.messenger} onChange={e => setApplicant({ ...applicant, messenger: e.target.value })} required>
                  <option value="">通訊軟體</option>
                  {messengerTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input className="input flex-1" placeholder="通訊軟體ID" value={applicant.messengerId} onChange={e => setApplicant({ ...applicant, messengerId: e.target.value })} required />
              </div>
              <input className="input" placeholder="住宿飯店名稱或地址" value={applicant.hotel} onChange={e => setApplicant({ ...applicant, hotel: e.target.value })} required />
              <div>
                <div className="relative">
                  <input 
                    className="input pr-10" 
                    placeholder="教練合作折扣碼 (選填)" 
                    value={applicant.discountCode} 
                    disabled={isValidatingDiscount}
                    onChange={e => {
                      setApplicant({ ...applicant, discountCode: e.target.value });
                      // 當用戶輸入時自動驗證
                      validateDiscountCode(e.target.value);
                    }} 
                  />
                  {isValidatingDiscount && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    </div>
                  )}
                </div>
                {discountStatus && (
                  <div className={`mt-2 p-2 rounded text-sm ${
                    discountStatus.type === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {discountStatus.message}
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-1">是否需要接送</label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={applicant.shuttleMode === 'none'}
                      onChange={() => setApplicant({ ...applicant, shuttleMode: 'none', shuttle: [] })}
                    />
                    不須接送
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={applicant.shuttleMode === 'need'}
                      onChange={() => setApplicant({ ...applicant, shuttleMode: 'need', shuttle: [] })}
                    />
                    需要接送
                  </label>
                </div>
                {applicant.shuttleMode === 'need' && (
                  <>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="font-semibold">接：</span>
                      {shuttlePickOptions.map(opt => (
                        <label key={opt} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={applicant.shuttle.includes(opt)}
                            onChange={e => {
                              let newShuttle = applicant.shuttle.filter(s => s !== '不須接送');
                              if (e.target.checked) newShuttle = [...newShuttle, opt];
                              else newShuttle = newShuttle.filter(s => s !== opt);
                              setApplicant({ ...applicant, shuttle: newShuttle });
                            }}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="font-semibold">送：</span>
                      {shuttleDropOptions.map(opt => (
                        <label key={opt} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={applicant.shuttle.includes(opt)}
                            onChange={e => {
                              let newShuttle = applicant.shuttle.filter(s => s !== '不須接送');
                              if (e.target.checked) newShuttle = [...newShuttle, opt];
                              else newShuttle = newShuttle.filter(s => s !== opt);
                              setApplicant({ ...applicant, shuttle: newShuttle });
                            }}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="lg:flex lg:gap-6">
              {/* 即時價格面板 - 桌面版右側，手機版底部 */}
              {startDate && endDate && (
                <div className="lg:w-80 lg:flex-shrink-0 lg:order-2">
                  <div className="sticky top-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 mb-4 lg:mb-0 transition-all duration-300 hover:shadow-xl">
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <span className="mr-2">💰</span> 即時價格預覽
                    </h3>
                    
                    {(() => {
                      const { total, details, days, crossStore } = calcRealTimePrice();
                      return (
                        <>
                          <div className="text-sm text-gray-600 mb-3">
                            租借天數：{days || 0}天
                          </div>
                          
                          {details.map((person: any) => (
                            <div key={person.index} className="mb-3 pb-3 border-b border-gray-100 last:border-0">
                              <div className="font-medium text-sm mb-1">
                                第{person.index}位租借者
                              </div>
                              {person.items.length > 0 ? (
                                <>
                                  {person.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-xs text-gray-600 ml-2">
                                      <span>• {item.label}</span>
                                      <span>¥{item.price.toLocaleString()}</span>
                                    </div>
                                  ))}
                                  <div className="flex justify-between text-sm font-medium mt-1 ml-2">
                                    <span>小計</span>
                                    <span>¥{person.subtotal.toLocaleString()}</span>
                                  </div>
                                </>
                              ) : (
                                <div className="text-xs text-gray-400 ml-2">尚未選擇裝備</div>
                              )}
                            </div>
                          ))}
                          
                          {crossStore && (
                            <div className="flex justify-between text-sm mb-2">
                              <span>甲地租乙地還</span>
                              <span>¥{(3000 * details.filter((d: any) => d.subtotal > 0).length).toLocaleString()}</span>
                            </div>
                          )}
                          
                          {discountInfo && discountInfo.valid && (
                            <div className="flex justify-between text-sm text-green-600 mb-2">
                              <span>折扣 ({applicant.discountCode})</span>
                              <span>-¥{discountAmount.toLocaleString()}</span>
                            </div>
                          )}
                          
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between font-bold text-lg">
                              <span>總計</span>
                              <span className="text-primary-600 transition-all duration-300 transform">
                                ¥{(total - (discountAmount || 0)).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              
              <div className="lg:flex-1 lg:order-1">
                <div className="space-y-8">
              {persons.map((p, idx) => (
                <div key={idx} className="border rounded-lg p-4 mb-2 bg-snow-50">
                  <div className="font-semibold mb-2">第 {idx + 1} 位租借者</div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input className="input" placeholder="姓名" value={p.name} onChange={e => handlePersonChange(idx, 'name', e.target.value)} required />
                    <input className="input" placeholder="年齡" type="number" min={1} max={100} value={p.age} onChange={e => handlePersonChange(idx, 'age', e.target.value)} required />
                    <select className="input" value={p.gender} onChange={e => handlePersonChange(idx, 'gender', e.target.value)} required>
                      <option value="">性別</option>
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                    <input className="input" placeholder="身高 (cm)" type="number" min={50} max={250} value={p.height} onChange={e => handlePersonChange(idx, 'height', e.target.value)} required />
                    <input className="input" placeholder="體重 (kg)" type="number" min={10} max={200} value={p.weight} onChange={e => handlePersonChange(idx, 'weight', e.target.value)} required />
                    <input className="input" placeholder="腳的尺寸 (cm)" type="number" min={15} max={35} value={p.footSize} onChange={e => handlePersonChange(idx, 'footSize', e.target.value)} required />
                    <select className="input" value={p.level} onChange={e => handlePersonChange(idx, 'level', e.target.value)} required>
                      <option value="">滑雪程度</option>
                      {levels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <select className="input" value={p.skiType} onChange={e => handlePersonChange(idx, 'skiType', e.target.value)} required>
                      <option value="">滑雪種類</option>
                      {skiTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select className="input" value={p.boardType} onChange={e => handlePersonChange(idx, 'boardType', e.target.value)} required>
                      <option value="">欲租用雪板類型</option>
                      {boardTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select className="input" value={p.equipType} onChange={e => handlePersonChange(idx, 'equipType', e.target.value)} required>
                      <option value="">租用裝備類型</option>
                      {equipTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select className="input" value={p.clothingType} onChange={e => handlePersonChange(idx, 'clothingType', e.target.value)} required disabled={p.equipType.includes('大全配')}>
                      <option value="">是否要另外租借雪衣褲</option>
                      {clothingTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select className="input" value={p.helmetOnly} onChange={e => handlePersonChange(idx, 'helmetOnly', e.target.value)} required disabled={p.equipType.includes('大全配')}>
                      <option value="">單租安全帽</option>
                      {yesNo.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select className="input" value={p.fastWear} onChange={e => handlePersonChange(idx, 'fastWear', e.target.value)} required disabled={p.skiType === '雙板'}>
                      <option value="">是否升級Fase快穿裝備</option>
                      {yesNo.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              ))}
                </div>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-snow-900">預約資料確認</h2>
              <div>
                <div className="mb-2">租借日期：{startDate} ~ {endDate}</div>
                <div className="mb-2">取件日期：{pickupDate}</div>
                <div className="mb-2">取件時間：{pickupTime}</div>
                <div className="mb-2">租借地點：{rentStore}</div>
                <div className="mb-2">歸還地點：{returnStore}</div>
                <div className="mb-2">人數：{people}</div>
                <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold mb-2">費用明細</div>
                  {discountAmount > 0 ? (
                    <>
                      <div className="mb-1">原價：¥{originalPrice}</div>
                      <div className="mb-1 text-green-600">
                        折扣碼 ({applicant.discountCode})：-¥{discountAmount}
                      </div>
                      <div className="text-xl font-bold text-primary-600">
                        總價：¥{price}
                      </div>
                    </>
                  ) : (
                    <div className="text-xl font-bold text-primary-600">
                      總價：¥{price}
                    </div>
                  )}
                </div>
              </div>
              {/* 預覽頁面顯示申請人資料 */}
              <div className="mb-6">
                <div className="font-bold text-lg mb-2">申請人資料</div>
                <div>姓名：{applicant.name}</div>
                <div>電話：{applicant.countryCode} {applicant.phone}</div>
                <div>Email：{applicant.email}</div>
                <div>通訊軟體：{applicant.messenger}（ID：{applicant.messengerId}）</div>
                <div>住宿飯店：{applicant.hotel}</div>
                <div>接送需求：{applicant.shuttleMode === 'none' ? '不須接送' : (applicant.shuttle.length ? applicant.shuttle.join('、') : '未選擇')}</div>
              </div>
              <div className="space-y-4">
                {detail.map((p, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-snow-50">
                    <div className="font-semibold mb-2">第 {p.idx} 位租借者</div>
                    <div className="grid md:grid-cols-2 gap-2 text-snow-700 text-sm">
                      <div>姓名：{p.name}</div>
                      <div>年齡：{p.age}</div>
                      <div>性別：{p.gender}</div>
                      <div>身高：{p.height} cm</div>
                      <div>體重：{p.weight} kg</div>
                      <div>腳的尺寸：{p.footSize} cm</div>
                      <div>滑雪程度：{p.level}</div>
                      <div>滑雪種類：{p.skiType}</div>
                      <div>欲租用雪板類型：{p.boardType}</div>
                      <div>租用裝備類型：{p.equipType}</div>
                      {p.equipType !== '大全配 (板+靴+雪衣&雪褲+安全帽)' && (
                        <>
                          <div>是否要另外租借雪衣褲：{p.clothingType}</div>
                          <div>單租安全帽：{p.helmetOnly}</div>
                        </>
                      )}
                      <div>是否升級Fase快穿裝備：{p.fastWear}</div>
                      {/* 價格內訳 */}
                      <div className="col-span-2 mt-2">
                        <div className="font-semibold">費用明細：</div>
                        <ul className="ml-4 list-disc">
                          {(() => {
                            const days = getDays(startDate, endDate);
                            const { equipLabel, clothingLabel, helmetLabel, faseLabel } = getItemLabel(p, days);
                            // 若主裝備已經是板靴組，不再顯示雪靴細項
                            const isBootsIncluded = equipLabel.includes('板靴組');
                            return <>
                              {equipLabel && <li>{equipLabel} {days}天：¥ {p.main}</li>}
                              {!isBootsIncluded && p.boots > 0 && <li>雪靴 {days}天：¥ {p.boots}</li>}
                              {clothingLabel && <li>{clothingLabel} {days}天：¥ {p.clothing}</li>}
                              {helmetLabel && <li>{helmetLabel} {days}天：¥ {p.helmet}</li>}
                              {faseLabel && <li>{faseLabel} {days}天：¥ {p.fase}</li>}
                              {p.cross > 0 && <li>甲地租乙地還：¥ {p.cross}</li>}
                            </>;
                          })()}
                        </ul>
                        <div className="mt-1">總價：<span className="text-primary-600 font-bold">¥ {p.subtotal}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="text-center space-y-6 py-12">
              <img src="/logo.png" alt="Logo" className="h-16 w-16 mx-auto mb-4" />
              <div className="text-2xl font-bold text-primary-600">預約成功！</div>
              
              {reservationResponse && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">預約詳情</h3>
                  {(reservationResponse.reservation_number || reservationResponse.reservation_id) && (
                    <div className="text-sm text-green-700 mb-2">
                      <strong>預約編號：</strong> {reservationResponse.reservation_number || reservationResponse.reservation_id}
                    </div>
                  )}
                  <div className="text-sm text-green-700 mb-2">
                    <strong>預約日期：</strong> {startDate} 至 {endDate}
                  </div>
                  <div className="text-sm text-green-700 mb-2">
                    <strong>預約人：</strong> {applicant.name}
                  </div>
                  <div className="text-sm text-green-700 mb-2">
                    <strong>總價：</strong> ¥{reservationResponse.total_price || price}
                  </div>
                  <div className="text-sm text-green-700">
                    <strong>人數：</strong> {persons.length}人
                  </div>
                </div>
              )}
              
              <div className="text-snow-700">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div className="text-blue-800">
                    感謝您的預約，系統將會寄送預約確認信至您的電子信箱，請留意信件。
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  resetFormData();
                  navigate('/');
                }}
                className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                返回首頁
              </button>
            </div>
          )}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
          <div className="flex justify-between">
            {step > 1 && step < 5 && (
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handlePrev}
                disabled={isSubmitting}
              >
                上一步
              </button>
            )}
            {step < 3 && (
              <button type="button" className="btn-primary ml-auto" onClick={handleNextStep}>下一步</button>
            )}
            {step === 3 && (
              <button
                type="button"
                className="btn-primary ml-auto"
                onClick={() => {
                  // 檢查所有租借者的欄位
                  for (let i = 0; i < persons.length; i++) {
                    const missing = getMissingFields(persons[i]);
                    if (missing.length > 0) {
                      setError(`第${i + 1}位租借者缺少：${missing.join('、')}`);
                      return;
                    }
                  }
                  setError('');
                  calcPrice();
                  setStep(4);
                }}
              >
                預覽資料
              </button>
            )}
            {step === 4 && (
              <button 
                type="submit" 
                className="btn-primary ml-auto flex items-center gap-2" 
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isSubmitting ? '處理中...' : '確認送出'}
              </button>
            )}
          </div>
        </form>
      </div>
      {step === 4 && detail.length > 0 && (
        <div className="mt-6 text-right text-lg font-bold">
          合計總金額：¥ {price}
        </div>
      )}
    </div>
  );
};

export default Reservation; 