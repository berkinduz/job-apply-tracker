# JobTrack Redesign — Handoff & Manual TODOs

Bu doküman, sen (Berkin) tarafından **el ile yapılması gereken** ya da **karar
verilmesi gereken** her şeyi tek yerde topluyor. Kod tarafı (Claude tarafından)
tamamlandı; aşağıdaki maddeler ya hesap erişimi, ya policy onayı, ya da senin
varlık (asset) eklemen gerekiyor.

---

## 1. Supabase Dashboard — kendi yapman gerekenler

### 1.1 Leaked password protection
Supabase'in HaveIBeenPwned entegrasyonu **kapalı**. Açıldığında signup sırasında
sızdırılmış şifreler reddediliyor.

- **Yer:** Supabase dashboard → Authentication → Policies → Password Strength
- **Aksiyon:** "Leaked password protection" toggle'ını AÇ
- **Etki:** Sıfır kod değişikliği; sadece yeni signup'lar etkilenir

### 1.2 Email templates
Şu an Supabase'in default email template'leri var. Marka tutarlılığı için:

- **Yer:** Authentication → Email Templates
- **Düzenle:** "Confirm signup", "Reset password", "Magic link"
- **Öneri:** Brand-color buton (#5A5DE8), "jobtrack" lockup üstte, sade copy
- "Welcome to JobTrack — confirm your email"
- "Reset your JobTrack password"
- "Your sign-in link"

### 1.3 SMTP — kendi mail provider'ın
Default Supabase SMTP'si rate-limited (3 mail/saat). Production için kendi
SMTP'ni bağla:
- **Yer:** Project Settings → Auth → SMTP Settings
- **Öneri:** Resend, Postmark, SendGrid — `noreply@jobapplytracker.com` from address
- Domain verification (SPF + DKIM) gerekir

### 1.4 Storage bucket — resumes
Resume upload `resumes` bucket'ına yazıyor. Onboarding sırasında bu bucket var mı
kontrol et:
```sql
SELECT * FROM storage.buckets WHERE id = 'resumes';
```
Yoksa:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false);

-- RLS: kullanıcı kendi klasörüne yazıp okuyabilir
CREATE POLICY "Users can upload own resumes" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Users can read own resumes" ON storage.objects
FOR SELECT USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### 1.5 Test kullanıcı temizliği (`design-review@jobtrack.local`)
Bu kullanıcı bu redesign çalışması için seed edildi. Production'da kalsın
istemiyorsan SIL:
```sql
DELETE FROM auth.users WHERE email = 'design-review@jobtrack.local';
-- cascade siler: applications + user_settings
```

---

## 2. Domain & Marka

### 2.1 Favicon, app icons, apple-touch-icon — DONE
`src/app/icon.svg` (indigo brand mark) + `src/app/apple-icon.tsx` (180×180 dynamic
PNG via ImageResponse) hazır. Eski briefcase favicon.ico'lar (`public/`, `src/app/`)
silindi. Next.js otomatik bağlıyor. Modern tarayıcılar SVG'yi alır; iOS apple-icon
endpoint'inden PNG çeker.

### 2.2 OG image
Dinamik OG image `src/app/opengraph-image.tsx` üzerinden generate ediliyor (Edge runtime). Twitter / Facebook bunu çekiyor. Çalışıyor.
**Doğrulama:** https://www.opengraph.xyz/url/https%3A%2F%2Fjobapplytracker.com

### 2.3 PWA manifest — DONE
`src/app/manifest.ts` Next.js dinamik manifest endpoint'i (`/manifest.webmanifest`)
sağlıyor. Layout metadata `manifest: "/manifest.webmanifest"` linkliyor. Icon
referansları: SVG (any + maskable) + dynamic 180×180 apple-icon. PWA installable.

---

## 3. Domain & DNS

