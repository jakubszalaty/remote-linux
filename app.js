'use strict'

// const net = require('net')
const http = require('http')
const ip = require('ip')
const shelljs = require('shelljs')
const robot = require('robotjs')

robot.setMouseDelay(2)

const IP_ADDRESS = ip.address()

const server = http.createServer()
const io = require('socket.io')(server)
io.on('connection', function(client){

    console.log('client connected',client.id)

    client.on('disconnect', ()=>{
        console.log('client disconnected',client.id)
    })

    client.on('get_commands_list', ()=>{
        console.log('get_commands_list')
        client.emit('commands_list', {
            data: [
                'mouseMoveCenter',
                'mouseMoveZero',
                'mouseMoveSin',
                'volumeup',
                'volumedown',
                'spotify',
                'spotifyPlayPause',
                'spotifyNext',
                'spotifyPrevious',
                'spotifyClose',
            ]
        })
    })

    client.on('mouseMoveCenter', () =>{
        const screenSize = robot.getScreenSize()
        robot.moveMouse(screenSize.width/2, screenSize.height/2)
    })

    client.on('mouseMoveZero', () =>{
        robot.moveMouse(0,0)
    })

    client.on('mouseMoveSin', () =>{
        const twoPI = Math.PI * 2.0
        const screenSize = robot.getScreenSize()
        const height = (screenSize.height / 2) - 10
        const width = screenSize.width

        for (let x = 0; x < width; x++) {
            let y = height * Math.sin((twoPI * x) / width) + height
            robot.moveMouse(x, y)
        }
    })

    client.on('volumeup', ()=>{
        shelljs.exec('amixer -D pulse sset Master 5%+ >> /dev/null')
    })

    client.on('volumedown', ()=>{
        shelljs.exec('amixer -D pulse sset Master 5%- >> /dev/null')
    })

    client.on('spotify', ()=>{
        shelljs.exec('spotify >> /dev/null 2>> /dev/null &')
    })
    client.on('spotifyPlayPause', ()=>{
        shelljs.exec('dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.PlayPause >> /dev/null')
    })

    client.on('spotifyNext', ()=>{
        shelljs.exec('dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Next >> /dev/null')
    })

    client.on('spotifyPrevious', ()=>{
        shelljs.exec('dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Previous >> /dev/null')
    })

    client.on('spotifyClose', ()=>{
        shelljs.exec('kill $(ps aux | grep spotify | awk \'{print $2}\')')
    })

    // client.emit('test_connection', { data: 'witaj!' })

})
server.listen(1337, IP_ADDRESS)

console.log(`Address: ${IP_ADDRESS}:1337`)
