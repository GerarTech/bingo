'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp, AppProvider } from '@/lib/hooks/useApp';
import TabBar from '@/lib/components/TabBar';
import BingoGrid from '@/lib/components/BingoGrid';
import { 
  Gamepad2, Medal, History, Wallet, User, 
  Check, X, Volume2, VolumeX, Trophy, Play, Star, Coins, RefreshCw, 
  Info, Crown, Target, List, Swords, Eye, Timer, RefreshCcw, Volume1
} from 'lucide-react';
import { generateCard, getSeededCard, getWinningCells, getColumnLabel, getAvailableCards, drawNumber, checkWin } from '@/lib/server/bingo';

type TabType = 'game' | 'scores' | 'history' | 'wallet' | 'profile';

function generateGameId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Amharic number words
const AMHARIC_NUMBERS: Record<number, string> = {
  1: 'አንድ', 2: 'ሁለት', 3: 'ሶስት', 4: 'አራት', 5: 'አምስት',
  6: 'ስድስት', 7: 'ሰባት', 8: 'ስምንት', 9: 'ዘጠኝ', 10: 'አስር',
  11: 'አስራ አንድ', 12: 'አስራ ሁለት', 13: 'አስራ ሶስት', 14: 'አስራ አራት', 15: 'አስራ አምስት',
  16: 'አስራ ስድስት', 17: 'አስራ ሰባት', 18: 'አስራ ስምንት', 19: 'አስራ ዘጠኝ', 20: 'ሃያ',
  21: 'ሃያ አንድ', 22: 'ሃያ ሁለት', 23: 'ሃያ ሶስት', 24: 'ሃያ አራት', 25: 'ሃያ አምስት',
  26: 'ሃያ ስድስት', 27: 'ሃያ ሰባት', 28: 'ሃያ ስምንት', 29: 'ሃያ ዘጠኝ', 30: 'ሰላሳ',
  31: 'ሰላሳ አንድ', 32: 'ሰላሳ ሁለት', 33: 'ሰላሳ ሶስት', 34: 'ሰላሳ አራት', 35: 'ሰላሳ አምስት',
  36: 'ሰላሳ ስድስት', 37: 'ሰላሳ ሰባት', 38: 'ሰላሳ ስምንት', 39: 'ሰላሳ ዘጠኝ', 40: 'አርባ',
  41: 'አርባ አንድ', 42: 'አርባ ሁለት', 43: 'አርባ ሶስት', 44: 'አርባ አራት', 45: 'አርባ አምስት',
  46: 'አርባ ስድስት', 47: 'አርባ ሰባት', 48: 'አርባ ስምንት', 49: 'አርባ ዘጠኝ', 50: 'ሃምሳ',
  51: 'ሃምሳ አንድ', 52: 'ሃምሳ ሁለት', 53: 'ሃምሳ ሶስት', 54: 'ሃምሳ አራት', 55: 'ሃምሳ አምስት',
  56: 'ሃምሳ ስድስት', 57: 'ሃምሳ ሰባት', 58: 'ሃምሳ ስምንት', 59: 'ሃምሳ ዘጠኝ', 60: 'ስልሳ',
  61: 'ስልሳ አንድ', 62: 'ስልሳ ሁለት', 63: 'ስልሳ ሶስት', 64: 'ስልሳ አራት', 65: 'ስልሳ አምስት',
  66: 'ስልሳ ስድስት', 67: 'ስልሳ ሰባት', 68: 'ስልሳ ስምንት', 69: 'ስልሳ ዘጠኝ', 70: 'ሰባ',
  71: 'ሰባ አንድ', 72: 'ሰባ ሁለት', 73: 'ሰባ ሶስት', 74: 'ሰባ አራት', 75: 'ሰባ አምስት',
};

const AMHARIC_COLUMNS: Record<string, string> = {
  B: 'ቢ', I: 'አይ', N: 'ኤን', G: 'ጂ', O: 'ኦ',
};

