import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Music } from "lucide-react";
import "./MoodSongs.css";




const MoodSongs = ({ Songs = [] }) => {
  const [isPlaying, setPlaying] = useState(null);
  const audioRefs = useRef([]);

  useEffect(() => {
    // stop audio when song list changes or component unmounts
    return () => {
      audioRefs.current.forEach((a) => { if (a) a.pause(); });
    };
  }, [Songs]);

  const handlePlayPause = (index) => {
    const current = audioRefs.current[index];
    if (!current) return;

    if (isPlaying === index) {
      current.pause();
      setPlaying(null);
    } else {
      audioRefs.current.forEach((a, i) => {
        if (a && i !== index) a.pause();
      });
      current.currentTime = 0;
      current.play();
      setPlaying(index);
    }
  };

  const setAudioRef = (el, i) => {
    audioRefs.current[i] = el;
    if (el) {
      el.onended = () => {
        setPlaying((prev) => (prev === i ? null : prev));
      };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, x: 20 },
    show: { opacity: 1, scale: 1, x: 0, transition: { type: "spring", stiffness: 200, damping: 20 } }
  };

  return (
    <div className="mood-songs-container">
      <h2 className="songs-title">Recommended AI Playlist</h2>
      <div className="songs-carousel-wrapper">
        <motion.div 
          className="songs-list"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {Songs.length === 0 && <p className="no-songs">No songs found for this mood yet.</p>}
          {Songs.map((song, index) => (
            <motion.div 
              variants={itemVariants}
              className={`song-card ${isPlaying === index ? "playing" : ""}`} 
              key={`${song.title}-${index}`}
            >
              <div className="left">
                <div className="cover">
                  {song.cover ? (
                    <img src={song.cover} alt={song.title} />
                  ) : (
                    <div className="cover-placeholder"> <Music size={24} /> </div>
                  )}
                </div>
                <div className="meta">
                  <h3 className="song-title">{song.title}</h3>
                  <p className="song-artist">{song.artist}</p>
                </div>
              </div>

              <div className="right">
                <audio
                  ref={(el) => setAudioRef(el, index)}
                  src={song.audio}
                  preload="metadata"
                />
                
                {isPlaying === index && (
                  <div className="equalizer">
                    <span className="bar active"></span>
                    <span className="bar active"></span>
                    <span className="bar active"></span>
                  </div>
                )}
                
                <button className="play-btn" onClick={() => handlePlayPause(index)}>
                  {isPlaying === index ? <Pause size={20} fill="currentColor" /> : <Play fill="currentColor" size={20} className="ml-1" />}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default MoodSongs;
