/**
 * 雪具預約系統 - Google Sheet 自動建立腳本
 * 執行此腳本會自動建立完整的欄位結構
 * 
 * 更新內容：新增取件日期和取件時間欄位
 */

function createReservationSheet() {
  // 搜尋或創建 SnowGearOrders 試算表
  let spreadsheet;
  let sheet;
  
  try {
    // 先嘗試取得活躍的試算表
    spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    console.log('📊 使用活躍試算表:', spreadsheet.getName());
  } catch (e) {
    // 如果沒有活躍的試算表，搜尋 SnowGearOrders
    console.log('🔍 搜尋 SnowGearOrders 檔案...');
    const files = DriveApp.getFilesByName('SnowGearOrders');
    if (files.hasNext()) {
      const file = files.next();
      spreadsheet = SpreadsheetApp.openById(file.getId());
      console.log('✅ 找到 SnowGearOrders 試算表');
    } else {
      // 創建新的試算表
      spreadsheet = SpreadsheetApp.create('SnowGearOrders');
      console.log('✅ 創建新的 SnowGearOrders 試算表');
    }
  }
  
  // 取得或創建 orders 工作表
  sheet = spreadsheet.getSheetByName('orders');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('orders');
    console.log('✅ 創建新的 orders 工作表');
  } else {
    console.log('📋 使用現有的 orders 工作表');
  }
  
  // 清空現有內容
  sheet.clear();
  
  // 定義所有欄位標題 - 已更新包含取件日期和時間
  const headers = [
    // 基本預約資訊
    '預約編號', '預約日期', '租借日期', '歸還日期', '取件日期', '取件時間', '租借地點', '歸還地點', '租借天數', '甲地租乙地還',
    
    // 申請人資料
    '申請人姓名', '申請人電話', '申請人Email', '通訊軟體類型', '通訊軟體ID', '住宿飯店', '接送需求', '總金額'
  ];
  
  // 為每個租借者添加欄位 (最多10人)
  for (let i = 1; i <= 10; i++) {
    const prefix = `第${i}位租借者`;
    headers.push(
      `${prefix}姓名`, `${prefix}年齡`, `${prefix}性別`, 
      `${prefix}身高`, `${prefix}體重`, `${prefix}腳尺寸`,
      `${prefix}技術等級`, `${prefix}滑雪類型`, `${prefix}雪板類型`,
      `${prefix}裝備類型`, `${prefix}雪衣選項`, `${prefix}安全帽`,
      `${prefix}Fase快穿`, `${prefix}費用`
    );
  }
  
  console.log('📝 標題列總共', headers.length, '個欄位');
  
  // 設定標題列
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(10);
  
  // 凍結標題列
  sheet.setFrozenRows(1);
  
  // 自動調整欄寬
  sheet.autoResizeColumns(1, Math.min(headers.length, 20)); // 只調整前20欄避免太慢
  
  // 設定資料驗證規則
  setupValidationRules(sheet, headers);
  
  console.log('✅ 預約表格設定完成!');
  console.log('📊 試算表ID:', spreadsheet.getId());
  console.log('🔗 試算表網址:', spreadsheet.getUrl());
  
  return {
    spreadsheetId: spreadsheet.getId(),
    sheetId: sheet.getSheetId(),
    url: spreadsheet.getUrl()
  };
}

