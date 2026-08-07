const els = {
  urlInput: document.getElementById('urlInput'),
  convertBtn: document.getElementById('convertBtn'),
  qualitySelect: document.getElementById('qualitySelect'),
  statusAlert: document.getElementById('statusAlert'),
  resultsSection: document.getElementById('resultsSection'),
  downloadList: document.getElementById('downloadList')
};

els.convertBtn.addEventListener('click', handleConvert);
els.urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleConvert();
});

function showAlert(message, type = 'info') {
  els.statusAlert.textContent = message;
  els.statusAlert.className = `alert ${type}`;
  els.statusAlert.classList.remove('hidden');
}

function hideAlert() {
  els.statusAlert.classList.add('hidden');
}

function extractVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function triggerDirectFileDownload(streamUrl, filename) {
  // Use same-origin proxy endpoint to bypass CORS and force native PC download
  const proxyDownloadUrl = `/api/proxy-download?url=${encodeURIComponent(streamUrl)}&filename=${encodeURIComponent(filename)}`;
  
  const a = document.createElement('a');
  a.href = proxyDownloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  showAlert('Downloading MP3 directly to your device...', 'info');
}

async function handleConvert() {
  const url = els.urlInput.value.trim();
  if (!url) {
    showAlert('Please enter a valid YouTube video or playlist link.', 'error');
    return;
  }

  const quality = els.qualitySelect.value;
  hideAlert();
  
  els.convertBtn.disabled = true;
  els.convertBtn.querySelector('.btn-text').textContent = 'Extracting MP3...';
  els.convertBtn.querySelector('.spinner').classList.remove('hidden');

  try {
    showAlert('Extracting audio stream... Please wait.', 'info');

    // Call Cloudflare Worker endpoint
    const response = await fetch('/api/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        quality: quality
      })
    }).catch(async () => {
      // Fallback if testing locally on static file server
      return await fetch('https://api.cobalt.tools/api/json', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url, isAudioOnly: true, aFormat: 'mp3', audioBitrate: quality })
      });
    });

    const data = await response.json().catch(() => ({}));

    if (!data.url && !data.picker) {
      throw new Error(data.error || data.text || 'Could not extract MP3 audio. Verify YouTube link.');
    }

    const videoId = extractVideoId(url);
    const title = data.filename || `YouTube_Audio_${videoId || 'Track'}.mp3`;
    const streamUrl = data.url || data.picker?.[0]?.url;

    renderResult(url, title, streamUrl);

  } catch (err) {
    showAlert(err.message || 'Failed to extract MP3 audio stream.', 'error');
  } finally {
    els.convertBtn.disabled = false;
    els.convertBtn.querySelector('.btn-text').textContent = 'Extract MP3';
    els.convertBtn.querySelector('.spinner').classList.add('hidden');
  }
}

function renderResult(originalUrl, title, streamUrl) {
  els.resultsSection.classList.remove('hidden');

  const videoId = extractVideoId(originalUrl);
  const thumbUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=60';
  const cardId = `item-${Date.now()}`;

  const cardHtml = `
    <div class="item-card" id="${cardId}">
      <img class="item-thumb" src="${thumbUrl}" alt="Thumbnail">
      <div class="item-info">
        <div class="item-title">${title}</div>
        <div class="item-meta">Format: MP3 • ${els.qualitySelect.value} kbps</div>
      </div>
      <button class="dl-btn direct-dl-btn" data-url="${streamUrl}" data-title="${title}">
        Save MP3 to PC
      </button>
    </div>
  `;

  els.downloadList.insertAdjacentHTML('afterbegin', cardHtml);

  document.querySelector(`#${cardId} .direct-dl-btn`).addEventListener('click', function() {
    const url = this.getAttribute('data-url');
    const filename = this.getAttribute('data-title');
    triggerDirectFileDownload(url, filename);
  });

  // Auto trigger download
  triggerDirectFileDownload(streamUrl, title);
}
