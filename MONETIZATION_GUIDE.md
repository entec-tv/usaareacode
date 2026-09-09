# 💰 دليل تحقيق الأرباح وربط Google AdSense (الإصدار المطور - areacode-v2)

## 🎯 الهدف
تحويل موقع **ENTEC Phone Intelligence Hub** إلى مصدر دخل مستمر وعالي العائد من خلال إعلانات **Google AdSense**، وتحسين مواضع الوحدات الإعلانية ومعدل النقر (CTR).

---

## ⚙️ البيانات الرسمية المربوطة والمفعلة في الكود

| العنصر | القيمة المربوطة | الملف المسؤول |
| :--- | :--- | :--- |
| **Publisher Client ID** | `ca-pub-7997346618896033` | `src/config/ads.ts` & `src/routes/__root.tsx` |
| **Publisher ID** | `pub-7997346618896033` | `public/ads.txt` |
| **سجل ads.txt** | `google.com, pub-7997346618896033, DIRECT, f08c47fec0942fa0` | `public/ads.txt` |
| **Google Analytics (gtag)** | `G-XDZD19YSQS` | `src/routes/__root.tsx` |
| **Meta Verification** | `<meta name="google-adsense-account" content="ca-pub-7997346618896033">` | `src/routes/__root.tsx` |

---

## 📁 هيكلية ملفات الربط في الموقع الجديد (`areacode-v2`)

```
areacode-v2/
├── public/
│   └── ads.txt                     # ملف التحقق المباشر من النطاق (متاح على /ads.txt)
├── src/
│   ├── config/
│   │   └── ads.ts                  # الإعدادات المركزية لحساب قوقل ادز وأرقام الوحدات
│   ├── components/
│   │   └── ads/
│   │       └── GoogleAdBanner.tsx  # مكوّن React الإعلاني المتجاوب
│   ├── routes/
│   │   ├── __root.tsx              # حقن سكريبت AdSense و Analytics وميتا التحقق
│   │   └── index.tsx               # المواضع النشطة للإعلانات في الصفحة الرئيسية
│   └── styles.css                  # أنماط وتنسيقات حاويات الإعلانات
```

---

## 🧩 كيفية استخدام مكوّن الإعلانات `GoogleAdBanner`

المكوّن مبني ليعمل بسلاسة في بيئة React / TanStack Router مع حماية من الأخطاء التكرارية (Duplicate push) والتوافق مع الـ SSR:

### 1. إعلان متجاوب تلقائي (Auto Responsive):
```tsx
import { GoogleAdBanner } from "@/components/ads/GoogleAdBanner";

<GoogleAdBanner format="auto" />
```

### 2. إعلان ليدربورد أفقي (Leaderboard 728x90):
```tsx
<GoogleAdBanner format="horizontal" slot="1234567890" />
```

### 3. إعلان مستطيل جانبي أو في نهاية المحتوى (Rectangle 300x250):
```tsx
<GoogleAdBanner format="rectangle" slot="1234567890" />
```

---

## 📍 الأماكن المفعلة حالياً في الموقع

1. **نتائج البحث الفورية (Post-Search Results):** يظهر مباشرة بعد بطاقة تفاصيل المفتاح والخريطة التفاعلية.
2. **شريط الثقة والشركاء (Mid-Feed):** يظهر بعد شريط الهيئات التنظيمية وقبل قصص النجاح المؤسسية.
3. **قبل التذييل (Pre-Footer Banner):** إعلان كامل العرض في نهاية الصفحة الرئيسية قبل الفوتر.

---

## 🚀 وضع المعاينة والتطوير (Development Mode)
- أثناء التطوير المحلي (`npm run dev`)، يعرض المكوّن بطاقة معاينة أنيقة توضح معرّف الحساب وحجم الإعلان لتجنب حجب الإعلانات أو أخطاء المتصفح ولتثبيت مساحات الـ Layout ومنع اهتزاز الشاشة (CLS).
- في بيئة الإنتاج (`npm run build`)، يقوم تلقائياً بطلب الإعلانات الحقيقية من خوادم Google AdSense.

---

**تم التحديث والمطابقة لمنظومة ENTEC Phone Intelligence - سبتمبر 2026**
