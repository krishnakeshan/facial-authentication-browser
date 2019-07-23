const MODEL_URL = "/models"

const labels = ['raj', 'sheldon', 'leonard', 'howard']

function myFunc() {
    console.log(faceapi.nets)
}

async function loadModels() {
    //load models
    await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
    await faceapi.loadFaceLandmarkModel(MODEL_URL)
    await faceapi.loadFaceRecognitionModel(MODEL_URL)

    //get reference to input image and detect faces
    var inputImage = document.getElementById("myImage")
    var fullFaceDescriptions = await faceapi.detectAllFaces(inputImage).withFaceLandmarks().withFaceDescriptors()

    //get reference to canvas
    var canvas = document.getElementById("canvas")

    //get labeled face descriptors
    const labeledFaceDescriptors = await Promise.all(
        //get descriptors for each label
        labels.map(async label => {
            //create an image url from the label
            // const imageUrl = `images/${label}.jpg`
            // const image = faceapi.fetchImage(imageUrl)

            //get image
            const image = document.getElementById(label)

            //detect face with highest score
            const fullFaceDescription = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()

            if (!fullFaceDescription) {
                throw new Error(`no faces detected for ${label}`)
            }

            //store face descriptors
            const faceDescriptors = [fullFaceDescription.descriptor]
            return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
        })
    )

    //match stored faces with input image
    const maxDescriptorDistance = 0.6 //maximum value for two faces to be apart
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance)

    var results = fullFaceDescriptions.map(fd => faceMatcher.findBestMatch(fd.descriptor));

    //draw results
    results.forEach((bestMatch, index) => {
        const box = fullFaceDescriptions[index].detection.box
        const label = bestMatch.toString()
        const drawBox = new faceapi.draw.DrawBox(box, {
            label: label
        })
        drawBox.draw(canvas)
    })
}