### 3.1 Canonical hostname
`siteConfig.url` default `https://jobapplytracker.com`. Eğer farklı subdomain
(www, app.jobapplytracker.com) kullanmak istersen `NEXT_PUBLIC_SITE_URL`
ortam değişkeniyle override et. Vercel'de:
- Project → Settings → Domains: primary `jobapplytracker.com`, redirect from `www`
- Project → Settings → Environment Variables: `NEXT_PUBLIC_SITE_URL=https://jobapplytracker.com`

### 3.2 robots.txt + sitemap.xml
`src/app/robots.ts` ve `src/app/sitemap.ts` zaten dinamik. Vercel'e deploy edilince çalışacak. Manuel kontrol:
- https://jobapplytracker.com/robots.txt
- https://jobapplytracker.com/sitemap.xml

### 3.3 Google Search Console
- Property ekle (jobapplytracker.com)
- Sitemap submit: `https://jobapplytracker.com/sitemap.xml`
- DNS TXT record ile ownership verification

---

## 4. Analytics

### 4.1 Vercel Analytics
Layout'ta `<Analytics />` zaten var, aktif.

### 4.2 Privacy-respecting analytics (önerim)
GA4 yerine **Plausible** veya **Umami** öner — cookie banner gerektirmez,
landing'in "your data is yours" mesajıyla uyumlu. Kurulum 5 dakika.

---

## 5. Konfigüre edilecek metin/copy

### 5.1 Footer linkleri
`src/components/jt/landing.tsx` içindeki `LandingFooter`'da placeholder linkler var:
- Product → Features / Pricing / Roadmap / Changelog (henüz route yok)
- Resources → Templates / Compare vs. Teal / Compare vs. Notion / Blog (route yok)
- Company → About / Contact / Privacy / Terms (gerçek sayfalar yapılmalı)

**Aksiyon — DONE:** `/privacy` ve `/terms` route'ları + `JtLegalShell` shared
component eklendi. Footer'daki ölü `#` linkler gerçek hrefs ile değiştirildi
(Features/Compare/FAQ anchor + Privacy/Terms/Contact/GitHub). Login disclaimer
da `/terms` ve `/privacy`'ye bağlı.

### 5.2 Testimonials
`src/components/jt/landing.tsx`'te 3 placeholder testimonial var (Maya / Diego / Jules).
Gerçek kullanıcılardan toplayınca değiştir veya PH launch sonrası "(early users)"
notuyla koru.

### 5.3 i18n (TR) çevirileri — KISMEN
- **Landing** (LandingHeader, Hero, Preview, Compare, FeatureSlab, Mocks, FAQ,
  FinalCta, Footer) → `landing.*` namespace altında tamamen i18n'lendi (EN + TR).
- **Login** (JtLogin + alt componentler) → `loginV2.*` namespace altında i18n'lendi.
  Magic link, password strength, error mesajları dahil.
- **Application form** (`jt/application-form.tsx`): section başlıkları/etiketleri
  hâlâ inline EN. Sonraki iterasyon.
