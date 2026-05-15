# JobTrack — End-to-End Redesign Brief for Claude Design

> Brief'i okuyan kişi: Claude Design veya kıdemli bir ürün tasarımcısı.
> Çıktı: tüm ürünü kapsayan, uygulanabilir bir tasarım sistemi + ekran-ekran wireframe / yüksek-fidelity tasarım.

---

## 0. Bağlam

**JobTrack**, iş başvurularını takip etmek için yapılmış bir Next.js + Supabase ürünü. Şu an https://jobapplytracker.com adresinde canlı, ancak adoption düşük — toplam DB'de 17 başvuru var, kullanıcılar girip kayboluyor. Stack modern (React 19, Tailwind v4, shadcn/ui, Supabase), kod sağlam — ancak ürün **kötü onboard ediyor, formu uzun, görsel kimliği jenerik, mobile zayıf, value proposition zayıf**. Tüm ürünü baştan kurguluyoruz.

### Mevcut canlının teşhis özeti

| Alan | Mevcut durum | Sorun |
|---|---|---|
| Marka | "JobTrack — Job Application Manager", siyah-beyaz monochrome | Hatırlanmıyor; "Manager" kelimesi soğuk |
| Hero | "Track every application with total clarity." | Generic; her competitor aynı söylüyor |
| Sosyal kanıt | Yok | Sıfır güven inşası |
| Yeni başvuru formu | 7 zorunlu alan (şirket, lokasyon, sektör, pozisyon, tarih, work type, source) | İlk başvuru girmek 2-3 dakika — drop-off başlıca burada |
| Onboarding | Yok — login sonrası boş ekran | Kullanıcı "ne yapayım?" deyip kapatır |
| Kanban | 4 kolon 1440px'da görünüyor, 8 status var | Yatay scroll, mobilde kullanılamaz |
| Analytics | Production'da `"Insights (Coming Soon)"` placeholder var | Profesyonellik zayıflığı |
| Header | 6 ikon-only nav (lang, tema, list, analytics, settings, logout) | Label yok, hangisi ne belirsiz |
| Mobile | Cards çok büyük, kanban yatay-scroll | Tek kolon değil, swipe pattern yok |
| Boş state'ler | Tek ikon + tek cümle | Sample data, ilk-deneme yardımı yok |

### Hedef kitle

- **Yeni mezunlar** — ilk işini arayan üniversite/bootcamp mezunu, 22-26 yaş
- **Bootcamp grads** — kariyer değiştiren, dağınık başvuru sürecinden bunalan
- **Junior–mid mühendisler** — paralel 10-30 başvuruyu yönetmek zorunda

Ortak özellik: **motivasyonlu ama yorgun**. Süreç kaotik. Spreadsheet'le başlıyor, vazgeçiyor. "Bu işi düzenleyecek bir araç" arıyor — ama **karmaşık enterprise tool istemiyor**. Notion kadar kişisel, Teal/Huntr kadar profesyonel.

---

## 1. Marka kimliği

### Ad ve etiket
- **Marka adı:** JobTrack (korunur)
- **Yeni tagline:** **"Your job hunt's command center."**
- **Eski "Job Application Manager" descriptor'ı silinir** (soğuk, jenerik).
- Alternatif kısa tagline ekleri (kullanım yerine göre):
  - Footer: *"Built by job seekers, for job seekers."*
  - OG image: *"Land your next role — without the spreadsheet."*

### Marka sesi (voice)

Bir cümleyle: **Confident peer, not corporate.** Job-hunt'ın grind olduğunu bilen ama dramatize etmeyen, doğrudan ve sıcak bir arkadaş.

| Marka **olur** | Marka **olmaz** |
|---|---|
| Confident, direct | Pushy, salesy |
| Empathic about job-search fatigue | Whiny, "we know it's so hard" |
| Modern, slightly bold | Corporate, "enterprise solutions" |
| Specific ("Track follow-ups in 30 seconds") | Vague ("Empower your career") |
| Honest — free tier is free | Trial-bait, hidden upsells |
| Uses tech vocab where audience speaks it ("kanban", "pipeline") | Jargon dump ("synergize your funnel") |
| Lower-case where it feels natural ("ready when you are") | All-caps headlines |
| Encourages without flattering ("Nice — that's 5 this week") | Cringe celebration ("AMAZING job!!! 🎉🎉") |

### Yazım tonu örnekleri

**Hero (landing):**
> Land your next role — without the spreadsheet.
> JobTrack tracks every application, every follow-up, every offer. Free, forever.

**Empty state (no applications):**
> No applications yet. Let's fix that.
> Drop a job link, paste a posting, or start with sample data — you'll be tracking in 30 seconds.

**Form save success:**
> Added Stripe → Senior Frontend. Next: set a follow-up reminder?

**Status change → Offer:**
> Offer at Anthropic 🎉  Nice. Want to add the offer details for your analytics?

**Rejected:**
> Marked Notion as rejected. Their loss. Want to move on or note what you learned?

---

## 2. Görsel kimlik

### Renk paleti

Mevcut ürün tamamen monochrome. Bu **karakter yok** demek. Yeni palette:

**Primary** — sıcak ama profesyonel bir indigo. "Co-pilot" hissi, hem ciddi hem genç.
```
--primary-50:   oklch(0.97 0.02 270)   /* #F1F2FE */
--primary-100:  oklch(0.94 0.04 270)   /* #E2E4FD */
--primary-300:  oklch(0.78 0.12 270)   /* #A4A8F6 */
--primary-500:  oklch(0.58 0.18 270)   /* #5A5DE8 */  ← brand primary
--primary-600:  oklch(0.50 0.18 270)   /* #4A4DDC */
--primary-700:  oklch(0.42 0.16 270)   /* #3B3DB8 */
--primary-900:  oklch(0.25 0.10 270)   /* #1E1F66 */
```

