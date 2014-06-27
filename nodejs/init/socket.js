module.exports = function (socket) {
    socket.on('getProgressBar', function (data) {
        var percent = 0;
        var sendPercent = setInterval(function () {
            socket.emit('sendPercent', {
                percent: percent
            });
            percent += 10;
            if (percent > 100) {
                clearInterval(sendPercent);
            }
        }, 1000);
    });
};