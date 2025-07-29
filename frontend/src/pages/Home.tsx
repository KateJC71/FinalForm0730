import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative text-center py-16 bg-gradient-to-b from-blue-50 to-white">
        {/* 背景圖片（如果您有的話，放在public目錄） */}
        {/* <div className="absolute inset-0 opacity-20">
          <img src="/hero-background.jpg" alt="" className="w-full h-full object-cover" />
        </div> */}
        
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-snow-900 mb-6">
            歡迎來到<br/>Snow Force雪具預約系統
          </h1>
          <p className="text-xl text-snow-600 mb-8 max-w-2xl mx-auto">
            請先詳閱下列說明再進行預約! 趕快來一起感受Bochi Powder的魅力!
          </p>
          
          {/* 主要圖片區域 */}
          <div className="mb-8">
            {/* 如果您有主要展示圖片，取消註解並放置圖片 */}
            {/* <img src="/ski-equipment.jpg" alt="滑雪裝備" className="w-full max-w-2xl mx-auto rounded-lg shadow-lg" /> */}
          </div>
          
          {/* 條款方塊 */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                租借條款與注意事項
              </h3>
              <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto text-left text-sm text-gray-700 leading-relaxed space-y-3">
                <p><strong>請仔細閱讀以下營業資訊與服務條款：</strong></p>
                
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                  <p><strong>📅 營業資訊</strong></p>
                  <div className="mt-3 grid md:grid-cols-2 gap-4">
                    {/* 富良野店 */}
                    <div className="bg-white p-3 rounded-lg border border-blue-200">
                      <h4 className="font-bold text-blue-800 mb-2 text-center">🏔️ 富良野店</h4>
                      <ul className="text-sm space-y-1">
                        <li><strong>營業日期：</strong>2025/12/1 - 2026/05/10</li>
                        <li><strong>營業時間：</strong>08:00 - 18:00</li>
                        <li><strong>最後取件：</strong>17:30</li>
                      </ul>
                    </div>
                    
                    {/* 旭川店 */}
                    <div className="bg-white p-3 rounded-lg border border-blue-200">
                      <h4 className="font-bold text-blue-800 mb-2 text-center">🏙️ 旭川店</h4>
                      <ul className="text-sm space-y-1">
                        <li><strong>營業日期：</strong>2025/12/1 - 2026/03/31</li>
                        <li><strong>營業時間：</strong>07:30 - 19:00</li>
                        <li><strong>最後取件：</strong>18:30</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-3 bg-red-50 p-2 rounded border-l-4 border-red-400">
                    <p className="text-sm"><strong>⚠️ 注意事項：</strong></p>
                    <ul className="text-sm mt-1 space-y-1">
                      <li>• <span className="text-red-600 font-semibold">8:00-12:00 尖峰時段，非預約客戶可能無法接待</span></li>
                      <li>• 14:00以後為前一日提早取件時段</li>
                    </ul>
                  </div>
                </div>


                <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                  <p><strong>🚌 接送規則</strong></p>
                  <div className="mt-3">
                    <div className="bg-green-100 p-2 rounded mb-3 border-l-4 border-green-500">
                      <p className="text-sm font-semibold text-green-800">💰 免費接送條件</p>
                      <ul className="text-sm mt-1">
                        <li>• 當日裝備租滿￥10,000/人即可免費接送</li>
                        <li>• 上課前租借，請提前60分鐘以上來店</li>
                      </ul>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-3">
                      {/* 富良野接送範圍 */}
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h4 className="font-bold text-yellow-800 mb-2">🏔️ 富良野店接送範圍</h4>
                        <ul className="text-sm space-y-1">
                          <li>• 富良野市區</li>
                          <li>• 新富良野王子/北之峰區域飯店</li>
                        </ul>
                      </div>
                      
                      {/* 旭川接送範圍 */}
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h4 className="font-bold text-yellow-800 mb-2">🏙️ 旭川店接送範圍</h4>
                        <ul className="text-sm space-y-1">
                          <li>• 旭川市區⇔旭川車站</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
                  <p><strong>💳 付款方式</strong></p>
                  <p className="ml-4 mt-2">日幣／僅接受信用卡付款</p>
                </div>
                
                <div>
                  <p><strong>📋 雪具租賃服務條款</strong></p>
                  
                  <div className="ml-4 space-y-2">
                    <div>
                      <p><strong>一、服務說明</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>本公司提供網路預約滑雪相關用品租賃服務</li>
                        <li>服務範圍：富良野市、旭川市內</li>
                      </ul>
                    </div>

                    <div>
                      <p><strong>二、租賃資格</strong></p>
                      <p className="ml-4 text-xs">如有下列情況，本公司有權限制或取消租賃資格：</p>
                      <ul className="list-disc list-inside ml-8 space-y-1 text-xs">
                        <li>提供虛假資料或資料不完整</li>
                        <li>有未歸還之租賃物品紀錄</li>
                        <li>有租金逾期或未支付紀錄</li>
                        <li>無法聯繫到登記的聯絡方式</li>
                      </ul>
                    </div>

                    <div>
                      <p><strong>三、預約與取消</strong></p>
                      <div className="ml-4 space-y-1">
                        <p className="font-medium">預約成立：</p>
                        <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                          <li>完成線上登記、付款，並收到預約完成確認信</li>
                          <li>如需變更預約內容，請直接聯繫Line客服</li>
                        </ul>
                        
                        <p className="font-medium">預約確認流程：</p>
                        <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                          <li>預約後24小時內發送確認信</li>
                          <li>取件當日請攜帶：護照、預約確認信、付款證明</li>
                        </ul>
                        
                        <p className="font-medium">取消與退款政策：</p>
                        <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                          <li>租用開始7日前：退還50%</li>
                          <li>租用開始3日前：退還20%</li>
                          <li>租用開始3日內：不予退款</li>
                          <li className="text-red-600">※部分取消視為整筆取消，需重新預約</li>
                          <li className="text-red-600">※請注意付款後退款皆需扣除4%手續費</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <p><strong>四、租賃規定</strong></p>
                      <div className="ml-4 space-y-1 text-xs">
                        <p className="font-medium">尺寸說明：</p>
                        <ul className="list-disc list-inside ml-4">
                          <li>實際尺寸以現場試穿為準</li>
                          <li>如尺寸不合，將提供最接近需求之現有庫存</li>
                          <li>因尺寸問題恕不退費</li>
                        </ul>
                        
                        <p className="font-medium">歸還規定：</p>
                        <ul className="list-disc list-inside ml-4">
                          <li>須於租期結束當日歸還</li>
                          <li>逾期每日收取一日租金</li>
                          <li>逾期7日未歸還視同遺失</li>
                        </ul>
                        
                        <p className="font-medium">損壞賠償：</p>
                        <ul className="list-disc list-inside ml-4">
                          <li>遺失或嚴重損壞：收取該物品20倍日租金</li>
                          <li>賠償範圍包含租賃物損失及營業損失</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <p><strong>五、安全與清潔政策</strong></p>
                      <div className="ml-4 space-y-1 text-xs">
                        <p className="font-medium">安全檢查：</p>
                        <ul className="list-disc list-inside ml-4">
                          <li>所有裝備租借前後皆經清潔消毒</li>
                          <li>租借裝備前將進行安全檢查說明</li>
                          <li>如發現裝備異常請立即停止使用並聯繫本店</li>
                        </ul>
                        <p className="font-medium mt-2">衛生政策：</p>
                        <ul className="list-disc list-inside ml-4">
                          <li>如有衛生疑慮請於租借時提出</li>
                          <li>建議承租人自備滑雪保險</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <p><strong>六、附加服務說明</strong></p>
                      <div className="ml-4 space-y-1 text-xs">
                        <p className="font-medium">免費接送服務：</p>
                        <ul className="list-disc list-inside ml-4">
                          <li>實際服務視現場狀況調整</li>
                          <li>如因接送延誤造成任何損失（含錯過交通工具），本公司不負賠償責任</li>
                        </ul>
                        <p className="font-medium mt-2">行李寄放服務：</p>
                        <ul className="list-disc list-inside ml-4">
                          <li>限雪具承租者使用</li>
                          <li>每人最多2件行李</li>
                          <li>須於當日營業結束前領回</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <p><strong>七、天候影響政策</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                        <li>暴風雪等情況下接送服務可能暫停</li>
                        <li>因天災停業期間可免費延期租借</li>
                      </ul>
                    </div>

                    <div>
                      <p><strong>八、裝備故障應對</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                        <li>租借期間如遇裝備故障，請立即聯繫本店</li>
                        <li>本店將免費提供替代裝備或協助維修</li>
                        <li>因裝備故障造成的滑雪時間損失，本店不負額外賠償責任</li>
                      </ul>
                    </div>

                    <div>
                      <p><strong>九、免責聲明</strong></p>
                      <p className="ml-4 text-xs">本公司不負責：</p>
                      <ul className="list-disc list-inside ml-8 space-y-1 text-xs">
                        <li>租賃期間的人身傷害</li>
                        <li>物品遺失或被盗</li>
                        <li>因天災或不可抗力因素造成的損失</li>
                        <li>因個人技術不當使用造成的裝備損壞</li>
                      </ul>
                    </div>

                    <div>
                      <p><strong>十、個人資料保護</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                        <li>僅用於租賃契約相關用途</li>
                        <li>原則上不對第三方公開</li>
                        <li>如需更改資料可聯繫本公司</li>
                      </ul>
                    </div>

                    <div>
                      <p><strong>十一、法律適用</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                        <li>本契約適用日本國法律</li>
                        <li>如有爭議以富良野簡易裁判所為管轄法院</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 p-2 rounded border-l-4 border-orange-400">
                      <p><strong>⚠️ 注意事項</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                        <li>所有服務以現場實際狀況為準</li>
                        <li>如有未盡事宜，依本公司規範辦理</li>
                        <li>預約前請詳閱以上規定</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <p className="mt-4 text-center font-semibold text-gray-800 bg-blue-100 p-3 rounded-lg">
                  感謝您選擇Snow Force，祝您滑雪愉快！<br/>
                  如有任何問題請聯繫Line客服
                </p>
              </div>
              
              <div className="mt-6 flex items-center justify-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTermsAccepted}
                    onChange={(e) => setIsTermsAccepted(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    我已詳細閱讀並同意以上條款與注意事項
                  </span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isTermsAccepted ? (
              <Link to="/reservation" className="btn-primary text-lg px-8 py-3">
                立即預約
              </Link>
            ) : (
              <button 
                disabled 
                className="text-lg px-8 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
              >
                請先同意條款才能預約
              </button>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home; 