- **App shell** (avatar menüsü, premium teaser, kanban/empty state'ler): hâlâ
  inline EN. Sonraki iterasyon.
- Landing header'a TR/EN toggle (`LangMenu`) eklendi — logged-out kullanıcı
  da dili değiştirebiliyor.

---

## 6. Schema notları

### 6.1 Yapılan migration
```sql
-- relax_application_required_fields_and_anon_revoke
ALTER TABLE applications ALTER COLUMN company_location DROP NOT NULL;
ALTER TABLE applications ALTER COLUMN company_industry DROP NOT NULL;
ALTER TABLE applications ALTER COLUMN source DROP NOT NULL;
ALTER TABLE applications ALTER COLUMN work_type SET DEFAULT 'remote';
REVOKE SELECT ON applications, user_settings FROM anon;
REVOKE INSERT, UPDATE, DELETE ON skill_suggestions FROM anon, authenticated;
```

### 6.2 İleride ekleyebileceğin alanlar (pazar talebine göre)
- `applications.follow_up_date` (timestamptz, nullable) — stale reminder geliştirmek için
- `applications.offer_details` (jsonb) — base salary, equity, sign-on, deadline
- `applications.archived_at` (timestamptz, nullable) — soft delete
- `user_settings.weekly_goal` (int, nullable) — onboarding goal kullanıcıdan alındı ama henüz saklanmıyor
- Yeni tablo `activity_events` (id, application_id, user_id, kind, payload, created_at) — şu an synthetic timeline kullanıyoruz

---

## 7. Yapılması gereken sonraki büyük özellikler (roadmap notları)

Bunlar redesign kapsamı **dışı** ama brief'te room bırakıldı:

1. **URL paste → autofill** (LinkedIn / Indeed scraper). Server-side fetch + parse.
2. **AI job-spec özet** — yapıştırılan JD'yi Anthropic API ile özet (Sonnet 4 ucuz tutar).
3. **Email forwarding** — `you@inbox.jobtrack.app` adresini kullanıcıya ata; gelen mail'i otomatik application'a dönüştür.
4. **Browser extension** — LinkedIn job sayfasında "Track in JobTrack" butonu.
5. **Follow-up reminders** — `follow_up_date` + cron + email/push delivery.
6. **CSV import** — onboarding 1. adımdaki "Import from CSV" karşılığı.
7. **Public profile / share** — viral loop. `jobtrack.com/u/berkin` → kullanıcının funnel istatistikleri (sayılar değil yüzdeler).
8. ~~**Klavye kısayolları (Cmd+K palette)**~~ — DONE. cmdk dialog ile gerçek
   command palette: quick actions + tüm başvurularda full-text search.

---

## 8. Önemli kararlar (kayıt için)

- **Marka adı:** JobTrack (korundu)
- **Tagline:** "Your job hunt's command center." / "Land your next role — without the spreadsheet."
- **Primary renk:** indigo `#5A5DE8` (oklch 0.58 0.18 270)
- **Accent renk:** amber `#F5B842` (offer + celebration)
- **Tipografi:** Geist Sans (UI + display), Geist Mono (numeric)
- **Dark mode:** neutral surfaces (`#111114` bg) — mavi ton kullanılmıyor (kullanıcı feedback'i)
- **Onboarding:** 3 adımlı, "Try sample data" seçeneği var, sample seed action prod'da yazıyor
- **Form:** 2 zorunlu alan (Company + Role); diğer her şey opsiyonel + sensible defaults
- **Test kullanıcı:** `design-review@jobtrack.local` (silinecek)

---

## 9. Production deploy checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` Vercel'de set
- [ ] `NEXT_PUBLIC_SITE_URL=https://jobapplytracker.com` Vercel'de set
- [ ] Storage bucket `resumes` private + RLS policy'leri (§1.4)
- [ ] Leaked password protection açık (§1.1)
- [ ] Custom SMTP bağlı (§1.3) — yoksa email magic link 3/saat'i geçemez
- [ ] Favicon + icon set yüklü (§2.1)
- [ ] design-review user silindi (§1.5)
- [ ] Privacy + Terms sayfaları yayında (§5.1)
- [ ] Plausible/Umami analytics kurulu (§4.2)
- [ ] Search Console submission (§3.3)
- [ ] OG image render testi (§2.2)

---

## 10. Bilinen eksiklikler / sonraki iterasyon

- **i18n (TR) çevirileri** application-form ve app-shell kalan inline string'ler (§5.3)
- ~~**Cmd+K command palette**~~ DONE
- **Activity timeline** synthetic — gerçek event log tablosu eklenmeli
- **Pipeline progress click → status değişimi** çalışıyor ama optimistic update'i henüz yok
- **Kanban mobile** swipe pattern brief'te vardı ama henüz yapılmadı (mevcut kanban grid mobile'da yatay scroll)

---

İletişim: kod tarafında bir şey patlar veya yön değişirse, brief (`DESIGN_BRIEF.md`)
ve bu doküman bağlamında devam edilir.