// Voice announcement for drawn numbers
// English: Uses Web Speech API
// Amharic: Uses pre-generated audio files
async function speakNumber(num: number, lang: 'en' | 'am') {
  if (typeof window === 'undefined') return;
  
  const label = getColumnLabel(num);
  
  if (lang === 'en') {
    // English: Use Web Speech API
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const text = `${label} ${num}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  } else {
    // Amharic: Use pre-generated audio files
    try {
      // Play column letter first
      const letterAudio = new Audio(`/audio/am/${label}.mp3`);
      await letterAudio.play();
      
      await letterAudio.addEventListener('ended', async () => {
        // Decompose number into audio parts
        const audioParts: string[] = [];
        
        if (num <= 9) {
          // 1-9: single file
          audioParts.push(`/audio/am/${num}.mp3`);
        } else if (num % 10 === 0) {
          // 10, 20, 30, 40, 50, 60, 70: base files
          audioParts.push(`/audio/am/${num}.mp3`);
        } else {
          // 11-19, 21-29, etc: base + unit
          const base = Math.floor(num / 10) * 10;
          const unit = num % 10;
          audioParts.push(`/audio/am/${base}.mp3`);
          audioParts.push(`/audio/am/${unit}.mp3`);
        }
        
        // Play each part sequentially
        for (const audioPath of audioParts) {
          try {
            const audio = new Audio(audioPath);
            await audio.play();
            await new Promise((resolve) => audio.addEventListener('ended', resolve, { once: true }));
          } catch (err) {
            // Skip missing files silently
          }
        }
      }, { once: true });
      
    } catch (err) {
      console.error('Audio playback error:', err);
      // Silent fail - no audio if file not found
    }
  }
}

function HomePage() {
  const { profile, wallet, language, activeTab, loading, t, setActiveTab, setLanguage, toggleSound, initialize } = useApp();
  const [inGame, setInGame] = useState(false);
  const [gameCard, setGameCard] = useState<number[][]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [selectedStake, setSelectedStake] = useState<number | null>(null);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [autoMark, setAutoMark] = useState(true);
  const [isWatching, setIsWatching] = useState(false);
  const [recentCalled, setRecentCalled] = useState<{num: number, label: string}[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [cardPickerCountdown, setCardPickerCountdown] = useState(50);
  const [livePlayerCount, setLivePlayerCount] = useState(20);
  const [gameId, setGameId] = useState('');
  const [previewCard, setPreviewCard] = useState<number[][]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showWinModal, setShowWinModal] = useState(false);
  const [winningCard, setWinningCard] = useState<number[][]>([]);
  const [winningCells, setWinningCells] = useState<boolean[][]>([]);
  const drawnRef = useRef<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load voices on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices(); // Trigger voice loading
    }
  }, []);

  // Initialize Telegram
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        const user = tg.initDataUnsafe?.user;
        if (user?.id) initialize(String(user.id));
        else initialize('999999999');
      } else {
        initialize('999999999');
      }
    }
  }, [initialize]);

  // Stake countdowns tick
  const [stakeStates, setStakeStates] = useState<Record<number, {status: 'waiting'|'playing'|'finished', countdown: number}>>({
    10: { status: 'playing', countdown: 0 },
    20: { status: 'waiting', countdown: 23 },
    50: { status: 'waiting', countdown: 42 },
  });

  useEffect(() => {
    const tick = setInterval(() => {
      setStakeStates(prev => {
        const next = { ...prev };
        for (const k of Object.keys(next)) {
          const key = Number(k);
          const s = next[key];
          if (s.status === 'waiting' && s.countdown > 0) {
            s.countdown--;
            if (s.countdown <= 0) {
              s.status = 'playing';
              s.countdown = 45;
            }
          } else if (s.status === 'playing' && s.countdown > 0) {
            s.countdown--;
            if (s.countdown <= 0) {
              s.status = 'waiting';
              s.countdown = 50 + Math.floor(Math.random() * 20);
            }
          }
        }
        return next;
      });
      setLivePlayerCount(prev => Math.max(1, prev + Math.floor(Math.random() * 4) - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // Card picker countdown
  useEffect(() => {
    if (!showCardPicker) return;
    const timer = setInterval(() => {
      setCardPickerCountdown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [showCardPicker]);

  // Handle winning state
  const triggerWin = useCallback((card: number[][], drawn: number[]) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setWinningCard(card);
    setWinningCells(getWinningCells(card, drawn));
    setShowWinModal(true);
  }, []);

  // Auto-draw numbers when in game (every 2.5 seconds)
  useEffect(() => {
    if (!inGame) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      const currentDrawn = drawnRef.current;
      if (currentDrawn.length >= 75) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      const all = Array.from({ length: 75 }, (_, i) => i + 1);
      const rem = all.filter(n => !currentDrawn.includes(n));
      const num = rem[Math.floor(Math.random() * rem.length)];
      const newDrawn = [...currentDrawn, num];
      drawnRef.current = newDrawn;
      setDrawnNumbers(newDrawn);
      setRecentCalled(prev => [{ num, label: `${getColumnLabel(num)}-${num}` }, ...prev].slice(0, 10));
      
      // Voice announcement
      if (voiceEnabled) {
        speakNumber(num, language);
      }
      
      // Check if current player won
      const card = gameCard;
      if (card.length > 0 && !isWatching && checkWin(card, newDrawn)) {
        triggerWin(card, newDrawn);
      }
    }, 2500);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [inGame, voiceEnabled, language, gameCard, isWatching, triggerWin]);

  // Keep ref in sync
  useEffect(() => {
    drawnRef.current = drawnNumbers;
  }, [drawnNumbers]);

  // Stake selection → open card picker
  const selectStake = useCallback((stake: number) => {
    setSelectedStake(stake);
    setSelectedCards([]);
    setPreviewCard([]);
    setCardPickerCountdown(50);
    setShowCardPicker(true);
  }, []);

  // Watch live game
  const watchGame = useCallback(() => {
    setShowCardPicker(false);
    setInGame(true);
    setIsWatching(true);
    setGameId(generateGameId());
    setGameCard(generateCard());
    setDrawnNumbers([]);
    drawnRef.current = [];
    setRecentCalled([]);
    setSelectedStake(null);
  }, []);

  // Toggle card selection in picker
  const toggleCard = useCallback((num: number) => {
    setSelectedCards(prev => {
      if (prev.includes(num)) return prev.filter(c => c !== num);
      if (prev.length >= 2) return prev;
      return [...prev, num];
    });
    if (selectedCards.length === 0 || !selectedCards.includes(num)) {
      const newCardList = selectedCards.includes(num) 
        ? selectedCards.filter(c => c !== num) 
        : [...selectedCards, num];
      if (newCardList.length > 0) {
        setPreviewCard(getSeededCard(num));
      } else {
        setPreviewCard([]);
      }
    } else {
      const updated = selectedCards.filter(c => c !== num);
      if (updated.length > 0) {
        setPreviewCard(getSeededCard(updated[0]));
      } else {
        setPreviewCard([]);
      }
    }
  }, [selectedCards]);

  // Play with selected card
  const playWithCard = useCallback(() => {
    if (selectedCards.length === 0) return;
    const stakeAmount = selectedStake || 0;
    const totalBal = (wallet?.main_balance || 0) + (wallet?.play_balance || 0);
    if (totalBal < stakeAmount) {
      alert(t('insufficient_balance'));
      return;
    }
    const card = getSeededCard(selectedCards[0]);
    setGameCard(card);
    setGameId(generateGameId());
    const emptyDrawn: number[] = [];
    setDrawnNumbers(emptyDrawn);
    drawnRef.current = emptyDrawn;
    setRecentCalled([]);
    setShowCardPicker(false);
    setInGame(true);
    setIsWatching(false);
  }, [selectedCards, selectedStake, wallet, t]);

  const leaveGame = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setInGame(false);
    setIsWatching(false);
    setGameCard([]);
    setDrawnNumbers([]);
    drawnRef.current = [];
    setSelectedStake(null);
    setSelectedCards([]);
    setRecentCalled([]);
    setGameId('');
    setShowWinModal(false);
    setWinningCard([]);
    setWinningCells([]);
  }, []);

  const manualDraw = useCallback(() => {
    const currentDrawn = drawnRef.current;
    if (currentDrawn.length >= 75) return;
    const all = Array.from({ length: 75 }, (_, i) => i + 1);
    const rem = all.filter(n => !currentDrawn.includes(n));
    const num = rem[Math.floor(Math.random() * rem.length)];
    const newDrawn = [...currentDrawn, num];
    drawnRef.current = newDrawn;
    setDrawnNumbers(newDrawn);
    setRecentCalled(prev => [{ num, label: `${getColumnLabel(num)}-${num}` }, ...prev].slice(0, 10));
    
    if (voiceEnabled) speakNumber(num, language);
    
    const card = gameCard;
    if (card.length > 0 && !isWatching && checkWin(card, newDrawn)) {
      triggerWin(card, newDrawn);
    }
  }, [voiceEnabled, language, gameCard, isWatching, triggerWin]);

  const handleBingo = useCallback(() => {
    if (gameCard.length > 0) {
      triggerWin(gameCard, drawnRef.current);
    }
  }, [gameCard, triggerWin]);

  // ============= WIN MODAL =============
  const renderWinModal = () => {
    if (!showWinModal) return null;
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => { setShowWinModal(false); leaveGame(); }}>
        <div className="bg-navy-card rounded-2xl p-6 w-full max-w-sm animate-slide-up text-center" onClick={e => e.stopPropagation()}>
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-gold mb-1">{t('bingo')}</h2>
          <p className="text-sm text-gray-400 mb-4">Congratulations! You won!</p>
          
          {winningCard.length > 0 && (
            <div className="bg-navy-light/50 rounded-xl p-2 mb-4">
              <div className="text-[10px] text-gray-400 mb-1">Winning Card</div>
              <BingoGrid card={winningCard} drawnNumbers={drawnNumbers} winningCells={winningCells} />
            </div>
          )}

          <div className="glass rounded-xl p-3 mb-4">
            <div className="text-[10px] text-gray-400 uppercase">Prize</div>
            <div className="text-lg font-bold text-gold">{(selectedStake || 10) * livePlayerCount} {t('birr')}</div>
          </div>

          <button onClick={() => { setShowWinModal(false); leaveGame(); }} className="w-full bg-gold text-navy font-bold py-3 rounded-xl text-sm">
            {t('play')} {t('again') || 'Again'}
          </button>
        </div>
      </div>
    );
  };

  // ============= GAME TAB =============
  const renderGameTab = () => {
    if (inGame) {
      return (
        <div className="px-3 pt-2 animate-fade-in">
          {/* Top Bar */}
          <div className="grid grid-cols-5 gap-1 mb-3">
            {[
              { label: t('game_id'), value: gameId },
              { label: t('players'), value: `${livePlayerCount}` },
              { label: t('bet'), value: `${selectedStake || 10} ${t('birr')}` },
              { label: t('prize'), value: `${(selectedStake || 10) * livePlayerCount}` },
              { label: t('called'), value: `${drawnNumbers.length}/75` },
            ].map(s => (
              <div key={s.label} className="glass rounded-lg py-1.5 px-1 text-center">
                <div className="text-[8px] text-gray-400 uppercase font-medium">{s.label}</div>
                <div className="text-[11px] font-bold text-white mt-0.5 truncate">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="flex-1 min-w-0">
              <div className="bg-navy-light/50 rounded-xl p-1.5">
                <BingoGrid card={gameCard} drawnNumbers={drawnNumbers} winningCells={getWinningCells(gameCard, drawnNumbers)} />
              </div>
            </div>
            <div className="w-24 flex-shrink-0 space-y-2">
              {/* Called Balls History */}
              <div className="glass rounded-xl p-2">
                <div className="text-[8px] text-gray-400 uppercase mb-1.5 font-medium">{t('called')}</div>
                <div className="space-y-1">
                  {recentCalled.slice(0, 5).map((item, i) => (
                    <div key={i} className={`text-center text-[10px] font-bold py-1 rounded transition-all ${i === 0 ? 'bg-gold/20 text-gold border border-gold/30 scale-105' : 'text-gray-400'}`}>
                      {item.label}
                    </div>
                  ))}
                  {recentCalled.length === 0 && <div className="text-[8px] text-gray-500 text-center">---</div>}
                </div>
              </div>
              {/* Auto-Mark */}
              <div className="glass rounded-xl p-2">
                <div className="text-[8px] text-gray-400 uppercase mb-1">{t('auto_mark')}</div>
                <button onClick={() => setAutoMark(!autoMark)} className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition-all ${autoMark ? 'bg-gold text-navy' : 'bg-navy text-gray-400'}`}>
                  {autoMark ? 'ON' : 'OFF'}
                </button>
              </div>
              {/* Voice toggle */}
              <div className="glass rounded-xl p-2">
                <div className="text-[8px] text-gray-400 uppercase mb-1">Voice</div>
                <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition-all ${voiceEnabled ? 'bg-gold text-navy' : 'bg-navy text-gray-400'}`}>
                  {voiceEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              {/* Watching badge */}
              {isWatching && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2 text-center">
                  <Eye size={12} className="mx-auto mb-0.5 text-red-400" />
                  <div className="text-[8px] text-red-300 font-medium">{t('watching')}</div>
                  <div className="text-[7px] text-red-400/70">WATCHING ONLY</div>
                </div>
              )}
            </div>
          </div>
          {/* Buttons */}
          <div className="flex gap-2 mt-3">
            <button onClick={manualDraw} disabled={drawnNumbers.length >= 75} className="flex-1 bg-gold text-navy font-bold py-2.5 rounded-lg text-xs disabled:opacity-50">
              🎱 {drawnNumbers.length}/75
            </button>
            <button onClick={handleBingo} className="bg-accent-green text-white font-bold py-2.5 px-5 rounded-lg text-xs">{t('bingo')}</button>
            <button onClick={leaveGame} className="glass text-red-400 font-medium py-2.5 px-3 rounded-lg text-xs">{t('leave')}</button>
          </div>
          {renderWinModal()}
        </div>
      );
    }

    // LOBBY
    return (
      <div className="px-4 pt-5 animate-fade-in">
        <div className="text-center mb-6">
          <div className="text-2xl font-black text-gold">FUA BINGO</div>
        </div>

        <h3 className="text-xs text-gray-400 mb-3 font-medium">{t('choose_stake')}</h3>
        
        <div className="flex gap-2 mb-5">
          {[10, 20, 50].map((amount) => {
            const state = stakeStates[amount];
            const isPlaying = state.status === 'playing';
            const isWaiting = state.status === 'waiting';
            return (
              <div key={amount} className={`flex-1 rounded-xl p-3 text-center relative transition-all ${isPlaying ? 'bg-gradient-gold text-navy' : 'card-gradient'}`}>
                {isPlaying && (
                  <div className="absolute -top-2 -right-2 bg-accent-green text-white text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    {t('playing')}
                  </div>
                )}
                {isWaiting && state.countdown > 0 && (
                  <div className="absolute -top-2 -right-2 bg-gold/20 text-gold text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Timer size={8} />{state.countdown}s
                  </div>
                )}
                <div className={`font-bold text-lg ${isPlaying ? 'text-navy' : 'text-gold'}`}>{amount}</div>
                <div className={`text-[10px] ${isPlaying ? 'text-navy/70' : 'text-gray-400'}`}>{t('birr')}</div>
                {isPlaying ? (
                  <button onClick={() => watchGame()} className="w-full mt-2 py-1.5 rounded-lg text-[10px] font-bold bg-accent-green text-white hover:opacity-90 flex items-center justify-center gap-1">
                    <Eye size={10} />{t('watch')}
                  </button>
                ) : (
                  <button onClick={() => selectStake(amount)} className="w-full mt-2 py-1.5 rounded-lg text-[10px] font-bold bg-gold text-navy hover:bg-gold-dark">
                    {t('play')} {amount}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={() => selectStake(20)} className="w-full bg-gradient-gold text-navy font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-all mb-6">
          {t('select_stake')}
        </button>

        <div className="glass rounded-xl p-3">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">{t('wallet')}</div>
          <div className="text-lg font-bold text-gold mt-0.5">
            {wallet ? (wallet.main_balance + wallet.play_balance).toLocaleString() : '0'} {t('birr')}
          </div>
        </div>

        <button onClick={() => setShowRules(true)} className="w-full mt-3 glass text-white/60 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-white/5">
          <Info size={12} />{t('how_to_play')}
        </button>

        {showCardPicker && renderCardPicker()}
        {showRules && renderRulesModal()}
      </div>
    );
  };

  // ============= CARD PICKER =============
  const renderCardPicker = () => {
    const cards = getAvailableCards();
    const stake = selectedStake || 20;
    const totalBal = (wallet?.main_balance || 0) + (wallet?.play_balance || 0);
    const hasBalance = totalBal >= stake;

    return (
      <div className="fixed inset-0 bg-black/95 flex flex-col z-50 animate-fade-in">
        <div className="px-4 pt-4 pb-2 border-b border-white/5 relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-gold">FUA BINGO</div>
              <div className="text-[10px] text-gray-400">{t('select_card')}</div>
            </div>
            <button onClick={() => { setShowCardPicker(false); setSelectedStake(null); setSelectedCards([]); setPreviewCard([]); }} className="text-gray-400 hover:text-white p-1"><X size={18} /></button>
          </div>
          <div className="absolute top-4 right-14 bg-gold text-navy text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            <Timer size={10} />{cardPickerCountdown}s
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 px-4 py-3">
          <div className="glass rounded-xl p-2.5 text-center">
            <div className="text-[8px] text-gray-400 uppercase">{t('wallet')}</div>
            <div className="text-xs font-bold text-gold mt-0.5">{totalBal.toLocaleString()} {t('birr')}</div>
          </div>
          <div className="glass rounded-xl p-2.5 text-center">
            <div className="text-[8px] text-gray-400 uppercase">{t('stake')}</div>
            <div className="text-xs font-bold text-white mt-0.5">{stake} {t('birr')}</div>
          </div>
          <div className="glass rounded-xl p-2.5 text-center">
            <div className="text-[8px] text-gray-400 uppercase">{t('prize')}</div>
            <div className="text-xs font-bold text-accent-green mt-0.5">{stake * livePlayerCount} {t('birr')}</div>
          </div>
        </div>

        {/* Card Preview */}
        {selectedCards.length > 0 && previewCard.length > 0 && (
          <div className="px-4 py-2 border-t border-white/5">
            <div className="text-[10px] text-gray-400 mb-1">Your BINGO Card #{selectedCards[0]}</div>
            <div className="bg-navy-light/50 rounded-xl p-2">
              <BingoGrid card={previewCard} drawnNumbers={[]} />
            </div>
          </div>
        )}

        {/* Card grid (1-40) */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {selectedCards.length === 0 && (
            <div className="text-[10px] text-gray-400 mb-2">{t('select_card_desc')}</div>
          )}
          <div className="grid grid-cols-5 gap-2">
            {cards.slice(0, 40).map((num) => {
              const isSelected = selectedCards.includes(num);
              const isTaken = [3, 7, 12, 25, 33].includes(num);
              return (
                <button key={num} onClick={() => { if (!isTaken) toggleCard(num); }} disabled={isTaken}
                  className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${isSelected ? 'bg-gold text-navy ring-2 ring-gold' : isTaken ? 'bg-navy/30 text-gray-600 cursor-not-allowed line-through' : 'bg-navy border border-white/10 text-gray-300 hover:border-gold/50'}`}>
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom section */}
        <div className="px-4 py-3 border-t border-white/5 bg-navy-light">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] text-gray-400">{t('selected_card')} ({selectedCards.length}/2)</div>
            <div className="flex gap-2">
              {[0, 1].map(i => (
                <div key={i} className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold ${selectedCards[i] ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-navy border border-white/5 text-gray-600'}`}>
                  {selectedCards[i] || '?'}
                </div>
              ))}
            </div>
          </div>
          
          {selectedCards.length > 0 && !hasBalance && (
            <div className="bg-red-500/20 text-red-400 text-[10px] text-center py-2 rounded-lg mb-2 font-medium">
              ⚠ {t('insufficient_balance')} ({t('wallet')}: {totalBal} {t('birr')} / {stake} {t('birr')} {t('required')})
            </div>
          )}

          <button onClick={playWithCard} disabled={selectedCards.length === 0}
            className={`w-full font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${selectedCards.length > 0 && hasBalance ? 'bg-gradient-gold text-navy hover:opacity-90 gold-glow' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}>
            <Play size={18} />
            {t('play')} {stake} {t('birr')}
          </button>
        </div>
      </div>
    );
  };

  // ============= RULES MODAL =============
  const renderRulesModal = () => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setShowRules(false)}>
      <div className="bg-navy-card rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gold flex items-center gap-2"><Info size={20} />{t('how_to_play')}</h2>
          <button onClick={() => setShowRules(false)} className="text-gray-400 hover:text-white p-1"><X size={20} /></button>
        </div>
        <div className="space-y-5">
          {[
            { icon: <Target size={16} className="text-gold" />, bg: 'bg-gold/20', title: t('objective'), desc: t('objective_desc') },
            { icon: <List size={16} className="text-accent-green" />, bg: 'bg-accent-green/20', title: t('gameplay'), desc: t('gameplay_desc') },
            { icon: <Crown size={16} className="text-accent-blue" />, bg: 'bg-accent-blue/20', title: t('winning'), desc: t('winning_desc') },
            { icon: <Swords size={16} className="text-accent-violet" />, bg: 'bg-accent-violet/20', title: t('stakes'), desc: t('stakes_desc') },
          ].map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className={`w-8 h-8 rounded-full ${item.bg} flex items-center justify-center flex-shrink-0`}>{item.icon}</div>
              <div><h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4><p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p></div>
            </div>
          ))}
        </div>
        <button onClick={() => setShowRules(false)} className="w-full mt-6 bg-gold text-navy font-bold py-3 rounded-xl hover:bg-gold-dark">{t('got_it')}</button>
      </div>
    </div>
  );

  // ============= OTHER TABS =============
  const renderScoresTab = () => (
    <div className="px-4 pt-4 animate-fade-in">
      <div className="bg-gradient-violet rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"><Trophy size={24} className="text-gold" /></div>
          <div>
            <div className="text-xs text-white/70">{t('my_rank')}</div>
            <div className="text-3xl font-bold">#--</div>
            <div className="text-xs text-white/50">🏆 {t('top_winners')}</div>
          </div>
        </div>
      </div>
      <h3 className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">{t('leaderboard')}</h3>
      <div className="glass rounded-2xl py-10 text-center text-gray-500 text-xs"><Trophy size={28} className="mx-auto mb-2 text-gray-600" />{t('no_winners')}</div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="px-4 pt-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gradient-green rounded-2xl p-4"><span className="text-[10px] text-white/70 uppercase">{t('total_played')}</span><div className="text-2xl font-bold">0</div></div>
        <div className="bg-gradient-violet rounded-2xl p-4"><span className="text-[10px] text-white/70 uppercase">{t('total_wins')}</span><div className="text-2xl font-bold">0</div></div>
      </div>
      <div className="glass rounded-2xl py-10 text-center text-gray-500 text-xs"><History size={28} className="mx-auto mb-2 text-gray-600" />{t('no_activity')}</div>
    </div>
  );

  const renderWalletTab = () => (
    <div className="px-4 pt-4 animate-fade-in">
      <div className="space-y-3 mb-6">
        <div className="bg-gradient-gold rounded-2xl p-5 flex justify-between items-center"><span className="text-navy font-semibold text-sm">{t('main_wallet')}</span><span className="text-navy text-2xl font-bold">{wallet?.main_balance.toLocaleString() || '0'} {t('birr')}</span></div>
        <div className="glass rounded-2xl p-5 flex justify-between items-center"><span className="text-white font-semibold text-sm">{t('play_wallet')}</span><span className="text-gold text-2xl font-bold">{wallet?.play_balance.toLocaleString() || '0'} {t('birr')}</span></div>
      </div>
      <div className="glass rounded-2xl p-4 mb-6"><Info size={16} className="text-gold" /><p className="text-xs text-gray-400 mt-1">Use 📥 Deposit or 📤 Withdraw in the Telegram bot.</p></div>
      <div className="glass rounded-2xl py-10 text-center text-gray-500 text-xs"><RefreshCw size={28} className="mx-auto mb-2 text-gray-600" />{t('no_transactions')}</div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="px-4 pt-4 animate-fade-in">
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-gold mx-auto mb-3 flex items-center justify-center shadow-lg"><User size={36} className="text-navy" /></div>
        <h2 className="text-lg font-bold">{profile?.first_name || (profile?.username ? `@${profile.username}` : 'Player')}</h2>
        {profile?.phone && <div className="text-sm text-gray-400 mt-1">📞 {profile.phone}</div>}
        {profile?.username && <div className="text-xs text-gray-500 mt-0.5">@{profile.username}</div>}
        {profile?.verified && <span className="inline-flex items-center gap-1 text-[10px] bg-gold/20 text-gold px-3 py-1 rounded-full mt-1"><Check size={10} />{t('verified')}</span>}
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[{ label: t('game_win'), value: '0', icon: Trophy }, { label: t('played'), value: '0', icon: Gamepad2 }, { label: t('total_earned'), value: `0 ${t('birr')}`, icon: Coins }].map(s => (
          <div key={s.label} className="glass rounded-xl p-3 text-center"><s.icon size={14} className="mx-auto mb-1 text-gold" /><div className="text-sm font-bold">{s.value}</div><div className="text-[9px] text-gray-400">{s.label}</div></div>
        ))}
      </div>
      <div className="glass rounded-2xl divide-y divide-white/5">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">{profile?.sound_on ? <Volume2 size={16} className="text-gold" /> : <VolumeX size={16} className="text-gray-500" />}<span className="text-sm">{t('sound_effects')}</span></div>
          <button onClick={toggleSound} className={`w-10 h-5 rounded-full transition-colors relative ${profile?.sound_on ? 'bg-gold' : 'bg-gray-600'}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 ${profile?.sound_on ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3"><Star size={16} className="text-gold" /><span className="text-sm">{t('language')}</span></div>
          <div className="flex gap-1">
            <button onClick={() => setLanguage('en')} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium ${language === 'en' ? 'bg-gold text-navy' : 'text-gray-400'}`}>EN</button>
            <button onClick={() => setLanguage('am')} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium ${language === 'am' ? 'bg-gold text-navy' : 'text-gray-400'}`}>አማ</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'game': return renderGameTab();
      case 'scores': return renderScoresTab();
      case 'history': return renderHistoryTab();
      case 'wallet': return renderWalletTab();
      case 'profile': return renderProfileTab();
      default: return renderGameTab();
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="text-4xl font-black text-gold mb-4 animate-pulse">BINGO</div><div className="text-gray-400 text-sm">{t('loading')}</div></div></div>;
  }

  return (
    <div className="min-h-screen pb-20">
      {renderContent()}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} inGame={inGame} />
    </div>
  );
}

export default function Page() {
  return (<AppProvider><HomePage /></AppProvider>);
}