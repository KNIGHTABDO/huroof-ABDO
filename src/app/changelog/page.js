import InfoLayout from '@/components/InfoLayout';

export const metadata = {
  title: 'سجل التغييرات | حروف مع عبدو',
  description: 'سجل التحديثات والإصدارات الخاصة بلعبة حروف مع عبدو',
};

export default function ChangelogPage() {
  return (
    <InfoLayout 
      title="سجل التغييرات (Changelog)" 
      subtitle="نحن نطور 'حروف مع عبدو' باستمرار لتوفير أفضل تجربة لعب عربية تفاعلية. إليكم آخر التحديثات."
    >
      <div className="changelog-item">
        <span className="info-date">22 مارس 2026</span>
        <h3>
          <span className="changelog-version">v1.2.0</span>
          نظام الجرس التفاعلي وتجربة الشاشة الكاملة
        </h3>
        <ul>
          <li><strong>جديد:</strong> نظام "الجرس" (Buzzer)؛ الآن يمكن للاعبين قرع الجرس لإيقاف اللعبة والإجابة، مع تنبيهات فورية للمضيف.</li>
          <li><strong>جديد:</strong> ماسح QR مدمج (In-App Scanner)؛ إمكانية مسح كود المضيف مباشرة من داخل التطبيق باستخدام كاميرا الهاتف دون الحاجة لمغادرته.</li>
          <li><strong>جديد:</strong> دعم تجربة "الشاشة الكاملة" (Immersive Mode) ونظام الـ PWA؛ إرشادات مخصصة لتثبيت اللعبة على iOS و Android للعب بدون شريط المتصفح.</li>
          <li><strong>جديد:</strong> ميزة الانضمام السريع عبر رمز (QR Code) مع دعم الربط التلقائي للغرف عبر الرابط.</li>
          <li><strong>تحسين:</strong> نظام "إعادة الاتصال التلقائي" (Auto-Reconnect)؛ اللعبة الآن تستعيد الاتصال تلقائياً عند انقطاع الشبكة أو إغلاق الشاشة المؤقت للاعب أو المضيف.</li>
          <li><strong>تحسين:</strong> إخفاء نص السؤال عن اللاعبين لمنح المضيف الخصوصية والاحترافية في إدارة المنافسة.</li>
          <li><strong>تحسين:</strong> إعادة صياغة كاملة لبنك الأسئلة العربية لتصبح أكثر دقة وتحدياً واحترافية.</li>
          <li><strong>إصلاح:</strong> حل مشكلة تعطل خاصية "النسخ" في الشبكات المحلية (Local IPs) عبر توفير نظام نسخ بديل.</li>
        </ul>
      </div>

      <div className="changelog-item">
        <span className="info-date">21 مارس 2026</span>
        <h3>
          <span className="changelog-version">v1.1.0</span>
          تحديث الهوية البصرية وإطلاق صفحات المعلومات
        </h3>
        <ul>
          <li><strong>جديد:</strong> إضافة صفحة "سياسة الخصوصية" و "شروط الخدمة" للشفافية المطلقة.</li>
          <li><strong>جديد:</strong> تصميم سجل التغييرات بتجربة استخدام (Apple-like) فريدة وخطوط أنيقة.</li>
          <li><strong>تحسين:</strong> استخدام الهوية البصرية الجديدة والشعار الجديد (logo) العالي الجودة في جميع صفحات التطبيق.</li>
          <li><strong>تحسين:</strong> دعم شامل لـ Dark Mode Glassmorphism بتصميم يعكس احترافية اللعبة.</li>
        </ul>
      </div>

      <div className="changelog-item">
        <span className="info-date">14 مارس 2026</span>
        <h3>
          <span className="changelog-version">v1.0.5</span>
          تحسين تجربة اللعب وإدارة الفرق
        </h3>
        <ul>
          <li><strong>جديد:</strong> إضافة ميزة إدخال أسماء اللاعبين وتحديد ألوان الفريق (الأخضر/البرتقالي) قبل الانضمام للعبة.</li>
          <li><strong>جديد:</strong> إضافة لوحة تحكم الخادم (Host) لتغيير لاعبي الفرق بسهولة وبث التغييرات عبر P2P.</li>
          <li><strong>إصلاح:</strong> حل مشكلة اختلاط الأحرف المتقاطعة في اللوحة السداسية (Hex Board).</li>
          <li><strong>تحسين:</strong> ترقية أداء اتصال (PeerJS) وتقليل التأخير بشكل ملحوظ للاعبين.</li>
        </ul>
      </div>

      <div className="changelog-item">
        <span className="info-date">10 مارس 2026</span>
        <h3>
          <span className="changelog-version">v1.0.0</span>
          الإطلاق الأولي (Initial Release)
        </h3>
        <ul>
          <li><strong>إطلاق:</strong> الإصدار الأول من لعبة حروف مع عبدو باللوحة السداسية.</li>
          <li><strong>أساسيات:</strong> نظام النقط والتحديات الثنائي.</li>
          <li><strong>أساسيات:</strong> واجهات اللعب المبدئية.</li>
        </ul>
      </div>
    </InfoLayout>
  );
}
