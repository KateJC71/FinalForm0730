import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

export interface ReservationEmailData {
  applicant: {
    name: string;
    email: string;
    phone: string;
    hotel: string;
  };
  persons: Array<{
    name: string;
    age: string;
    gender: string;
    height: string;
    weight: string;
    footSize: string;
    level: string;
    skiType: string;
    boardType: string;
    equipType: string;
    clothingType?: string;
    helmetOnly?: string;
    fastWear?: string;
    protectiveGear?: string;
  }>;
  startDate: string;
  endDate: string;
  pickupDate: string;
  pickupTime: string;
  rentStore: string;
  returnStore: string;
  totalPrice: number;
  originalPrice?: number;
  discountCode?: string;
  discountAmount?: number;
  reservationNumber: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '', // Gmail App Password
      },
    });
  }

  // 驗證 SMTP 連接
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('📧 SMTP server ready to take our messages');
      return true;
    } catch (error) {
      console.error('❌ SMTP verification failed:', error);
      return false;
    }
  }

  // 計算天數
  private getDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 1;
  }

  // 生成客戶確認郵件 HTML
  private generateCustomerEmailHTML(data: ReservationEmailData): string {
    const days = this.getDays(data.startDate, data.endDate);
    const isCrossStore = data.rentStore !== data.returnStore;
    
    return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>預約收件 - 雪具預約系統</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
        .footer { background: #64748b; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
        .reservation-info { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #2563eb; }
        .person-details { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border: 1px solid #e2e8f0; }
        .price-summary { background: #fef3c7; padding: 15px; margin: 15px 0; border-radius: 6px; border: 1px solid #f59e0b; }
        .important { color: #dc2626; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background-color: #f1f5f9; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎿 預約收件通知</h1>
        <p>感謝您選擇我們的雪具租借服務</p>
    </div>
    
    <div class="content">
        <p>親愛的 <strong>${data.applicant.name}</strong> 您好，</p>
        <p>我們已經收到您的預約申請，會在確認庫存狀況之後寄送付款連結給您。若確定庫存已經租罄，我們也會通知您預約無法受理。請您稍後。</p>
        <p>以下是您的預約詳情：</p>
        
        <div class="reservation-info">
            <h3>📋 預約基本資訊</h3>
            <table>
                <tr><th>預約編號</th><td><strong>${data.reservationNumber}</strong></td></tr>
                <tr><th>租借日期</th><td>${data.startDate} 至 ${data.endDate} (${days}天)</td></tr>
                <tr><th>取件日期</th><td>${data.pickupDate}</td></tr>
                <tr><th>取件時間</th><td>${data.pickupTime}</td></tr>
                <tr><th>租借地點</th><td>${data.rentStore}</td></tr>
                <tr><th>歸還地點</th><td>${data.returnStore}</td></tr>
                <tr><th>預約人數</th><td>${data.persons.length}人</td></tr>
            </table>
        </div>

        <h3>👥 租借者詳情</h3>
        ${data.persons.map((person, index) => `
        <div class="person-details">
            <h4>第 ${index + 1} 位租借者</h4>
            <table>
                <tr><th>姓名</th><td>${person.name}</td></tr>
                <tr><th>年齡</th><td>${person.age}歲</td></tr>
                <tr><th>性別</th><td>${person.gender}</td></tr>
                <tr><th>身高/體重</th><td>${person.height}cm / ${person.weight}kg</td></tr>
                <tr><th>腳尺寸</th><td>${person.footSize}cm</td></tr>
                <tr><th>滑雪程度</th><td>${person.level}</td></tr>
                <tr><th>滑雪種類</th><td>${person.skiType}</td></tr>
                <tr><th>雪板類型</th><td>${person.boardType}</td></tr>
                <tr><th>裝備類型</th><td>${person.equipType}</td></tr>
                ${person.clothingType && person.clothingType !== '否' ? `<tr><th>雪衣需求</th><td>${person.clothingType}</td></tr>` : ''}
                ${person.helmetOnly === '是' ? `<tr><th>安全帽</th><td>需要</td></tr>` : ''}
                ${person.fastWear === '是' ? `<tr><th>Fase快穿</th><td>需要</td></tr>` : ''}
                ${person.protectiveGear && person.protectiveGear !== '否' ? `<tr><th>護具</th><td>${person.protectiveGear}</td></tr>` : ''}
            </table>
        </div>
        `).join('')}

        <div class="price-summary">
            <h3>💰 費用明細</h3>
            ${data.originalPrice && data.discountAmount ? `
            <p><strong>原價：</strong> ¥${data.originalPrice?.toLocaleString()}</p>
            <p><strong>折扣碼 (${data.discountCode})：</strong> <span style="color: #059669;">-¥${data.discountAmount?.toLocaleString()}</span></p>
            ` : ''}
            ${isCrossStore ? `<p><strong>甲地租乙地還：</strong> ¥${(3000 * data.persons.length).toLocaleString()}</p>` : ''}
            <p style="font-size: 18px;"><strong>總計：¥${data.totalPrice.toLocaleString()}</strong></p>
        </div>

        <div class="reservation-info">
            <h3>📞 聯絡資訊</h3>
            <p><strong>聯絡電話：</strong> ${data.applicant.phone}</p>
            <p><strong>Email：</strong> ${data.applicant.email}</p>
            <p><strong>住宿飯店：</strong> ${data.applicant.hotel || '未提供'}</p>
        </div>

        <div class="important">
            <h3>⚠️ 重要提醒</h3>
            <ul>
                <li>若預約成功，我們最晚會在收到預約申請的隔日寄送付款連結給您，須完成付款，才算完成預約流程。</li>
                <li>為保護先完成付款的客戶的權益，若未能於取件日三日前完成付款，我們會將此訂單視為取消，不予保留預約雪具。敬請見諒。</li>
                <li>請確認所有個人資料正確，如有異動請盡快聯繫我們</li>
            </ul>
            
            <h4>退款與改期政策（以取件日為基準）</h4>
            
            <h5><strong>退款規則</strong></h5>
            <ul>
                <li><strong>取件日前 14 天（不含當日）以前取消</strong> → 退還扣除刷卡手續費（4%）後的全額</li>
                <li><strong>取件日前 7～13 天取消</strong> → 退還已付款項的 50%</li>
                <li><strong>取件日前 4～6 天取消</strong> → 退還已付款項的 20%</li>
                <li><strong>取件日前 3 天（含當日）取消</strong> → 恕不退款</li>
            </ul>
            
            <h5><strong>改期與變更規則</strong></h5>
            <ul>
                <li><strong>更改取件日期：</strong>最晚需在取件日前 3 天（不含當日） 辦理，且僅可更改一次</li>
                <li><strong>更改租借天數或部分人數取消</strong> → 視同整筆訂單取消，需重新預約</li>
            </ul>
            
            <p style="margin-top: 15px; font-size: 14px;">
                💡 <strong>天數計算方式：</strong>以取件日為第 0 天，往前一天為第 1 天，再依此類推。<br>
                💳 <strong>付款方式：</strong>日圓／僅接受信用卡付款
            </p>
        </div>
    </div>
    
    <div class="footer">
        <p>如有任何問題，請隨時與我們聯繫</p>
        <p>雪具預約系統 | 感謝您的選擇</p>
    </div>
</body>
</html>
    `;
  }

  // 生成店家通知郵件 HTML
  private generateStoreNotificationHTML(data: ReservationEmailData): string {
    const days = this.getDays(data.startDate, data.endDate);
    
    return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>新預約通知</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
        .urgent { background: #fef2f2; border: 1px solid #fca5a5; padding: 15px; margin: 15px 0; border-radius: 6px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background-color: #fee2e2; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚨 新預約通知</h1>
        <p>預約編號：${data.reservationNumber}</p>
    </div>
    
    <div class="content">
        <div class="urgent">
            <h3>📅 預約概要</h3>
            <p><strong>取件時間：</strong> ${data.pickupDate} ${data.pickupTime}</p>
            <p><strong>租借天數：</strong> ${days}天 (${data.startDate} ~ ${data.endDate})</p>
            <p><strong>租借地點：</strong> ${data.rentStore}</p>
            <p><strong>歸還地點：</strong> ${data.returnStore}</p>
            <p><strong>預約人數：</strong> ${data.persons.length}人</p>
            <p><strong>總金額：</strong> ¥${data.totalPrice.toLocaleString()}</p>
        </div>

        <h3>👤 申請人資訊</h3>
        <table>
            <tr><th>姓名</th><td>${data.applicant.name}</td></tr>
            <tr><th>電話</th><td>${data.applicant.phone}</td></tr>
            <tr><th>Email</th><td>${data.applicant.email}</td></tr>
            <tr><th>飯店</th><td>${data.applicant.hotel}</td></tr>
        </table>

        <h3>👥 租借者明細</h3>
        ${data.persons.map((person, index) => `
        <h4>第 ${index + 1} 位：${person.name}</h4>
        <table>
            <tr><th>年齡/性別</th><td>${person.age}歲 / ${person.gender}</td></tr>
            <tr><th>身高/體重</th><td>${person.height}cm / ${person.weight}kg</td></tr>
            <tr><th>腳尺寸</th><td>${person.footSize}cm</td></tr>
            <tr><th>程度</th><td>${person.level}</td></tr>
            <tr><th>類型</th><td>${person.skiType} - ${person.boardType}</td></tr>
            <tr><th>裝備</th><td>${person.equipType}</td></tr>
            ${person.clothingType && person.clothingType !== '否' ? `<tr><th>雪衣</th><td>${person.clothingType}</td></tr>` : ''}
            ${person.helmetOnly === '是' ? `<tr><th>安全帽</th><td>需要</td></tr>` : ''}
            ${person.fastWear === '是' ? `<tr><th>Fase快穿</th><td>需要</td></tr>` : ''}
            ${person.protectiveGear && person.protectiveGear !== '否' ? `<tr><th>護具</th><td>${person.protectiveGear}</td></tr>` : ''}
        </table>
        `).join('')}
    </div>
</body>
</html>
    `;
  }

  // 發送客戶確認郵件
  async sendCustomerConfirmation(data: ReservationEmailData): Promise<boolean> {
    try {
      const htmlContent = this.generateCustomerEmailHTML(data);
      
      const mailOptions = {
        from: `"雪具預約系統" <${process.env.SMTP_USER}>`,
        to: data.applicant.email,
        subject: `Snow Force雪具租借預約收件通知 ${data.reservationNumber}`,
        html: htmlContent,
        text: `預約收件通知 - 預約編號：${data.reservationNumber}，租借日期：${data.startDate} 至 ${data.endDate}，取件時間：${data.pickupDate} ${data.pickupTime}，總金額：¥${data.totalPrice.toLocaleString()}`,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Customer confirmation email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send customer confirmation email:', error);
      return false;
    }
  }

  // 發送店家通知郵件
  async sendStoreNotification(data: ReservationEmailData): Promise<boolean> {
    try {
      const htmlContent = this.generateStoreNotificationHTML(data);
      const storeEmail = process.env.STORE_EMAIL;
      
      if (!storeEmail) {
        console.warn('⚠️ STORE_EMAIL not configured, skipping store notification');
        return false;
      }
      
      const mailOptions = {
        from: `"雪具預約系統" <${process.env.SMTP_USER}>`,
        to: storeEmail,
        subject: `Snow Force新預約通知 ${data.reservationNumber}`,
        html: htmlContent,
        text: `新預約通知 - 預約編號：${data.reservationNumber}，申請人：${data.applicant.name}，取件：${data.pickupDate} ${data.pickupTime}，人數：${data.persons.length}人`,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Store notification email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send store notification email:', error);
      return false;
    }
  }

  // 發送預約相關的所有郵件
  async sendReservationEmails(data: ReservationEmailData): Promise<{ customer: boolean; store: boolean }> {
    console.log('📧 Sending reservation emails for:', data.reservationNumber);
    
    const results = await Promise.allSettled([
      this.sendCustomerConfirmation(data),
      this.sendStoreNotification(data),
    ]);

    return {
      customer: results[0].status === 'fulfilled' ? results[0].value : false,
      store: results[1].status === 'fulfilled' ? results[1].value : false,
    };
  }
}

export default new EmailService();