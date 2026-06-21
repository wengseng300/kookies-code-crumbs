import React, { useState, useEffect, useRef } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Search, 
  Mic, 
  MicOff, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Sparkles, 
  Mail, 
  Github, 
  Linkedin, 
  Twitter, 
  Copy, 
  Check, 
  RotateCcw, 
  Info,
  Music,
  Keyboard,
  TrendingUp,
  Type,
  Cat,
  Download,
  FileText
} from "lucide-react";
import { portfolioData } from "./data/portfolio";
import { parseQuery, PortfolioCategory } from "./utils/nlp";

export default function App() {
  const [query, setQuery] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PortfolioCategory | "ai">("none");
  const [conversationalResponse, setConversationalResponse] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // AI RAG States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  // Audio Visualizer Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // References
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsEndRef = useRef<HTMLDivElement>(null);

  // Audio Visualizer real-time analyzer effect
  useEffect(() => {
    if (isListening) {
      let active = true;
      let stream: MediaStream | null = null;
      let audioCtx: AudioContext | null = null;
      let analyser: AnalyserNode | null = null;
      let dataArray = new Uint8Array(0);

      // Request live microphone stream
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((s) => {
          if (!active) {
            s.getTracks().forEach((track) => track.stop());
            return;
          }
          stream = s;
          streamRef.current = s;

          try {
            audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioCtxRef.current = audioCtx;

            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64; // compact fft for 12 audio bars
            analyser.smoothingTimeConstant = 0.65;
            analyserRef.current = analyser;

            const source = audioCtx.createMediaStreamSource(s);
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
          } catch (err) {
            console.error("Audio Context initialization error, auto-reverting to high fidelity simulation.", err);
          }
        })
        .catch((err) => {
          console.warn("Microphone capture failed or disabled, auto-reverting to high fidelity simulation.", err);
        });

      // Render loop for frequency bar visualization
      const draw = () => {
        if (!active) return;
        animationFrameRef.current = requestAnimationFrame(draw);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Clean canvas viewport
        ctx.clearRect(0, 0, width, height);

        const numBars = 14;
        const frequencies: number[] = [];

        // Determine frequency data (live or simulated vocal envelope waveforms)
        if (analyser && dataArray.length > 0) {
          analyser.getByteFrequencyData(dataArray);
          const step = Math.floor(dataArray.length / numBars) || 1;
          for (let i = 0; i < numBars; i++) {
            const rawVal = dataArray[i * step];
            // Normalize & amplify range slightly for optimal visual weight
            const val = (rawVal / 255) * height * 1.5;
            frequencies.push(val);
          }
        } else {
          // Generate a highly realistic dynamic speaking/equalizer procedural simulation
          const time = Date.now() * 0.009;
          for (let i = 0; i < numBars; i++) {
            // Complex trigonometric synthesis mimicking authentic speech envelopes
            const baseWave = Math.sin(time + i * 0.45) * 6;
            const resonance = Math.sin(time * 1.6 - i * 0.7) * 4;
            const macroPulse = Math.cos(time * 0.3 + i * 1.2) * 5;
            // Vocal frequency cadence modulation
            const cadence = Math.sin(time * 0.08) * 0.6 + 0.6;

            let val = Math.max(2, Math.abs(baseWave + resonance + macroPulse) * cadence);
            if (val > height - 2) val = height - 2;
            frequencies.push(val);
          }
        }

        // Draw EQ Bars centered matching design guidelines perfectly
        const barWidth = 3;
        const barGap = 2.5;
        const totalEQWidth = numBars * barWidth + (numBars - 1) * barGap;
        const startX = (width - totalEQWidth) / 2;

        for (let i = 0; i < numBars; i++) {
          const x = startX + i * (barWidth + barGap);
          const barHeight = Math.max(3, frequencies[i]);
          const y = (height - barHeight) / 2;

          // Seamless dual color gradient (Sleek Theme: Indigo spectrum into glowing Cyan)
          const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
          gradient.addColorStop(0, "#818cf8"); // Indigo light
          gradient.addColorStop(0.5, "#6366f1"); // Primary Indigo
          gradient.addColorStop(1, "#06b6d4"); // Cyan glow Accent

          ctx.fillStyle = gradient;

          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, barWidth, barHeight, 1.5);
          } else {
            ctx.rect(x, y, barWidth, barHeight);
          }
          ctx.fill();
        }
      };

      // Run
      animationFrameRef.current = requestAnimationFrame(draw);

      return () => {
        active = false;
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        if (audioCtxRef.current) {
          if (audioCtxRef.current.state !== "closed") {
            audioCtxRef.current.close().catch(() => {});
          }
          audioCtxRef.current = null;
        }
      };
    }
  }, [isListening]);

  // Check browser Web Speech API availability
  useEffect(() => {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      rec.onresult = (e: any) => {
        const transcript = Array.from(e.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");
        setQuery(transcript);
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        if (e.error === "not-allowed") {
          setSpeechError("Microphone permission denied.");
        } else if (e.error === "no-speech") {
          setSpeechError("No speech detected. Please try again.");
        } else {
          setSpeechError(`Speech error: ${e.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      };

      setRecognitionInstance(rec);
    }
  }, []);

  const handleMicClick = () => {
    if (!recognitionInstance) {
      setSpeechError("Web Speech API is not supported in this browser. Please type your question.");
      return;
    }

    if (isListening) {
      recognitionInstance.stop();
    } else {
      setSpeechError(null);
      try {
        recognitionInstance.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        recognitionInstance.stop();
      }
    }
  };

  const validateQuery = (q: string): boolean => {
    const queryLower = q.toLowerCase().trim();
    if (!queryLower) return false;

    // Common offensive/curse words matching
    const badWords = [
      "fuck", "f*ck", "f**k", "fk", 
      "shit", "sh*t", "bitch", "b*tch", 
      "cunt", "c*nt", "asshole", "ass", 
      "bastard", "dick", "pussy"
    ];
    if (badWords.some(word => queryLower.includes(word))) {
      return false;
    }

    // Short queries less than 4 chars except common standard elements/valid terms
    const validShortWords = ["bio", "git", "job", "run", "exp", "cv", "dev", "me"];
    if (queryLower.length < 4 && !validShortWords.includes(queryLower)) {
      return false;
    }

    // Repetitive keys like 'aaaa' or only digit sequences '1234'
    const isRepetitive = /^(.)\1{3,}$/.test(queryLower);
    const isAllDigits = /^\d+$/.test(queryLower);
    if (isRepetitive || isAllDigits) {
      return false;
    }

    return true;
  };

  const handleSearch = async (searchQuery: string) => {
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) return;

    if (!validateQuery(cleanQuery)) {
      setIsActive(true);
      setSelectedCategory("invalid" as any);
      setConversationalResponse("I don't understand the question.");
      setAiAnswer("");
      inputRef.current?.blur();
      return;
    }

    // Determine if it is an exact category command/pill or a natural lang question
    const lower = cleanQuery.toLowerCase();
    const categories = ["experience", "education", "projects", "hobbies", "skills", "contact", "working experience", "academic background", "study", "stack"];
    
    // Check if it's an exact simple keyword for pages
    const isLocalCategoryTrigger = categories.includes(lower);

    if (isLocalCategoryTrigger) {
      const result = parseQuery(cleanQuery);
      setIsActive(true);
      setSelectedCategory(result.category);
      setConversationalResponse(result.conversationalIntro);
      setAiAnswer("");
      inputRef.current?.blur();
      return;
    }

    // Otherwise, Route to Server-Side AI RAG engine!
    setIsActive(true);
    setSelectedCategory("ai");
    setIsAiLoading(true);
    setAiAnswer("");
    setConversationalResponse("");
    inputRef.current?.blur();

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: cleanQuery }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiAnswer(data.text);
      } else {
        setAiAnswer(data.text || "I'm sorry, I was unable to connect to the profile index.");
      }
    } catch (err) {
      console.error("Failed to query AI RAG endpoint:", err);
      setAiAnswer("I'm sorry, my AI query server failed to answer. Please check if your dynamic network connection is healthy!");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleReset = () => {
    setQuery("");
    setIsActive(false);
    setSelectedCategory("none");
    setConversationalResponse("");
    setAiAnswer("");
    setSpeechError(null);
    if (isListening && recognitionInstance) {
      recognitionInstance.stop();
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Helper to click suggestion tags
  const handleSuggestionClick = (keyword: string, forceAi: boolean = false) => {
    setQuery(keyword);
    if (forceAi) {
      // Direct RAG search triggering
      setIsActive(true);
      setSelectedCategory("ai");
      setIsAiLoading(true);
      setAiAnswer("");
      setConversationalResponse("");
      
      fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: keyword }),
      })
      .then(res => res.json())
      .then(data => {
        setAiAnswer(data.text);
      })
      .catch(err => {
        console.error(err);
        setAiAnswer("I'm sorry, my AI query server failed to answer. Please check if your dynamic network connection is healthy!");
      })
      .finally(() => {
        setIsAiLoading(false);
      });
    } else {
      handleSearch(keyword);
    }
  };

  // Helper function to render AI Markdown formatted responses beautifully in React
  const renderAiMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return (
      <div className="space-y-4.5 text-slate-200">
        {lines.map((line, idx) => {
          const cleanLine = line.trim();
          if (!cleanLine) return <div key={idx} className="h-1" />;

          // Level 3 Headings
          if (cleanLine.startsWith("### ")) {
            return (
              <h3 key={idx} className="text-xl sm:text-2xl font-black text-white mt-7 mb-3 pb-1 border-b border-indigo-500/10 flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                {cleanLine.replace("### ", "")}
              </h3>
            );
          }

          // Level 2 Headings
          if (cleanLine.startsWith("## ")) {
            return (
              <h2 key={idx} className="text-2xl sm:text-3xl font-black text-white mt-9 mb-4.5 pb-2 border-b border-white/10 flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
                {cleanLine.replace("## ", "")}
              </h2>
            );
          }

          // List bullet rendering
          if (cleanLine.startsWith("* ") || cleanLine.startsWith("- ")) {
            const bulletText = cleanLine.substring(2);
            
            // Highlight format bullet lists starting with bold labels e.g. * **Laravel**: value
            const boldKeywordMatches = bulletText.match(/^\*\*(.*?)\*\*:(.*)$/);
            if (boldKeywordMatches) {
              return (
                <div key={idx} className="pl-4 sm:pl-6 flex items-start gap-3 my-2.5 text-base sm:text-lg leading-relaxed font-light">
                  <span className="text-indigo-400 mt-2 shrink-0 text-sm font-bold">•</span>
                  <span className="text-slate-300">
                    <strong className="font-extrabold text-white text-base sm:text-lg mr-1">{boldKeywordMatches[1]}:</strong>
                    {boldKeywordMatches[2]}
                  </span>
                </div>
              );
            }

            return (
              <div key={idx} className="pl-4 sm:pl-6 flex items-start gap-3 my-2.5 text-base sm:text-lg leading-relaxed font-light">
                <span className="text-indigo-400 mt-2 shrink-0 text-sm font-bold">•</span>
                <span className="text-slate-300">{bulletText}</span>
              </div>
            );
          }

          // Inline Bold Text Formatting replacement safely
          const parts: (string | React.ReactNode)[] = [];
          const boldRegex = /\*\*(.*?)\*\*/g;
          let match;
          let lastIndex = 0;

          while ((match = boldRegex.exec(cleanLine)) !== null) {
            const preText = cleanLine.substring(lastIndex, match.index);
            if (preText) parts.push(preText);
            parts.push(<strong key={match.index} className="font-extrabold text-white">{match[1]}</strong>);
            lastIndex = boldRegex.lastIndex;
          }
          const postText = cleanLine.substring(lastIndex);
          if (postText) parts.push(postText);

          return (
            <p key={idx} className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
              {parts.length > 0 ? parts : cleanLine}
            </p>
          );
        })}
      </div>
    );
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadResume = async () => {
    const cacheBusterUrl = `/api/download-resume?t=${Date.now()}`;
    try {
      // First attempt with dynamic fetch verification to bypass stale iframe loads
      const response = await fetch(cacheBusterUrl);
      const contentType = response.headers.get("content-type");
      
      if (!response.ok || !contentType || !contentType.includes("application/pdf")) {
        console.warn("[Download] Stale of incorrect response detected. Retrying...");
        // Wait 800ms and try one more time
        await new Promise((resolve) => setTimeout(resolve, 800));
        const retryResponse = await fetch(`/api/download-resume?t=${Date.now()}`);
        const retryContentType = retryResponse.headers.get("content-type");
        
        if (!retryResponse.ok || !retryContentType || !retryContentType.includes("application/pdf")) {
          throw new Error("Invalid resume format returned from server");
        }
        
        const blob = await retryResponse.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = "2026KWS_Resume.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        return;
      }
      
      // If first attempt is perfect, download it directly using secure blob url
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "2026KWS_Resume.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error("[Download] Safe-fallback triggered:", err);
      // Fallback: standard native link trigger
      const link = document.createElement("a");
      link.href = cacheBusterUrl;
      link.setAttribute("download", "2026KWS_Resume.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Maps custom string hobby icons to Lucide Icons
  const renderHobbyIcon = (iconName: string) => {
    switch (iconName) {
      case "Cats": return <Cat className="w-5 h-5 text-indigo-400" />;
      case "Keyboard": return <Keyboard className="w-5 h-5 text-indigo-400" />;
      case "TrendingUp": return <TrendingUp className="w-5 h-5 text-[#06b6d4]" />;
      case "Type": return <Type className="w-5 h-5 text-[#818cf8]" />;
      default: return <Sparkles className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="h-screen w-screen bg-[#020617] text-slate-200 flex flex-col justify-between overflow-hidden relative font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Sleek Theme Ambient Accent Glow Bulbs in the Background */}
      <div className="absolute top-[-10%] right-[-15%] w-[450px] h-[450px] bg-indigo-600/12 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[-10%] w-[350px] h-[350px] bg-cyan-600/10 rounded-full blur-[110px] pointer-events-none z-0" />
      <div className="absolute top-[40%] left-[30%] w-[200px] h-[200px] bg-indigo-500/5 rounded-full blur-[90px] pointer-events-none z-0" />

      {/* Main Responsive Grid Panel Stage */}
      <main className={`flex-1 w-full ${isActive ? "max-w-6xl" : "max-w-4xl"} mx-auto px-3 sm:px-6 flex flex-col justify-center relative z-10 overflow-hidden transition-all duration-700`}>
        
        {/* State wrapper transitioning the search bar dynamically up or down */}
        <div className={`w-full flex flex-col transition-all duration-700 ease-in-out ${isActive ? "pt-18 sm:pt-14 pb-4" : "py-0 my-auto items-center"}`}>
          
          {/* Default branding view when the search container is centered */}
          <AnimatePresence mode="wait">
            {!isActive && (
              <motion.div 
                key="sleek-branding"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-4 shadow-sm">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  <span className="text-[10px] font-mono tracking-widest text-[#818cf8] uppercase">Kookie's Code Crumbs</span>
                </div>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-3">
                  {portfolioData.name}
                </h1>
                <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto font-light leading-relaxed mb-6">
                  {portfolioData.title}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={downloadResume}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm rounded-full transition-all duration-300 shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 group cursor-pointer border border-indigo-500/30"
                  >
                    <Download className="w-4 h-4 text-white group-hover:scale-115 transition-transform" />
                    <span>Download Resume</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick("skills")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs sm:text-sm rounded-full transition-all duration-300 border border-white/10 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#818cf8]" />
                    <span>View Skills Stack</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ask Me Anything interactive bar */}
          <motion.div 
            layoutId="search-box-wrapper"
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
            className="w-full max-w-2xl mx-auto"
          >
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(query);
              }}
              className="relative"
            >
              <div className={`relative flex items-center glass rounded-2xl accent-glow border transition-all duration-300 ${isListening ? "border-indigo-500/40 ring-4 ring-indigo-500/10" : "border-white/10 hover:border-white/20"}`}>
                
                {/* Search glass decoration */}
                <div className="pl-5 text-indigo-400">
                  <Search className="w-5 h-5" />
                </div>

                {/* Main sleek interactive textbox */}
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch(query);
                    }
                  }}
                  placeholder={isListening ? "Listening..." : "Ask me anything!"}
                  id="portfolio-search-input"
                  className="w-full py-5 px-3.5 bg-transparent text-white text-base sm:text-lg font-light placeholder-slate-400 focus:outline-[#6366f1]/0 focus:ring-0"
                  autoComplete="off"
                />

                {/* Real-time audio waveform visualizer */}
                {isListening && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-xl mr-2 h-9 shrink-0 shadow-inner">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <canvas 
                      ref={canvasRef} 
                      className="w-24 h-6 opacity-90 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]" 
                      width={96} 
                      height={24} 
                    />
                  </div>
                )}

                {/* Controls and speech state icons */}
                <div className="flex items-center gap-2 pr-3 shrink-0">
                  {query && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Clear console"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}

                  {/* Mic action targeting Web Voice Speech APIs */}
                  <button
                    type="button"
                    onClick={handleMicClick}
                    className={`p-2.5 rounded-xl transition-all relative cursor-pointer ${isListening ? "bg-red-500/80 text-white animate-pulse" : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"}`}
                    title={isListening ? "Voice active... tap to stop" : "Use Voice Assistance"}
                  >
                    {isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                    
                    {isListening && (
                      <span className="absolute -inset-1 rounded-xl bg-red-500/20 animate-ping -z-10" />
                    )}
                  </button>

                  <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shrink-0 cursor-pointer"
                  >
                    Ask
                  </button>
                </div>
              </div>

              {/* keyboard hints */}
              <div className="absolute top-full left-3 mt-1.5 flex items-center gap-1 text-[11px] font-mono text-slate-500 pointer-events-none">
                <span>Enter</span>
                <span>or microphone to inquire</span>
              </div>
            </form>

            {/* Error notifications */}
            <AnimatePresence>
              {speechError && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="mt-4 px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-xl flex items-center gap-2.5"
                >
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{speechError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dynamic keyword buttons mimicking real system queries */}
            <div className="mt-8 flex flex-col gap-3 w-full">
              {/* Row 1: Direct Categories */}
              <div className="flex flex-wrap gap-2 justify-center items-center">
                <span className="text-[10px] md:text-xs text-slate-500 font-mono uppercase tracking-wider">Show Section:</span>
                {[
                  { label: "Experience", keyword: "working experience" },
                  { label: "Education", keyword: "education" },
                  { label: "Projects", keyword: "projects" },
                  { label: "Hobbies", keyword: "hobby" },
                  { label: "Tech Stack", keyword: "skills" },
                  { label: "Contact Info", keyword: "contact" }
                ].map((pill) => {
                  const keywordClean = pill.keyword;
                  const isSelected = selectedCategory === keywordClean || (keywordClean === "hobby" && selectedCategory === "hobbies") || (keywordClean === "working experience" && selectedCategory === "experience");
                  return (
                    <button
                      type="button"
                      key={pill.label}
                      onClick={() => handleSuggestionClick(pill.keyword)}
                      className={`text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 rounded-full border transition-all duration-300 cursor-pointer ${isSelected ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20" : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"}`}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>

              {/* Row 2: Natural AI Queries grounded via RAG */}
              <div className="flex flex-wrap gap-2 justify-center items-center">
                <span className="text-[10px] md:text-xs text-indigo-400 font-mono uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                  Ask Koo AI:
                </span>
                {[
                  { label: "Have you learned PHP/Laravel before?", query: "Have you learned PHP or Laravel before?" },
                  { label: "How familiar are you with SQL?", query: "How familiar are you with SQL?" },
                  { label: "Tell me about your main role in Tricor Senedi/SSC.", query: "Tell me about your main role in Tricor Senedi/SSC." },
                  { label: "How many years of programming experience do you have?", query: "How many years of coding experience do you have?" }
                ].map((item, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setQuery(item.query);
                      handleSuggestionClick(item.query, true); // Direct RAG trigger!
                    }}
                    className="text-[11px] sm:text-xs px-3 py-1.5 rounded-full bg-indigo-500/5 hover:bg-indigo-500/15 text-indigo-200 border border-indigo-500/15 hover:border-indigo-400/30 transition-all duration-300 cursor-pointer flex items-center gap-1 shadow-sm font-light leading-none"
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Clean Glassmorphism Response results console container */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="w-full mt-8 flex flex-col z-25"
              >
                
                {/* Action-bar containing Download Resume buttons */}
                <div className="flex justify-end mb-4">
                  <button
                    type="button"
                    onClick={downloadResume}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-650 border border-indigo-500/30 text-[10px] uppercase tracking-wider font-mono font-bold text-indigo-300 hover:text-white rounded-lg transition-all duration-300 cursor-pointer shadow-sm group"
                    title="Download Full Resume"
                  >
                    <Download className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    <span>Download CV / Resume</span>
                  </button>
                </div>

                <div className="glass rounded-3xl overflow-hidden accent-glow flex flex-col border border-white/10">
                                 {/* Inner dynamic content block styled with custom scrollbar */}
                  <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(100vh-340px)] sm:max-h-[calc(100vh-380px)] custom-scrollbar">
                    
                    {/* Category: AI GROUNDED RESPONSE WITH LOADER */}
                    {selectedCategory === "ai" && (
                      <div className="space-y-6">
                        {isAiLoading ? (
                          <div className="space-y-5 py-8 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row items-center gap-4.5">
                              <div className="relative shrink-0 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full bg-indigo-500/25 blur-md animate-pulse" />
                                <div className="w-12 h-12 rounded-full border border-indigo-400 bg-[#090d1f] flex items-center justify-center animate-spin">
                                  <Sparkles className="w-5 h-5 text-indigo-400" />
                                </div>
                              </div>
                              <div className="space-y-2 flex-1 w-full max-w-md">
                                <div className="h-4 bg-white/5 border border-white/5 rounded-full animate-pulse w-3/4 mx-auto sm:mx-0" />
                                <div className="h-3.5 bg-white/5 border border-white/5 rounded-full animate-pulse w-5/6 mx-auto sm:mx-0" />
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm font-mono text-slate-500 tracking-wider uppercase animate-pulse mt-3">
                              Koo AI Agent is searching resume context ...
                            </p>
                          </div>
                        ) : (
                          <div className="glass-light p-6.5 sm:p-8 rounded-3xl border border-indigo-500/10 shadow-lg relative overflow-hidden backdrop-blur-md">
                            {/* Sparkle background element */}
                            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/3 rounded-full blur-[60px] pointer-events-none" />
                            
                            <div className="flex items-center gap-2 mb-5 font-mono text-[10px] md:text-xs text-indigo-400 uppercase tracking-widest font-extrabold pb-3 border-b border-white/5">
                              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                              <span>Grounded AI Synthesis Response</span>
                            </div>

                            <div className="animate-fade-in">
                              {renderAiMarkdown(aiAnswer)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Category: EXPERIENCE */}
                    {selectedCategory === "experience" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {portfolioData.experience.map((exp) => {
                            const isVercel = exp.company.toLowerCase().includes("vercel");
                            const bgPill = isVercel ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/10" : "bg-cyan-500/15 text-cyan-300 border-cyan-500/10";

                            return (
                              <div key={exp.id} className="glass-light p-6.5 rounded-2xl flex flex-col justify-between gap-4 border border-white/5">
                                <div>
                                  <div className="flex justify-between items-start mb-1">
                                    <div className="text-slate-400 font-mono text-xs">{exp.period}</div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] border font-bold uppercase tracking-wider ${bgPill}`}>
                                      {exp.company}
                                    </span>
                                  </div>
                                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2">{exp.role}</h3>
                                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-light mb-4.5 italic">
                                    "{exp.description}"
                                  </p>

                                  <ul className="space-y-2">
                                    {exp.bullets.map((bullet, bidx) => (
                                      <li key={bidx} className="text-sm sm:text-base text-slate-300 flex items-start gap-2.5 leading-relaxed font-light">
                                        <span className={isVercel ? "text-indigo-400 font-bold shrink-0" : "text-cyan-400 font-bold shrink-0"}>—</span>
                                        <span>{bullet}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Category: EDUCATION */}
                    {selectedCategory === "education" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {portfolioData.education.map((edu) => {
                            const isStanford = edu.institution.toLowerCase().includes("stanford");
                            const accentText = isStanford ? "text-rose-400" : "text-cyan-400";
                            return (
                              <div key={edu.id} className="glass-light p-7 rounded-2xl border border-white/5 flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-start gap-2 mb-3">
                                    <span className="text-[10px] font-mono tracking-wider font-semibold text-slate-400 uppercase">{edu.period}</span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white/5 border border-white/10 text-slate-300 uppercase`}>
                                      {edu.institution.split(" ")[0]}
                                    </span>
                                  </div>
                                  <h3 className="text-xl sm:text-2xl font-black text-white leading-snug mb-1">{edu.degree}</h3>
                                  <p className={`text-sm sm:text-base font-semibold ${accentText} mb-3.5`}>{edu.institution}</p>
                                  <p className="text-sm sm:text-base text-slate-400 font-light leading-relaxed mb-4">{edu.description}</p>
                                </div>

                                <div className="border-t border-white/5 pt-3.5 mt-2">
                                  <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block mb-2 font-bold">Key Achievements</span>
                                  <ul className="space-y-1.5">
                                    {edu.achievements.map((ach, aidx) => (
                                      <li key={aidx} className="text-sm sm:text-base text-slate-300 flex items-start gap-2.5 font-light">
                                        <span className="text-indigo-400 mt-1 shrink-0">•</span>
                                        <span>{ach}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Category: PROJECTS */}
                    {selectedCategory === "projects" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {(portfolioData.projects || []).map((proj) => (
                            <div key={proj.id} className="glass-light p-6.5 rounded-3xl border border-white/5 hover:border-white/12 transition-all duration-300 flex flex-col justify-between relative group">
                              <div>
                                <h3 className="text-lg sm:text-xl font-black text-white mb-2 leading-relaxed group-hover:text-indigo-400 transition-colors">
                                  {proj.title}
                                </h3>
                                <p className="text-slate-400 text-sm sm:text-base font-light leading-relaxed mb-6">
                                  {proj.description}
                                </p>
                              </div>

                              <div>
                                <div className="flex flex-wrap gap-1.5 mb-5.5">
                                  {proj.tags.map((tag) => (
                                    <span key={tag} className="text-[11px] font-mono px-2.5 py-0.5 bg-indigo-500/10 text-indigo-300 rounded-md border border-indigo-500/10">
                                      {tag}
                                    </span>
                                  ))}
                                </div>

                                {proj.github && (
                                  <a 
                                    href={`https://${proj.github}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-mono text-indigo-400 flex items-center gap-1.5 hover:text-indigo-300 transition-colors mt-1"
                                  >
                                    <Github className="w-4 h-4" />
                                    <span className="truncate">{proj.github}</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category: HOBBIES */}
                    {selectedCategory === "hobbies" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          {portfolioData.hobbies.map((hob) => (
                            <div key={hob.id} className="flex gap-4 p-5.5 glass-light rounded-3xl border border-white/5 hover:border-indigo-500/10 transition-all duration-300">
                              <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-xs text-indigo-400">
                                {renderHobbyIcon(hob.icon)}
                              </div>
                              <div>
                                <h3 className="font-extrabold text-white text-base mb-1">{hob.name}</h3>
                                <p className="text-sm sm:text-base text-slate-400 font-light leading-relaxed">{hob.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category: SKILLS */}
                    {selectedCategory === "skills" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          {portfolioData.skills.map((category, idx) => (
                            <div key={idx} className="glass-light p-6 rounded-3xl border border-white/5">
                              <h3 className="font-mono text-xs uppercase tracking-widest text-[#818cf8] mb-4.5 block border-b border-white/5 pb-2.5 font-bold">
                                {category.title}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {category.items.map((skill) => (
                                  <span 
                                    key={skill} 
                                    className="text-sm px-3.5 py-1.5 bg-white/5 border border-white/5 rounded-xl text-slate-200 font-light hover:bg-white/12 hover:text-white transition-all duration-300"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category: CONTACT */}
                    {selectedCategory === "contact" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { label: "Email", value: portfolioData.contact.email, icon: <Mail className="w-4 h-4 text-indigo-400" /> },
                            { label: "GitHub URL", value: portfolioData.contact.github, icon: <Github className="w-4 h-4 text-indigo-400" /> },
                            { label: "LinkedIn link", value: portfolioData.contact.linkedin, icon: <Linkedin className="w-4 h-4 text-indigo-400" /> },
                            { label: "Twitter profile", value: portfolioData.contact.twitter, icon: <Twitter className="w-4 h-4 text-indigo-400" /> }
                          ].map((contact, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 glass-light rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300">
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                  {contact.icon}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono mb-0.5">{contact.label}</div>
                                  <div className="text-xs font-semibold text-slate-200 truncate pr-2">{contact.value}</div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => copyToClipboard(contact.value, contact.label)}
                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer"
                                title="Copy"
                              >
                                {copiedField === contact.label ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category: ABOUT GENERAL */}
                    {(selectedCategory === "about" || selectedCategory === "none" || selectedCategory === "all") && (
                      <div className="space-y-6">
                        <div className="glass-light p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-lg border border-indigo-400/20">
                            {portfolioData.avatarPlaceholder}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-white text-lg">{portfolioData.name}</h3>
                            <p className="text-[11px] text-[#818cf8] font-bold tracking-widest font-mono uppercase mb-1.5">{portfolioData.title}</p>
                            <p className="text-xs text-slate-400 font-light leading-relaxed">
                              {portfolioData.tagline} {portfolioData.bio}
                            </p>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block mb-3 font-bold">Recommended Topics To Ask</span>
                          
                          <div className="grid grid-cols-2 gap-3 pb-2 animate-fade-in">
                            {[
                              { label: "Working Achievements", icon: <Briefcase className="w-4 h-4 text-indigo-400" />, keyword: "working experience" },
                              { label: "Degree & Qualifications", icon: <GraduationCap className="w-4 h-4 text-[#06b6d4]" />, keyword: "education" },
                              { label: "Interactive Custom Projects", icon: <Code className="w-4 h-4 text-[#818cf8]" />, keyword: "projects" },
                              { label: "Hobbies & Daily Life", icon: <Sparkles className="w-4 h-4 text-teal-400" />, keyword: "hobby" }
                            ].map((item, idx) => (
                              <button
                                type="button"
                                key={idx}
                                onClick={() => handleSuggestionClick(item.keyword)}
                                className="p-3.5 bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/12 rounded-xl text-left transition-all duration-300 flex items-center gap-3 cursor-pointer"
                              >
                                <div className="p-1.5 bg-white/5 rounded-lg">
                                  {item.icon}
                                </div>
                                <span className="text-xs text-slate-300 font-medium">{item.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Category: INVALID / VALIDATION FAILURE */}
                    {selectedCategory === "invalid" && (
                      <div className="space-y-6 text-center py-6">
                        <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-xs mb-4">
                          <Info className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 font-extrabold">I don't understand the question.</h3>
                        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed font-light">
                          Please ask something about my professional background, academic study, key projects, technical skills, or hobbies.
                        </p>
                        <div className="pt-4 max-w-md mx-auto grid grid-cols-2 gap-3">
                          {[
                            { label: "Working Experience", icon: <Briefcase className="w-4 h-4 text-indigo-400" />, keyword: "working experience" },
                            { label: "Education & Studies", icon: <GraduationCap className="w-4 h-4 text-[#06b6d4]" />, keyword: "education" },
                            { label: "Key Projects", icon: <Code className="w-4 h-4 text-[#818cf8]" />, keyword: "projects" },
                            { label: "Hobbies", icon: <Sparkles className="w-4 h-4 text-teal-400" />, keyword: "hobby" }
                          ].map((item, idx) => (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => handleSuggestionClick(item.keyword)}
                              className="p-3 bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/12 rounded-xl text-left transition-all duration-300 flex items-center gap-3 cursor-pointer"
                            >
                              <div className="p-1.5 bg-white/5 rounded-lg">
                                {item.icon}
                              </div>
                              <span className="text-xs text-slate-300 font-medium">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div ref={resultsEndRef} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Sleek Design Footer Copyright indicators with exact brand parameters - No screen overflow */}
      <footer className="pb-8 px-12 text-center z-10 shrink-0">
        <div className="max-w-4xl mx-auto border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">
          <p>&copy; {new Date().getFullYear()} {portfolioData.name.toUpperCase()} PORTFOLIO</p>
          <div className="flex gap-6">
            <a href={`https://${portfolioData.contact.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href={`https://${portfolioData.contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
          </div>
          <p>CURATED EXPERIENCE</p>
        </div>
      </footer>
    </div>
  );
}
