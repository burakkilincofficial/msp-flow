# MSP Flow Designer

Turkcell Order Management süreçlerini görsel olarak yönetmek için geliştirilmiş modern bir React uygulaması. XML tabanlı flow tanımlarını BPMN benzeri görsel arayüzle düzenleme imkanı sunar.

## 🚀 Özellikler

### Görsel Flow Editörü
- **Drag & Drop Interface**: Elementleri sürükleyip bırakarak flow oluşturma
- **Görsel Node Tipleri**:
  - 🟢 **IF/ELSE Koşulları**: Yeşil renkli koşul node'ları
  - 🔵 **INVOKE Adımları**: Mavi renkli işlem adımları
  - 🟡 **FOREACH Döngüleri**: Sarı renkli döngü elementleri
- **Otomatik Bağlantılar**: Node'lar arası akış bağlantıları
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu arayüz

### XML İşleme
- **XML Import**: Mevcut Deactivation_Flow_Definition.xml dosyalarını yükleme
- **XML Export**: Değişiklikleri XML formatında kaydetme
- **Browser-Native Parser**: xml2js bağımlılığı olmadan, tarayıcı native API'leri kullanımı
- **Hata Yönetimi**: XML parse hatalarının detaylı raporlanması

### Element Yönetimi
- **Özellik Paneli**: Sağ sidebar'da element özelliklerini düzenleme
- **Koşul Editörü**: IF/ELSE koşullarını görsel olarak düzenleme
- **Adım Konfigürasyonu**: INVOKE adımlarının detaylı ayarları
- **Metadata Yönetimi**: Process name, version gibi meta bilgiler

### İstatistikler ve Analiz
- **Flow İstatistikleri**: Element sayılarının dashboard görünümü
- **XML Preview**: Canlı XML önizleme ve kopyalama
- **Hata Takibi**: Validation ve işlem hatalarının görüntülenmesi

## 🛠️ Kurulum

### Gereksinimler
- Node.js 16+ 
- npm veya yarn
- Modern web tarayıcısı (Chrome, Firefox, Safari, Edge)

### Kurulum Adımları

```bash
# Proje dizinine gidin
cd msp-flow

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm start
```

Uygulama http://localhost:3001 adresinde çalışacaktır.

### Build için

```bash
# Production build oluşturun
npm run build

# Build dosyaları dist/ klasöründe oluşturulur
```

## 📁 Proje Yapısı

```
msp-flow/
├── src/
│   ├── components/          # React bileşenleri
│   │   ├── Header.js       # Üst başlık bileşeni
│   │   ├── Toolbar.js      # Araç çubuğu (Import/Export)
│   │   ├── FlowCanvas.js   # Ana flow editör canvas'ı
│   │   ├── Sidebar.js      # Sağ sidebar - element özellikleri
│   │   ├── FlowStats.js    # İstatistik dashboard'u
│   │   ├── XmlPreview.js   # XML önizleme paneli
│   │   └── nodes/
│   │       └── CustomNode.js # Özel node bileşenleri
│   ├── context/
│   │   └── FlowContext.js  # Global state yönetimi
│   ├── styles/             # CSS stilleri
│   │   ├── App.css         # Ana uygulama stilleri
│   │   ├── FlowCanvas.css  # Canvas stilleri
│   │   ├── CustomNode.css  # Node stilleri
│   │   └── ...
│   ├── utils/
│   │   └── xmlProcessor.js # XML işleme utilities
│   ├── App.js              # Ana uygulama bileşeni
│   └── index.js            # Uygulama giriş noktası
├── public/
│   ├── index.html          # HTML template
│   └── favicon.ico         # Favicon
├── package.json            # NPM bağımlılıkları
├── webpack.config.js       # Webpack konfigürasyonu
└── README.md              # Bu dosya
```

## 🔧 Teknolojiler

### Frontend
- **React 18**: Modern React hooks ve context API
- **ReactFlow**: Flow diagram ve node editörü
- **CSS3**: Modern CSS grid ve flexbox
- **Webpack 5**: Module bundler ve dev server

