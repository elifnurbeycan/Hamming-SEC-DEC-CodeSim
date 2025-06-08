let memoryData = []; // Hamming kodlu veri (array of numbers)
let originalMemoryData = []; // Hata eklenmeden önceki orijinal Hamming kodlu veri (array of numbers)
let errorPositions = []; // Hatalı bit pozisyonları (0-indexed)

// Bit uzunluğu değiştikçe arayüzü ve değişkenleri günceller
function updateBitLength() {
    const bitLength = parseInt(document.getElementById('bitLength').value);
    const dataInput = document.getElementById('dataInput');
    dataInput.maxLength = bitLength;
    dataInput.placeholder = `Örn: ${'0'.repeat(bitLength)}`;
    dataInput.value = ''; // Input'u temizle
    
    // Verileri sıfırla ve ekranı temizle
    memoryData = [];
    originalMemoryData = [];
    errorPositions = [];
    updateMemoryDisplay();
    document.getElementById('hammingCode').textContent = '';
}

// Hamming SEC-DED parite biti sayısı hesaplama
function calculateParityBits(dataLength) {
    let r = 0;
    // 2^r >= m + r + 1 formülü (burada +1 overall parity için)
    while (Math.pow(2, r) < dataLength + r + 1) {
        r++;
    }
    return r;
}

// Veriyi ve parite bitlerini yerleştirip Hamming kodu üretme
function applyHammingSECDED(dataBits) {
    const m = dataBits.length;
    const r = calculateParityBits(m); // Gerekli parite bitleri sayısı
    const totalLength = m + r + 1; // Toplam uzunluk (veri + parite + genel parite)
    let encoded = Array(totalLength).fill(0);

    // Veri bitlerini parite bit pozisyonları hariç yerleştir (1-indexed düşünerek)
    let dataIdx = 0;
    for (let i = 1; i <= totalLength; i++) {
        // i bir 2'nin kuvveti değilse (parite bit pozisyonu değilse)
        if ((i & (i - 1)) !== 0) {
            if (dataIdx < m) { // Veri bitleri tükenmediyse
                encoded[i - 1] = dataBits[dataIdx++];
            }
        }
    }

    // Parite bitlerini hesapla ve yerleştir
    for (let i = 0; i < r; i++) {
        const parityPos = Math.pow(2, i); // 1, 2, 4, 8, ...
        let parity = 0;
        // Parite bitinin kontrol ettiği tüm pozisyonları tara
        for (let k = 1; k <= totalLength - 1; k++) { // Genel parite bitini dahil etme
            if ((k & parityPos) !== 0) { // k'nın ikili gösteriminde parityPos bit'i 1 ise
                parity ^= encoded[k - 1]; // XOR işlemi yap
            }
        }
        encoded[parityPos - 1] = parity; // Parite bitini ilgili pozisyona yerleştir
    }

    // Genel parite bitini (overall parity) hesapla ve en sona yerleştir
    // Tüm kodlanmış verinin (genel parite biti hariç) XOR toplamı
    let overallParity = 0;
    for (let i = 0; i < totalLength - 1; i++) { // Son bit hariç tüm bitleri dahil et
        overallParity ^= encoded[i];
    }
    encoded[totalLength - 1] = overallParity; // En son pozisyona yerleştir

    return encoded;
}

// Kullanıcıdan gelen veriyi doğrula
function validateInput(dataStr, bitLength) {
    if (dataStr.length !== bitLength) {
        alert(`Lütfen ${bitLength} bit uzunluğunda veri giriniz.`);
        return false;
    }
    if (!/^[01]+$/.test(dataStr)) {
        alert('Lütfen sadece 0 ve 1 karakterlerini kullanın.');
        return false;
    }
    return true;
}

