const express = require('express');
const multer = require('multer');
const uploadFile = require('../service/storage.service');
const router = express.Router();
const songModel = require("../models/song.model");

const upload = multer({ storage: multer.memoryStorage() });

// ✅ Create song route
router.post('/songs', upload.single("audio"), async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file);
    const fileData = await uploadFile(req.file);

    const song = await songModel.create({
      title: req.body.title,
      artist: req.body.artist,
      audio: fileData.url,
      mood: req.body.mood
    });

    res.status(201).json({
      message: 'Song created successfully',
      song: song
    });
  } catch (error) {
    console.error('POST /songs error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/songs', async (req, res) => {
  try {
    const { mood } = req.query;

    if (!mood) {
      return res.status(400).json({ error: 'Mood query parameter is required' });
    }

    const songs = await songModel.find({ mood: mood });

    if (!songs || songs.length === 0) {
      return res.status(404).json({ error: `No songs found for mood: ${mood}` });
    }

    res.status(200).json({
      message: "Songs fetched successfully",
      songs
    });
  } catch (error) {
    console.error('GET /songs error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
