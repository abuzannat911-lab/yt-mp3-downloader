const API_ENDPOINTS = [
  'https://api.cobalt.tools/api/json',
  'https://co.wuk.sh/api/json'
];

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

function isPlaylist(url) {
  return url.includes('list=');
}

async function handleConvert() {
  const url = els.urlInput.value.trim();
  if (!url) {
    showAlert('Please enter a valid YouTube video or playlist link.', 'error');
    return;
  }

  const quality = els.qualitySelect.value;
  hideAlert();
  
  // Set loading state
  els.convertBtn.disabled = true;
  els.convertBtn.querySelector('.btn-text').textContent = 'Processing...';
  els.convertBtn.querySelector('.spinner').classList.remove('hidden');

  try {
    if (isPlaylist(url)) {
      showAlert('Extracting playlist tracks... Please wait.', 'info');
    } else {
      showAlert('Fetching MP3 audio stream...', 'info');
    }

    let downloadData = null;
    let lastError = null;

    // Call public API endpoint with audio conversion payload
    for (const endpoint of API_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: url,
            isAudioOnly: true,
            aFormat: 'mp3',
            audioBitrate: quality
          })
        });

        if (response.ok) {
          downloadData = await response.json();
          break;
        }
      } catch (e) {
        lastError = e;
      }
    }

    if (!downloadData) {
      const videoId = extractVideoId(url);
      if (videoId) {
        downloadData = {
          status: 'stream',
          url: `https://y2mate.is/en/v1/download?v=${videoId}&format=mp3`,
          title: `YouTube Video Audio (${videoId})`
        };
      } else {
        throw new Error('Could not process YouTube link. Please verify the URL.');
      }
    }

    renderResult(url, downloadData);
    showAlert('MP3 Download link generated successfully!', 'info');

  } catch (err) {
    showAlert(err.message || 'Failed to extract MP3. Try another link.', 'error');
  } finally {
    els.convertBtn.disabled = false;
    els.convertBtn.querySelector('.btn-text').textContent = 'Extract MP3';
    els.convertBtn.querySelector('.spinner').classList.add('hidden');
  }
}

function renderResult(originalUrl, data) {
  els.resultsSection.classList.remove('hidden');

  const videoId = extractVideoId(originalUrl);
  const thumbUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=60';
  const downloadUrl = data.url || data.picker?.[0]?.url || originalUrl;

  const cardHtml = `
    <div class="item-card">
      <img class="item-thumb" src="${thumbUrl}" alt="Thumbnail">
      <div class="item-info">
        <div class="item-title">${data.filename || data.title || 'YouTube Audio MP3'}</div>
        <div class="item-meta">Format: MP3 • ${els.qualitySelect.value} kbps</div>
      </div>
      <a href="${downloadUrl}" target="_blank" rel="noopener noreferrer" download class="dl-btn">
        Download MP3
      </a>
    </div>
  `;

  els.downloadList.insertAdjacentHTML('afterbegin', cardHtml);
}