// Veriyi kodlar ve belleğe yazar
function encode() {
    const bitLength = parseInt(document.getElementById('bitLength').value);
    const dataStr = document.getElementById('dataInput').value.trim();

    if (!validateInput(dataStr, bitLength)) return;

    const dataBits = dataStr.split('').map(Number);
    const encoded = applyHammingSECDED(dataBits);

    // Orijinal ve anlık bellek verisini ayarla
    originalMemoryData = [...encoded]; // Orijinal halini sakla
    memoryData = [...encoded]; // Hata eklemek için kopyala
    errorPositions = []; // Hata pozisyonlarını temizle

    updateMemoryDisplay();
    updateHammingCodeDisplay();
}

// Bellekteki veriyi görselleştir (bitleri yatay kutucuklarla)
function updateMemoryDisplay() {
    const memoryDiv = document.getElementById('memory');
    memoryDiv.innerHTML = '';
    if (!memoryData || memoryData.length === 0) return;

    memoryData.forEach((bit, idx) => {
        const span = document.createElement('span');
        span.classList.add('bit');
        // Hata pozisyonları 0-indexed olduğu için direkt kullanırız
        if (errorPositions.includes(idx)) {
            span.classList.add('error');
        }
        span.textContent = bit;
        memoryDiv.appendChild(span);
    });
}

// Hamming kodunu metin olarak gösterir
function updateHammingCodeDisplay() {
    if (!memoryData || memoryData.length === 0) {
        document.getElementById('hammingCode').textContent = '';
        return;
    }
    document.getElementById('hammingCode').textContent = memoryData.join('');
}

// Rastgele tek bit hata ekler
function randomSingleError() {
    if (!memoryData || memoryData.length === 0) {
        alert('Önce "Kodla ve Belleğe Yaz" butonuna basın.');
        return;
    }
    clearErrors(); // Önceki hataları temizle ve orijinal veriye dön

    const totalBits = memoryData.length;
    const errorBitIndex = Math.floor(Math.random() * totalBits); // 0-indexed
    
    // Biti tersine çevir
    memoryData[errorBitIndex] = memoryData[errorBitIndex] === 0 ? 1 : 0;
    errorPositions.push(errorBitIndex); // Hatalı pozisyonu kaydet

    updateMemoryDisplay();
    updateHammingCodeDisplay();
}

// Rastgele çift bit hata ekler
function randomDoubleError() {
    if (!memoryData || memoryData.length === 0) {
        alert('Önce "Kodla ve Belleğe Yaz" butonuna basın.');
        return;
    }
    if (memoryData.length < 2) {
        alert('Çift hata eklemek için en az 2 bit olmalıdır.');
        return;
    }
    clearErrors(); // Önceki hataları temizle ve orijinal veriye dön

    const totalBits = memoryData.length;
    let errorBitIndex1 = Math.floor(Math.random() * totalBits); // 0-indexed
    let errorBitIndex2;
    do {
        errorBitIndex2 = Math.floor(Math.random() * totalBits);
    } while (errorBitIndex2 === errorBitIndex1); // Aynı bit olmaması için kontrol

    // Bitleri tersine çevir
    memoryData[errorBitIndex1] = memoryData[errorBitIndex1] === 0 ? 1 : 0;
    memoryData[errorBitIndex2] = memoryData[errorBitIndex2] === 0 ? 1 : 0;
    
    // Hatalı pozisyonları kaydet
    errorPositions.push(errorBitIndex1, errorBitIndex2);

    updateMemoryDisplay();
    updateHammingCodeDisplay();
}

// Belleği orijinal haline döndürür ve hataları temizler
function clearErrors() {
    if (!originalMemoryData || originalMemoryData.length === 0) return;
    memoryData = [...originalMemoryData]; // Orijinal veriye geri dön
    errorPositions = []; // Hata pozisyonlarını temizle
    updateMemoryDisplay(); // Ekranı güncelle
    updateHammingCodeDisplay(); // Hamming kodu gösterimini güncelle
}

