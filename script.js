let memoryData = []; // Bellekteki mevcut Hamming kodlu veri
let originalMemoryData = []; // Hatalar eklenmeden önceki orijinal Hamming verisi
let errorPositions = []; // Tespit edilen hatalı bit konumları

// Bit uzunluğu değiştiğinde giriş alanı ve bellek durumu güncellenir
function updateBitLength() {
    const bitLength = parseInt(document.getElementById('bitLength').value);
    const dataInput = document.getElementById('dataInput');
    dataInput.maxLength = bitLength;
    dataInput.placeholder = `Örn: ${'0'.repeat(bitLength)}`;
    dataInput.value = '';

    // Belleği ve arayüzü temizle
    memoryData = [];
    originalMemoryData = [];
    errorPositions = [];
    updateMemoryDisplay();
    document.getElementById('hammingCode').textContent = '';
}

// Belirtilen veri uzunluğuna göre gerekli parite biti sayısını hesaplar
function calculateParityBits(dataLength) {
    let r = 0;
    // 2^r >= m + r + 1 kuralına göre uygun r bulunur
    while (Math.pow(2, r) < dataLength + r + 1) {
        r++;
    }
    return r;
}

// Girilen veriye Hamming SEC-DED algoritmasını uygulayarak kodlama işlemi yapar
function applyHammingSECDED(dataBits) {
    const m = dataBits.length;
    const r = calculateParityBits(m);
    const totalLength = m + r + 1; // +1: genel parite biti
    let encoded = Array(totalLength).fill(0);

    // Veri bitlerini pozisyonlara yerleştir
    let dataIdx = 0;
    for (let i = 1; i <= totalLength; i++) {
        if ((i & (i - 1)) !== 0) {
            if (dataIdx < m) {
                encoded[i - 1] = dataBits[dataIdx++];
            }
        }
    }

    // Her bir parite biti için kontrol ettiği bitlerin XOR toplamı alınır
    for (let i = 0; i < r; i++) {
        const parityPos = Math.pow(2, i);
        let parity = 0;
        for (let k = 1; k <= totalLength - 1; k++) {
            if ((k & parityPos) !== 0) {
                parity ^= encoded[k - 1];
            }
        }
        encoded[parityPos - 1] = parity;
    }

    // Genel parite biti hesaplanır ve dizinin sonuna eklenir
    let overallParity = 0;
    for (let i = 0; i < totalLength - 1; i++) {
        overallParity ^= encoded[i];
    }
    encoded[totalLength - 1] = overallParity;

    return encoded;
}

// Kullanıcı tarafından girilen verinin geçerliliğini kontrol eder
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

// Veriyi kodlayarak belleğe kaydeder
function encode() {
    const bitLength = parseInt(document.getElementById('bitLength').value);
    const dataStr = document.getElementById('dataInput').value.trim();

    if (!validateInput(dataStr, bitLength)) return;

    const dataBits = dataStr.split('').map(Number);
    const encoded = applyHammingSECDED(dataBits);

    originalMemoryData = [...encoded];
    memoryData = [...encoded];
    errorPositions = [];

    updateMemoryDisplay();
    updateHammingCodeDisplay();
}

// Bellekteki veriyi arayüzde görsel olarak günceller
function updateMemoryDisplay() {
    const memoryDiv = document.getElementById('memory');
    memoryDiv.innerHTML = '';
    if (!memoryData || memoryData.length === 0) return;

    memoryData.forEach((bit, idx) => {
        const span = document.createElement('span');
        span.classList.add('bit');
        if (errorPositions.includes(idx)) {
            span.classList.add('error');
        }
        span.textContent = bit;
        memoryDiv.appendChild(span);
    });
}

// Hamming kodunu metin olarak günceller
function updateHammingCodeDisplay() {
    if (!memoryData || memoryData.length === 0) {
        document.getElementById('hammingCode').textContent = '';
        return;
    }
    document.getElementById('hammingCode').textContent = memoryData.join('');
}

