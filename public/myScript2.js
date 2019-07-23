$(document).ready(function () {
    run()
})

const labels = ['krishna', 'sheldon']

async function run() {
    //load the models
    console.log("starting run");
    await faceapi.loadMtcnnModel("./models")
    await faceapi.loadFaceRecognitionModel("./models")

    //access video element and get stream
    let stream = null
    const videoElement = document.getElementById("video")

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {}
        })
        videoElement.srcObject = stream
    } catch (error) {
        console.error(error);
    }

    //configure mtcnn
    const mtcnnForwardParams = {
        maxNumScales: 10,
        scaleFactor: 0.709,
        scoreThresholds: [0.6, 0.7, 0.7],
        minFaceSize: 200
    }

    const mtcnnResults = await faceapi.mtcnn(videoElement, mtcnnForwardParams)

    //draw results
    faceapi.drawDetection('overlay', mtcnnResults.map(res => res.faceDetection), {
        withScore: false
    })

    //get aligned faces
    const alignedFaceBoxes = mtcnnResults.map(({
        faceLandmarks
    }) => faceLandmarks.align())

    const alignedFaceTensors = await extractFaceTensors(videoElement, alignedFaceBoxes)

    const descriptors = await Promise.all(alignedFaceTensors.map(faceTensor => faceapi.computeFaceDescriptor(faceTensor)))

    alignedFaceTensors.forEach(tensor => tensor.dispose()) //free memory

    //get labeled face descriptors from source images
    const labeledFaceDescriptors = await Promise.all(
        labels.map(async label => {
            const imageElement = document.getElementById(label)

            //detect face in image
            const fullFaceDescription = await faceapi.detectSingleFace(imageElement).withFaceLandmarks().withFaceDescriptor()

            //handle error detecting faces
            if (!fullFaceDescription) {
                throw new Error(`no faces detected for ${label}`);
            }

            const faceDescriptors = [fullFaceDescription.descriptor]
            return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
        })
    )

    const maxDescriptorDistance = 0.6
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance)

    const results = fullFaceDescription
}