function setupValidationRules(sheet, headers) {
  console.log('🔧 設定資料驗證規則...');
  
  try {
    // 性別驗證
    for (let i = 1; i <= 10; i++) {
      const genderColIndex = headers.indexOf(`第${i}位租借者性別`) + 1;
      if (genderColIndex > 0) {
        const genderRange = sheet.getRange(2, genderColIndex, sheet.getMaxRows() - 1, 1);
        const genderRule = SpreadsheetApp.newDataValidation()
          .requireValueInList(['男', '女'], true)
          .setAllowInvalid(false)
          .setHelpText('請選擇男或女')
          .build();
        genderRange.setDataValidation(genderRule);
      }
    }
    
    // 技術等級驗證
    const levels = ['初級 (第一次滑雪)', '初級 (曾滑雪但不熟練)', '中級 (能連續轉彎)', '高級 (能處理各種雪道)'];
    for (let i = 1; i <= 10; i++) {
      const levelColIndex = headers.indexOf(`第${i}位租借者技術等級`) + 1;
      if (levelColIndex > 0) {
        const levelRange = sheet.getRange(2, levelColIndex, sheet.getMaxRows() - 1, 1);
        const levelRule = SpreadsheetApp.newDataValidation()
          .requireValueInList(levels, true)
          .setAllowInvalid(false)
          .build();
        levelRange.setDataValidation(levelRule);
      }
    }
    
    // 滑雪類型驗證
    const skiTypes = ['雙板', '單板'];
    for (let i = 1; i <= 10; i++) {
      const skiTypeColIndex = headers.indexOf(`第${i}位租借者滑雪類型`) + 1;
      if (skiTypeColIndex > 0) {
        const skiTypeRange = sheet.getRange(2, skiTypeColIndex, sheet.getMaxRows() - 1, 1);
        const skiTypeRule = SpreadsheetApp.newDataValidation()
          .requireValueInList(skiTypes, true)
          .setAllowInvalid(false)
          .build();
        skiTypeRange.setDataValidation(skiTypeRule);
      }
    }
    
    // 裝備類型驗證
    const equipTypes = ['大全配', '板靴組', '單租雪板', '單租雪靴'];
    for (let i = 1; i <= 10; i++) {
      const equipColIndex = headers.indexOf(`第${i}位租借者裝備類型`) + 1;
      if (equipColIndex > 0) {
        const equipRange = sheet.getRange(2, equipColIndex, sheet.getMaxRows() - 1, 1);
        const equipRule = SpreadsheetApp.newDataValidation()
          .requireValueInList(equipTypes, true)
          .setAllowInvalid(false)
          .build();
        equipRange.setDataValidation(equipRule);
      }
    }
    
    console.log('✅ 資料驗證規則設定完成');
  } catch (error) {
    console.error('❌ 設定驗證規則時發生錯誤:', error);
  }
}

// 生成預約編號的函數
function generateReservationId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const timestamp = now.getTime().toString().slice(-4); // 取時間戳記的後4位
  
  return `RSV${year}${month}${day}${timestamp}`;
}

/**
 * 接收來自後端的預約資料並寫入試算表
 * 此函數將被部署為Web應用程式供後端呼叫
 */
