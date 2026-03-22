# سجل التغييرات — حروف مع عبدو

جميع التغييرات البارزة في هذا المشروع موثقة في هذا الملف.

---

## [2.1.1] — 22 مارس 2026

### ✨ ميزات جديدة

- 📱 **تطبيق Android أصلي متاح:** نسخة موقعة وموثوقة من التطبيق عبر GitHub Releases
- 🚀 **بناء وتوقيع مؤتمت:** GitHub Actions تتعامل مع كل الخطوات تلقائياً
- 🔐 **آلية توقيع آمنة:** استخدام keystore موثق وGitHub Secrets للمفاتيح

### 🎯 التحسينات

- صفحة التثبيت والتحميل محدثة مع كشف ذكي لنوع الجهاز (iOS vs Android)
- توثيق شامل للإفراج (ANDROID_RELEASE_FULL_GUIDE.md)
- تحديثات خروج إصدارات مستقبلية محسّنة

### 📥 طرق التحميل

**الويب (لا يتطلب تحميل):**

- العنوان: https://huroof-abdo.vercel.app/
- متوفر على: جميع الأجهزة والمتصفحات

**Android APK (تطبيق موثوق):**

- التحميل المباشر: https://github.com/KNIGHTABDO/huroof-ABDO/releases/download/v2.1.1/app-release.apk
- حجم الملف: ~30MB
- متطلبات: Android 6.0+

**iPhone/iPad (تطبيق ويب):**

- نفس رابط الويب أو إضافة اختصار للشاشة الرئيسية

### 🔧 التغييرات التقنية

- استخدام Bubblewrap لتوليد مشروع Android/TWA
- Gradle build system لتوليد APK/AAB موقع
- JDK 17 كبيئة بناء الـ Java
- GitHub Actions workflow للبناء والتوقيع والإفراج المؤتمت

### 📚 التوثيق

- ANDROID_RELEASE_FULL_GUIDE.md: دليل شامل للإفراجات والأسرار
- CONTRIBUTING.md: تحديثات عملية الإفراج
- INFRASTRUCTURE.md: توثيق CI/CD الكامل

---

## [2.1.0] — سابق

_(تعديلات سابقة يمكن إضافتها هنا)_

---

## ملاحظات الإصدار

جميع الإصدارات تحافظ على التوافقية الكاملة مع الإصدارات السابقة. لتحميل إصدار معين، انظر إلى [GitHub Releases](https://github.com/KNIGHTABDO/huroof-ABDO/releases).
