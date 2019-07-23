$(document).ready(() => {
    run()
})

async function run() {
    console.log("loading face detection model")
    // await faceapi.nets.ssdMobilenetv1.loadFromUri("./models")
    await faceapi.nets.mtcnn.loadFromUri('./models')
    await faceapi.nets.faceLandmark68Net.loadFromUri('./models')
    await faceapi.nets.faceRecognitionNet.loadFromUri('./models')

    console.log("detecting faces")
    var input = document.getElementById("image")
    // var detections = await faceapi.detectAllFaces(input, new faceapi.MtcnnOptions());

    //getting face landmarks
    console.log("getting face landmarks")
    var results = await faceapi.detectAllFaces(input, new faceapi.MtcnnOptions()).withFaceLandmarks().withFaceDescriptors()
    console.log(results[0])

    var descriptor = results[0].descriptor
    console.log(descriptor)
}