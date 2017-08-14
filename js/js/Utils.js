var invadersApp = invadersApp || {};

invadersApp.utils = {};

invadersApp.utils.TEXT_SET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789?!:.©_-/()";

invadersApp.utils.addText = function (game, x, y, text, size) {
    var scale = size || 1;
    var font = game.add.retroFont('retroFont', 8, 8, invadersApp.utils.TEXT_SET, 0);
    font.text = text;
    var img = game.add.image(x, y, font);
    img.scale.setTo(scale, scale);
    img.anchor.setTo(0.5, 0.5);
    return {'font': font, 'img': img};
};

invadersApp.utils.pad = function (n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};