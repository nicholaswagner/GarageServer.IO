var garageServerGame = require('./garageservergame');

/*
options = {
    stateInterval: 45,
    logging: true,
    clientSidePrediction: true,
    interpolation: true,
    interpolationDelay: 100,
    smoothingFactor: 0.3,
    pingInterval: 2000,
    worldState: {},
    onPlayerConnect: function (socket),
    onPlayerInput: function (socket, input),
    onPlayerDisconnect: function (socket),
    onPing: function (socket, data)
}
api methods
    createGarageServer(io, options)
    start()
    stop()
    getPlayers() : [{ id: '', state: {}, inputs: [{}], stateHistory: [{ state, executionTime }] }]
    getEntities() : [{ id: '', state: {}, stateHistory: [{ state, executionTime }] }]
    updatePlayerState(id, state)
    updateEntityState(id, state)
    addEntity(id)
    removeEntity(id)
    sendPlayerEvent(id, data)
    sendPlayersEvent(data)
*/
function GarageServer(socketio, options) {
    this.socketPath = '/garageserver.io';
    this.io = socketio;
    this.game = new garageServerGame(options);
    this.registerSocketEvents(options);
}

GarageServer.prototype.registerSocketEvents = function (options) {
    var self = this;

    self.io.of(self.socketPath).on('connection', function (socket) {
        if (options.logging) {
            console.log('garageserver.io:: socket ' + socket.id + ' connection');
        }
        socket.emit('state', {
            physicsDelta: (options.physicsInterval ? options.physicsInterval : 15) / 1000,
            smoothingFactor: options.smoothingFactor ? options.smoothingFactor : 1,
            interpolation: options.interpolation ? options.interpolation : false,
            interpolationDelay: options.interpolationDelay ? options.interpolationDelay : 100,
            pingInterval: options.pingInterval ? options.pingInterval : 2000,
            clientSidePrediction: options.clientSidePrediction ? options.clientSidePrediction : false,
            worldState: options.worldState ? options.worldState : {}
        });
        self.onPlayerConnect(socket, options);

        socket.on('disconnect', function () {
            if (options.logging) {
                console.log('garageserver.io:: socket ' + socket.id + ' disconnect');
            }
            self.onPlayerDisconnect(socket, options);
        });

        socket.on('input', function (data) {
            if (options.logging) {
                console.log('garageserver.io:: socket input ' +  socket.id + ' ' + data[0] + ' ' + data[1]);
            }
            self.onPlayerInput(socket, data, options);
        });

        socket.on('ping', function (data) {
            if (options.logging) {
                console.log('garageserver.io:: socket ping ' + data);
            }
            self.onPing(socket, data, options);
        });
    });
};

GarageServer.prototype.onPlayerConnect = function (socket, options) {
    this.game.addPlayer(socket);
    if (options.onPlayerConnect) {
        options.onPlayerConnect(socket);
    }
};

GarageServer.prototype.onPlayerDisconnect = function (socket, options) {
    this.game.removePlayer(socket.id);
    socket.broadcast.emit('removePlayer', socket.id);
    if (options.onPlayerDisconnect) {
        options.onPlayerDisconnect(socket);
    }
};

GarageServer.prototype.onPlayerInput = function (socket, input, options) {
    this.game.addPlayerInput(socket.id, input[0], input[1], input[2]);
    if (options.onPlayerInput) {
        options.onPlayerInput(socket, input);
    }
};

GarageServer.prototype.onPing = function (socket, data, options) {
    socket.emit('ping', data);
    if (options.onPing) {
        options.onPing(socket, data);
    }
};

GarageServer.prototype.start = function () {
    this.game.start();
};

GarageServer.prototype.stop = function () {
    this.game.stop();
};

GarageServer.prototype.getPlayers = function () {
    return this.game.getPlayers();
};

GarageServer.prototype.getEntities = function () {
    return this.game.getEntities();
};

GarageServer.prototype.updatePlayerState = function (id, state) {
    this.game.updatePlayerState(id, state);
};

GarageServer.prototype.updateEntityState = function (id, state) {
    this.game.updateEntityState(id, state);
};

GarageServer.prototype.addEntity = function (id) {
    this.game.addEntity(id);
};

GarageServer.prototype.removeEntity = function (id) {
    this.io.of(this.socketPath).emit('removeEntity', id);
    this.game.removeEntity(id);
};

GarageServer.prototype.sendPlayerEvent = function (id, data) {
    this.game.sendPlayerEvent(id, data);
};

GarageServer.prototype.sendPlayersEvent = function (data) {
    this.io.of(this.socketPath).emit('event', data);
};

exports.createGarageServer = function (io, options) {
    return new GarageServer(io, options);
};