import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import "./facialExpressionDetection.css";
import axios from "axios";
import mlogo from "../assets/mlogo.jpg"
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ScanFace, Loader2, Info } from "lucide-react";



const ExpressionDetector = ({ setSongs, onMoodChange, onFetchingStarted }) => {
  const videoRef = useRef(null);
  const [expression, setExpression] = useState("waiting...");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
      startVideo();
    };
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.error("Webcam error:", err);
        setExpression("webcam error");
      });
  };

  const detectExpression = async () => {
    if (!modelsLoaded) {
      setExpression("models loading...");
      return;
    }
    const video = videoRef.current;
    if (!video) {
      setExpression("video not ready");
      return;
    }
    try {
      setDetecting(true);
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detection && detection.expressions) {
        const best = Object.entries(detection.expressions).reduce((a, b) =>
          a[1] > b[1] ? a : b
        );
        const mood = best[0];
        setExpression(mood);
        if (onMoodChange) onMoodChange(mood);

        const invalidMoods = [
          "unknown",
          "no face detected",
          "waiting...",
          "error detecting expression",
        ];
        if (!invalidMoods.includes(mood.toLowerCase())) {
          setIsSuccess(true);
          setTimeout(() => setIsSuccess(false), 2000);
          
          if (onFetchingStarted) onFetchingStarted(true);
          
          axios
            .get(`http://localhost:3000/songs?mood=${mood}`)
            .then((response) => {
              setSongs(response.data.songs || []);
              if (onFetchingStarted) onFetchingStarted(false);
            })
            .catch((error) => {
              console.error("Axios error:", error);
              if (onFetchingStarted) onFetchingStarted(false);
            });
        } else {
          console.log("Invalid mood detected — skipping API call.");
        }
      } else {
        setExpression("no face detected");
      }
    } catch (err) {
      console.error("Detection error:", err);
      setExpression("error detecting expression");
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="detector-wrapper">
      <div className="brand">
        <div className="brand-left">
          <div className="logo">
            <img src={mlogo} alt="logo" />
          </div>
          <div className="brand-text">
            <h1>MoodyPlayer</h1>
            <p>AI Music Gen</p>
          </div>
        </div>
        <motion.div 
          className="mood-badge"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ScanFace size={16} />
          Mood: <motion.span 
            key={expression}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mood-text"
          >
            {expression}
          </motion.span>
        </motion.div>
      </div>

      <div className="detector-card">
        <div className={`video-frame ${isSuccess ? 'pulsing' : ''}`}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="user-video"
          />
          <div className="video-overlay">
            <AnimatePresence>
              {detecting ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="scanner-line"
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                    y: { value: ["0%", "280px", "0%"] }
                  }}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                >
                  <Camera size={48} className="overlay-icon" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="controls">
          <h3 className="current-label">Current Expression</h3>
          
          <AnimatePresence mode="popLayout">
            <motion.div 
              key={expression}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="current-expression"
            >
              {expression}
            </motion.div>
          </AnimatePresence>

          <button
            className="detect-btn"
            onClick={detectExpression}
            disabled={detecting}
          >
            {detecting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <ScanFace size={20} />
                Detect Mood
              </>
            )}
          </button>

          <p className="hint">
            <Info size={14} /> Allow camera access and keep face in center.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpressionDetector;
