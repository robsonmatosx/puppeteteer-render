// For Register Page
const registerView = (req, res) => {
    res.render("register", {});
}

// For View 
const loginView = (req, res) => {
    const messages = req.flash('error'); // Pega mensagens de erro, se houver
    res.render('login', { messages: messages });
}

// NOVA FUNÇÃO: Para processar o POST do login
const loginUser = (req, res) => {
    const { email, password } = req.body;

    // Lógica simples de teste (Substitua pela sua consulta ao banco futuramente)
    if (email === "admin@teste.com" && password === "teste@2026") {
        req.session.user = { email }; // Salva na sessão
        return res.redirect('/dashboard'); // Redireciona para sua home/dashboard
    } else {
        req.flash('error', 'E-mail ou senha inválidos');
        return res.redirect('/login');
    }
}

// NOVA FUNÇÃO: Para Logout
const logoutUser = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
}

module.exports = {
    registerView,
    loginView,
    loginUser,  // Não esqueça de exportar
    logoutUser  // Não esqueça de exportar
};