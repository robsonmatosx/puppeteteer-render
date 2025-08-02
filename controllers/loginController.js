//js

//For Register Page
const registerView = (req, res) => {
    res.render("register", {
    } );
}
// For View 
const loginView = (req, res) => {

    //register some flash messages

    req.flash('info', 'Flash Message Added');;
    var messages = req.flash('info');
    
    res.render('login', {  
         messages: messages

    });

console.log(loginView);
    // res.render("login", {
    // } );
}
module.exports =  {
    registerView,
    loginView
};