**Accent** — kutlama / offer / başarı anları için sıcak amber:
```
--accent-500:   oklch(0.78 0.16 75)    /* ~#F5B842 */
--accent-600:   oklch(0.70 0.16 65)    /* ~#E69B2E */
```

**Status colors** (semantic — kanban + badge + grafikler için)
```
applied             → slate / nötr      oklch(0.62 0.03 250)  /* #94A2B8 */
test_case           → mor-mavi         oklch(0.65 0.16 280)  /* #9B7AE5 */
hr_interview        → cyan-mint        oklch(0.72 0.12 195)  /* #5AC4D2 */
technical_interview → indigo-deep      oklch(0.55 0.18 265)  /* #5158D6 */
management_interview→ violet           oklch(0.62 0.18 305)  /* #B860D9 */
offer               → amber (accent)   oklch(0.78 0.16 75)   /* #F5B842 */
accepted            → emerald          oklch(0.68 0.16 155)  /* #43C18B */
rejected            → coral (soft)     oklch(0.68 0.16 25)   /* #E07A6B */
```

Status renklerini hem **light** hem **dark** mode'da kontrastı koruyacak şekilde tonla. Background olarak status renklerinin `100` tonu (light) veya `300` + alpha 12% (dark) kullanılır.

**Neutral scale** — light/dark mode core:
```
--bg-light:        #FAFAFB          /* soft off-white, pure beyaz değil */
--bg-elevated:     #FFFFFF
--text-primary:    #0E0F1A
--text-secondary:  #565878
--border:          #E5E7F0

--bg-dark:         #0B0C16          /* mavi-siyah, pure black değil */
--bg-dark-elev:    #14162A
--text-dark-pri:   #F4F4F8
--text-dark-sec:   #9091AA
--border-dark:     #232543
```

Dark mode önemli — hedef kitle önemli ölçüde dark-mode kullanıcısı (developer / bootcamp tech grad). Default'u sistem-takip et.

### Tipografi

**Font ailesi:**
- **UI / body / labels:** **Geist Sans** (Next.js ekosisteminde zaten var, modern, geniş weight skalası)
- **Display (hero, page titles):** **Geist Sans** weight 600-700, tracking `-0.025em` (tight)
- **Numeric / data:** **Geist Mono** (tabular figures için)
- **Asla kullanma:** Inter (overused), Comic Sans, Roboto, system-ui fallback

**Type scale (rem):**
```
display-xl:  3.5rem  / 56px  / line-height 1.05 / weight 700 / tracking -0.03em
display-lg:  2.75rem / 44px  / line-height 1.1  / weight 700 / tracking -0.025em
display-md:  2.25rem / 36px  / line-height 1.15 / weight 700 / tracking -0.02em
h1:          1.875rem/ 30px / line-height 1.25 / weight 600
h2:          1.5rem  / 24px / line-height 1.3  / weight 600
h3:          1.25rem / 20px / line-height 1.35 / weight 600
body-lg:     1.125rem/ 18px / line-height 1.6  / weight 400
body:        1rem    / 16px / line-height 1.55 / weight 400
body-sm:     0.875rem/ 14px / line-height 1.5  / weight 400
caption:     0.75rem / 12px / line-height 1.4  / weight 500
```

Mevcut canlıda hero'da çok büyük heavy-weight tek-satır kullanılmış — yeni tasarımda hero **iki satır** olabilir ama her satır net cümle bütünü olmalı (mid-sentence break yapma).

### Boşluk, radius, gölge

```
Radius:
  sm:  6px   /* küçük input, küçük badge */
  md:  10px  /* button, input, badge */
  lg:  14px  /* card, modal */  ← varsayılan
  xl:  20px  /* large hero card, feature panel */
  full: 9999px

Spacing scale:  4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96 px

Shadow (layered, soft — heavy değil):
  shadow-xs:  0 1px 2px rgba(15,16,26,0.04)
  shadow-sm:  0 2px 8px rgba(15,16,26,0.06)
  shadow-md:  0 8px 24px rgba(15,16,26,0.08), 0 2px 4px rgba(15,16,26,0.04)
  shadow-lg:  0 24px 48px rgba(15,16,26,0.12), 0 8px 16px rgba(15,16,26,0.06)

Dark mode shadows:  alpha'yı 0.4-0.6'ya çıkar, base rengi #000000 yap.
```

### Motion

- **Default duration:** 200ms
- **Default easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (spring-feel, snappy ama yumuşak)
- **Page transitions:** none (Next.js page nav already enough)
- **Card hover:** `translateY(-2px)` + shadow upgrade, 150ms
- **Kanban drag:** scale(1.02) + shadow-lg + rotate(1deg) — sticky feel
- **Status change:** badge color transition 250ms + tiny confetti for "Offer"/"Accepted"
- **Asla yapma:** sayfa geçişinde fade, scroll-triggered AOS, parallax. Bu enterprise/2018.

### İkonografi

- **Mevcut:** Lucide Icons — devam et. Tutarlı, modern.
- **Stroke width:** 1.75 (default 2'den biraz inceltilmiş — Geist'a daha iyi uyar)
- **Boyut:** 16px (inline), 20px (button), 24px (header)
- **Brand mark:** mevcut briefcase yerine — **çapraz checkmark içeren minimal stilize hedef** (target with check). Briefcase çok corporate. Alternatif: gradient bir "JT" wordmark. Tasarımcı 3 alternatif sunmalı.

---

## 3. Component patterns

### Buttons

