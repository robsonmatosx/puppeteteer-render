//js
const express = require('express');
// const {registerView, loginView } = require('../controllers/loginController');

const { registerView, loginView, loginUser, logoutUser } = require('../controllers/loginController');
const router = express.Router();
router.post('/login', loginUser); // Rota que recebe os dados do formulário
router.get('/logout', logoutUser); // Rota para sairrouter.get('/register', registerView);
router.get('/login', loginView);

router.get('/', loginView);
module.exports = router;   