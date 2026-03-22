import InfoLayout from '@/components/InfoLayout';

export const metadata = {
  title: 'التثبيت والتحميل | حروف مع عبدو',
  description: 'تحميل وتثبيت لعبة حروف مع عبدو من GitHub Releases أو اللعب مباشرة عبر الويب.',
};

export default function InstallPage() {
  return (
    <InfoLayout
      title="التثبيت والتحميل"
      subtitle="اختر طريقة اللعب المناسبة: عبر الويب مباشرة أو تحميل نسخة Android الرسمية من صفحة الإصدارات."
    >
      <div className="changelog-item">
        <h3>الطريقة 1: اللعب مباشرة (الأسرع)</h3>
        <p>
          افتح اللعبة مباشرة من المتصفح بدون أي تنزيل:
          {' '}
          <a href="https://huroof-abdo.vercel.app/" target="_blank" rel="noopener noreferrer">https://huroof-abdo.vercel.app/</a>
        </p>
      </div>

      <div className="changelog-item">
        <h3>الطريقة 2: تثبيت Android من GitHub Releases</h3>
        <ul>
          <li>
            افتح صفحة الإصدارات الرسمية:
            {' '}
            <a href="https://github.com/KNIGHTABDO/huroof-ABDO/releases" target="_blank" rel="noopener noreferrer">GitHub Releases</a>
          </li>
          <li>حمّل ملف <strong>APK</strong> للتثبيت المباشر على الهاتف.</li>
          <li>ملف <strong>AAB</strong> مخصص أساساً للنشر على Google Play.</li>
          <li>بعد التثبيت سيظهر اسم التطبيق على الهاتف باسم: <strong>حروف مع عبدو</strong>.</li>
        </ul>
      </div>

      <div className="changelog-item">
        <h3>ملاحظات مهمة</h3>
        <ul>
          <li>إذا ظهرت رسالة حماية عند تثبيت APK، فعّل خيار التثبيت من مصادر موثوقة لهذا الملف فقط.</li>
          <li>تأكد من التحميل دائماً من صفحة الإصدارات الرسمية لنفس المستودع.</li>
          <li>لأفضل تجربة، حدّث التطبيق دائماً إلى آخر إصدار متاح في صفحة الإصدارات.</li>
        </ul>
      </div>
    </InfoLayout>
  );
}
