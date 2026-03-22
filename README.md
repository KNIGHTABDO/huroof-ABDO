<div align="center">
  <img src="public/assets/logo_transparent.png" alt="حروف مع عبدو Logo" width="200" />
  
  # حروف مع عبدو (Letters with Abdo)
  
  **لعبة الحروف العربية التفاعلية - تحدي الفرق في الوقت الحقيقي**  
  *(Interactive Arabic Letters Game - Real-time Team Challenge)*

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![PeerJS](https://img.shields.io/badge/PeerJS-WebRTC-blue.svg)](https://peerjs.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg?logo=vercel)](https://huroof-abdo.vercel.app/)

[🎮 العب الآن (Play Now)](https://huroof-abdo.vercel.app/) • [🤝 المساهمة (Contributing)](#-المساهمة-contributing) • [📋 سجل التغييرات (Changelog)](#-الروابط-المهمة-important-links)

</div>

---

## 🌟 اللمحة العامة (Overview)

**حروف مع عبدو** هو تطبيق ويب تفاعلي مصمم للتسلية مع العائلة والأصدقاء، يعتمد على تحديات الحروف العربية. اللعبة تجمع فريقين (البرتقالي والأخضر) في منافسة ممتعة للسيطرة على لوحة شكل سداسي (Hex Board) عبر الإجابة الصحيحة على الأسئلة واختيار الحروف المناسبة.

يقدم التطبيق واجهة مستخدم احترافية وسلسة بتصميم داكن وزجاجي يضفي طابعاً فريداً ومميزاً على تجربة المستخدم. **مُنشور ومتاح مجاناً على:** [https://huroof-abdo.vercel.app/](https://huroof-abdo.vercel.app/)

## 📸 لقطات الشاشة (Screenshots)

<div align="center">

### الصفحة الرئيسية (Landing Page)

<img src="public/screenshots/screenshot-landing.png" alt="الصفحة الرئيسية" width="800" />

### لوحة اللعبة - عرض سطح المكتب (Game Board - Desktop)

<img src="public/screenshots/screenshot-game-desktop.png" alt="لوحة اللعبة على سطح المكتب" width="800" />

### لوحة اللعبة - لوحي (Game Board - Tablet)

<img src="public/screenshots/screenshot-game-tablet.png" alt="لوحة اللعبة على اللوحي" width="600" />

### عرض الجوال (Mobile View)

<img src="public/screenshots/screenshot-landing-mobile.png" alt="عرض الجوال" width="390" />

</div>

## ✨ الميزات (Features)

- 🎮 **لعب جماعي في الوقت الفعلي:** تنافس بين لاعبين باستخدام تقنية (Peer-to-Peer عبر PeerJS) بدون تأخير.
- 🔔 **نظام الجرس التفاعلي (Buzzer):** أول من يضغط يربح حق الإجابة، مع واجهة تنبيهات فورية للمضيف.
- 📱 **تجربة غامرة (PWA & Fullscreen):** إمكانية تثبيت اللعبة على الشاشة الرئيسية (Add to Home Screen) للعب في وضع الشاشة الكاملة كلياً.
- 📲 **ماسح QR مدمج بالكاميرا:** انضمام فوري عبر مسح كود المضيف مباشرة من واجهة اللعبة الجوالة.
- 🎨 **تصميم عصري وجذاب:** واجهات مستخدم متقدمة بنمط (Glassmorphism) وتأثيرات حركية فاخرة.
- 🧩 **لوحة سداسية تفاعلية:** لوحة لعب سداسية مبتكرة تعتمد على الأحرف العربية مع تحديثات فورية للحالة.
- ⚙️ **تقنيات حديثة:** مبني باستخدام أحدث إصدارات Next.js 16 و React 19 لسرعة أداء فائقة.
- 🔄 **إعادة اتصال تلقائي:** نظام صلب لاستعادة الاتصال عند انقطاع الشبكة أو إغلاق الشاشة المؤقت.
- 🌐 **نشر مجاني:** متاح للعب مباشرةً على [https://huroof-abdo.vercel.app/](https://huroof-abdo.vercel.app/)

## 🚀 تقنيات المشروع (Tech Stack)

- **الإطار الرئيسي:** [Next.js 16](https://nextjs.org/) (App Router)
- **المكتبة الأساسية:** [React 19](https://react.dev/)
- **الشبكة (Network):** [PeerJS](https://peerjs.com/) للاتصال المباشر بين اللاعبين.
- **التصميم (Styling):** CSS Modules / Plain CSS (Custom glassmorphism design system).
- **الخطوط (Fonts):** خط `Cairo` لدعم ممتاز وتحسينات رائعة للنصوص العربية.
- **النشر (Deployment):** [Vercel](https://vercel.com/) على الرابط [https://huroof-abdo.vercel.app/](https://huroof-abdo.vercel.app/)

## 🛠 التثبيت والتشغيل المحلي (Installation & Setup)

1. **استنساخ المستودع (Clone the repository)**

   ```bash
   git clone https://github.com/KNIGHTABDO/huroof-ABDO.git
   cd huroof-ABDO
   ```

2. **تثبيت الحزم (Install dependencies)**

   ```bash
   npm install
   ```

3. **تشغيل خادم التطوير (Run development server)**

   ```bash
   npm run dev
   ```

   افتح [http://localhost:3000](http://localhost:3000) في متصفحك.

## 🧪 فحوصات الجودة (Quality Checks)

قبل رفع أي تغييرات، شغّل الأوامر التالية:

```bash
npm run lint
npm test
npm run test:coverage
```

- `npm run lint`: فحص جودة الكود وقواعد ESLint.
- `npm test`: تشغيل اختبارات الوحدة (Jest).
- `npm run test:coverage`: توليد تقرير تغطية الاختبارات لتسهيل الصيانة المستقبلية.

## 🏗 بنية التشغيل (Runtime Infrastructure)

للتفاصيل الفنية حول الواجهات، طبقات الاتصال، وإعدادات التطوير، راجع:

- [INFRASTRUCTURE.md](INFRASTRUCTURE.md)

## 🤝 المساهمة (Contributing)

نرحب دائماً بالمساهمين! لتطوير أو إصلاح أو تحسين اللعبة، يرجى مراجعة [دليل المساهمة (CONTRIBUTING.md)](CONTRIBUTING.md) للتعرف على الخطوات والقواعد.

## 📜 الروابط المهمة (Important Links)

- 🎮 [العب الآن (Play Now)](https://huroof-abdo.vercel.app/)
- 🔒 [سياسة الخصوصية (Privacy Policy)](https://huroof-abdo.vercel.app/privacy)
- 📋 [شروط الخدمة (Terms of Service)](https://huroof-abdo.vercel.app/terms)
- 🔄 [سجل التغييرات (Changelog)](https://huroof-abdo.vercel.app/changelog)

## 📄 الترخيص (License)

هذا المشروع مرخص بموجب أداة **MIT License** - يرجى الاطلاع على ملف [LICENSE](LICENSE) لمزيد من التفاصيل.
