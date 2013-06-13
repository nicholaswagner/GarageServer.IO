$(function () {
    GarageServerIO.connectToGarageServer('http://garageserver_io.jbillmann.c9.io', { logging: true });

    var gameCanvas = document.getElementById('gameCanvas'),

        keyboard = new THREEx.KeyboardState(),

        ctxGameCanvas = gameCanvas.getContext('2d'),

        fps = 0,

        now,

        lastUpdate = (new Date()) * 1 - 1,

        fpsFilter = 50,

        requestAnimFrame = (function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) { window.setTimeout(callback, 1000/60); };
        })(),

        processClientInput = function () {
            if (keyboard.pressed('left')) {
                GarageServerIO.addPlayerInput('left');
            }
            if (keyboard.pressed('right')) {
                GarageServerIO.addPlayerInput('right');
            }
            if (keyboard.pressed('down')) {
                GarageServerIO.addPlayerInput('down');
            }
            if (keyboard.pressed('up')) {
                GarageServerIO.addPlayerInput('up');
            }
        },

        draw = function () {
            ctxGameCanvas.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

            GarageServerIO.getPlayerStates(function (state) {
                ctxGameCanvas.fillRect(state.x, state.y, 10, 10);
            });
        },

        update = function () {
            requestAnimFrame(update);

            processClientInput();

            draw();

            var thisFrameFPS = 1000 / ((now = new Date()) - lastUpdate);
            fps += (thisFrameFPS - fps) / fpsFilter;
            lastUpdate = now;

            $('#fps').html('FPS: ' + Math.round(fps));
        };

    update();
});