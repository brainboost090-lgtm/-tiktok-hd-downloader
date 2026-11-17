const form = document.getElementById('form');
const input = document.getElementById('url');
const statusBox = document.getElementById('status');
const result = document.getElementById('result');
const preview = document.getElementById('preview');
const openTikTok = document.getElementById('open-tiktok');
let currentVideoUrl = '';

function isTikTokUrl(value) {
  try {
    const u = new URL(value);
    return ['https:', 'http:'].includes(u.protocol) &&
      (u.hostname === 'tiktok.com' || u.hostname.endsWith('.tiktok.com'));
  } catch {
    return false;
  }
}

function getVideoId(value) {
  const match = value.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const entered = input.value.trim();
  result.hidden = true;
  preview.replaceChildren();
  currentVideoUrl = '';

  if (!isTikTokUrl(entered)) {
    statusBox.textContent = 'সঠিক TikTok লিংক দিন।';
    return;
  }

  statusBox.textContent = 'লিংক যাচাই করা হচ্ছে…';
  let resolved = entered;

  try {
    const response = await fetch('/.netlify/functions/resolve-tiktok?url=' + encodeURIComponent(entered));
    if (response.ok) {
      const data = await response.json();
      if (data.url && isTikTokUrl(data.url)) resolved = data.url;
    }
  } catch (_) {
    // Full TikTok URLs can still be previewed if the resolver is unavailable.
  }

  currentVideoUrl = resolved;
  const id = getVideoId(resolved);

  if (!id) {
    statusBox.textContent = 'এই লিংক থেকে ভিডিও ID পাওয়া যায়নি। TikTok থেকে Share → Copy link করে আবার চেষ্টা করুন।';
    return;
  }

  const frame = document.createElement('iframe');
  frame.src = 'https://www.tiktok.com/embed/v2/' + encodeURIComponent(id);
  frame.title = 'TikTok video preview';
  frame.allow = 'encrypted-media; fullscreen';
  frame.allowFullscreen = true;
  preview.appendChild(frame);

  result.hidden = false;
  statusBox.textContent = 'ভিডিও প্রিভিউ প্রস্তুত।';
});

openTikTok.addEventListener('click', () => {
  if (currentVideoUrl) window.open(currentVideoUrl, '_blank', 'noopener,noreferrer');
});

document.getElementById('mp4-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const field = document.getElementById('mp4-url');
  const message = document.getElementById('mp4-status');
  let url;

  try {
    url = new URL(field.value.trim());
  } catch {
    message.textContent = 'সঠিক MP4 ফাইলের URL দিন।';
    return;
  }

  if (!['https:', 'http:'].includes(url.protocol) || !/\.mp4$/i.test(url.pathname)) {
    message.textContent = 'এটি সরাসরি .mp4 ফাইলের লিংক বলে মনে হচ্ছে না।';
    return;
  }

  message.textContent = 'MP4 ফাইলটি নতুন ট্যাবে খোলা হচ্ছে। ব্রাউজারের ভিডিও মেনু থেকে Download/Save ব্যবহার করুন।';
  window.open(url.href, '_blank', 'noopener,noreferrer');
});