### XML İşleme
- **DOMParser**: Browser-native XML parsing
- **XMLSerializer**: XML string serialization
- **Browser APIs**: Node.js bağımlılığı olmayan çözüm

### Geliştirme Araçları
- **Babel**: ES6+ transpilation
- **Webpack Dev Server**: Hot reload development
- **CSS Loader**: Style işleme
- **File Loader**: Asset yönetimi

## 📋 Kullanım

### XML Dosyası Yükleme
1. **"XML Yükle"** butonuna tıklayın
2. Deactivation_Flow_Definition.xml dosyanızı seçin
3. Flow otomatik olarak görsel editörde açılacak

### Element Düzenleme
1. Herhangi bir node'a tıklayın
2. Sağ sidebar'da element özelliklerini görün
3. Koşulları, adım tanımlarını düzenleyin
4. Değişiklikler otomatik olarak kaydedilir

### XML Export
1. **"XML İndir"** butonuna tıklayın
2. Güncellenmiş XML dosyası indirilecek
3. Dosyayı projenizde kullanabilirsiniz

### Yeni Element Ekleme
1. Toolbar'dan element tipini seçin
2. Canvas'a sürükleyip bırakın
3. Bağlantıları manuel olarak oluşturun
4. Özelliklerini düzenleyin

## 🔄 Değişiklik Geçmişi

### v1.0.0 - İlk Sürüm (2024)

#### ✅ Tamamlanan Özellikler
- React 18 tabanlı modern uygulama mimarisi
- ReactFlow ile görsel flow editörü
- Browser-native XML işleme (DOMParser/XMLSerializer)
- Türkçe dil desteği
- Responsive tasarım
- Element özellik paneli
- İstatistik dashboard'u
- XML import/export functionality

#### 🔧 Teknik Düzeltmeler

**Webpack 5 Uyumluluğu**
- Node.js polyfill sorunları çözüldü
- Buffer, stream, timers modülleri için fallback'ler eklendi
- Browser-native API'lere geçiş yapıldı

**XML İşleme Optimizasyonu**
- xml2js bağımlılığı kaldırıldı (Node.js uyumluluk sorunları)
- DOMParser ve XMLSerializer ile browser-native çözüm
- Daha hızlı ve güvenilir XML parsing

**Syntax ve Build Hataları**
- Babel parser uyumluluk sorunları çözüldü
- Identifier çakışmaları giderildi
- Production build optimizasyonu

**Performans İyileştirmeleri**
- Lazy loading için component splitting
- CSS optimizasyonu ve minification
- Bundle size optimizasyonu

### 🚧 Gelecek Sürümler

#### v1.1.0 - Planlanan Özellikler
- [ ] Undo/Redo functionality
- [ ] Keyboard shortcuts
- [ ] Element arama ve filtreleme
- [ ] Batch operations
- [ ] Template system

#### v1.2.0 - Gelişmiş Özellikler
- [ ] Multi-file support
- [ ] Version control integration
- [ ] Collaboration features
- [ ] Advanced validation rules

## 🐛 Bilinen Sorunlar

### Çözülen Sorunlar
- ✅ HtmlWebpackPlugin favicon hatası
- ✅ xml2js Node.js uyumluluk sorunu
- ✅ Webpack 5 polyfill hataları
- ✅ Babel parser syntax hataları
- ✅ processElement identifier çakışması

### Aktif Sorunlar
- Yok (şu anda bilinen aktif sorun bulunmuyor)

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/YeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/YeniOzellik`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje Turkcell Abonelik ve Sonrasi(MSPS) ekibi tarafından geliştirilmiştir.

## 📞 Destek

Sorularınız veya sorunlarınız için:
- Issue açın
- Geliştirme ekibiyle iletişime geçin
- Dokümantasyonu inceleyin

---

**Son Güncelleme**: 2024
**Versiyon**: 1.0.0
**Durum**: ✅ Aktif Geliştirme 
