var server = require('./lib/server')
   , app = require('http').createServer(server)
   , io = require('socket.io').listen(app)
   , buffer = {}
   , PORT = process.env.PORT || 5000;

app.listen(PORT);

io.sockets.on('connection', function(socket){

   socket.on('connect_client', function(data){
      var input = '';

      socket.join(data.path);

      socket.set('path', data.path);

      if(typeof buffer[data.path] !== 'undefined'){
        input = buffer[data.path];
      }

      var count = io.sockets.clients(data.path).length;
      var send = {count : count, input : input};

      io.sockets.in(data.path).emit('server_ready', send);

   });
   
   socket.on('client_input', function(input){

      socket.get('path', function(err, path){
        buffer[path] = input;
        socket.broadcast.to(path).emit('server_input', input);
      });
      
   });

   socket.on('set_active', function(){
      socket.get('path', function(err, path){
        socket.broadcast.to(path).emit('set_inactive');
      });
   });
   
   socket.on('disconnect', function(){
    
    socket.get('path', function(err, path){
      
      socket.leave(path);
      
      var count = io.sockets.clients(path).length;
      
      if(count == 0){
        delete buffer[path];
      }

      io.sockets.in(path).emit('disconnected', {count : count});

    });

   });

});
   