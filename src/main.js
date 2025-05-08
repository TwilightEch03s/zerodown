// Lorenzo Uk
// Created April 25th

"use strict"

let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true
    },
    fps: {forceSetTimeOut: true, target: 60},
    backgroundColor: "#87CEEB",
    width: 800,
    height: 900,
    scene: [Menu, ZeroDown],
}

const game = new Phaser.Game(config);