```
Primary:   bg-primary-500, text-white, weight 500, radius-md, hover bg-primary-600
Secondary: bg-transparent, border-2 border-border, text-primary-text, hover bg-primary-50
Ghost:     bg-transparent, no-border, hover bg-neutral-100
Destructive: bg-coral-500, text-white
Sizes:     sm (h-8 px-3), md (h-10 px-4), lg (h-12 px-6)
```

**Asla:** dolgu siyah primary kullanma (mevcut ürünün hatası). Primary indigo olmalı — siyah, "neutral default" hissi verir, brand silinir.

### Inputs

- Tek satır height: 40px (h-10), radius-md, border 1.5px
- Focus: ring 3px primary-300 + border primary-500
- Hata: border coral-500 + alt satır küçük hata metni (12px)
- Label yukarıda (üzerinde değil placeholder olarak — accessibility)
- Required göstergesi: kırmızı asterisk yerine **opsiyonel olanlara "Optional"** yaz (default'u required varsay). Mevcut ürün tersini yapıyor.

### Cards

İki tür:
1. **Data card** (application list item): horizontal layout, 80-100px yükseklik. Mevcut canlıda kartlar ~220px — yeni tasarımda **bilgi yoğunluğunu 2.5x artır**. Bir viewport'ta 5-6 kart görünmeli.
2. **Container card** (settings sections, form sections): mevcut shadcn `Card` davranışı — başlık + içerik + opsiyonel footer.

### Badges & status pills

- Status pill: bg-status-100, text-status-700, radius-full, px-2.5 py-0.5, font-medium size-12px
- İkon önekli (her status için mini bir dot veya glyph)
- "Pinned" göstergesi: kartın sol kenarında 3px primary-500 border (mevcut "yüzen siyah top" yerine — yüzen top kırık görünüyor)

### Toasts (sonner — mevcut)

- Sağ üst köşe, 380px max-width
- Renk: success emerald, error coral, info primary
- 5 saniye, hover'da pause, swipe ile dismiss

### Empty states

Her empty state şu yapıyı izler:
```
[İllüstrasyon veya büyük ikon — 64px]
[H2: spesifik mesaj — "No applications yet."]
[Body: bir cümle yardım]
[2 buton: primary action + "Try with sample data"]
```

**Sample data** — kritik yeni özellik. Boş app'in onboarding'i.

### Modals

- Backdrop: rgba(11,12,22,0.6) + 8px blur
- Modal: radius-lg, shadow-lg, max-width 480px (form), 720px (large content)
- Animation: scale 0.95 → 1 + opacity, 200ms
- Esc / backdrop click ile kapanır
- Mobile'da bottom-sheet'e dönüşür (`sm:` breakpoint altında)

### Tooltips

- Bg dark, text light, küçük 12px
- Hover delay 400ms, fade 100ms
- Header'daki icon-only butonlarda **mutlaka** olmalı (mevcut canlıda yok)

---

## 4. Sayfa-sayfa brief

Her sayfa için: **amaç, hedef etkileşim, content, mobile pattern, ana state'ler, anti-patterns** anlatılır.

---

### 4.1 Landing page (`/`)

**Amaç:** Spreadsheet'le başvuru takip eden ya da takip etmeyen kullanıcıyı 30 saniyede ikna et — JobTrack'in ne olduğunu, neyin daha iyi olduğunu, ücretsiz olduğunu göstersin.

**Yapı (yukarıdan aşağıya):**

1. **Header (sticky)** — Logo + dil + tema + "Sign in" + "Get started free" (primary). Header her sayfada aynı.

2. **Hero** —
   - Eyebrow: küçük pill, primary-100 bg, primary-700 text → "**Built for the messy job hunt**"
   - H1: **"Land your next role — without the spreadsheet."** (display-xl, 2 satır)
   - Subtitle: "Track every application, follow up on time, and see what's actually working. Free, forever." (body-lg, max-width 560px)
   - CTAs: **"Start tracking — free"** (primary) + "**Watch 60s demo**" (secondary, açılır video modal)
   - Trust strip altta: "**4,200+ applications tracked this week**" + "**No credit card • Open source**" (eğer doğruysa; değilse "**4.8★ Product Hunt**" / sosyal kanıt için neyi varsa)
   - **Sağ tarafta veya altında**: animasyonlu küçük ürün demo — sahte ama gerçekçi bir kanban kartı süzülerek status değiştiriyor (görsel kanıt)

3. **Product preview** — tek bir büyük "browser frame" değil, **3 tabbed showcase**:
   - **Tab 1: Track** — list view ekran görüntüsü
   - **Tab 2: Visualize** — kanban view
   - **Tab 3: Learn** — analytics

   Mevcut canlıda "Kanban & Lists / Analytics" tab var ama medya boş geliyor — bu sefer **statik PNG'ler** kullan, video/gif değil (loading güvenilirsizliği yaratıyor). Lazy-load et ama placeholder skeleton düzgün olsun.

4. **Sosyal kanıt şeridi** — 3-4 kullanıcı testimonial'ı (kısa, 1 cümle + ad + role + foto). Şu an testimonial yok — placeholder kullan (Berkin notu: gerçekleri sonra topla, plan: PH launch + Twitter call-out). Yer tutucu içerik:
   > "I went from 'Excel chaos' to 'I know exactly what's pending' in one evening."
   > — Maya P., Frontend Engineer (bootcamp grad)

5. **Comparison: JobTrack vs Spreadsheet** — 2 kolon, side-by-side. Spreadsheet kolonu kasvetli, JobTrack kolonu canlı. Her satır:
   - "Find applications I sent in March" — Spreadsheet: scroll-and-pray / JobTrack: filter + search, instant
   - "Track follow-up dates" — Spreadsheet: conditional formatting hell / JobTrack: auto-reminders
   - "See offer conversion rate" — Spreadsheet: pivot table you'll never build / JobTrack: built-in
   - "Move an application along" — Spreadsheet: edit a cell / JobTrack: drag on kanban
   - "Use on phone" — Spreadsheet: 🙃 / JobTrack: full mobile

6. **Feature deep-dive** — 3 büyük section, her biri sol-yazı / sağ-mockup (veya tersi alterne):
   - **Section A: Capture in seconds** — "Paste a job URL. We fill in the rest. (URL parser geliyor — şimdilik: 'One-line quick add — Company → Role.')"
   - **Section B: See your funnel** — analytics screenshot, response rate, kaynak bazlı conversion
   - **Section C: Never miss a follow-up** — "Stale" badge örneği, reminder pattern

7. **FAQ** — accordion, 6-8 soru:
   - Is it free? (yes, forever)
   - Where's my data? (Supabase EU)
   - Can I import from spreadsheet? (CSV)
   - Mobile? (web app, PWA-installable)
   - Is it open source? (eğer doğruysa, evet — link to GitHub)
   - Will I be spammed? (no, no marketing emails)
   - How is it different from Teal/Huntr? (free, lightweight, your data is yours)
   - Can I delete my account? (yes, settings)

8. **Final CTA strip** — primary-50 bg, h2 "**Ready when you are.**", primary button "Create your account — 30 seconds".

9. **Footer (zenginleştirilmiş)** — 4 kolon:
   - **Product**: Features / Pricing (free) / Roadmap / Changelog
   - **Resources**: Blog / Templates / Compare (vs Teal, vs spreadsheet, vs Notion)
   - **Company**: About / Open Source / Contact
   - **Legal**: Privacy / Terms / Data Export

   Alt çubuk: © 2026 JobTrack · Built by [Berkin Duz] · GitHub · LinkedIn · X

**Mobile pattern (landing):**
- Hero: tek kolon, CTA full-width.
- Product preview: tabs üstte, görsel tab-altında, swipe ile geçer.
- Comparison: 2 kolon → accordion (toggle).
- Feature deep-dive: sol-yazı/sağ-mockup → stacked (mockup önce, sonra yazı).

**Anti-patterns (landing):**
- ❌ "AI-powered" iddiası (AI özellikleri henüz yok, bekle).
- ❌ "Trusted by Google, Meta" gibi sahte logo wall.
- ❌ Animasyonlu sayı sayaçları ("4,231 applications tracked!" count-up).
- ❌ Cookie banner zorla onay — Privacy-respect approach (Plausible / no-cookies analytics tercih et).

---

### 4.2 Login / Sign up (`/login`)

**Amaç:** Sürtünmesiz giriş. Yeni kullanıcıyı sign-up'a, dönen kullanıcıyı dashboard'a göndermek.

**Yapı:**

- **2-kolon, equal height** (mobile'da stacked).
  - **Sol kolon:** brand visual paneli. Mevcut canlıda Unsplash kafe fotoğrafı var — soft ama brand'i yansıtmıyor. Yerine: **kendi mockup ekran görüntümüz** (canlı bir kanban veya analytics) + üstte rotasyonla 3 farklı kullanıcı quote'u (alt satıra), brand gradient overlay (primary-900 → primary-700 alpha 0.85 üzerine).
  - **Sağ kolon:** form. Form sade — Sign In default. "Sign Up" tab üstte.

- **Form içeriği:**
  - H1: **"Welcome back."** (Sign In) / **"Let's get you tracking."** (Sign Up)
  - Subtitle: tek cümle context
  - Email + password
  - Sign In: "Forgot password?" link
  - Sign Up: parola gücü göstergesi (HaveIBeenPwned check'i de aç)
  - Primary button: dark text-on-primary
  - Divider: "or continue with"
  - OAuth: **Google + GitHub** (mevcut). Magic link **eklenecek** ("Email me a sign-in link") — bootcamp/yeni mezunlar için parola hatırlamaktan kurtarır.
  - Alt satır: "By signing up you agree to Terms · Privacy" — sade, tiny.

- **Sign In <-> Sign Up tab'ı:** mevcut canlıda yan-yana tab var, kolay karışıyor. Yeni tasarım: **tek panel, tek H1, alt satırda link**: *"New here? Create an account →"* / *"Already have one? Sign in →"*. Tab kalkar.

**Mobile:** sol panel kalkar, sağ form full-width. Brand visual yerine üstte küçük header (logo + tagline tek cümle).

**Hata state'ler:**
- Yanlış parola: form altında coral renkli, "Email or password isn't right. [Reset →]"
- Email doğrulanmamış: turuncu alert, "Check your inbox to confirm your email."
- Rate limit: gri info, "Too many attempts. Try again in 60s."

**Anti-patterns:**
- ❌ "Sign up" formunun "Sign in"e göre 5 alan daha uzun olması (sadece email + password yeterli).
- ❌ Marketing opt-in checkbox default-checked.
- ❌ Auto-redirect olmadan beyaz ekran (loading state'i göster).

---

### 4.3 Onboarding (`/onboarding` — yeni route, sign-up sonrası)

**Mevcut durum:** YOK. Sign-up → boş `/applications` → kullanıcı kayboluyor.

**Yeni yapı (3 adımlı, atlama opsiyonu var):**

**Step 1 — "How do you want to start?"**
- 3 büyük kart:
  - **"Add my first one"** → quick-add form (sadece Company + Role required)
  - **"Try with sample data"** → 5 örnek başvuru ekler (Stripe/Linear/Figma), tour başlatır
  - **"Import from CSV / Notion / Spreadsheet"** → upload UI (ileride; şimdilik CSV)

**Step 2 — "Set your goal" (opsiyonel)**
- Tek soru: "How many applications a week feels right?" → 3 pill (3 / 5 / 10+) veya custom
- Bu hedef analytics'te kullanılır ("3 of 5 this week")

**Step 3 — "You're set"**
- Confetti yok ama subtle motion: primary checkmark + "Let's go" CTA → `/applications`
- Skip link her step'te sağ üstte: "Skip — I'll figure it out."

**Anti-patterns:**
- ❌ 7-adım onboarding tour.
- ❌ Profil resmi yükleme zorlaması.
- ❌ "Connect your LinkedIn" gibi henüz olmayan özelliği vaad etme.

---

### 4.4 Applications list (`/applications`)

**Amaç:** Kullanıcının pipeline'ını saniyeler içinde tarayıp filtre ve eylem yapabilmesi.

**Header (page-level, app header'ın altında):**
- H1: **"Applications"** (bug değil — bilgi hiyerarşisi: bu bir noun-page, başlık net olsun)
- Alt satır: "8 active · 3 pinned · 2 stale" (stale = 14 gün boyunca status değişmemiş)
- Sağ üstte primary button: **"+ New Application"** (Cmd+N kısayolu)

**Quick-Add bar (yeni — kritik özellik):**
- Page header'ın hemen altında, sticky.
- Tek input: placeholder **"Add: company → role (e.g. Stripe → Senior Frontend)"**
- Enter ile insert, status default "Applied", diğer her şey nullable
- Sağda küçük link "Add full details →" (full form'a gider)
- Cmd+K command palette de aynı işi yapar (gelişmiş kullanıcılar için)

**Filter / Search row:**
- Sol: Search input (kısayol "/") — placeholder "Search by company, role, location..."
- Sağ: 3 pill toggle: **All / Active / Closed** (closed = accepted + rejected)
- Daha sağda dropdown filters: Status, Source, Work type, Date range — mevcut canlıdaki gibi
- Sort dropdown: Recent first / Oldest / Status / Company A–Z
- View toggle: **List / Kanban** (mevcut). İkonlu, label'lı tooltip ile.

**Liste (default view):**

Mevcut canlıda kart yüksekliği ~220px — viewport'a 2 kart sığıyor. **Yeni tasarımda kart yüksekliği 88-104px**, viewport'a 6-7 kart sığar. Yatay layout:

```
[● status dot] | Company name (bold) · Role           [📌 if pinned]  [⋯ menu]
                Location · Industry · Applied 3d ago
                [skill] [skill] [+2]              [Applied] [Remote]
```

- Sol kenarda 4px dikey çubuk = status rengi
- Pinned göstergesi: sol kenardaki çubuk 6px + primary-500 + ikon (mevcut "yüzen siyah top" SİLİNECEK)
- **Stale rozeti**: 14+ gün status değişmemişse sarı pill "Stale 3w" → tıklayınca status hızlıca değiştirilir veya "follow up" eylemi
- Hover: shadow-sm + cursor pointer
- Click → detail; menu (⋯) hover'da fade-in: Edit / Duplicate / Pin / Archive / Delete

**Group by status (opsiyonel görünüm)**: List view'de "Group by: None / Status / Source / Date" dropdown. None default.

**Kanban view:**
- Şu an 8 status, 1440px'da 4 kolon görünür — yatay scroll
- Yeni tasarım: **kolon genişliği 240px** (mevcut 288px), **6 kolon birden görünür** + 2 collapse-edilebilir grup ("Closed" = Accepted + Rejected, default kapalı, accordion).
- Kolon başlığı: status adı + count rozetı + ufak ekle butonu (+ tıklayınca o kolonda yeni kart oluşturur, status preset)
- Kart: 56px yükseklik, kompakt — sadece company, role, date relative ("3d"). Hover'da expand önizleme.
- Drag: gerçekçi (rotate 1deg, shadow-lg, mouse'ta yapışma)
- Mobile: Kanban single-column — **swipe gesture** kolonlar arası (Trello mobile patterni). Üstte dot indicators (● ○ ○ ○ ○ ○ ○ ○).

**Bulk select:**
- Cards üzerinde hover'da küçük checkbox (sol-üst, opacity 0 → 0.5)
- Seçilince üstte sticky toolbar: "5 selected → Change status · Add tag · Archive · Delete"

**Empty states:**
- Hiç başvuru yok: büyük illustration + "No applications yet." + 2 buton ("Add your first" + "Try sample data")
- Filtre sonucu yok: kompakt + "No matches. Try clearing filters."

**Mobile pattern:**
- Header collapse-on-scroll
- Quick-add bar 56px height, sticky
- List item 96px, tek-satır truncate
- Floating "+" button bottom-right (FAB) → quick-add modal
- Kanban: swipeable kolonlar + bottom indicator dots

**Anti-patterns:**
- ❌ Sayfa başlığı yokken sadece search bar göstermek.
- ❌ Status badge'ler 3 farklı boyutta (consistent kalsın).
- ❌ "List/Kanban" dışında 4. view (gallery vs.) — basit kalsın.

---

### 4.5 Application detail (`/applications/[id]`)

**Amaç:** Bir başvurunun tüm bilgisini hızla görmek + status değiştirmek + not eklemek + edit'e geçmek.

**Mevcut canlı:** zaten temiz — 2-kolon (Company Details / Application Details) + Notes. Devam et ama:

**İyileştirmeler:**

1. **Üst bilgi** —
   - Geri ikonu solda (mevcut)
   - Company logo (yeni!) — Clearbit-like favicon API ya da Logo.dev integration. Kullanıcı manuel yükleyebilir. Yok ise gri placeholder + ilk harfler.
   - Company name (h1, display-md)
   - Role (h3 muted)
   - Sağ üstte status pill (large), tıklanır dropdown → status değiştir
   - Sağ üstte 3 buton: **Set follow-up reminder** (yeni, primary), **Edit**, **More** (Duplicate / Delete / Archive)

2. **Pipeline progress** — yeni özellik. Detay header'ın altında ince horizontal bar:
   ```
   ● Applied ─── ● Test ─── ○ HR ─── ○ Tech ─── ○ Mgmt ─── ○ Offer ─── ○ Accepted
   ```
   Mevcut status'a kadar dolu, sonrası boş. Her node'a tıklayınca status değişir. Visual progress hissi.

3. **Quick actions sidebar (sağ)** — desktop'ta sticky 280px panel, mobile'da accordion:
   - **Set follow-up** — date picker + "Remind me when nothing happens for 7 days"
   - **Add contact** (recruiter/interviewer)
   - **Upload resume version** (per-application CV)
   - **Add note** — quick inline textarea
   - **Set salary outcome** (sadece "offer" status'unda görünür)

4. **Main content (sol/center, 720px):**
   - Activity timeline (yeni!) — Notlar, status değişimleri, eklenen contact'lar zaman sırasıyla. Mevcut canlıda yok, çok gerekli.
     ```
     May 13 → You added Stripe (Applied)
     May 14 → Note: "Referred by Maya..."
     May 15 → Status changed to HR Interview
     ```
   - Notes (genişletilmiş, markdown destekli)
   - Job posting (URL ya da pasted content — collapse default)
   - Cover letter (collapse default)
   - Contacts (kart grid, mevcut)

5. **Mobile pattern:**
   - Geri buton → soldaki kenardan açılan drawer veya sticky top-left
   - Header bilgisi compact, status pill altta
   - Pipeline progress yatay scroll edilebilir
   - Sidebar → bottom sheet (FAB: Edit/More)

**Anti-patterns:**
- ❌ Created At / Updated At'i UI'da büyük göstermek (mevcut canlıda var — kullanıcı için anlamsız, küçük caption kalsın).
- ❌ "View Job Posting" linkini yeni tab değil aynı tab'da açmak.

---

### 4.6 New / Edit application (`/applications/new` ve `/applications/[id]/edit`)

**Amaç:** Hızlı kayıt mümkün, ama detaylı doldurmak da rahat.

**Mevcut canlı problemi:** 7 zorunlu alan. **Yeni yapıda sadece 2 zorunlu:** Company name + Role. Geri kalan her şey opsiyonel veya sensible default'lu.

**Yapı:**

1. **Header:** geri ok + H1 "New application" + status pill (default Applied, dropdown ile değiştirilir)

2. **Tek sayfada 3 bölüm** (collapse yerine düz akış):

   **Section: Essentials**
   - Company name * (autocomplete: önceki şirketler + Clearbit company search)
   - Role *
   - Application date (default bugün)
   - Status (default Applied)
   - Source (dropdown: LinkedIn / Indeed / Referral / Cold apply / Other; default LinkedIn)

   **Section: Job details**
   - Location (free text, autocomplete dünya şehirleri)
   - Work type (Remote / Hybrid / On-site — 3 pill toggle, default Remote)
   - Industry (dropdown, opsiyonel)
   - Job posting URL
   - Salary range (currency + min-max veya tek değer, opsiyonel)

   **Section: Your prep**
   - Skills (mevcut chip input — autocomplete devam)
   - Resume (mevcut PDF upload — drag&drop)
   - Cover letter (collapse default)
   - Notes
   - Contacts (mevcut accordion)

3. **Submit bar (sticky bottom):**
   - Sol: "Cancel" (ghost)
   - Sağ: **"Save & Add Another"** (secondary) + **"Save"** (primary)
   - Mobile: tek "Save" buton full-width sticky bottom

**Quick-add modal varyantı:**
- Cmd+N veya üstteki quick-add bar'dan açılır
- Sadece 2 input: Company + Role
- Enter → kayıt, toast "Added. Open details?"
- ESC kapatır

**Edit modu farkları:**
- H1: "Edit application"
- Status dropdown header'da
- Activity timeline'a "Edited" event ekler
- Save button "Save changes"

**Anti-patterns:**
- ❌ Required alanları kırmızı asterisk + label-after-input (mevcut canlıda label üstte ama asterisk gözden kaçıyor). Yeni: opsiyonel olanları "Optional" küçük gri ile işaretle.
- ❌ Validate-on-blur ile her alan kırmızı flash. Submit'te tek toplu validate.
- ❌ Currency parsing regex bug (zaten fix edildi).

---

### 4.7 Analytics (`/analytics`)

**Amaç:** Kullanıcının funnel'ını ve "neyin işe yaradığını" gerçekten göstermek.

**Mevcut canlı problemleri:**
- Production'da `"Insights (Coming Soon)"` placeholder var — sil.
- 4 küçük metric kart + 2 chart + 1 chart + 1 boş alan = bilgi az, layout düz.
- Charts küçük, label'lar overflow ediyor (legend taşması).

**Yeni yapı:**

1. **Hero metric strip (4 büyük rakam):**
   - Total applications (8)
   - Active (5) — applied, test_case, *_interview, offer
   - Response rate (63%) — interview'a düşen oran
   - Avg response time (4 days) — apply → first status change

2. **Funnel chart (yeni — büyük kartı tek başına):**
   - Yatay funnel/sankey: Applied → Test → HR → Tech → Mgmt → Offer → Accepted
   - Her aşamada drop-off yüzdesi
   - Tıklanır → o status'taki başvurular filtrelenmiş şekilde liste sayfasında açılır

3. **Source performance (yeni):**
   - Hangi kaynak (LinkedIn / Referral / Cold) en yüksek conversion'a sahip?
   - Bar chart: source × interview-or-better %

4. **Weekly activity (mevcut bar chart — iyileştirme):**
   - 12 hafta yerine **8 hafta** göster, label'lar büyük olsun
   - Tıklanır: o hafta filtrelenmiş liste

5. **Status distribution (mevcut donut — iyileştirme):**
   - Legend kart-altında değil, kartın sağında dikey
   - Renkler status renk skalasına tam uysun

6. **Work type distribution (mevcut — değiştirme):**
   - Renkler: Remote primary, Hybrid accent, Onsite slate
   - "Coming soon" kaldırılır

7. **Insights (yeni — gerçek):**
   - 2-3 dinamik içgörü cümlesi:
     - "Your response rate is **63%** — that's above the spreadsheet-tracker average."
     - "You apply most on **Wednesdays** — and that's also your best response day."
     - "**3 applications** are stale. Want to follow up?"
   - Her insight'in sonunda action: link

**Empty state (< 3 applications):**
- "We'll need a few more applications to show meaningful insights."
- Sample data önerisi.

**Mobile pattern:**
- Tüm kartlar tek kolon
- Funnel chart vertical orientation
- Insights kartı üstte (en değerli)

**Anti-patterns:**
- ❌ "Coming soon" placeholder canlıya çıkmasın.
- ❌ Lots of decimal places ("63.47%") — yuvarla.
- ❌ Pie chart 8+ dilim — okunmuyor.

---

### 4.8 Settings (`/settings`)

**Amaç:** Tercihler + hesap + data.

**Mevcut canlı temel:** Çalışıyor, iyi. Az iyileştirme.

**Sections:**

1. **Profile** (yeni — eksikti)
   - Avatar upload
   - Display name
   - Email (read-only, "Change email →" linki ayrı flow)
   - Change password
   - Delete account (danger zone, alt)

2. **Appearance**
   - Theme: Light / Dark / System (mevcut, 3 büyük pill — daha küçük olsun, h-10)
   - Language: EN / TR (mevcut)
   - Density: Comfortable / Compact (yeni — list view kart yüksekliği)

3. **Notifications** (yeni)
   - Email follow-up reminders (toggle)
   - Weekly summary email (toggle)
   - Browser push (toggle, opt-in)

4. **Customization**
   - Custom sources (mevcut)
   - Custom industries (mevcut)
   - Custom status colors (yeni — power user)

5. **Data**
   - Export (CSV / JSON)
   - Import (CSV)
   - Clear all (danger)

6. **About**
   - Version, build date
   - Changelog link
   - "Made by Berkin · Open source" satırı
   - GitHub link
   - **"Support development"** — mevcut Buy Me a Coffee butonu kalır ama "About" section içinde, daha sade görünüm

**Mobile pattern:** her section accordion.

---

### 4.9 Reset password (`/reset-password`)

Mevcut akış: email gönder + sonra yeni parola gir. **İyileştirmeler:**

- Email gönderildikten sonra **net mesaj** + spam folder uyarısı
- "Resend in 60s" geri sayım butonu
- Yeni parola formunda parola gücü göstergesi
- Başarılı sonrası otomatik redirect 3 saniyede `/applications`'a + countdown

---

### 4.10 404 & Error states (yeni)

**Mevcut:** muhtemelen default Next.js 404. Yeni özel sayfa:

- Büyük "404" tipografisi (display-xl, primary)
- "Looks like that application never made it to interview."
- 2 buton: "Back to applications" + "Report broken link"
- Easter egg: küçük kanban kartı animasyonu boş kolonda kayıp

**Generic error (5xx):**
- "Something broke on our end. We're on it."
- "Try again" buton + "Report what happened" link

---

## 5. Header & Footer (global)

### Header

Mevcut canlı: logo + 6 ikon-only nav. Belirsiz, label yok.

**Yeni header (logged-in):**
- Sol: logo (clickable → `/applications`) + breadcrumb veya page title (route-aware)
- Orta: yok (sade)
- Sağ:
  - **Search trigger** (Cmd+K, magnifying glass icon + "Search" text on desktop, icon only mobile)
  - **+ New** (primary button, ✕ icon-only on mobile)
  - Avatar dropdown → Profile / Settings / Theme / Language / Help / Sign out

Tab nav (Applications / Analytics) header **altında** ayrı bir satır olarak — segmented control veya tabs. Mevcut canlıdaki ikon-only nav buradan kalkar. Mobile'da bottom tab bar olur (3 tab: List, Kanban, Analytics — Settings drawer içinde).

**Logged-out header:** logo + Sign in + "Get started free" (primary). Sade.

### Footer

Daha önce landing'de detaylı verildi. App içinde **minimal footer** (1 satır): © 2026 JobTrack · Privacy · Terms · Status · Help

---

## 6. Mobile principles (özet)

1. **Thumb-zone friendly:** primary actions her zaman alt yarıda — FAB veya sticky bottom bar.
2. **One column always.** İki kolon mobile'da yok.
3. **Sheets > modals.** Modal'lar bottom-sheet olur.
4. **Tap targets ≥ 44px.**
5. **Swipe gestures:** kanban kolonlar arası, list item üzerinde "swipe to archive/delete".
6. **Sticky search & quick-add bar** — her zaman erişilebilir.
7. **PWA-installable** — manifest, ikonlar, splash screen tasarımı dahil.

---

## 7. Accessibility

- **WCAG 2.2 AA** target.
- Renk kontrastı: status pill text/bg en az 4.5:1, large text 3:1.
- Focus visible: her interaktif element 3px primary-300 ring.
- Keyboard nav: tüm akışlar tab + enter ile bitirilebilir; kanban kart hareket Alt+Arrow ile.
- Screen reader: tüm icon-only butonlarda `aria-label`.
- Status renklerine ek olarak **ikon** veya **metin** desteği (color-blind users için).
- Form hataları: input'a `aria-invalid`, hata mesajı `aria-describedby` ile bağlı.
- Klavye kısayolları: `?` ile tam liste açılır.

---

## 8. Klavye kısayolları

| Tuş | Eylem |
|---|---|
| `Cmd/Ctrl + K` | Command palette / quick search |
| `Cmd/Ctrl + N` | Yeni başvuru |
| `/` | Search bar'a odaklan |
| `G + A` | Applications'a git |
| `G + I` | Analytics'e git |
| `G + S` | Settings'e git |
| `K` | Kanban view toggle |
| `L` | List view toggle |
| `J / K` | Liste içinde aşağı / yukarı |
| `Enter` | Seçili kartı aç |
| `E` | Seçili kartı edit |
| `P` | Pin / unpin |
| `1-8` | Seçili kartı statu 1-8'e geçir |
| `?` | Kısayol listesini göster |
| `Esc` | Modal / palette kapat |

---

## 9. SEO, OG, meta

- **Title pattern:** `{Page} · JobTrack` (örn: "Applications · JobTrack")
- **OG image:** her sayfa için statik veya dinamik. Landing OG: brand renkli, hero başlığı, küçük product mockup. `@vercel/og` ile generate edilebilir.
- **Favicon set:** light + dark optimized, mask icon Safari, Apple touch icon.
- **Sitemap:** mevcut robots/sitemap genişletilsin (blog rotaları için hazır olsun).
- **Structured data:** SoftwareApplication schema (mevcut) + FAQPage schema (landing FAQ için).
- **Open graph copy:**
  - og:title = "JobTrack — Land your next role without the spreadsheet."
  - og:description = "Track every application, follow up on time, and see what's actually working. Free, forever."

---

## 10. Anti-patterns özet (canlıdaki hatalardan ders)

| Yapma | Neden |
|---|---|
| Monochrome black-white "neutral default" | Hatırlanmaz, marka silinir |
| 7 zorunlu alan ilk formda | Drop-off başlıca burada |
| Icon-only nav label'sız | Yeni kullanıcı kayboluyor |
| "Coming soon" placeholder canlıda | Yarım iş hissi |
| Hero'da animasyonlu video lazy-load fail | Boş alan = broken page hissi |
| Pin/badge yüzen siyah top (overflow) | Görsel bug gibi |
| Card 220px yükseklik, 2 kart/viewport | Bilgi yoğunluğu çok düşük |
| Sign In/Sign Up tab yan-yana | Kullanıcı yanlış sekmede tıklıyor |
| 8 status kolonu yatay scroll, mobile yok | Kanban kullanılmıyor |
| Buy Me a Coffee primary attention | Confused brand priorities |
| "Welcome / Sign in to track your job applications" | Generic copy |

---

## 11. Tasarımcıya çıktı beklentisi

Aşağıdaki dosyaları teslim et (Figma file veya equivalent):

1. **Design tokens** — color, type, spacing, shadow, radius (CSS variables ready)
2. **Component library** — button, input, card, badge, modal, toast, tabs, dropdown, select, calendar, switch, checkbox, radio, table, kanban-card, application-card, all states (default, hover, active, focus, disabled, loading, error)
3. **All page wireframes** — desktop (1440) + mobile (390):
   - `/` landing (logged-out)
   - `/login` (sign in + sign up + reset password)
   - `/onboarding` (3 steps)
   - `/applications` (list + kanban + empty + filtered)
   - `/applications/new`
   - `/applications/[id]`
   - `/applications/[id]/edit`
   - `/analytics` (populated + empty)
   - `/settings`
   - `404`
   - `5xx`
4. **Dark mode versions** — her ekran light + dark
5. **Marka** — yeni logo varyasyonları (lockup, mark, monogram), OG image template, favicon set
6. **Motion notları** — kritik etkileşimlerin (kanban drag, status change, quick-add, page transition) ne kadar/hangi easing
7. **Empty / loading / error state'leri** — her ana ekran için 3 state
8. **Onboarding ilustrasyonları** — 3 ufak custom illustration (sample data card, goal-set, success), brand colors ile uyumlu — vektör.
9. **Spec sheet** — her ekran için spacing, sizes, copy notes

---

## 12. Tasarım yön özeti (TL;DR)

> JobTrack'i jenerik bir "spreadsheet replacement"tan, **iş arayanın saat 11'de uyumadan önce açtığı kişisel co-pilot**'a dönüştür.
>
> Renk: indigo primary + amber accent + status-driven semantic pastels.
> Tipografi: Geist Sans (tight tracking, mid-bold display).
> Kart yoğunluğu: 2.5x artırılmış, viewport'a 6+ kart.
> Form: 2 zorunlu alan (Company + Role), gerisi opsiyonel + sensible defaults.
> Onboarding: 3 adım, "Try sample data" seçeneği.
> Mobile: tek kolon, swipe-able kanban, FAB quick-add, bottom-sheets.
> Analytics: gerçek funnel + insights, "Coming soon" yok.
> Ton: confident peer — "Land your next role — without the spreadsheet."
>
> Yapma: monochrome, icon-only nav, 220px cards, "Coming soon", lazy-load gif fail.
> Yap: status-colored bars, quick-add bar, real insights, motion that feels alive, dark mode that respects the eye.

---

*Bu brief Berkin Duz tarafından kuruldu, Claude tarafından canlı sitenin ve kod tabanının analizinden sonra yazıldı. Brief üzerinde herhangi bir madde için "şunu değiştir" → 2 dakikada güncellenir.*
