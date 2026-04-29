import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader2 } from 'lucide-react';
import './App.css';
import FacialExpressionDetector from './components/FacialExpressionDetector';
import MoodSongs from './components/MoodSongs';
import Footer from './components/Footer';

// throw new Error("Failed to render songs due to state sync issue");

function App() {
  const [Songs, setSongs] = useState([]);
  const [currentMood, setCurrentMood] = useState('waiting');
  const [showIntro, setShowIntro] = useState(false);
  const [isFetchingSongs, setIsFetchingSongs] = useState(false);
  const [hasDetected, setHasDetected] = useState(false);

  // throw new Error("UI Rendering Failed: Songs component crashed");

  useEffect(() => {
    // Check session storage for intro
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    if (!hasSeenIntro) {
      setShowIntro(true);
      sessionStorage.setItem('hasSeenIntro', 'true');
      
      // Auto hide intro after 3s
      const timer = setTimeout(() => {
        setShowIntro(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Determine theme colors based on mood
    let glowColor = '#8b5cf6'; // default purple
    
    // Smooth transitions between moods using CSS variables instead of inline styles
    const moodMap = {
      happy: '#f59e0b', // warm yellow/orange
      sad: '#3b82f6',   // soft blue
      angry: '#ef4444', // red glow
      calm: '#818cf8',  // indigo
      neutral: '#8b5cf6', // purple
      fearful: '#a78bfa',
      disgusted: '#10b981',
      surprised: '#facc15',
    };
    
    if (moodMap[currentMood]) {
      glowColor = moodMap[currentMood];
    }
    
    document.documentElement.style.setProperty('--theme-glow', glowColor);
  }, [currentMood]);

  const scrollToSection = (id) => {
    // small delay to ensure React commits DOM
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="app-container">
      <AnimatePresence>
        {showIntro && (
          <motion.div 
            className="intro-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <motion.h1 
              className="intro-title"
              initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              MOODY PLAYER
            </motion.h1>
            <motion.p 
              className="intro-tagline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Music That Understands You
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Story Content */}
      <main className="app-main">
        {/* Section 1: Hero */}
        <section className="story-section hero-section" id="hero">
          <motion.h1 
            className="hero-title"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            MOODY PLAYER
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your emotional soundtrack generator
          </motion.p>
          <motion.button
            onClick={() => scrollToSection('detector')}
            className="start-btn"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Play fill="currentColor" size={20} />
            Start Detection
          </motion.button>
        </section>

        {/* Section 2: Webcam Detection */}
        <section className="story-section detector-section" id="detector">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <FacialExpressionDetector 
              setSongs={(songs) => {
                setSongs(songs);
                scrollToSection('songs');
              }} 
              onMoodChange={(mood) => {
                setCurrentMood(mood);
                setHasDetected(true);
              }}
              onFetchingStarted={(status) => {
                setIsFetchingSongs(status);
                if (status) {
                  scrollToSection('songs');
                }
              }}
            />
          </motion.div>
        </section>
        
        {/* Section 3: Results & Songs */}
        <section className="story-section songs-section" id="songs">
          <AnimatePresence mode="wait">
            {isFetchingSongs ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                style={{ width: '100%', height: '50vh', display: 'flex', flexDirection: 'column', alignItems:'center', justifyContent:'center', color:'var(--theme-glow)' }}
              >
                <Loader2 size={48} className="animate-spin mb-4" />
                <p style={{ fontFamily: 'Poppins', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>Crafting Playlist...</p>
              </motion.div>
            ) : Songs.length > 0 ? (
              <motion.div 
                key={`songs-list-${Songs[0]?.title || 'ready'}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                style={{ width: '100%' }}
              >
                <MoodSongs Songs={Songs} />
              </motion.div>
            ) : hasDetected ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ height: '50vh', display: 'flex', alignItems:'center', justifyContent:'center', color:'var(--muted)' }}
              >
                No songs discovered for this mood yet. Try again!
              </motion.div>
            ) : (
              <div style={{ height: '20vh' }}></div> /* spacer invisible */
            )}
          </AnimatePresence>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
