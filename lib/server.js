var  fs = require('fs');

module.exports = function(req, res) {

  if(!/\.js$/.test(req.url) && !/\.css/.test(req.url)){
    fs.readFile(__dirname + '/../index.html', 
      function(err, data){
         if(err){
             res.writeHead(500);
             return res.end('Error loading index.html');
         }

         res.writeHead(200, {'Content-Type' : 'text/html'});
         res.end(data);
      
      });
  }

  if(/\.js$/.test(req.url)){
    fs.readFile(__dirname + '/..'+req.url, 
    function(err, data){
       if(err){
           res.writeHead(500);
           return res.end('Error loading '+req.url);
       }
       
       res.writeHead(200, {'Content-Type' : 'text/javascript'});
       res.end(data);
    
    });
  }

  if(/\.css$/.test(req.url)){
    fs.readFile(__dirname + '/..'+req.url, 
    function(err, data){
       if(err){
           res.writeHead(500);
           return res.end('Error loading '+req.url);
       }
       
       res.writeHead(200, {'Content-Type' : 'text/css'});
       res.end(data);
    
    });
  }

};
