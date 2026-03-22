'use client';

import InfoLayout from '@/components/InfoLayout';

export default function InstallClient() {
  return (
    <InfoLayout
      title="التثبيت والتحميل"
      subtitle="اختر الطريقة المناسبة لجهازك: تحميل تطبيق Android الأصلي، أو الدخول المباشر للويب و iOS"
    >
      {/* Android: Direct APK Download */}
      <div className="changelog-item" style={{ borderRight: '4px solid #4CAF50' }}>
        <h3 style={{ color: '#4CAF50', marginTop: 0 }}>📱 تحميل تطبيق Android</h3>
        <p>
          تم إصدار نسخة Android رسمية (v2.1.1) مع أداء محسّن وتجربة أفضل:
        </p>
        <div style={{ margin: '20px 0' }}>
          <a
            href="https://github.com/KNIGHTABDO/huroof-ABDO/releases/download/v2.1.1/app-release.apk"
            className="info-back-button"
            style={{ backgroundColor: '#4CAF50', borderColor: '#4CAF50', marginTop: 0, color: 'white' }}
            download
          >
            ⬇️ تحميل APK (v2.1.1)
          </a>
        </div>
        <h4>خطوات التثبيت:</h4>
        <ul>
          <li>انقر على زر التحميل أعلاه وانتظر تحميل الملف</li>
          <li>افتح الملف المحمّل (app-release.apk)</li>
          <li>اضغط على &quot;تثبيت&quot; (Install)</li>
          <li>تأكيد التثبيت إذا ظهر تحذير الحماية، ثم افتح التطبيق واستمتع باللعبة!</li>
        </ul>
      </div>

      {/* iOS / Desktop: Direct Web Access */}
      <div className="changelog-item" style={{ borderRight: '4px solid #2196F3' }}>
        <h3 style={{ color: '#2196F3', marginTop: 0 }}>🌐 الدخول المباشر (للـ iPhone والكمبيوتر)</h3>
        <p>
          لا حاجة لتحميل أي ملفات! يمكنك اللعب مباشرة وبأفضل أداء من المتصفح:
        </p>
        <div style={{ margin: '20px 0' }}>
          <a
            href="https://huroof-abdo.vercel.app/"
            className="info-back-button"
            style={{ backgroundColor: '#2196F3', borderColor: '#2196F3', marginTop: 0, color: 'white' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            🎮 ابدأ اللعب المباشر
          </a>
        </div>
        <h4>للـ iPhone / iPad (إضافة اختصار):</h4>
        <ul>
          <li>افتح Safari</li>
          <li>انتقل إلى الموقع أعلاه</li>
          <li>اضغط على زر &quot;مشاركة&quot; (Share)</li>
          <li>اختر &quot;إضافة إلى الشاشة الرئيسية&quot; (Add to Home Screen)</li>
        </ul>
      </div>

      <div className="changelog-item">
        <h3 style={{ marginTop: 0 }}>🎯 نظرة عامة:</h3>
        <ul>
          <li><strong>📱 Android:</strong> تطبيق أصلي (APK) للحصول على أفضل أداء (متوفر بـ GitHub Releases).</li>
          <li><strong>🍎 iPhone / iPad:</strong> تطبيق ويب تفاعلي (PWA) من المتصفح مباشرة.</li>
          <li><strong>💻 الكمبيوتر:</strong> لعب مباشر من أي متصفح.</li>
        </ul>
      </div>
    </InfoLayout>
  );
}