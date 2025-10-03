// gallery_random_spawn_hybrid_moving_fixed.js
// Imágenes + palabras rebote tipo DVD
// Requiere p5.js y tus WebApps con JSONP

const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwSKjCCbn724YWBVQ1QhfOBBZIfYl4AP-CxRo8-bRNXG792rJpymayrGtFmtclUsLHq/exec'; 
const WORDS_URL  = 'https://script.google.com/macros/s/AKfycbyKU9hyiibqUSHDJ-1J26TeANthxe43I38bds7pdlr0C3ts0THa0Q2kvV2btnv2LMik/exec'; // tu WebApp de palabras

let photos = []; 
let words = [];
let pollMs = 8000; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('VT323');   
  textSize(22);

  // Llamadas iniciales
  pollOnceJSONP();
  pollWords();

  // Poll periódico
  setInterval(pollOnceJSONP, pollMs);
  setInterval(pollWords, pollMs);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ==================== IMÁGENES ====================
function pollOnceJSONP() {
  const prev = document.querySelector('script[data-jsonp="true"]');
  if (prev && prev.parentNode) prev.parentNode.removeChild(prev);

  const url = WEBAPP_URL + '?action=listdata&callback=gotPhotosJSONP&_=' + Date.now();
  const s = document.createElement('script');
  s.src = url;
  s.async = true;
  s.setAttribute('data-jsonp', 'true');
  document.body.appendChild(s);
}

function gotPhotosJSONP(data) {
  if (!Array.isArray(data)) return;

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const fileId = extractFileId(item.url || '');
    if (!fileId) continue;
    if (photos.some(p => p.id === fileId)) continue;

    const newP = {
      id: fileId,
      filename: item.filename || ('img_' + Date.now()),
      url: item.url || '',
      dataUrl: item.dataUrl || '',
      img: null,
      loaded: false,
      x: random(50, windowWidth - 200),
      y: random(60, windowHeight - 200), 
      w: random(100, 200)
    };

    photos.push(newP);

    const source = (newP.dataUrl && newP.dataUrl.length > 50) ? newP.dataUrl : newP.url;

    loadImage(source,
      img => {
        newP.img = img;
        newP.loaded = true;
      },
      err => {
        console.warn('No se pudo cargar imagen para', newP.filename);
        newP.loaded = false;
      }
    );
  }
}

function extractFileId(url) {
  if (!url) return null;
  let m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m && m[1]) return m[1];
  m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m && m[1]) return m[1];
  return null;
}

// ==================== PALABRAS ====================
function pollWords() {
  const prev = document.querySelector('script[data-jsonp="words"]');
  if (prev && prev.parentNode) prev.parentNode.removeChild(prev);

  const url = WORDS_URL + '?callback=gotWordsJSONP&_=' + Date.now();
  const s = document.createElement('script');
  s.src = url;
  s.async = true;
  s.setAttribute('data-jsonp', 'words');
  document.body.appendChild(s);
}

function gotWordsJSONP(data) {
  if (!Array.isArray(data)) return;

  for (let i = 0; i < data.length; i++) {
    const text = data[i];
    if (words.some(w => w.text === text)) continue; // evitar duplicados

    words.push({
      text: text,
      x: random(50, windowWidth - 50),
      y: random(50, windowHeight - 50),
      size: random(20, 50), // tamaño de letra
      color: [random(255), random(255), random(255)], // array para color
      font: 'VT323',          // tipografía
      vx: random(-2, 2),
      vy: random(-2, 2)
    });
  }
}

// ==================== DIBUJO ====================
function draw() {
  background(0);

  // Mostrar estado
  fill('#ff00d6');
  textAlign(LEFT, TOP);
  text('e-SONOMÍA EN DERIVA ::: ' + photos.length + ' imágenes, ' + words.length + ' palabras', 12, 12);

  // Dibujar imágenes primero
  for (let i = 0; i < photos.length; i++) {
    const p = photos[i];
    if (p.img && p.loaded) {
      let h = p.w * (p.img.height / p.img.width);
      image(p.img, p.x, p.y, p.w, h);
    }
  }

  // Dibujar palabras con movimiento y rebote tipo DVD
  for (let i = 0; i < words.length; i++) {
  let w = words[i];

  // mover
  w.x += w.vx;
  w.y += w.vy;

  // rebotar en bordes
  if (w.x < 0 || w.x + textWidth(w.text) > width) w.vx *= -1;
  if (w.y - w.size < 0 || w.y > height) w.vy *= -1;

  // dibujar palabra
  textFont('VT323');          // tipografía fija
  textSize('10px');               // tamaño fijo
  fill('#ff00d6');          // color fijo RGB
  text(w.text, w.x, w.y);
}

  }
