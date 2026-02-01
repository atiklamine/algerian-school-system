# Cezayir Okul Yönetim Sistemi

Cezayir eğitim bağlamında okul değerlendirmelerini ve akademik verileri yönetmek için tasarlanmış kapsamlı bir web uygulaması. Bu sistem birden fazla rolü, çok dilli arayüzleri ve kolaylaştırılmış idari iş akışlarını destekler.

## 🚀 Temel Özellikler

- **Çoklu Rol Desteği**: **Yöneticiler**, **Öğretmenler** ve **Müdürler** için özelleştirilmiş paneller.
- **Çok Dilli Kullanıcı Arayüzü**: Arapça (RTL), Fransızca, İngilizce, Almanca, Türkçe ve Tamazight için tam destek.
- **Akademik Yönetim**:
  - Öğrenci ve Sınıf kaydı ve takibi.
  - Belirli katsayılara sahip ders yönetimi.
  - Üç aylık (Trimestriel) değerlendirme ve not girişi.
- **Otomatik Kurulum**: Windows üzerinde hızlı yerel ortam kurulumu için özel bir PowerShell betiği.
- **Raporlama**: İstatistiksel bilgiler ve akademik raporların oluşturulması.

## 🛠️ Teknoloji Yığını

### Ön Yüz (Frontend)
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **UI Kütüphanesi**: [Material UI (MUI)](https://mui.com/)
- **Animasyonlar**: [Framer Motion](https://www.framer.com/motion/)
- **Uluslararasılaştırma**: [next-intl](https://next-intl-docs.vercel.app/)

### Arka Yüz (Backend)
- **Çalışma Zamanı**: [Node.js](https://nodejs.org/) ve **Express.js**
- **Dil**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Doğrulama**: [Zod](https://zod.dev/)

### Veritabanı
- **Motor**: [PostgreSQL](https://www.postgresql.org/)

---

## 🏃 Başlarken

### Önkoşullar

- **Node.js**: Sürüm 18.x veya üzeri.
- **PostgreSQL**: Sürüm 14 veya üzeri.

### Otomatik Kurulum (Windows için Önerilir)

1. Kök dizinde bir PowerShell terminali açın.
2. Kurulum betiğini çalıştırın:
   ```powershell
   ./setup.ps1
   ```
3. Ekrandaki talimatları izleyin.

---

## 👨‍💻 Geliştirici Hakkında

Bu proje, en son yapay zeka araçlarını kullanarak premium çözümler oluşturma konusunda uzmanlaşmış tutkulu bir yazılım mühendisi olan **Atik Lamine** tarafından geliştirilmiştir.

- **E-posta**: atiklamine@gmail.com
- **Uygunluk**: En son yapay zeka teknolojilerini kullanarak akıllı uygulamalar tasarlamak için şu anda müsaitim. Fikirlerinizi en yüksek yenilik ve verimlilik standartlarıyla somut gerçeğe dönüştüren ileri düzey dijital çözümler geliştirmek için uzaktan çalışıyorum.
---

## 📄 Lisans
Bu proje ISC Lisansı altında lisanslanmıştır.
