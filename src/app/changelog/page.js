import InfoLayout from '@/components/InfoLayout';

export const metadata = {
  title: 'سجل التغييرات | حروف مع عبدو',
  description: 'سجل التحديثات والإصدارات الخاصة بلعبة حروف مع عبدو',
};

export default function ChangelogPage() {
  return (
    <InfoLayout 
      title="سجل التغييرات (Changelog)" 
      subtitle="تابع أحدث التحسينات والميزات الجديدة التي نضيفها باستمرار لجعل تجربتك أفضل."
    >
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
