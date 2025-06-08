# 🧮 Hamming SEC-DED Kodlama Simülatörü

Bu proje, **Hamming SEC-DED (Single Error Correction, Double Error Detection)** algoritmasını kullanarak veriyi kodlayan, rastgele hatalar ekleyen, hataları tespit eden ve düzelten interaktif bir web uygulamasıdır. Kullanıcılar veri girebilir, Hamming kodlamasını görebilir, bellekteki veriye tek veya çift bitlik hata ekleyebilir ve hataları analiz edip düzeltebilir.

## 🚀 Canlı Demo

📺 YouTube Tanıtım Videosu: [Videoyu buraya ekle](https://www.youtube.com/...)

📷 Proje Görselleri:

| Bellek Görünümü | Hata Sonrası Görünüm |
|------------------|-----------------------|
| ![memory-clean](link/bellek-temiz.png) | ![memory-error](link/hata-eklenmiş.png) |

> Görselleri `docs/assets` klasöründe saklaman ve `README.md` içerisinde bağlantı vermen önerilir.

---

## 🧠 Algoritma Detayları

Proje, klasik **Hamming Kodlama**'nın SEC-DED (tek hata düzeltme, çift hata tespit) uzantısını temel alır:

- **Veri bitleri** ve **parite bitleri** belirli konumlara yerleştirilir.
- Hamming parite bitleri, her biri belirli bit gruplarının XOR toplamını tutar.
- Ek olarak bir **genel parite biti (overall parity)** eklenerek çift hatalar da tespit edilebilir.
- Hata analizi sırasında hesaplanan sendrom, hatalı biti gösterir.
- Çift hatalarda sendrom sıfırdan farklıdır fakat genel parite doğru görünür → düzeltilemez hata.
- Tek hata olduğunda sendrom pozisyonu verir ve bu bit terslenerek düzeltilir.

---

## 📐 Parite Bit Sayısı Hesaplama

Gerekli parite bit sayısı `r`, aşağıdaki formül sağlanana kadar artırılır:

2^r ≥ m + r + 1


Burada:
- `m`: veri bit sayısı
- `r`: parite bit sayısı
- `+1`: genel (overall) parite biti için

**Örnek:**
- `m = 8` için:  
  `2^r ≥ 8 + r + 1`  
  `r = 4` uygundur çünkü `2^4 = 16 ≥ 13`.

---

## ⚙️ Fonksiyonlar ve İşlevleri

| Fonksiyon Adı             | Açıklama |
|--------------------------|----------|
| `updateBitLength()`      | Bit uzunluğu değiştiğinde arayüzü sıfırlar |
| `calculateParityBits(m)` | Gerekli parite bitlerini hesaplar |
| `applyHammingSECDED()`   | Veri bitlerini ve parite bitlerini kullanarak Hamming kodunu oluşturur |
| `encode()`               | Kullanıcıdan alınan veriyi kodlar ve belleğe yazar |
| `validateInput()`        | Girişin bit uzunluğu ve format açısından doğruluğunu kontrol eder |
| `updateMemoryDisplay()`  | Bellekteki veriyi kutucuklar şeklinde görsel olarak gösterir |
| `updateHammingCodeDisplay()` | Kodlanmış veriyi düz metin halinde gösterir |
| `randomSingleError()`    | Rastgele tek bit hatası ekler |
| `randomDoubleError()`    | Rastgele iki bit hatası ekler |
| `clearErrors()`          | Veriyi orijinal haline döndürür |
| `checkError()`           | Sendrom ve genel parite üzerinden hata analizini yapar ve gerekirse düzeltir |

---

## 🔢 Örnek: 8 Bitlik Veri Girişi

Veri: `11010110`

### Kodlama Adımları:

1. Veri bitleri (8 bit)
2. Parite bitleri (4 bit) → 1, 2, 4, 8. pozisyonlara yerleştirilir.
3. Genel parite biti (1 bit) → sona eklenir.
4. Toplam 13 bitlik kod:  
   Örnek (sıralı görünüm):  
   `P1 P2 D1 P4 D2 D3 D4 P8 D5 D6 D7 D8 OP`

   Kodlanmış çıktı (örnek):  
   `0 1 1 0 0 1 0 1 1 0 1 0 1`

---

## 📦 Kurulum ve Kullanım

1. Bu projeyi klonlayın:

```bash
git clone https://github.com/kullaniciadi/hamming-secded-simulator.git
cd hamming-secded-simulator

