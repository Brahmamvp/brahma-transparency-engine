// src/components/TranslateAndListen.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Languages,
  Download,
  Copy,
  FileText,
  Upload,
  ShieldCheck,
  Keyboard,
  Loader2,
  Globe,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Volume2,
  ArrowLeftRight,
  History as HistoryIcon,
} from 'lucide-react';

/** Translate & Listen — dark glassmorphic edition (no external deps) */
export default function TranslateAndListen() {
  // ── TTS / paste
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [progress, setProgress] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);

  // ── Translate
  const [activeTab, setActiveTab] = useState('paste'); // paste | upload | translate
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProvider, setTranslationProvider] = useState('openai');
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [translationHistory, setTranslationHistory] = useState([]);
  const [showOriginal, setShowOriginal] = useState(true);
  const [privacyMode, setPrivacyMode] = useState('cloud'); // cloud | local
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // split pane width (for translate view)
  const [split, setSplit] = useState(50);
  const draggingRef = useRef(false);

  // Refs
  const fileInputRef = useRef(null);
  const utteranceRef = useRef(null);
  const supportsTTS = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Languages
  const languages = useMemo(
    () => [
      { code: 'auto', name: 'Auto-detect', flag: '🌐' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Spanish', flag: '🇪🇸' },
      { code: 'fr', name: 'French', flag: '🇫🇷' },
      { code: 'de', name: 'German', flag: '🇩🇪' },
      { code: 'it', name: 'Italian', flag: '🇮🇹' },
      { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
      { code: 'ru', name: 'Russian', flag: '🇷🇺' },
      { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
      { code: 'ko', name: 'Korean', flag: '🇰🇷' },
      { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
      { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
      { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
      { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
      { code: 'pl', name: 'Polish', flag: '🇵🇱' },
      { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
      { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
      { code: 'da', name: 'Danish', flag: '🇩🇰' },
    ],
    []
  );

  // Persisted state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ttsText');
      if (saved) setText(saved);
      const tr = localStorage.getItem('translatedText');
      if (tr) setTranslatedText(tr);
      const hist = localStorage.getItem('translationHistory');
      if (hist) setTranslationHistory(JSON.parse(hist));
      const prov = localStorage.getItem('translationProvider');
      if (prov) setTranslationProvider(prov);
      const sv = localStorage.getItem('splitPct');
      if (sv) setSplit(Number(sv));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('ttsText', text);
    } catch {}
  }, [text]);
  useEffect(() => {
    try {
      localStorage.setItem('translatedText', translatedText);
    } catch {}
  }, [translatedText]);
  useEffect(() => {
    try {
      localStorage.setItem('translationHistory', JSON.stringify(translationHistory));
    } catch {}
  }, [translationHistory]);
  useEffect(() => {
    try {
      localStorage.setItem('translationProvider', translationProvider);
    } catch {}
  }, [translationProvider]);
  useEffect(() => {
    try {
      localStorage.setItem('splitPct', String(split));
    } catch {}
  }, [split]);

  // word count
  useEffect(() => setWordCount(countWords(text)), [text]);

  // TTS voices
  useEffect(() => {
    if (!supportsTTS) return;
    let cancelled = false;
    const want = normalizeLang(targetLanguage);

    const choose = (all) => {
      if (!all?.length) return null;
      const direct = all.find((v) => v.lang.toLowerCase().startsWith(want));
      if (direct) return direct;
      const contains = all.find((v) => v.lang.toLowerCase().includes(want));
      if (contains) return contains;
      return all.find((v) => v.lang.startsWith('en')) || all[0];
    };

    const loadVoices = () => {
      const arr = window.speechSynthesis.getVoices();
      if (arr.length) {
        if (!cancelled) {
          setVoices(arr);
          setSelectedVoice((prev) => prev || choose(arr));
        }
        return true;
      }
      return false;
    };

    if (!loadVoices()) {
      const onChanged = () => loadVoices();
      window.speechSynthesis.addEventListener('voiceschanged', onChanged);
      let tries = 0;
      const t = setInterval(() => {
        tries += 1;
        if (loadVoices() || tries > 20) {
          clearInterval(t);
          window.speechSynthesis.removeEventListener('voiceschanged', onChanged);
        }
      }, 150);
    }

    return () => {
      cancelled = true;
    };
  }, [targetLanguage, supportsTTS]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const cmd = e.metaKey || e.ctrlKey;
      if (cmd && e.key.toLowerCase() === 'enter') {
        e.preventDefault();
        handleTranslate();
      }
      if (e.key === ' ') {
        const tag = (e.target?.tagName || '').toLowerCase();
        if (!['input', 'textarea', 'select', 'button'].includes(tag)) {
          e.preventDefault();
          isPlaying ? handlePause() : handlePlay();
        }
      }
      if (e.key === 'Escape') handleStop();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPlaying]);

  // Drag to resize split
useEffect(() => {
  const onMove = (e) => {
    if (!draggingRef.current) return;

    const mouseX = typeof e.clientX === 'number' ? e.clientX : undefined;
    const touchX = e.touches?.[0]?.clientX;
    const px = mouseX ?? touchX ?? 0; // no mixed || with ?? — safe precedence

    const total = document.body.clientWidth || window.innerWidth || 1;
    const pct = Math.min(80, Math.max(20, (px / total) * 100));
    setSplit(pct);
  };

  const stop = () => {
    draggingRef.current = false;
  };

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', stop);
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', stop);

  return () => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', stop);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('touchend', stop);
  };
}, []);

  // Translation (mock/demo)
  const detectLanguage = async (txt) => {
    const map = {
      hola: 'es',
      bonjour: 'fr',
      hallo: 'de',
      ciao: 'it',
      привет: 'ru',
      こんにちは: 'ja',
      안녕하세요: 'ko',
      你好: 'zh',
      مرحبا: 'ar',
      नमस्ते: 'hi',
    };
    const first = txt.trim().split(/\s+/)[0]?.toLowerCase();
    return map[first] || 'en';
  };
  const translateText = async (txt, fromLang, toLang) => {
    if (!txt.trim()) return '';
    setIsTranslating(true);
    try {
      await delay(900);
      const mock = MOCK_TRANSLATIONS[toLang];
      const detected = fromLang === 'auto' ? await detectLanguage(txt) : fromLang;
      setDetectedLanguage(detected);
      const result = mock || `Translated to ${languages.find((l) => l.code === toLang)?.name}: ${txt}`;
      setTranslationHistory((prev) => [
        {
          id: Date.now(),
          original: truncate(txt, 120),
          translated: truncate(result, 120),
          fromLang: detected,
          toLang,
          provider: translationProvider,
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 14),
      ]);
      return result;
    } catch {
      return 'Translation failed. Please try again.';
    } finally {
      setIsTranslating(false);
    }
  };
  const handleTranslate = async () => {
    if (!text.trim()) return;
    const out = await translateText(text, sourceLanguage, targetLanguage);
    setTranslatedText(out);
    setActiveTab('translate');
  };

  // Upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((f) => ({ id: cryptoRand(), name: f.name, size: f.size, type: f.type, file: f }));
    setUploadedFiles((prev) => [...prev, ...mapped]);
    if (mapped[0]) processFile(mapped[0]);
  };
  const processFile = async ({ file, name }) => {
    if (file.type.startsWith('text/')) setText(await file.text());
    else if (file.type === 'application/pdf')
      setText(`PDF Content from ${name}\n\n(placeholder for extracted text)`);
    else if (file.type.includes('word'))
      setText(`Word Content from ${name}\n\n(placeholder for extracted text)`);
    else setText(`File uploaded: ${name}\n(No parser yet for this type.)`);
    setActiveTab('paste');
  };

  // TTS
  const getCurrentText = () => (activeTab === 'translate' && !showOriginal ? translatedText : text);
  const getCurrentWordCount = () => countWords(getCurrentText());
  const speak = (input) => {
    if (!supportsTTS) return;
    window.speechSynthesis.cancel();
    const content = (input ?? getCurrentText()) || '';
    if (!content.trim()) return;

    const u = new SpeechSynthesisUtterance(content);
    u.voice = selectedVoice || null;
    u.rate = rate;
    u.pitch = 1;
    u.volume = 1;

    const words = content.trim().split(/\s+/);
    u.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setProgress(0);
      setCurrentWordIdx(0);
    };
    u.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      setCurrentWordIdx(words.length);
    };
    u.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    u.onboundary = (e) => {
      const idx = e.charIndex || 0;
      const prefix = content.slice(0, idx);
      const w = countWords(prefix);
      setCurrentWordIdx(w);
      setProgress(words.length ? (w / words.length) * 100 : 0);
    };

    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  };
  const handlePlay = () => {
    if (!supportsTTS) return;
    if (isPaused && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      speak();
    }
  };
  const handlePause = () => {
    if (!supportsTTS) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };
  const handleStop = () => {
    if (!supportsTTS) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentWordIdx(0);
  };
  const handleRestart = () => {
    handleStop();
    setTimeout(() => speak(), 80);
  };
  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch {} }, []);

  // UI
  return (
    <div className="p-6 lg:p-8">
      {/* Header / toolbar */}
      <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl px-5 py-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/40 to-pink-500/40 grid place-items-center border border-white/10">
            <Languages className="w-4 h-4 text-purple-200" />
          </div>
          <div>
            <div className="text-sm font-medium text-white/90">Translate & Listen</div>
            <div className="text-[11px] text-white/60">Dark glass • pro tools • on-device TTS</div>
          </div>
        </div>

        <div className="flex-1" />

        <Chip
          icon={<ShieldCheck className="w-3.5 h-3.5" />}
          label={privacyMode === 'local' ? 'Local only' : 'Cloud processing'}
          tone={privacyMode === 'local' ? 'emerald' : 'indigo'}
        />
        <Chip icon={<HistoryIcon className="w-3.5 h-3.5" />} label={`${translationHistory.length} recent`} />
        <Chip icon={<Keyboard className="w-3.5 h-3.5" />} label="⌘/Ctrl+Enter → Translate" />

        <div className="w-px h-6 bg-white/10 mx-1" />

        <select
          value={translationProvider}
          onChange={(e) => setTranslationProvider(e.target.value)}
          className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/90"
        >
          <option value="openai">OpenAI GPT-4</option>
          <option value="deepl">DeepL</option>
          <option value="google">Google</option>
        </select>
        <button
          onClick={() => setPrivacyMode((p) => (p === 'local' ? 'cloud' : 'local'))}
          className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white/90"
          title="Toggle privacy mode"
        >
          {privacyMode === 'local' ? 'Local' : 'Cloud'}
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          ['paste', 'Paste'],
          ['upload', 'Upload'],
          ['translate', 'Translation'],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setActiveTab(k)}
            className={`px-4 py-2 rounded-xl text-sm border transition ${
              activeTab === k
                ? 'bg-white/15 border-white/20 text-white'
                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-4 space-y-6">
        {/* PASTE */}
        {activeTab === 'paste' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl p-5 space-y-4">
            {/* language row */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-end">
              <LangSelect label="From" value={sourceLanguage} setValue={setSourceLanguage} options={languages} />
              <button
                onClick={() => {
                  if (sourceLanguage === 'auto') return;
                  setSourceLanguage(targetLanguage);
                  setTargetLanguage(sourceLanguage);
                }}
                className="h-10 md:h-11 rounded-xl px-3 bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 flex items-center gap-2 justify-center"
                title="Swap languages"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
              <LangSelect
                label="To"
                value={targetLanguage}
                setValue={setTargetLanguage}
                options={languages.filter((l) => l.code !== 'auto')}
              />
            </div>

            {/* editor + shortcuts */}
            <div className="grid lg:grid-cols-[1fr_minmax(0,300px)] gap-5">
              <div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste notes, documents, or any text to translate and hear…"
                  className="w-full h-60 lg:h-72 p-4 rounded-2xl bg-white/5 border border-white/10 text-white/90 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/60">
                  <span>{wordCount} words</span>
                  <span>• ~{Math.ceil(wordCount / 150)} min read</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">Press ⌘/Ctrl+Enter to translate</span>
                </div>
              </div>

              {/* quick templates */}
              <div className="space-y-3">
                <div className="text-xs text-white/60">Quick templates</div>
                {TEMPLATES.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setText((prev) => (prev ? prev + '\n\n' : '') + t.body)}
                    className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80"
                  >
                    <div className="text-sm font-medium text-white/90">{t.name}</div>
                    <div className="text-xs text-white/60 truncate">{t.preview}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleTranslate}
                disabled={isTranslating || !text.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                {isTranslating ? 'Translating…' : 'Translate'}
              </button>

              <div className="ml-auto flex items-center gap-2">
                <TTSControls
                  supportsTTS={supportsTTS}
                  isPlaying={isPlaying}
                  isPaused={isPaused}
                  rate={rate}
                  setRate={setRate}
                  voices={voices}
                  selectedVoice={selectedVoice}
                  setSelectedVoice={setSelectedVoice}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onStop={handleStop}
                  onRestart={handleRestart}
                  progress={progress}
                  currentWords={currentWordIdx}
                  totalWords={getCurrentWordCount()}
                />
              </div>
            </div>
          </div>
        )}

        {/* UPLOAD */}
        {activeTab === 'upload' && (
          <div
            className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl p-5 space-y-4"
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files || []);
              if (files.length) handleFileUpload({ target: { files } });
            }}
          >
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition"
            >
              <Upload className="w-10 h-10 text-white/60 mx-auto mb-3" />
              <div className="text-white/90 font-medium">Drop files here or click to browse</div>
              <div className="text-sm text-white/60 mt-1">PDF, Word, PowerPoint, Excel, Text, Images</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
            />
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-white/60">Uploaded</div>
                {uploadedFiles.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-white/60" />
                      <div>
                        <div className="text-sm text-white/90">{f.name}</div>
                        <div className="text-xs text-white/50">{(f.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <button onClick={() => processFile(f)} className="text-sm text-purple-300 hover:text-purple-200">
                      Process
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TRANSLATE VIEW */}
        {activeTab === 'translate' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl p-5 space-y-4">
            {translatedText ? (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-white/90 font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" /> Translation Ready
                  </h3>
                  {detectedLanguage && (
                    <div className="text-sm text-white/70 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Detected {langName(languages, detectedLanguage)} → {langName(languages, targetLanguage)}
                    </div>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => setShowOriginal((v) => !v)}
                      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 flex items-center gap-2 text-sm"
                    >
                      {showOriginal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showOriginal ? 'Hide Original' : 'Show Original'}
                    </button>
                    <button
                      onClick={() => setActiveTab('paste')}
                      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 flex items-center gap-2 text-sm"
                    >
                      <RotateCcw className="w-4 h-4" /> New text
                    </button>
                  </div>
                </div>

                {/* Split panes */}
                <div
                  className={`grid ${
                    showOriginal ? 'grid-cols-[minmax(0,1fr)_10px_minmax(0,1fr)]' : 'grid-cols-1'
                  } gap-0`}
                >
                  {showOriginal && (
                    <Pane
                      title={`Original (${langName(languages, detectedLanguage)})`}
                      text={text}
                      onCopy={() => copyToClipboard(text)}
                      words={countWords(text)}
                      widthPct={split}
                    />
                  )}
                  {showOriginal && (
                    <div
                      className="w-[10px] h-full cursor-col-resize bg-white/0"
                      onMouseDown={() => (draggingRef.current = true)}
                      onTouchStart={() => (draggingRef.current = true)}
                    />
                  )}
                  <Pane
                    title={`Translation (${langName(languages, targetLanguage)})`}
                    text={translatedText}
                    onCopy={() => copyToClipboard(translatedText)}
                    words={countWords(translatedText)}
                    widthPct={showOriginal ? 100 - split : 100}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => downloadText(translatedText, `translation-${targetLanguage}.txt`)}
                    className="text-sm text-purple-300 hover:text-purple-200 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>

                  <div className="ml-auto">
                    <TTSControls
                      supportsTTS={supportsTTS}
                      isPlaying={isPlaying}
                      isPaused={isPaused}
                      rate={rate}
                      setRate={setRate}
                      voices={voices}
                      selectedVoice={selectedVoice}
                      setSelectedVoice={setSelectedVoice}
                      onPlay={handlePlay}
                      onPause={handlePause}
                      onStop={handleStop}
                      onRestart={handleRestart}
                      progress={progress}
                      currentWords={currentWordIdx}
                      totalWords={getCurrentWordCount()}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-white/70 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> No translation yet. Paste text and press{' '}
                <span className="font-semibold">Translate</span>.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────── Subcomponents / helpers ───────── */

const Chip = ({ icon, label, tone = 'slate' }) => (
  <div
    className={`px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1.5 border ${
      tone === 'emerald'
        ? 'bg-emerald-500/10 text-emerald-200 border-emerald-500/20'
        : tone === 'indigo'
        ? 'bg-indigo-500/10 text-indigo-200 border-indigo-500/20'
        : 'bg-white/5 text-white/70 border-white/10'
    }`}
  >
    {icon}
    {label}
  </div>
);

const LangSelect = ({ label, value, setValue, options }) => (
  <div className="space-y-1">
    <div className="text-xs text-white/60">{label}</div>
    <select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full h-11 rounded-xl bg-white/5 border border-white/10 text-white/90 px-3"
    >
      {options.map((l) => (
        <option key={l.code} value={l.code} className="bg-gray-900 text-white">
          {l.flag} {l.name}
        </option>
      ))}
    </select>
  </div>
);

const Pane = ({ title, text, onCopy, words }) => (
  <div className="p-4 md:p-5 bg-white/5 border border-white/10 rounded-2xl">
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm text-white/80">{title}</div>
      <button onClick={onCopy} className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1">
        <Copy className="w-3.5 h-3.5" /> Copy
      </button>
    </div>
    <div className="h-56 lg:h-64 overflow-auto rounded-xl bg-white/5 border border-white/10 p-3">
      <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
    <div className="mt-2 text-[11px] text-white/60">{words} words</div>
  </div>
);

const TTSControls = ({
  supportsTTS,
  isPlaying,
  isPaused,
  rate,
  setRate,
  voices,
  selectedVoice,
  setSelectedVoice,
  onPlay,
  onPause,
  onStop,
  onRestart,
  progress,
  currentWords,
  totalWords,
}) => (
  <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onPlay}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
        disabled={!supportsTTS}
        title={supportsTTS ? 'Play' : 'TTS not supported'}
      >
        <Play className="w-4 h-4" /> Play
      </button>
      <button className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-white/90" onClick={onPause}>
        <Pause className="w-4 h-4" /> Pause
      </button>
      <button className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-white/90" onClick={onStop}>
        <Square className="w-4 h-4" /> Stop
      </button>
      <button className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-white/90" onClick={onRestart}>
        <RotateCcw className="w-4 h-4" /> Restart
      </button>

      <div className="flex items-center gap-2 ml-auto">
        <Volume2 className="w-4 h-4 text-white/60" />
        <input type="range" min="0.6" max="1.4" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
        <span className="text-xs text-white/70">{rate.toFixed(1)}×</span>
      </div>
    </div>

    <div className="mt-2 flex items-center gap-2">
      <select
        value={selectedVoice?.name || ''}
        onChange={(e) => setSelectedVoice(voices.find((v) => v.name === e.target.value) || null)}
        className="flex-1 h-9 rounded-lg bg-white/5 border border-white/10 text-white/90 px-2 text-sm"
        disabled={!supportsTTS}
      >
        {voices.map((v) => (
          <option key={v.name} value={v.name} className="bg-gray-900 text-white">
            {v.name} — {v.lang}
          </option>
        ))}
      </select>
    </div>

    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${Math.min(progress, 100)}%` }} />
    </div>
    <div className="mt-1 text-[11px] text-white/60">
      {currentWords} / {totalWords} words
    </div>
  </div>
);

