const express = require('express');
const {scrapeViewPage } = require('../controllers/scrapeController');
const router = express.Router();
router.get('/scrapeurl', scrapeViewPage);

module.exports = router;