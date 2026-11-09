/**
 * ==============================================================================
 * HƯỚNG DẪN THÊM BÀI HÁT TỰ CHỌN VÀO HỆ THỐNG NHẠC LOFI (LOFI BACKGROUND MUSIC)
 * ==============================================================================
 *
 * Bạn có 2 cách cực kỳ đơn giản để thêm nhạc của riêng mình:
 *
 * CÁCH 1: TẢI TRỰC TIẾP TỪ GIAO DIỆN (KHUYÊN DÙNG - KHÔNG CẦN CHẠM CODE)
 * 1. Bấm nút Tải lên (icon mũi tên tải lên) ngay trên thanh nhạc dưới Quote hoặc trong Cài đặt.
 * 2. Chọn 1 hoặc nhiều file nhạc (.mp3, .m4a, .wav, .ogg) từ máy tính hoặc điện thoại.
 * 3. Nhạc sẽ được lưu bền vững vào IndexedDB nội bộ của trình duyệt và tự động phát khi học!
 *
 * CÁCH 2: BỎ FILE VÀO THƯ MỤC music/
 * 1. Tạo thư mục 'music' trong thư mục gốc của dự án nếu chưa có.
 * 2. Sao chép các file nhạc (.mp3 hoặc .m4a) vào thư mục 'music/'.
 * 3. Khai báo danh sách bài hát vào mảng window.CUSTOM_LOFI_FILES bên dưới:
 *
 *    window.CUSTOM_LOFI_FILES = [
 *      { title: 'Tên bài hát 1', url: './music/ten-file-1.mp3' },
 *      { title: 'Tên bài hát 2', url: './music/ten-file-2.m4a' }
 *    ];
 * ==============================================================================
 */

// Danh sách file nhạc cục bộ trong thư mục music/ (nếu người dùng thêm thủ công)
window.CUSTOM_LOFI_FILES = window.CUSTOM_LOFI_FILES || [
  // Ví dụ: { title: 'Lofi Chill 1', url: './music/chill-1.mp3' }
];

class LofiMusicPlayer {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.currentTrackIndex = 0;
    this.volume = 0.14; // Âm lượng mặc định 14% (nhỏ nhẹ để học bài)
    this.audioElement = null;
    this.synthLoopTimer = null;
    this.customTracks = []; // Tracks loaded from IndexedDB
    this.isSynthesizing = false;

    // Load saved volume
    try {
      const savedVol = localStorage.getItem('mindsparks_lofi_volume');
      if (savedVol !== null) {
        this.volume = Math.max(0, Math.min(1, parseFloat(savedVol)));
      }
    } catch (_) {}

    // Preset Procedural Lofi Chill Tracks (Hòa âm chuẩn Jazz & Neo-Soul)
    this.proceduralTracks = [
      {
        id: 'proc_1',
        title: 'Midnight Rain in Hanoi (Lofi Chill)',
        type: 'procedural',
        bpm: 72,
        chords: [
          // Fm9 -> Bb13 -> Ebmaj9 -> C7b13
          [174.61, 220.00, 261.63, 311.13, 349.23], // Fm9
          [116.54, 185.00, 233.08, 293.66, 349.23], // Bb13
          [155.56, 196.00, 233.08, 293.66, 349.23], // Ebmaj9
          [130.81, 164.81, 207.65, 233.08, 329.63]  // C7b13
        ],
        roots: [87.31, 58.27, 77.78, 65.41]
      },
      {
        id: 'proc_2',
        title: 'Warm Espresso & Old Books',
        type: 'procedural',
        bpm: 68,
        chords: [
          // Dmaj9 -> Bm11 -> Em9 -> A13sus4
          [146.83, 185.00, 220.00, 277.18, 329.63], // Dmaj9
          [123.47, 164.81, 220.00, 246.94, 293.66], // Bm11
          [164.81, 196.00, 246.94, 293.66, 370.00], // Em9
          [110.00, 164.81, 220.00, 293.66, 370.00]  // A13sus4
        ],
        roots: [73.42, 61.74, 82.41, 55.00]
      },
      {
        id: 'proc_3',
        title: 'Starlight Study Session',
        type: 'procedural',
        bpm: 64,
        chords: [
          // Am9 -> Fmaj9 -> Cmaj9 -> E7#9
          [110.00, 164.81, 220.00, 261.63, 329.63], // Am9
          [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj9
          [130.81, 196.00, 246.94, 261.63, 329.63], // Cmaj9
          [164.81, 207.65, 246.94, 311.13, 392.00]  // E7#9
        ],
        roots: [55.00, 87.31, 65.41, 82.41]
      },
      {
        id: 'proc_4',
        title: 'Autumn Leaves on West Lake',
        type: 'procedural',
        bpm: 74,
        chords: [
          // Gm9 -> C13 -> Fmaj9 -> Dm11
          [196.00, 233.08, 293.66, 349.23, 440.00], // Gm9
          [130.81, 196.00, 261.63, 329.63, 440.00], // C13
          [174.61, 220.00, 261.63, 329.63, 440.00], // Fmaj9
          [146.83, 220.00, 261.63, 293.66, 349.23]  // Dm11
        ],
        roots: [98.00, 65.41, 87.31, 73.42]
      }
    ];

    this.initAudioElement();
    this.loadCustomTracksFromDB();
  }

