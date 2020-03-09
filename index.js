var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
//var nickname = new Object();
clients = [];
//let users = new Object();
users = [];
connections = [];
messages=[];
var dict = new Object;



function User(id, username){
    this.id = id,
    this.username = username;
}

let test = {};

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

http.listen(port, function(){
    console.log('listening on *:' + port);
});

io.sockets.on('connection', function(socket){

    connections.push(socket);
    console.log('Connect: %s sockets connected', connections.length);

    socket.on('disconnect', function(data){
        if(!socket.username) return;
        users.splice(users.indexOf(socket.username), 1)
        updateUsernames2();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length)
    });

    socket.on('new user', function(data, callback){
        callback(true);
        socket.username=socket.id;
        let user = new User(socket.id, socket.id);
        test[socket.id] = user;
        
        //console.log(test);
        users.push(socket.username);
        console.log(users);
        clients.push(socket.username);
        updateUsernames();

        socket.on('chat message', function(msg){
            if(`${msg}`.includes('/nick ')){
                message=`${msg}`;
                mesg=message.split(" ")[1]
                io.emit('chat message', "your username has been changed to " + mesg);
                test[socket.id].username = mesg;
                updateUsernames1();
            }
        });
    });
    function updateUsernames(){
        io.emit('get users', test);
        for(i=0; i<messages.length; i++){
            socket.emit('chat message', messages[i]);
        } 
    }
    function updateUsernames1(){
        io.emit('get users', test);
    }
    function updateUsernames2(){
        io.emit('get users1', users);
        // for(i=0; i<messages.length; i++){
        //     socket.emit('chat message', messages[i]);
        // } 
    }

    socket.on('chat message', function(msg){
        var timestamp = new Date();
        var h = timestamp.getHours();
        var m = timestamp.getMinutes();
        var s = timestamp.getSeconds();
        timeStamp = h.toString() + ":" + m.toString() + ":" + s.toString();
        
        io.emit('chat message', `${timeStamp} ${test[socket.id].username}: ${msg}`);
        messages.push(`${timeStamp} ${test[socket.id].username}: ${msg}`);

      });
});

