//js

//For Scrape Page
const scrapeViewPage = (req, res) => {
   
    //register some flash messages

    req.flash('info', 'Flash Message Added');;
    var messages = req.flash('info');
    
    res.render('scrape', {  
         messages: messages

    });
}

console.log(scrapeViewPage);

module.exports =  {
    scrapeViewPage,

};