// Sendromu hesaplar ve hata varsa pozisyonlarını tespit edip düzeltir
function checkError() {
    if (!memoryData || memoryData.length === 0) {
        alert('Önce "Kodla ve Belleğe Yaz" butonuna basın.');
        return;
    }

    const totalLength = memoryData.length;
    // calculateParityBits fonksiyonunun içinde veri bit sayısı (m) + parite bit sayısı (r) + 1 (genel parite) toplam uzunluğunu kullandığımız için,
    // burada r'yi tekrar hesaplarken toplam uzunluktan (m + r + 1) genel pariteyi (-1) ve kendi parite bit sayısını (-r) çıkararak
    // yaklaşık veri bit sayısına (m) ulaşmaya çalışıyoruz.
    // Daha doğru bir hesaplama için, encodeHamming fonksiyonu içinde m'yi (original dataLength) global bir değişkende tutmak daha iyi olabilir.
    // Ancak mevcut yapıda, şu anki r hesaplaması (totalLength - r - 1) işe yarayabilir.
    const r = calculateParityBits(totalLength - 1); // Genel parite hariç uzunluğa göre r'yi buluruz

    let syndrome = 0;
    // Sendrom bitlerini hesapla (genel parite biti hariç)
    for (let i = 0; i < r; i++) {
        const parityPos = Math.pow(2, i); // 1, 2, 4, 8, ...
        let parity = 0;
        for (let k = 1; k <= totalLength - 1; k++) { // Genel parite biti hariç tüm bitleri tara (1-indexed k)
            if ((k & parityPos) !== 0) {
                parity ^= memoryData[k - 1]; // 0-indexed array'e uygun olarak k-1
            }
        }
        if (parity !== 0) {
            syndrome += parityPos;
        }
    }

    // Genel parite bitini kontrol et
    let calculatedOverallParity = 0;
    for (let i = 0; i < totalLength - 1; i++) { // Genel parite biti hariç tüm bitleri tara
        calculatedOverallParity ^= memoryData[i];
    }
    const actualOverallParity = memoryData[totalLength - 1]; // Gerçek genel parite biti

    const overallParityError = (calculatedOverallParity !== actualOverallParity);

    // Hata durumlarını analiz et ve düzelt
    if (syndrome === 0 && !overallParityError) {
        alert('Hata yok, veri doğru.');
        errorPositions = []; // Hata olmadığı için pozisyonları temizle
        updateMemoryDisplay(); // Ekranı güncelle
    } else if (syndrome !== 0 && overallParityError) {
        // Tek hata (düzeltilebilir)
        const errorIndex = syndrome - 1; // Sendrom 1-indexed, array 0-indexed

        // Hatalı biti düzelt
        memoryData[errorIndex] = memoryData[errorIndex] === 0 ? 1 : 0;

        alert(`Tek bit hatası tespit edildi ve düzeltildi. Hatalı bit pozisyonu: ${syndrome} (1-indexed).`);
        errorPositions = []; // Hata düzeltildiği için pozisyonu temizle
        updateMemoryDisplay(); // Ekranı güncelle
    } else if (syndrome !== 0 && !overallParityError) {
        // Çift hata (tespit edildi ama düzeltilemez)
        alert('Çift hata tespit edildi, düzeltilemez.');
        // errorPositions zaten çift hatayı içeriyorsa olduğu gibi kalır,
        // yeni bir hata eklenirse bu fonksiyon çağrılmadan önce temizlenir.
    } else if (syndrome === 0 && overallParityError) {
        // Genel parite bitinin kendisinde tek hata
        const errorIndex = totalLength - 1; // Genel parite bitinin pozisyonu

        // Hatalı biti düzelt
        memoryData[errorIndex] = memoryData[errorIndex] === 0 ? 1 : 0;

        alert(`Genel parite bitinde tek hata tespit edildi ve düzeltildi. Hatalı bit pozisyonu: ${totalLength} (1-indexed).`);
        errorPositions = []; // Hata düzeltildiği için pozisyonu temizle
        updateMemoryDisplay(); // Ekranı güncelle
    } else {
        alert('Bilinmeyen durum oluştu.');
    }
    updateHammingCodeDisplay(); // Hamming kodu gösterimini güncelle
}

// Sayfa ilk yüklendiğinde input placeholder ve maxlength ayarı
window.onload = updateBitLength;