// Belleğe rastgele tek bitlik hata uygular
function randomSingleError() {
    if (!memoryData || memoryData.length === 0) {
        alert('Önce "Kodla ve Belleğe Yaz" butonuna basın.');
        return;
    }
    clearErrors();

    const totalBits = memoryData.length;
    const errorBitIndex = Math.floor(Math.random() * totalBits);

    memoryData[errorBitIndex] = memoryData[errorBitIndex] === 0 ? 1 : 0;
    errorPositions.push(errorBitIndex);

    updateMemoryDisplay();
    updateHammingCodeDisplay();
}

// Belleğe rastgele iki bitlik hata uygular
function randomDoubleError() {
    if (!memoryData || memoryData.length === 0) {
        alert('Önce "Kodla ve Belleğe Yaz" butonuna basın.');
        return;
    }
    if (memoryData.length < 2) {
        alert('Çift hata eklemek için en az 2 bit olmalıdır.');
        return;
    }
    clearErrors();

    const totalBits = memoryData.length;
    let errorBitIndex1 = Math.floor(Math.random() * totalBits);
    let errorBitIndex2;
    do {
        errorBitIndex2 = Math.floor(Math.random() * totalBits);
    } while (errorBitIndex2 === errorBitIndex1);

    memoryData[errorBitIndex1] ^= 1;
    memoryData[errorBitIndex2] ^= 1;

    errorPositions.push(errorBitIndex1, errorBitIndex2);

    updateMemoryDisplay();
    updateHammingCodeDisplay();
}

// Belleği orijinal haline döndürür, hataları siler
function clearErrors() {
    if (!originalMemoryData || originalMemoryData.length === 0) return;
    memoryData = [...originalMemoryData];
    errorPositions = [];
    updateMemoryDisplay();
    updateHammingCodeDisplay();
}

// Hamming sendromunu analiz eder, hatayı tespit eder ve gerekirse düzeltir
function checkError() {
    if (!memoryData || memoryData.length === 0) {
        alert('Önce "Kodla ve Belleğe Yaz" butonuna basın.');
        return;
    }

    const totalLength = memoryData.length;
    const r = calculateParityBits(totalLength - 1);
    let syndrome = 0;

    // Sendrom bitlerini hesapla
    for (let i = 0; i < r; i++) {
        const parityPos = Math.pow(2, i);
        let parity = 0;
        for (let k = 1; k <= totalLength - 1; k++) {
            if ((k & parityPos) !== 0) {
                parity ^= memoryData[k - 1];
            }
        }
        if (parity !== 0) {
            syndrome += parityPos;
        }
    }

    // Genel parite biti kontrolü
    let calculatedOverallParity = 0;
    for (let i = 0; i < totalLength - 1; i++) {
        calculatedOverallParity ^= memoryData[i];
    }
    const actualOverallParity = memoryData[totalLength - 1];
    const overallParityError = (calculatedOverallParity !== actualOverallParity);

    // Hata durumlarını yorumla ve gerekli düzeltmeyi yap
    if (syndrome === 0 && !overallParityError) {
        alert('Hata yok, veri doğru.');
        errorPositions = [];
        updateMemoryDisplay();
    } else if (syndrome !== 0 && overallParityError) {
        const errorIndex = syndrome - 1;
        memoryData[errorIndex] ^= 1;
        alert(`Tek bit hatası tespit edildi ve düzeltildi. Hatalı bit pozisyonu: ${syndrome} (1-indexed).`);
        errorPositions = [];
        updateMemoryDisplay();
    } else if (syndrome !== 0 && !overallParityError) {
        alert('Çift hata tespit edildi, düzeltilemez.');
    } else if (syndrome === 0 && overallParityError) {
        const errorIndex = totalLength - 1;
        memoryData[errorIndex] ^= 1;
        alert(`Genel parite bitinde hata tespit edildi ve düzeltildi. Pozisyon: ${totalLength} (1-indexed).`);
        errorPositions = [];
        updateMemoryDisplay();
    } else {
        alert('Bilinmeyen durum oluştu.');
    }

    updateHammingCodeDisplay();
}

// Sayfa yüklendiğinde başlangıç bit uzunluğu ayarlanır
window.onload = updateBitLength;
