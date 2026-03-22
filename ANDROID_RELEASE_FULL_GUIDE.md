# Android Release Full Guide — حروف مع عبدو

هذا الملف هو الدليل الكامل لإخراج **APK/AAB** ونشر Release على GitHub.

---

## 0) الوضع الحالي الآن

- لا يوجد APK/AAB محفوظ داخل المستودع حالياً.
- تم التأكد من ذلك (لا توجد ملفات `*.apk` أو `*.aab` داخل ملفات المشروع).
- هذا طبيعي لأن هذه الملفات عادة تكون ناتج Build وليست ضمن السورس.

---

## 1) أين يكون ملف APK؟

## محليًا (على جهازك)

بعد البناء المحلي، ستجد الملفات هنا:

- APK (debug):
  - `android/twa/app/build/outputs/apk/debug/`
- APK (release):
  - `android/twa/app/build/outputs/apk/release/`
- AAB (release):
  - `android/twa/app/build/outputs/bundle/release/`

## على GitHub Actions

من صفحة **Actions** > افتح run > قسم **Artifacts**:

- `android-apk-debug` (إذا لم توجد secrets)
- `android-apk-release` و `android-aab-release` (إذا secrets موجودة)

## على GitHub Releases

في تبويب **Releases** (Assets):

- يظهر `.apk` و `.aab` فقط عند تشغيل release على tag يبدأ بـ `v` مع secrets صحيحة.

---

## 2) طريقتان للنشر

## الطريقة A (سريعة جدًا): رفع APK جاهز يدويًا

استخدم هذه الطريقة إذا عندك APK جاهز الآن.

1. اذهب إلى GitHub > **Releases** > **Draft a new release**.
2. أنشئ Tag (مثال: `v2.1.0`).
3. ارفع ملف APK في **Assets**.
4. Publish release.

> هذه الطريقة لا تحتاج CI ولا secrets.

---

## الطريقة B (تلقائي بالكامل): GitHub Actions

الـ workflow الموجود في المشروع:

- `.github/workflows/android-release.yml`

سلوكه:

- `push` على `main`:
  - مع secrets: يبني release APK + AAB.
  - بدون secrets: يبني debug APK فقط (ولا يفشل).
- `push` على Tag يبدأ بـ `v`:
  - يتطلب secrets.
  - يبني release APK + AAB.
  - ينشر release تلقائيًا في GitHub Releases.

---

## 3) القيم المطلوبة في GitHub Secrets (للـ release التلقائي)

أضف في:

- Repository Settings > Secrets and variables > Actions

الأسرار الأربعة:

1. `ANDROID_KEYSTORE_BASE64`
2. `ANDROID_KEYSTORE_PASSWORD`
3. `ANDROID_KEY_ALIAS`
4. `ANDROID_KEY_PASSWORD`

---

## 4) كيف تجيب قيمة كل Secret (Windows)

## 4.1 إذا لا يوجد keystore عندك

أنشئ keystore جديد:

```powershell
keytool -genkeypair -v -keystore "C:\android\keys\huroof-release.jks" -alias android -keyalg RSA -keysize 2048 -validity 10000
```

احتفظ بـ:

- keystore password
- key password
- alias (في المثال: `android`)

## 4.2 تأكد من alias

```powershell
keytool -list -v -keystore "C:\android\keys\huroof-release.jks" -alias android
```

## 4.3 قيمة `ANDROID_KEYSTORE_BASE64`

```powershell
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\android\keys\huroof-release.jks"))
$b64 | Set-Clipboard
```

- الصق هذه القيمة في Secret: `ANDROID_KEYSTORE_BASE64`

## 4.4 باقي القيم

- `ANDROID_KEYSTORE_PASSWORD` = كلمة مرور keystore
- `ANDROID_KEY_ALIAS` = اسم alias (مثال: `android`)
- `ANDROID_KEY_PASSWORD` = كلمة مرور المفتاح

---

## 5) تنفيذ release تلقائي الآن (خطوتان)

من جهازك داخل المشروع:

```powershell
git tag v2.1.0
git push origin v2.1.0
```

بعدها:

1. اذهب إلى **Actions** وتأكد أن run نجح.
2. تحقق من نجاح:
   - `Build signed release APK + AAB`
   - `Publish GitHub Release (tags only)`
3. افتح **Releases** وتأكد من وجود `.apk` داخل Assets.

---

## 6) تشخيص سريع إذا APK لم يظهر

1. هل الـ tag يبدأ بـ `v`؟ (مثل `v2.1.0`)
2. هل الأسرار الأربعة موجودة؟
3. هل alias في secret مطابق للـ keystore؟
4. هل كلمات المرور صحيحة؟
5. هل خطوة `Publish GitHub Release (tags only)` نجحت؟

---

## 7) أوامر مفيدة

## بناء محلي يدوي

```powershell
cd android/twa
./gradlew assembleDebug
./gradlew assembleRelease bundleRelease
```

## عرض الملفات الناتجة

```powershell
Get-ChildItem -Recurse android/twa/app/build/outputs/apk
Get-ChildItem -Recurse android/twa/app/build/outputs/bundle
```

---

## 8) أفضل ممارسة مهمة

- لا تغيّر keystore بعد نشر أول نسخة release.
- لو غيرت keystore، التحديثات المستقبلية للتطبيق ستفشل التوقيع.

---

إذا أردت، أضيف نسخة عربية مختصرة جدًا (10 أسطر فقط) باسم `RELEASE_QUICK_START.md` للتنفيذ السريع في كل مرة.
