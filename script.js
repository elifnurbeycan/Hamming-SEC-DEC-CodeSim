let memoryData = null; // Hamming kodlu veri (array)
let errorPositions = []; // Hatalı bit pozisyonları (1-indexed)

function updateBitLength() {
  const bitLength = parseInt(document.getElementById('bitLength').value);
  const dataInput = document.getElementById('dataInput');
  dataInput.maxLength = bitLength;
  dataInput.placeholder = `Örn: ${'0'.repeat(bitLength)}`;
  dataInput.value = '';
  memoryData = null;
  errorPositions = [];
  updateMemoryDisplay();
  document.getElementById('hammingCode').textContent = '';
}

// Hamming SEC-DED parite biti sayısı hesaplama
function calculateParityBits(dataLength) {
  let r = 1;
  while (Math.pow(2, r) < dataLength + r + 1) {
    r++;
  }
  return r;
}

// Veriyi ve parite bitlerini yerleştirip Hamming kodu üretme
function encodeHamming(dataBits) {
  const dataLength = dataBits.length;
  const r = calculateParityBits(dataLength);
  const totalLength = dataLength + r;
  let encoded = Array(totalLength).fill(0);

  // Parite bit pozisyonları: 1,2,4,8,... (1-indexed)
  let j = 0; // data bit index
  for (let i = 1; i <= totalLength; i++) {
    if ((i & (i - 1)) === 0) {
      // parite biti - şimdilik 0
      encoded[i - 1] = 0;
    } else {
      encoded[i - 1] = parseInt(dataBits[j]);
      j++;
    }
  }

  // Parite bitlerini hesapla
  for (let i = 0; i < r; i++) {
    const parityPos = Math.pow(2, i);
    let parity = 0;
    for (let k = 1; k <= totalLength; k++) {
      if ((k & parityPos) !== 0) {
        parity ^= encoded[k - 1];
      }
    }
    encoded[parityPos - 1] = parity;
  }

  // SEC-DED için overall parity biti (ekstra parity bit)
  // Bu örnek basit SEC, double-error detection kısmı için geliştirebiliriz.

  return encoded;
}

// Kullanıcıdan gelen veriyi doğrula (sadece 0 ve 1 olmalı, uzunluk doğru olmalı)
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

function encode() {
  const bitLength = parseInt(document.getElementById('bitLength').value);
  const dataStr = document.getElementById('dataInput').value.trim();
  if (!validateInput(dataStr, bitLength)) return;

  memoryData = encodeHamming(dataStr);
  errorPositions = [];
  updateMemoryDisplay();
  updateHammingCodeDisplay();
}

// Bellekteki veriyi görselleştir (bitleri yatay kutucuklarla)
function updateMemoryDisplay() {
  const memoryDiv = document.getElementById('memory');
  memoryDiv.innerHTML = '';
  if (!memoryData) return;

  memoryData.forEach((bit, idx) => {
    const span = document.createElement('span');
    span.classList.add('bit');
    if (errorPositions.includes(idx + 1)) {
      span.classList.add('error');
    }
    span.textContent = bit;
    memoryDiv.appendChild(span);
  });
}

function updateHammingCodeDisplay() {
  if (!memoryData) {
    document.getElementById('hammingCode').textContent = '';
    return;
  }
  document.getElementById('hammingCode').textContent = memoryData.join('');
}

// Rastgele tek bit hata ekle
function randomSingleError() {
  if (!memoryData) {
    alert('Önce kodla ve belleğe yaz butonuna basın.');
    return;
  }
  clearErrors();
  const totalBits = memoryData.length;
  const errorBit = Math.floor(Math.random() * totalBits) + 1;
  errorPositions.push(errorBit);
  memoryData[errorBit - 1] = memoryData[errorBit - 1] === 0 ? 1 : 0;
  updateMemoryDisplay();
}

// Rastgele çift bit hata ekle
function randomDoubleError() {
  if (!memoryData) {
    alert('Önce kodla ve belleğe yaz butonuna basın.');
    return;
  }
  clearErrors();
  const totalBits = memoryData.length;
  let errorBit1 = Math.floor(Math.random() * totalBits) + 1;
  let errorBit2;
  do {
    errorBit2 = Math.floor(Math.random() * totalBits) + 1;
  } while (errorBit2 === errorBit1);

  errorPositions.push(errorBit1, errorBit2);
  memoryData[errorBit1 - 1] = memoryData[errorBit1 - 1] === 0 ? 1 : 0;
  memoryData[errorBit2 - 1] = memoryData[errorBit2 - 1] === 0 ? 1 : 0;
  updateMemoryDisplay();
}

// Hata pozisyonlarını temizle
function clearErrors() {
  if (!memoryData) return;
  // Eğer daha önce hata eklenmişse, hatalı bitleri geri al
  errorPositions.forEach((pos) => {
    memoryData[pos - 1] = memoryData[pos - 1] === 0 ? 1 : 0;
  });
  errorPositions = [];
}

// Sendrom hesapla ve hata varsa pozisyonlarını tespit et
function checkError() {
  if (!memoryData) {
    alert('Önce kodla ve belleğe yaz butonuna basın.');
    return;
  }

  const r = calculateParityBits(memoryData.length - calculateParityBits(memoryData.length)); // hesapla tekrar

  let syndrome = 0;
  for (let i = 0; i < r; i++) {
    const parityPos = Math.pow(2, i);
    let parity = 0;
    for (let k = 1; k <= memoryData.length; k++) {
      if ((k & parityPos) !== 0) {
        parity ^= memoryData[k - 1];
      }
    }
    if (parity !== 0) {
      syndrome += parityPos;
    }
  }

  if (syndrome === 0 && errorPositions.length === 0) {
    alert('Hata yok, veri doğru.');
    return;
  }

  if (syndrome !== 0) {
    alert(`Tek bit hatası tespit edildi. Hatalı bit: ${syndrome}`);
    // Hatalı biti düzelt
    memoryData[syndrome - 1] = memoryData[syndrome - 1] === 0 ? 1 : 0;
    errorPositions = errorPositions.filter((pos) => pos !== syndrome);
    updateMemoryDisplay();
  } else if (errorPositions.length >= 2) {
    alert('Çift hata tespit edildi, düzeltilemez.');
  } else {
    alert('Bilinmeyen durum.');
  }
  updateHammingCodeDisplay();
}

// Sayfa ilk yüklendiğinde input placeholder ve maxlength ayarı
window.onload = updateBitLength;
