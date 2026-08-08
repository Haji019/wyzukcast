(() => {
  const video = document.getElementById('video-player');
  const playerWrapper = document.getElementById('player-wrapper');
  const idleOverlay = document.getElementById('player-idle');
  const loadingOverlay = document.getElementById('player-loading');
  const errorOverlay = document.getElementById('player-error');
  const errorTitle = document.getElementById('error-title');
  const errorDesc = document.getElementById('error-desc');
  const btnRetry = document.getElementById('btn-retry-stream');
  const btnNextError = document.getElementById('btn-next-error');

  const btnPlayPause = document.getElementById('btn-play-pause');
  const iconPlay = btnPlayPause.querySelector('.icon-play');
  const iconPause = btnPlayPause.querySelector('.icon-pause');
  const btnPrev = document.getElementById('btn-prev-channel');
  const btnNext = document.getElementById('btn-next-channel');
  const btnMute = document.getElementById('btn-mute');
  const iconVolHigh = btnMute.querySelector('.icon-vol-high');
  const iconVolMute = btnMute.querySelector('.icon-vol-mute');
  const volumeSlider = document.getElementById('volume-slider');
  const btnReload = document.getElementById('btn-reload');
  const btnPip = document.getElementById('btn-pip');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const iconExpand = btnFullscreen.querySelector('.icon-expand');
  const iconCompress = btnFullscreen.querySelector('.icon-compress');

  const infoLogo = document.getElementById('info-logo');
  const infoLogoFallback = document.getElementById('info-logo-fallback');
  const infoName = document.getElementById('info-name');
  const infoCategory = document.getElementById('info-category');
  const infoStatus = document.getElementById('info-status');
  const infoMeta = document.getElementById('info-meta');
  const headerStatus = document.getElementById('header-status');
  const totalChannelsBadge = document.getElementById('total-channels-badge');

  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  const resultsCount = document.getElementById('results-count');
  const categoryNav = document.getElementById('category-nav');
  const catScrollLeft = document.getElementById('cat-scroll-left');
  const catScrollRight = document.getElementById('cat-scroll-right');
  const channelGrid = document.getElementById('channel-grid');
  const gridSentinel = document.getElementById('grid-sentinel');
  const emptyState = document.getElementById('empty-state');
  const btnResetFilters = document.getElementById('btn-reset-filters');

  let channels = [];
  let filteredChannels = [];
  let currentChannelIndex = -1;
  let activeCategory = 'ALL';
  let searchQuery = '';
  let hls = null;
  let renderOffset = 0;
  const BATCH_SIZE = 60;

  function parseM3U(text) {
    const lines = text.split('\n');
    const result = [];
    let current = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith('#EXTINF:')) {
        current = {};
        const logoMatch = line.match(/tvg-logo=["']([^"']*)["']/i);
        const groupMatch = line.match(/group-title=["']([^"']*)["']/i);
        const commaIdx = line.lastIndexOf(',');
        
        current.name = commaIdx !== -1 ? line.slice(commaIdx + 1).trim() : 'Channel';
        current.logo = logoMatch ? logoMatch[1].trim() : '';
        current.group = groupMatch && groupMatch[1].trim() ? groupMatch[1].trim() : 'Other';
      } else if (current && !line.startsWith('#')) {
        current.url = line;
        current.id = result.length;
        current.searchIndex = (current.name + ' ' + current.group).toLowerCase();
        result.push(current);
        current = null;
      }
    }
    return result;
  }

  function getInitials(name) {
    const clean = name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
    if (!clean) return 'TV';
    const parts = clean.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function buildCategories() {
    const counts = {};
    for (let i = 0; i < channels.length; i++) {
      const g = channels[i].group;
      counts[g] = (counts[g] || 0) + 1;
    }

    const sortedGroups = Object.keys(counts).sort((a, b) => {
      if (counts[b] !== counts[a]) return counts[b] - counts[a];
      return a.localeCompare(b);
    });

    categoryNav.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'cat-pill active';
    allBtn.dataset.category = 'ALL';
    allBtn.setAttribute('role', 'tab');
    allBtn.setAttribute('aria-selected', 'true');
    allBtn.textContent = `All Channels (${channels.length.toLocaleString()})`;
    allBtn.addEventListener('click', () => setCategory('ALL'));
    categoryNav.appendChild(allBtn);

    sortedGroups.forEach(group => {
      const btn = document.createElement('button');
      btn.className = 'cat-pill';
      btn.dataset.category = group;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', 'false');
      btn.textContent = `${group} (${counts[group].toLocaleString()})`;
      btn.addEventListener('click', () => setCategory(group));
      categoryNav.appendChild(btn);
    });

    updateCategoryScrollButtons();
  }

  function setCategory(cat) {
    activeCategory = cat;
    const pills = categoryNav.querySelectorAll('.cat-pill');
    pills.forEach(p => {
      const isActive = p.dataset.category === cat;
      p.classList.toggle('active', isActive);
      p.setAttribute('aria-selected', isActive ? 'true' : 'false');
      if (isActive) {
        p.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
    applyFilter();
  }

  function applyFilter() {
    const q = searchQuery.toLowerCase().trim();
    if (activeCategory === 'ALL' && !q) {
      filteredChannels = channels;
    } else {
      filteredChannels = channels.filter(ch => {
        const matchesCategory = (activeCategory === 'ALL' || ch.group === activeCategory);
        const matchesSearch = (!q || ch.searchIndex.includes(q));
        return matchesCategory && matchesSearch;
      });
    }

    renderOffset = 0;
    channelGrid.innerHTML = '';
    
    if (filteredChannels.length === 0) {
      emptyState.classList.remove('hidden');
      resultsCount.textContent = '0 channels found';
    } else {
      emptyState.classList.add('hidden');
      resultsCount.textContent = `Showing ${filteredChannels.length.toLocaleString()} channel${filteredChannels.length === 1 ? '' : 's'}`;
      renderNextBatch();
    }
  }

  function createCard(ch) {
    const card = document.createElement('button');
    card.className = 'channel-card';
    card.dataset.id = ch.id;
    card.setAttribute('aria-label', `Play ${ch.name}`);

    if (currentChannelIndex !== -1 && channels[currentChannelIndex].id === ch.id) {
      card.classList.add('active');
    }

    const logoBox = document.createElement('div');
    logoBox.className = 'card-logo-box';

    if (ch.logo) {
      const img = document.createElement('img');
      img.className = 'card-logo';
      img.alt = ch.name;
      img.loading = 'lazy';
      img.src = ch.logo;
      img.onerror = () => {
        img.remove();
        const fallback = document.createElement('div');
        fallback.className = 'card-fallback';
        fallback.textContent = getInitials(ch.name);
        logoBox.appendChild(fallback);
      };
      logoBox.appendChild(img);
    } else {
      const fallback = document.createElement('div');
      fallback.className = 'card-fallback';
      fallback.textContent = getInitials(ch.name);
      logoBox.appendChild(fallback);
    }

    const info = document.createElement('div');
    info.className = 'card-info';

    const name = document.createElement('div');
    name.className = 'card-name';
    name.textContent = ch.name;
    name.title = ch.name;

    const cat = document.createElement('div');
    cat.className = 'card-category';
    cat.textContent = ch.group;

    info.appendChild(name);
    info.appendChild(cat);
    card.appendChild(logoBox);
    card.appendChild(info);

    card.addEventListener('click', () => {
      playChannelById(ch.id);
    });

    return card;
  }

  function renderNextBatch() {
    if (renderOffset >= filteredChannels.length) return;
    const nextChunk = filteredChannels.slice(renderOffset, renderOffset + BATCH_SIZE);
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < nextChunk.length; i++) {
      fragment.appendChild(createCard(nextChunk[i]));
    }
    channelGrid.appendChild(fragment);
    renderOffset += nextChunk.length;
  }

  function highlightActiveCard() {
    const currentActive = channelGrid.querySelectorAll('.channel-card.active');
    currentActive.forEach(c => c.classList.remove('active'));
    if (currentChannelIndex !== -1) {
      const activeId = channels[currentChannelIndex].id;
      const target = channelGrid.querySelector(`.channel-card[data-id="${activeId}"]`);
      if (target) {
        target.classList.add('active');
      }
    }
  }

  function playChannelById(id) {
    const index = channels.findIndex(c => c.id === id);
    if (index !== -1) {
      playChannel(index);
    }
  }

  function stopCurrentStream() {
    if (hls) {
      hls.destroy();
      hls = null;
    }
    video.pause();
    video.removeAttribute('src');
    video.load();
  }

  function updateStatus(state, message) {
    const statusDot = document.querySelector('.status-dot');
    statusDot.className = 'status-dot';

    if (state === 'live') {
      infoStatus.textContent = 'Live';
      infoStatus.className = 'badge badge-status';
      headerStatus.textContent = 'Streaming Live';
    } else if (state === 'buffering') {
      statusDot.classList.add('buffering');
      infoStatus.textContent = 'Connecting...';
      infoStatus.className = 'badge badge-status';
      headerStatus.textContent = 'Connecting...';
    } else if (state === 'error') {
      statusDot.classList.add('error');
      infoStatus.textContent = 'Offline';
      infoStatus.className = 'badge badge-category';
      headerStatus.textContent = 'Stream Offline';
    } else {
      infoStatus.textContent = 'Ready';
      headerStatus.textContent = 'Ready';
    }

    if (message) {
      infoMeta.textContent = message;
    }
  }

  function playChannel(index) {
    if (index < 0 || index >= channels.length) return;
    currentChannelIndex = index;
    const ch = channels[index];

    idleOverlay.classList.add('hidden');
    errorOverlay.classList.add('hidden');
    loadingOverlay.classList.remove('hidden');

    infoName.textContent = ch.name;
    infoCategory.textContent = ch.group;
    updateStatus('buffering', `Loading stream: ${ch.name}`);

    if (ch.logo) {
      infoLogo.src = ch.logo;
      infoLogo.classList.remove('hidden');
      infoLogoFallback.classList.add('hidden');
      infoLogo.onerror = () => {
        infoLogo.classList.add('hidden');
        infoLogoFallback.textContent = getInitials(ch.name);
        infoLogoFallback.classList.remove('hidden');
      };
    } else {
      infoLogo.classList.add('hidden');
      infoLogoFallback.textContent = getInitials(ch.name);
      infoLogoFallback.classList.remove('hidden');
    }

    highlightActiveCard();
    stopCurrentStream();

    const streamUrl = ch.url;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          updatePlayState();
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              showError('Stream Unreachable', 'This live stream is temporarily offline or restricted by CORS policy.');
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().catch(() => {
        updatePlayState();
      });
    } else {
      showError('Format Unsupported', 'Your browser does not support HLS stream playback.');
    }
  }

  function showError(title, desc) {
    stopCurrentStream();
    loadingOverlay.classList.add('hidden');
    errorOverlay.classList.remove('hidden');
    errorTitle.textContent = title;
    errorDesc.textContent = desc;
    updateStatus('error', desc);
  }

  function updatePlayState() {
    if (video.paused) {
      iconPlay.classList.remove('hidden');
      iconPause.classList.add('hidden');
    } else {
      iconPlay.classList.add('hidden');
      iconPause.classList.remove('hidden');
    }
  }

  function togglePlayPause() {
    if (currentChannelIndex === -1) {
      if (filteredChannels.length > 0) {
        playChannelById(filteredChannels[0].id);
      }
      return;
    }
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  function playNextChannel() {
    if (filteredChannels.length === 0) return;
    if (currentChannelIndex === -1) {
      playChannelById(filteredChannels[0].id);
      return;
    }
    const currentId = channels[currentChannelIndex].id;
    const currFilterIdx = filteredChannels.findIndex(c => c.id === currentId);
    const nextIdx = (currFilterIdx + 1) % filteredChannels.length;
    playChannelById(filteredChannels[nextIdx].id);
  }

  function playPrevChannel() {
    if (filteredChannels.length === 0) return;
    if (currentChannelIndex === -1) {
      playChannelById(filteredChannels[0].id);
      return;
    }
    const currentId = channels[currentChannelIndex].id;
    const currFilterIdx = filteredChannels.findIndex(c => c.id === currentId);
    const prevIdx = (currFilterIdx - 1 + filteredChannels.length) % filteredChannels.length;
    playChannelById(filteredChannels[prevIdx].id);
  }

  function setVolume(val) {
    val = Math.max(0, Math.min(1, val));
    video.volume = val;
    video.muted = (val === 0);
    volumeSlider.value = val;
    updateVolumeIcons();
  }

  function toggleMute() {
    video.muted = !video.muted;
    updateVolumeIcons();
  }

  function updateVolumeIcons() {
    if (video.muted || video.volume === 0) {
      iconVolHigh.classList.add('hidden');
      iconVolMute.classList.remove('hidden');
    } else {
      iconVolHigh.classList.remove('hidden');
      iconVolMute.classList.add('hidden');
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (playerWrapper.requestFullscreen) {
        playerWrapper.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  function updateFullscreenIcons() {
    if (document.fullscreenElement) {
      iconExpand.classList.add('hidden');
      iconCompress.classList.remove('hidden');
    } else {
      iconExpand.classList.remove('hidden');
      iconCompress.classList.add('hidden');
    }
  }

  function togglePiP() {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    } else if (document.pictureInPictureEnabled && video.readyState >= 1) {
      video.requestPictureInPicture().catch(() => {});
    }
  }

  function updateCategoryScrollButtons() {
    const canScrollLeft = categoryNav.scrollLeft > 4;
    const canScrollRight = categoryNav.scrollLeft < (categoryNav.scrollWidth - categoryNav.clientWidth - 4);
    catScrollLeft.classList.toggle('hidden', !canScrollLeft);
    catScrollRight.classList.toggle('hidden', !canScrollRight);
  }

  video.addEventListener('playing', () => {
    loadingOverlay.classList.add('hidden');
    errorOverlay.classList.add('hidden');
    updatePlayState();
    updateStatus('live', 'Broadcasting Live');
  });

  video.addEventListener('waiting', () => {
    loadingOverlay.classList.remove('hidden');
    updateStatus('buffering', 'Buffering stream data...');
  });

  video.addEventListener('pause', () => {
    updatePlayState();
  });

  video.addEventListener('error', () => {
    showError('Stream Playback Failed', 'Unable to decode this video stream. Please try another channel.');
  });

  btnPlayPause.addEventListener('click', togglePlayPause);
  btnPrev.addEventListener('click', playPrevChannel);
  btnNext.addEventListener('click', playNextChannel);
  btnMute.addEventListener('click', toggleMute);
  volumeSlider.addEventListener('input', (e) => setVolume(parseFloat(e.target.value)));
  btnReload.addEventListener('click', () => {
    if (currentChannelIndex !== -1) playChannel(currentChannelIndex);
  });
  btnFullscreen.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', updateFullscreenIcons);
  btnPip.addEventListener('click', togglePiP);

  btnRetry.addEventListener('click', () => {
    if (currentChannelIndex !== -1) playChannel(currentChannelIndex);
  });
  btnNextError.addEventListener('click', playNextChannel);

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    searchClear.classList.toggle('hidden', !searchQuery);
    applyFilter();
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClear.classList.add('hidden');
    searchInput.focus();
    applyFilter();
  });

  btnResetFilters.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClear.classList.add('hidden');
    setCategory('ALL');
  });

  categoryNav.addEventListener('scroll', updateCategoryScrollButtons);
  catScrollLeft.addEventListener('click', () => {
    categoryNav.scrollBy({ left: -240, behavior: 'smooth' });
  });
  catScrollRight.addEventListener('click', () => {
    categoryNav.scrollBy({ left: 240, behavior: 'smooth' });
  });

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      renderNextBatch();
    }
  }, { rootMargin: '300px' });

  observer.observe(gridSentinel);

  document.addEventListener('keydown', (e) => {
    if (document.activeElement === searchInput) {
      if (e.key === 'Escape') {
        searchInput.blur();
      }
      return;
    }

    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      toggleMute();
    } else if (e.key === ']') {
      playNextChannel();
    } else if (e.key === '[') {
      playPrevChannel();
    } else if (e.key === '/') {
      e.preventDefault();
      searchInput.focus();
    }
  });

  async function loadDatabase() {
    try {
      headerStatus.textContent = 'Loading channels...';
      const response = await fetch('tv.txt');
      if (!response.ok) {
        throw new Error(`Failed to load tv.txt (Status ${response.status})`);
      }
      const text = await response.text();
      channels = parseM3U(text);

      if (channels.length === 0) {
        throw new Error('No valid channel entries found in tv.txt');
      }

      totalChannelsBadge.textContent = `${channels.length.toLocaleString()} Channels`;
      headerStatus.textContent = 'Ready';
      buildCategories();
      applyFilter();
    } catch (err) {
      channelGrid.innerHTML = `
        <div class="loading-grid">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p style="color: #ef4444; font-weight: 600;">Failed to load channel database</p>
          <p style="font-size: 0.85rem; color: #94a3b8;">${err.message}</p>
        </div>
      `;
      headerStatus.textContent = 'Database Error';
      resultsCount.textContent = 'Error';
    }
  }

  const aboutPopup = document.getElementById('about-popup');
  const popupClose = document.getElementById('popup-close');

  function initPopup() {
    setTimeout(() => {
      if (aboutPopup) {
        aboutPopup.classList.add('active');
      }
    }, 700);

    if (popupClose) {
      popupClose.addEventListener('click', () => {
        aboutPopup.classList.remove('active');
      });
    }
  }

  loadDatabase();
  initPopup();
})();