  initAudioElement() {
    if (typeof document === 'undefined') return;
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.volume = this.volume;
      this.audioElement.onended = () => {
        this.nextTrack();
      };
      this.audioElement.onerror = () => {
        console.warn('[LofiPlayer] Audio file error, switching to next track');
        this.nextTrack();
      };
    }
  }

  async loadCustomTracksFromDB() {
    if (typeof indexedDB === 'undefined') return;
    try {
      const openReq = indexedDB.open('MindSparksLofiDB', 1);
      openReq.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('tracks')) {
          db.createObjectStore('tracks', { keyPath: 'id' });
        }
      };
      openReq.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction('tracks', 'readonly');
        const store = tx.objectStore('tracks');
        const getReq = store.getAll();
        getReq.onsuccess = () => {
          const files = getReq.result || [];
          this.customTracks = files.map(f => ({
            id: f.id,
            title: f.title || f.name,
            type: 'uploaded',
            blob: f.blob,
            url: URL.createObjectURL(f.blob)
          }));
          this.updateUI();
        };
      };
    } catch (err) {
      console.warn('[LofiPlayer] Error loading tracks from IndexedDB:', err);
    }
  }

  async saveTrackToDB(file) {
    if (!file) return;
    const trackRecord = {
      id: 'lofi_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: file.name.replace(/\.[^/.]+$/, ''),
      title: file.name.replace(/\.[^/.]+$/, ''),
      blob: file,
      addedAt: Date.now()
    };

    return new Promise((resolve) => {
      try {
        const openReq = indexedDB.open('MindSparksLofiDB', 1);
        openReq.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('tracks')) {
            db.createObjectStore('tracks', { keyPath: 'id' });
          }
        };
        openReq.onsuccess = (e) => {
          const db = e.target.result;
          const tx = db.transaction('tracks', 'readwrite');
          const store = tx.objectStore('tracks');
          store.put(trackRecord);
          tx.oncomplete = () => {
            this.customTracks.push({
              id: trackRecord.id,
              title: trackRecord.title,
              type: 'uploaded',
              blob: file,
              url: URL.createObjectURL(file)
            });
            this.updateUI();
            resolve(trackRecord);
          };
          tx.onerror = () => resolve(null);
        };
        openReq.onerror = () => resolve(null);
      } catch (_) {
        resolve(null);
      }
    });
  }

  getAllTracks() {
    const list = [...this.proceduralTracks];
    if (Array.isArray(window.CUSTOM_LOFI_FILES)) {
      window.CUSTOM_LOFI_FILES.forEach((f, idx) => {
        if (f && f.url) {
          list.push({
            id: 'custom_file_' + idx,
            title: f.title || `Track ${idx + 1}`,
            type: 'file',
            url: f.url
          });
        }
      });
    }
    this.customTracks.forEach(t => list.push(t));
    return list;
  }

  getCurrentTrack() {
    const tracks = this.getAllTracks();
    if (this.currentTrackIndex >= tracks.length) {
      this.currentTrackIndex = 0;
    }
    return tracks[this.currentTrackIndex] || this.proceduralTracks[0];
  }

  ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  async togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      await this.play();
    }
  }

  async play() {
    this.isPlaying = true;
    const track = this.getCurrentTrack();

    if (track.type === 'procedural') {
      if (this.audioElement) {
        this.audioElement.pause();
      }
      this.ensureAudioContext();
      this.startProceduralSynth(track);
    } else if (track.url) {
      this.stopProceduralSynth();
      this.initAudioElement();
      this.audioElement.src = track.url;
      this.audioElement.volume = this.volume;
      try {
        await this.audioElement.play();
      } catch (err) {
        console.warn('[LofiPlayer] Direct audio play prevented:', err);
      }
    }
    this.updateUI();
  }

  pause() {
    this.isPlaying = false;
    this.stopProceduralSynth();
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.updateUI();
  }

  nextTrack() {
    const tracks = this.getAllTracks();
    this.currentTrackIndex = (this.currentTrackIndex + 1) % tracks.length;
    if (this.isPlaying) {
      this.play();
    } else {
      this.updateUI();
    }
  }

  prevTrack() {
    const tracks = this.getAllTracks();
    this.currentTrackIndex = (this.currentTrackIndex - 1 + tracks.length) % tracks.length;
    if (this.isPlaying) {
      this.play();
    } else {
      this.updateUI();
    }
  }

  setTrack(index) {
    const tracks = this.getAllTracks();
    if (index >= 0 && index < tracks.length) {
      this.currentTrackIndex = index;
      if (this.isPlaying) {
        this.play();
      } else {
        this.updateUI();
      }
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    if (this.masterGainNode && this.audioCtx) {
      this.masterGainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
    try {
      localStorage.setItem('mindsparks_lofi_volume', String(this.volume));
    } catch (_) {}
  }

  triggerUpload() {
    const fileInput = document.getElementById('lofi-file-upload');
    if (fileInput) fileInput.click();
  }

  async handleFilesUpload(event) {
    const files = event?.target?.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      await this.saveTrackToDB(files[i]);
    }
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`Đã thêm ${files.length} bài nhạc Lofi của bạn thành công!`, 'success');
    }
    this.currentTrackIndex = this.getAllTracks().length - 1;
    this.play();
  }

  // --- PROCEDURAL SYNTHESIS ENGINE (Warm Rhodes + Jazz Chords + Vinyl Noise) ---
  startProceduralSynth(track) {
    if (!this.audioCtx) return;
    this.stopProceduralSynth();
    this.isSynthesizing = true;

    // Master Gain
    this.masterGainNode = this.audioCtx.createGain();
    this.masterGainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    this.masterGainNode.connect(this.audioCtx.destination);

    // Warm Vinyl / Rain Atmosphere Generator
    this.startVinylAtmosphere();

    const bpm = track.bpm || 70;
    const barDuration = (60 / bpm) * 4; // 4 beats per chord
    const chords = track.chords;
    const roots = track.roots;
    let chordIdx = 0;

    const playChordBar = () => {
      if (!this.isSynthesizing || !this.isPlaying) return;
      const now = this.audioCtx.currentTime;
      const chord = chords[chordIdx % chords.length];
      const root = roots[chordIdx % roots.length];

      // 1. Play Soft Rhodes Electric Piano Chord
      this.playRhodesChord(chord, now, barDuration * 0.95);

      // 2. Play Deep Mellow Sub-bass
      this.playMellowSubBass(root, now, barDuration * 0.92);

      chordIdx++;
      this.synthLoopTimer = setTimeout(playChordBar, barDuration * 1000);
    };

    playChordBar();
  }

  stopProceduralSynth() {
    this.isSynthesizing = false;
    if (this.synthLoopTimer) {
      clearTimeout(this.synthLoopTimer);
      this.synthLoopTimer = null;
    }
    if (this.vinylNode) {
      try { this.vinylNode.stop(); } catch (_) {}
      this.vinylNode = null;
    }
  }

  startVinylAtmosphere() {
    if (!this.audioCtx || !this.masterGainNode) return;
    try {
      const bufferSize = this.audioCtx.sampleRate * 2;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Soft pink noise with occasional vinyl pops
        const white = Math.random() * 2 - 1;
        const pop = (Math.random() < 0.0004) ? (Math.random() * 2 - 1) * 0.6 : 0;
        data[i] = white * 0.03 + pop;
      }

      this.vinylNode = this.audioCtx.createBufferSource();
      this.vinylNode.buffer = buffer;
      this.vinylNode.loop = true;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 850;

      const gain = this.audioCtx.createGain();
      gain.gain.value = 0.28;

      this.vinylNode.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGainNode);
      this.vinylNode.start();
    } catch (_) {}
  }

  playRhodesChord(freqs, startTime, duration) {
    if (!this.audioCtx || !this.masterGainNode) return;
    freqs.forEach((freq, i) => {
      // Warm Rhodes Voice: Sine + Triangle with slight detuning
      const osc = this.audioCtx.createOscillator();
      const oscTri = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.value = freq;

      oscTri.type = 'triangle';
      oscTri.frequency.value = freq * 1.002; // subtle chorus

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650 + i * 80, startTime);
      filter.frequency.exponentialRampToValueAtTime(320, startTime + duration);

      // Soft Bell Attack, warm mellow decay
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.08 / freqs.length, startTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.00005, startTime + duration);

      osc.connect(filter);
      oscTri.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGainNode);

      osc.start(startTime);
      oscTri.start(startTime);
      osc.stop(startTime + duration);
      oscTri.stop(startTime + duration);
    });
  }

  playMellowSubBass(freq, startTime, duration) {
    if (!this.audioCtx || !this.masterGainNode) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.value = 160;

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.12, startTime + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGainNode);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  updateUI() {
    const track = this.getCurrentTrack();
    const nameEl = document.getElementById('lofi-current-track-name');
    if (nameEl && track) {
      nameEl.textContent = track.title;
    }

    const playIcon = document.getElementById('lofi-play-icon');
    if (playIcon) {
      if (this.isPlaying) {
        // Pause icon: two bars
        playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
      } else {
        // Play icon: triangle
        playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
      }
    }

    const eqBars = document.getElementById('lofi-eq-bars');
    if (eqBars) {
      eqBars.classList.toggle('playing', this.isPlaying);
    }

    // Sync Settings elements if available
    const setVol = document.getElementById('setting-lofi-volume');
    if (setVol) {
      setVol.value = Math.round(this.volume * 100);
    }
    const setTrack = document.getElementById('setting-lofi-track');
    if (setTrack) {
      const tracks = this.getAllTracks();
      setTrack.innerHTML = tracks.map((t, idx) => `
        <option value="${idx}" ${idx === this.currentTrackIndex ? 'selected' : ''}>
          ${idx + 1}. ${t.title}
        </option>
      `).join('');
    }
  }
}

// Global Singleton
const LofiPlayer = new LofiMusicPlayer();
window.LofiPlayer = LofiPlayer;
