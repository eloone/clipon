var server = require('./lib/server')
   , app = require('http').createServer(server).listen(8222)
   , io = require('socket.io').listen(app)
   , transition = {};

io.sockets.on('connection', function(socket){

   socket.on('connect_client', function(data){
      var input = '';

      socket.join(data.path);

      socket.set('path', data.path);

      if(typeof transition[data.path] !== 'undefined'){
        input = transition[data.path];
      }

      var count = io.sockets.clients(data.path).length;
      var send = {count : count, input : input};

      io.sockets.in(data.path).emit('server_ready', send);

   });
   
   socket.on('client_input', function(input){

      socket.get('path', function(err, path){
        transition[path] = input;
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
        delete transition[path];
      }

      io.sockets.in(path).emit('disconnected', {count : count});

    });

   });

});
   