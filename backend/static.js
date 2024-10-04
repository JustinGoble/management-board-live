const express = require('express');
const path = require('path');
const RateLimit = require('express-rate-limit');

const indexPath = path.resolve('build/index.html');

const router = express.Router();

const rateLimit = new RateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000,
  delayMs: 0, // disabled
});

// Protect large static assets with a rate limiter
router.use('/static/media', rateLimit);

router.use(express.static('build'));
router.get('*', function sendFile(req, res) {
  res.sendFile(indexPath);
});

module.exports = router;
