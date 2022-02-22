const app = require('./app');

let auth = function(req, res, next) {
   if (req.session.sessionType === 'online')
     return next();
   else
     return res.status(401).send("Zaloguj się aby to zobaczyć");
};
 
  
app.listen(35353, function() {
  console.log('listening on 35353')
})


  