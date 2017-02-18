'use strict'

const SPOTIFY_PLAYPAUSE = 'dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.PlayPause'
const SPOTIFY_NEXT = 'dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Next'
const SPOTIFY_PREVIOUS = 'dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Previous'
const SPOTIFY_INFO = 'dbus-send --print-reply --session --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.freedesktop.DBus.Properties.Get string:\'org.mpris.MediaPlayer2.Player\' string:\'Metadata\''

// const net = require('net')
const http = require('http')
const ip = require('ip')
const shelljs = require('shelljs')
const robot = require('robotjs')

robot.setMouseDelay(2)

const IP_ADDRESS = ip.address()

const server = http.createServer()
const io = require('socket.io')(server)

io.on('connection', function (client) {

    console.log('client connected', client.id)
    let spotifyInterval = null

    client.on('disconnect', () => {
        console.log('client disconnected', client.id)
        clearInterval(spotifyInterval)
    })

    client.on('get_commands_list', () => {
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

    client.on('mouseMoveCenter', () => {
        const screenSize = robot.getScreenSize()
        robot.moveMouse(screenSize.width / 2, screenSize.height / 2)
    })

    client.on('mouseMoveZero', () => {
        robot.moveMouse(0, 0)
    })

    client.on('mouseMoveSin', () => {
        const twoPI = Math.PI * 2.0
        const screenSize = robot.getScreenSize()
        const height = (screenSize.height / 2) - 10
        const width = screenSize.width

        for (let x = 0; x < width; x++) {
            let y = height * Math.sin((twoPI * x) / width) + height
            robot.moveMouse(x, y)
        }
    })

    client.on('volumeup', () => {
        shelljs.exec('amixer -D pulse sset Master 5%+', { silent: true })
    })

    client.on('volumedown', () => {
        shelljs.exec('amixer -D pulse sset Master 5%-', { silent: true })
    })

    client.on('spotify', () => {
        spotifyInterval = setInterval(() => {
            getSpotifyInfo().then((data) => {
                client.emit('spotifyInfo', parseDbusData(data))
            })
        }, 2000)

        // shelljs.exec('spotify&', { silent: true }, () => { })

        const isSpotify = shelljs.exec('ps aux | grep spotify | awk \'{print $11}\'', { async: true, silent: true })

        isSpotify.stdout.on('data', (data) => {
            console.log(data)
            if (data.match('/usr/share/spotify/spotify'))
                sendSpotifyInfo(client)
            else{
                const cmd = shelljs.exec('spotify&', { async: true, silent: true })
                cmd.stdout.on('data', (data) => {
                    console.log('spotify started')
                    sendSpotifyInfo(client)
                })

            }
        })
    })
    client.on('spotifyPlayPause', () => {

        const cmd = shelljs.exec(SPOTIFY_PLAYPAUSE, { async: true, silent: true })
        cmd.stdout.on('data', (data) => {
            sendSpotifyInfo(client)
        })

    })

    client.on('spotifyNext', () => {

        const cmd = shelljs.exec(SPOTIFY_NEXT, { async: true, silent: true })
        cmd.stdout.on('data', (data) => {
            sendSpotifyInfo(client)
        })
    })

    client.on('spotifyPrevious', () => {

        const cmd = shelljs.exec(SPOTIFY_PREVIOUS, { async: true, silent: true })
        cmd.stdout.on('data', (data) => {
            sendSpotifyInfo(client)
        })

    })

    client.on('spotifyClose', () => {
        shelljs.exec('kill $(ps aux | grep spotify | awk \'{print $2}\')')
        clearInterval(spotifyInterval)
    })

    client.on('openUrl', (data) => {
        shelljs.exec(`google-chrome ${data.url}`)
    })

    // client.emit('test_connection', { data: 'witaj!' })
})
server.listen(1337, IP_ADDRESS)

console.log(`Address: ${IP_ADDRESS}:1337`)


function getSpotifyInfo() {
    return new Promise((resolve, reject) => {
        const cmd = shelljs.exec(SPOTIFY_INFO, { async: true, silent: true })

        cmd.stdout.on('data', (data) => { resolve(data) })
    })
}

function parseDbusData(data) {
    data = data.replace(/( )+/g, ' ')
    data = data.replace(/\n/g, '')
    data = data.replace(/dict entry\(/g, '\ndict entry(')

    data = data.match(/dict entry\(.*\)/g).join('\n')
    data = data.replace(/dict entry\( string /g, '')
    data = data.replace(/ variant \w+ /g, ':')
    data = data.replace(/ \)/g, '')
    data = data.replace(/ string /g, '')

    return JSON.parse(`{${data.replace(/\n/g, ',')}}`)
}

function sendSpotifyInfo(client){
    setTimeout(() => { getSpotifyInfo().then((data) => { client.emit('spotifyInfo', parseDbusData(data)) }) }, 100)
}