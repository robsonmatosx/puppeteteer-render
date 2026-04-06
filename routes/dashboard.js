const { dashboardView } = require('../controllers/dashboardController');
const express = require('express');
const router = express.Router();

// A rota chama apenas a função do controller
router.get('/dashboard',  dashboardView);


// router.get('/dashboard',  (req, res) => {
//     res.render('dashboard', { user: req.session.user });

// });

module.exports = router;