function doPost(e) {
  console.log('📝 收到POST請求');
  
  try {
    // 解析JSON資料
    const data = JSON.parse(e.postData.contents);
    console.log('📊 收到的資料:', JSON.stringify(data, null, 2));
    
    // 確保試算表存在
    const result = createReservationSheet();
    const spreadsheet = SpreadsheetApp.openById(result.spreadsheetId);
    const sheet = spreadsheet.getSheetByName('orders');
    
    // 取得標題列
    const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    const headers = headerRange.getValues()[0];
    
    // 建立新的資料列
    const rowData = new Array(headers.length).fill('');
    
    // 生成預約編號
    const reservationId = data.reservation_number || generateReservationId();
    console.log('📋 預約編號:', reservationId);
    
    // 偵錯資訊
    console.log('🔍 資料偵錯:');
    console.log('  - frontendData:', data.frontendData ? '存在' : '不存在');
    console.log('  - start_date:', data.start_date);
    console.log('  - end_date:', data.end_date);
    console.log('  - pickup_date:', data.pickup_date);
    console.log('  - pickup_time:', data.pickup_time);
    
    // 填寫基本資訊 - 已更新包含取件時間
    rowData[headers.indexOf('預約編號')] = reservationId;
    rowData[headers.indexOf('預約日期')] = new Date();
    rowData[headers.indexOf('租借日期')] = data.rentalDate || data.start_date || new Date();
    rowData[headers.indexOf('歸還日期')] = data.returnDate || data.end_date || new Date();
    rowData[headers.indexOf('取件日期')] = data.pickup_date || data.pickupDate || '';
    rowData[headers.indexOf('取件時間')] = data.pickup_time || data.pickupTime || '';
    rowData[headers.indexOf('租借地點')] = data.pickupLocation || '富良野店';
    rowData[headers.indexOf('歸還地點')] = data.returnLocation || '富良野店';
    rowData[headers.indexOf('租借天數')] = data.rentalDays || 1;
    rowData[headers.indexOf('甲地租乙地還')] = (data.pickupLocation !== data.returnLocation) ? '是' : '否';
    
    // 填寫申請人資訊
    rowData[headers.indexOf('申請人姓名')] = data.applicant?.name || '';
    rowData[headers.indexOf('申請人電話')] = data.applicant?.phone || '';
    rowData[headers.indexOf('申請人Email')] = data.applicant?.email || '';
    rowData[headers.indexOf('通訊軟體類型')] = data.applicant?.messagingApp?.type || 'Email';
    rowData[headers.indexOf('通訊軟體ID')] = data.applicant?.messagingApp?.id || data.applicant?.email || '';
    rowData[headers.indexOf('住宿飯店')] = data.applicant?.hotel || '';
    rowData[headers.indexOf('接送需求')] = data.applicant?.transportation?.required ? 
      (data.applicant.transportation.details && data.applicant.transportation.details.length > 0 ? 
        data.applicant.transportation.details.join('、') : '需要接送') : '不須接送';
    rowData[headers.indexOf('總金額')] = data.totalAmount || data.totalEquipmentCost || data.totalPrice || data.total_price || 0;
    
    // 填寫租借者資訊
    const renters = data.renters || [];
    console.log('👥 租借者數量:', renters.length);
    
    for (let i = 0; i < Math.min(renters.length, 10); i++) {
      const renter = renters[i];
      const prefix = `第${i + 1}位租借者`;
      
      console.log(`📝 處理${prefix}:`, renter.name);
      
      rowData[headers.indexOf(prefix + '姓名')] = renter.name || '';
      rowData[headers.indexOf(prefix + '年齡')] = renter.age || '';
      rowData[headers.indexOf(prefix + '性別')] = renter.gender || '';
      rowData[headers.indexOf(prefix + '身高')] = renter.height || '';
      rowData[headers.indexOf(prefix + '體重')] = renter.weight || '';
      rowData[headers.indexOf(prefix + '腳尺寸')] = renter.shoeSize || '';
      rowData[headers.indexOf(prefix + '技術等級')] = renter.skillLevel || '';
      rowData[headers.indexOf(prefix + '滑雪類型')] = renter.skiType || '';
      rowData[headers.indexOf(prefix + '雪板類型')] = renter.boardType || '';
      rowData[headers.indexOf(prefix + '裝備類型')] = renter.equipmentType || '';
      rowData[headers.indexOf(prefix + '雪衣選項')] = renter.clothingOption || '';
      rowData[headers.indexOf(prefix + '安全帽')] = renter.helmet ? '是' : '否';
      rowData[headers.indexOf(prefix + 'Fase快穿')] = renter.fase ? '是' : '否';
      rowData[headers.indexOf(prefix + '費用')] = renter.prices?.subtotal || 0;
    }
    
    // 寫入資料
    sheet.appendRow(rowData);
    console.log('✅ 資料已成功寫入試算表');
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: '預約資料已成功儲存',
        reservationId: reservationId,
        spreadsheetUrl: spreadsheet.getUrl()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('❌ 處理POST請求時發生錯誤:', error);
    console.error('錯誤堆疊:', error.stack);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: '儲存預約資料時發生錯誤: ' + error.message,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 簡化版本的資料寫入函數
 * 用於處理最基本的預約資料
 */
function doGet(e) {
  console.log('📄 收到GET請求');
  
  try {
    // 如果是GET請求，返回服務狀態
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: '雪具預約系統 Google Sheets 服務正在運行',
        timestamp: new Date().toISOString(),
        features: [
          '接收預約資料',
          '自動生成預約編號', 
          '支援多人預約',
          '取件時間管理',
          '資料驗證'
        ]
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('❌ 處理GET請求時發生錯誤:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: '服務發生錯誤: ' + error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 測試函數 - 可在Google Apps Script編輯器中直接執行
 */
function testAddReservation() {
  console.log('🧪 開始測試...');
  
  const testData = {
    reservation_number: 'TEST' + Date.now(),
    start_date: '2025-01-15',
    end_date: '2025-01-17',
    pickup_date: '2025-01-15',
    pickup_time: '09:00',
    pickupLocation: '富良野店',
    returnLocation: '富良野店',
    total_price: 15000,
    applicant: {
      name: '測試用戶',
      phone: '+81 90-1234-5678',
      email: 'test@example.com',
      hotel: '測試飯店',
      messagingApp: {
        type: 'Line',
        id: 'test123'
      },
      transportation: {
        required: true,
        details: ['飯店到雪具店', '雪具店到雪場']
      }
    },
    renters: [
      {
        name: '測試用戶',
        age: 30,
        gender: '男',
        height: 175,
        weight: 70,
        shoeSize: 27,
        skillLevel: '中級',
        skiType: '雙板',
        boardType: '一般板',
        equipmentType: '大全配',
        clothingOption: '否',
        helmet: true,
        fase: false,
        prices: {
          subtotal: 15000
        }
      }
    ]
  };
  
  // 模擬POST請求
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  console.log('🧪 測試結果:', result.getContent());
}