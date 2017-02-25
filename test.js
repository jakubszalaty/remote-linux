const NodeWebcam = require('node-webcam')
const _ = require('lodash')


//Default options

const webcamOpt = {
    width: 1280,
    height: 720,
    delay: 0,
    quality: 1,
    output: 'png',
    verbose: true
}

const Webcam = NodeWebcam.create(webcamOpt)


//Will automatically append location output type

// setInterval(() => {
const time = new Date().toISOString()
Webcam.capture('shot', (err, data) => {
    if (err) console.error(err)
    Webcam.getLastShot((err, data) => {
        if (err) console.error(err)


        Webcam.getBase64(0, (err, data) => {
            console.log(data)
        })

    })
})
// Webcam.getShot(1, (err, data) => {
//     console.log(err)
//     console.log(data)
// })
// }, 500)