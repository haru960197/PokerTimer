// ブラインドストラクチャーの設定 (各レベル7分)
const LEVEL_MINUTES = 7;
const SECONDS_PER_MINUTE = 60;

const blindStructure = [
    { level: 1, sb: 1, bb: 2 },
    { level: 2, sb: 2, bb: 4 },
    { level: 3, sb: 5, bb: 10 },
    { level: 4, sb: 10, bb: 20 },
    { level: 5, sb: 25, bb: 50 },
    { level: 6, sb: 50, bb: 100 },
    { level: 7, sb: 100, bb: 200 }
];

// 状態管理
let currentLevelIndex = 0;
let timeRemaining = LEVEL_MINUTES * SECONDS_PER_MINUTE;
let isRunning = false;
let timerInterval = null;

// DOM要素の取得
const levelDisplay = document.getElementById('level-display');
const blindsDisplay = document.getElementById('blinds-display');
const timeDisplay = document.getElementById('time-display');
const nextBlindsDisplay = document.getElementById('next-blinds-display');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// アラーム音を鳴らす関数 (Web Audio API)
function playBeep() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // 3回ビープ音を鳴らす
    for (let i = 0; i < 3; i++) {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + i * 0.5); // A5の音
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + i * 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + i * 0.5 + 0.4);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start(audioCtx.currentTime + i * 0.5);
        oscillator.stop(audioCtx.currentTime + i * 0.5 + 0.4);
    }
}

// 画面の更新
function updateDisplay() {
    const current = blindStructure[currentLevelIndex];
    const next = blindStructure[currentLevelIndex + 1];

    levelDisplay.textContent = current.level;
    blindsDisplay.textContent = `${current.sb} / ${current.bb}`;
    
    if (next) {
        nextBlindsDisplay.textContent = `${next.sb} / ${next.bb}`;
    } else {
        nextBlindsDisplay.textContent = "Max Level";
    }

    const minutes = Math.floor(timeRemaining / SECONDS_PER_MINUTE);
    const seconds = timeRemaining % SECONDS_PER_MINUTE;
    timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// タイマーの進行
function tick() {
    if (timeRemaining > 0) {
        timeRemaining--;
        updateDisplay();
    } else {
        // レベルアップ
        if (currentLevelIndex < blindStructure.length - 1) {
            playBeep();
            currentLevelIndex++;
            timeRemaining = LEVEL_MINUTES * SECONDS_PER_MINUTE;
            updateDisplay();
        } else {
            // 最終レベル終了
            pauseTimer();
            timeDisplay.textContent = "00:00";
        }
    }
}

// 再生・一時停止の切り替え
function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    isRunning = true;
    timerInterval = setInterval(tick, 1000);
    playPauseBtn.textContent = "Pause";
    playPauseBtn.classList.add("paused");
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    playPauseBtn.textContent = "Play";
    playPauseBtn.classList.remove("paused");
}

// レベルの手動変更
function changeLevel(offset) {
    const newIndex = currentLevelIndex + offset;
    if (newIndex >= 0 && newIndex < blindStructure.length) {
        currentLevelIndex = newIndex;
        timeRemaining = LEVEL_MINUTES * SECONDS_PER_MINUTE;
        updateDisplay();
    }
}

// イベントリスナー
playPauseBtn.addEventListener('click', toggleTimer);
prevBtn.addEventListener('click', () => changeLevel(-1));
nextBtn.addEventListener('click', () => changeLevel(1));

// 初期表示
updateDisplay();
