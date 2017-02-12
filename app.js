'use strict'

// const net = require('net')
const http = require('http')
const ip = require('ip')
const shelljs = require('shelljs')

const IP_ADDRESS = ip.address()

// const server = net.createServer((socket) => {
//     socket.write('Remote Linux\r\n')
//     // socket.pipe(socket)
//     socket.on('data', function(data){
//         const textChunk = data.toString('utf8')
//         console.log(textChunk)
//         socket.write(textChunk)
//     })

//     socket.on('error', function(err) {
//         console.log(err)
//     })
// })


const server = http.createServer()
const io = require('socket.io')(server)
io.on('connection', function(client){

    console.log('client connected',client.id)

    client.on('disconnect', function(){
        console.log('client disconnected',client.id)
    })

    client.on('get_commands_list', function(){
        console.log('get_commands_list')
        client.emit('commands_list', {
            data: [
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

    client.on('volumeup', function(){
        shelljs.exec('amixer -D pulse sset Master 10%+ >> /dev/null')
    })

    client.on('volumedown', function(){
        shelljs.exec('amixer -D pulse sset Master 10%- >> /dev/null')
    })

    client.on('spotify', function(){
        shelljs.exec('spotify >> /dev/null 2>> /dev/null &')
    })
    client.on('spotifyPlayPause', function(){
        shelljs.exec('dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.PlayPause >> /dev/null')
    })

    client.on('spotifyNext', function(){
        shelljs.exec('dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Next >> /dev/null')
    })

    client.on('spotifyPrevious', function(){
        shelljs.exec('dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Previous >> /dev/null')
    })

    client.on('spotifyClose', function(){
        shelljs.exec('kill $(ps aux | grep spotify | awk \'{print $2}\')')
    })

    client.emit('test_connection', {
        data: 'witaj!'
    })

})
server.listen(1337, IP_ADDRESS)

console.log(`Port: ${IP_ADDRESS}`)
