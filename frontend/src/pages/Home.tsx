import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Home: React.FC = () => {
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative text-center py-16 bg-gradient-to-b from-blue-50 to-white">
        {/* Language Switcher */}
        <div className="mb-6">
          <LanguageSwitcher variant="large" />
        </div>

        {/* 背景圖片（如果您有的話，放在public目錄） */}
        {/* <div className="absolute inset-0 opacity-20">
          <img src="/hero-background.jpg" alt="" className="w-full h-full object-cover" />
        </div> */}

        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-snow-900 mb-6">
            {t('home.title')}
          </h1>
          <p className="text-xl text-snow-600 mb-8 max-w-2xl mx-auto">
            {t('home.subtitle')}
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
                {t('home.termsTitle')}
              </h3>
              <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto text-left text-sm text-gray-700 leading-relaxed space-y-3">
                <p><strong>{t('terms.readCarefully')}</strong></p>

                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                  <p><strong>📅 {t('terms.businessInfo')}</strong></p>
                  <div className="mt-3 grid md:grid-cols-2 gap-4">
                    {/* Furano Store */}
                    <div className="bg-white p-3 rounded-lg border border-blue-200">
                      <h4 className="font-bold text-blue-800 mb-2 text-center">🏔️ {t('terms.furanoStore')}</h4>
                      <ul className="text-sm space-y-1">
                        <li><strong>{t('terms.businessDate')}</strong>{t('terms.furanoDate')}</li>
                        <li><strong>{t('terms.businessHours')}</strong>{t('terms.furanoHours')}</li>
                        <li><strong>{t('terms.lastPickup')}</strong>{t('terms.furanoLastPickup')}</li>
                      </ul>
                    </div>

                    {/* Asahikawa Store */}
                    <div className="bg-white p-3 rounded-lg border border-blue-200">
                      <h4 className="font-bold text-blue-800 mb-2 text-center">🏙️ {t('terms.asahikawaStore')}</h4>
                      <ul className="text-sm space-y-1">
                        <li><strong>{t('terms.businessDate')}</strong>{t('terms.asahikawaDate')}</li>
                        <li><strong>{t('terms.businessHours')}</strong>{t('terms.asahikawaHours')}</li>
                        <li><strong>{t('terms.lastPickup')}</strong>{t('terms.asahikawaLastPickup')}</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-3 bg-red-50 p-2 rounded border-l-4 border-red-400">
                    <p className="text-sm"><strong>⚠️ {t('terms.notes')}</strong></p>
                    <ul className="text-sm mt-1 space-y-1">
                      <li>• <span className="text-red-600 font-semibold">{t('terms.peakHoursNote')}</span></li>
                      <li>• {t('terms.earlyPickupNote')}</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                  <p><strong>🚌 {t('terms.shuttleRules')}</strong></p>
                  <div className="mt-3">
                    <div className="bg-green-100 p-2 rounded mb-3 border-l-4 border-green-500">
                      <p className="text-sm font-semibold text-green-800">💰 {t('terms.freeShuttleCondition')}</p>
                      <ul className="text-sm mt-1">
                        <li>• {t('terms.shuttleCondition1')}</li>
                        <li>• {t('terms.shuttleCondition2')}</li>
                      </ul>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      {/* Furano Shuttle Range */}
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h4 className="font-bold text-yellow-800 mb-2">🏔️ {t('terms.furanoShuttleRange')}</h4>
                        <ul className="text-sm space-y-1">
                          <li>• {t('terms.furanoRange1')}</li>
                          <li>• {t('terms.furanoRange2')}</li>
                        </ul>
                      </div>

                      {/* Asahikawa Shuttle Range */}
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h4 className="font-bold text-yellow-800 mb-2">🏙️ {t('terms.asahikawaShuttleRange')}</h4>
                        <ul className="text-sm space-y-1">
                          <li>• {t('terms.asahikawaRange1')}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
                  <p><strong>💳 {t('terms.paymentMethod')}</strong></p>
                  <p className="ml-4 mt-2">{t('terms.paymentDesc')}</p>
                </div>
                
                <div>
                  <p><strong>📋 {t('terms.serviceTerms')}</strong></p>

                  <div className="ml-4 space-y-2">
                    <div>
                      <p><strong>{t('terms.section1Title')}</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>{t('terms.section1Item1')}</li>
                        <li>{t('terms.section1Item2')}</li>
                      </ul>
                    </div>

                    <div>
                      <p><strong>{t('terms.section2Title')}</strong></p>
                      <p className="ml-4 text-xs">{t('terms.section2Desc')}</p>
                      <ul className="list-disc list-inside ml-8 space-y-1 text-xs">
                        <li>{t('terms.section2Item1')}</li>
                        <li>{t('terms.section2Item2')}</li>
                        <li>{t('terms.section2Item3')}</li>
                        <li>{t('terms.section2Item4')}</li>
                      </ul>
                    </div>

                    <div>
                      <p><strong>{t('terms.section3Title')}</strong></p>
                      <div className="ml-4 space-y-1">
                        <p className="font-medium">{t('terms.reservationConfirmed')}</p>
                        <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                          <li>{t('terms.reservationItem1')}</li>
                          <li>{t('terms.reservationItem2')}</li>
                        </ul>

                        <p className="font-medium">{t('terms.confirmationProcess')}</p>
                        <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                          <li>{t('terms.confirmItem1')}</li>
                          <li>{t('terms.confirmItem2')}</li>
                        </ul>

                        <p className="font-medium">{t('terms.refundPolicy')}</p>

                        <div className="ml-4 space-y-2">
                          <div>
                            <p className="font-medium text-xs">{t('terms.refundRules')}</p>
                            <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                              <li><strong>{t('terms.refund14Days')}</strong> → {t('terms.refund14DaysResult')}</li>
                              <li><strong>{t('terms.refund7to13Days')}</strong> → {t('terms.refund7to13DaysResult')}</li>
                              <li><strong>{t('terms.refund4to6Days')}</strong> → {t('terms.refund4to6DaysResult')}</li>
                              <li><strong>{t('terms.refund3Days')}</strong> → {t('terms.refund3DaysResult')}</li>
                            </ul>
                          </div>

                          <div>
                            <p className="font-medium text-xs">{t('terms.changeRules')}</p>
                            <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                              <li><strong>{t('terms.changeDate')}</strong>{t('terms.changeDateNote')}</li>
                              <li><strong>{t('terms.changeDaysOrCancel')}</strong> → {t('terms.changeDaysOrCancelNote')}</li>
                            </ul>
                          </div>

                          <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                            <p>💡 <strong>{t('terms.calculationMethod')}</strong>{t('terms.calculationNote')}</p>
                            <p>💳 <strong>{t('terms.paymentMethodNote')}</strong>{t('terms.paymentNote')}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p><strong>{t('terms.section4Title')}</strong></p>
                      <div className="ml-4 space-y-1 text-xs">
                        <p className="font-medium">{t('terms.sizeDescription')}</p>
                        <ul className="list-disc list-inside ml-4">
                          <li>{t('terms.sizeItem1')}</li>
                          <li>{t('terms.sizeItem2')}</li>
                          <li>{t('terms.sizeItem3')}</li>
                        </ul>

                        <p className="font-medium">{t('terms.returnRules')}</p>
                        <ul className="list-disc list-inside ml-4">
                          <li>{t('terms.returnItem1')}</li>
                          <li>{t('terms.returnItem2')}</li>
                          <li>{t('terms.returnItem3')}</li>
                        </ul>

                        <p className="font-medium">{t('terms.damageCompensation')}</p>
                        <ul className="list-disc list-inside ml-4">
                          <li>{t('terms.damageItem1')}</li>
                          <li>{t('terms.damageItem2')}</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <p><strong>{t('terms.section5Title')}</strong></p>
                      <div className="ml-4 space-y-1 text-xs">
                        <p className="font-medium">{t('terms.safetyCheck')}</p>
                        <ul className="list-disc list-inside ml-4">
                          <li>{t('terms.safetyItem1')}</li>
                          <li>{t('terms.safetyItem2')}</li>
                          <li>{t('terms.safetyItem3')}</li>
                        </ul>
                        <p className="font-medium mt-2">{t('terms.hygienePolicy')}</p>
                        <ul className="list-disc list-inside ml-4">
                          <li>{t('terms.hygieneItem1')}</li>
                          <li>{t('terms.hygieneItem2')}</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <p><strong>{t('terms.section6Title')}</strong></p>
                      <div className="ml-4 space-y-1 text-xs">
                        <p className="font-medium">{t('terms.freeShuttleService')}</p>
                        <ul className="list-disc list-inside ml-4">
                          <li>{t('terms.shuttleItem1')}</li>
                          <li>{t('terms.shuttleItem2')}</li>
                        </ul>
                        <p className="font-medium mt-2">{t('terms.luggageStorage')}</p>
                        <ul className="list-disc list-inside ml-4">
                          <li>{t('terms.luggageItem1')}</li>
                          <li>{t('terms.luggageItem2')}</li>
                          <li>{t('terms.luggageItem3')}</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <p><strong>{t('terms.section7Title')}</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                        <li>{t('terms.weatherItem1')}</li>
                        <li>{t('terms.weatherItem2')}</li>
                      </ul>
                    </div>

                    <div>
                      <p><strong>{t('terms.section8Title')}</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                        <li>{t('terms.equipmentItem1')}</li>
                        <li>{t('terms.equipmentItem2')}</li>
                        <li>{t('terms.equipmentItem3')}</li>
                      </ul>
                    </div>

                    <div>
                      <p><strong>{t('terms.section9Title')}</strong></p>
                      <p className="ml-4 text-xs">{t('terms.disclaimerDesc')}</p>
                      <ul className="list-disc list-inside ml-8 space-y-1 text-xs">
                        <li>{t('terms.disclaimerItem1')}</li>
                        <li>{t('terms.disclaimerItem2')}</li>
                        <li>{t('terms.disclaimerItem3')}</li>
                        <li>{t('terms.disclaimerItem4')}</li>
                      </ul>
                    </div>

                    <div>
                      <p><strong>{t('terms.section10Title')}</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                        <li>{t('terms.privacyItem1')}</li>
                        <li>{t('terms.privacyItem2')}</li>
                        <li>{t('terms.privacyItem3')}</li>
                      </ul>
                    </div>

                    <div>
                      <p><strong>{t('terms.section11Title')}</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                        <li>{t('terms.legalItem1')}</li>
                        <li>{t('terms.legalItem2')}</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 p-2 rounded border-l-4 border-orange-400">
                      <p><strong>⚠️ {t('terms.importantNotes')}</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                        <li>{t('terms.importantItem1')}</li>
                        <li>{t('terms.importantItem2')}</li>
                        <li>{t('terms.importantItem3')}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-center font-semibold text-gray-800 bg-blue-100 p-3 rounded-lg">
                  {t('terms.thankYou')}<br/>
                  {t('terms.contactLine')}
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
                    {t('home.agreeTerms')}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isTermsAccepted ? (
              <Link to="/reservation" className="btn-primary text-lg px-8 py-3">
                {t('home.reserveNow')}
              </Link>
            ) : (
              <button
                disabled
                className="text-lg px-8 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
              >
                {t('home.pleaseAgree')}
              </button>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home; 