/* helpers */

const TEMPLATES = [
  {
    name: 'Executive Summary',
    preview: 'Concise overview for leadership…',
    body: 'Executive Summary:\n• Objective:\n• Context:\n• Key Findings:\n• Recommendations:\n• Risks & Mitigations:\n',
  },
  {
    name: 'Academic Abstract',
    preview: 'Purpose, method, results, conclusion…',
    body: 'Abstract\nBackground: \nMethods: \nResults: \nConclusion: \nKeywords: \n',
  },
  {
    name: 'Support Email',
    preview: 'Clear request to vendor / IT…',
    body: 'Hello team,\n\nI\'m writing regarding…\nSteps taken:\n1)\n2)\nExpected behavior:\nObserved behavior:\nRequest:\n\nThanks,\n',
  },
];

const MOCK_TRANSLATIONS = {
  es: '¡Hola! Este es un texto traducido al español usando Brahma. Puedes escucharlo con una voz natural.',
  fr: "Bonjour ! Ceci est un texte traduit en français avec Brahma. Vous pouvez l'écouter avec une voix naturelle.",
  de: 'Hallo! Dies ist ein ins Deutsche übersetzter Text mit Brahma. Sie können ihn mit einer natürlichen Stimme anhören.',
  it: 'Ciao! Questo è un testo tradotto in italiano con Brahma. Puoi ascoltarlo con una voce naturale.',
  pt: 'Olá! Este é um texto traduzido para português com Brahma. Você pode ouvi-lo com uma voz natural.',
  ru: 'Привет! Это текст, переведённый на русский с помощью Brahma. Вы можете прослушать его естественным голосом.',
  ja: 'こんにちは！これはBrahmaで日本語に翻訳されたテキストです。自然な音声で聞くことができます。',
  ko: '안녕하세요! 이것은 Brahma로 한국어로 번역된 텍스트입니다. 자연스러운 음성으로 들을 수 있습니다.',
  zh: '你好！这是使用 Brahma 翻译成中文的文本。自然语音可播放。',
  ar: 'مرحباً! هذا نص مُترجم إلى العربية باستخدام Brahma. يمكنك الاستماع إليه بصوت طبيعي.',
  hi: 'नमस्ते! यह Brahma द्वारा हिंदी में अनूदित पाठ है। आप इसे प्राकृतिक आवाज़ में सुन सकते हैं।',
};

function countWords(s) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}
function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function cryptoRand() {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2);
  }
}
function normalizeLang(code) {
  return (code === 'zh' ? 'zh-cn' : code).toLowerCase();
}
function langName(list, code) {
  return list.find((l) => l.code === code)?.name || code;
}
function copyToClipboard(s) {
  try {
    navigator.clipboard.writeText(s || '');
  } catch {}
}
function downloadText(s, filename) {
  const blob = new Blob([s || ''], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'text.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}