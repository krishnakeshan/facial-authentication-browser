$(document).ready(() => {
    run();
})

var currentDescriptors = []

async function run() {
    //load models
    await faceapi.nets.ssdMobilenetv1.loadFromUri("./models")
    await faceapi.nets.faceLandmark68Net.loadFromUri("./models")
    await faceapi.nets.faceRecognitionNet.loadFromUri("./models")

    //start video streams
    let stream = null;
    const enrollmentVideoElement = document.getElementById("enrollmentVideo")
    const authenticationVideoElement = document.getElementById("authenticationVideo")

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
        })
    } catch (error) {
        console.log("error getting media stream " + error)
    }

    enrollmentVideoElement.srcObject = stream
    authenticationVideoElement.srcObject = stream
}

//function to capture an image and generate descriptors
async function capture() {
    //get capture button
    const captureButton = document.getElementById("captureButton")
    captureButton.setAttribute("disabled", "true");

    //get video element
    const videoElement = document.getElementById("enrollmentVideo")

    //recognise face and add descriptor to currentDescriptors
    let result;
    try {
        result = await faceapi.detectSingleFace(videoElement).withFaceLandmarks().withFaceDescriptor()
    } catch (err) {
        console.log("error capturing " + err)
        return;
    }
    currentDescriptors.push(result.descriptor)

    //disable button if we have 3 pictures
    if (currentDescriptors.length >= 3) {
        captureButton.innerText = "All Done!"
        return
    }

    //set value of capture button
    captureButton.removeAttribute("disabled")
    captureButton.innerText = "Capture (" + currentDescriptors.length + ")"
}

async function enroll() {
    //check if 3 pictures provided
    if (currentDescriptors.length < 3) {
        alert("Please capture 3 images and try again")
        return;
    }

    //get input values
    const usnInput = document.getElementById("usnInput")
    const nameInput = document.getElementById("nameInput")
    const usn = usnInput.value;
    const name = nameInput.value;

    //add this entry to database
    $.ajax({
        type: "POST",
        url: "enroll",
        data: {
            id: usn,
            name: name,
            descriptors0: currentDescriptors[0].join(' '),
            descriptors1: currentDescriptors[1].join(' '),
            descriptors2: currentDescriptors[2].join(' ')
        },
        success: (data, status, jqXHR) => {
            //empty the array
            currentDescriptors = []

            //clear fields
            usnInput.value = ""
            nameInput.value = ""

            //restore button
            const captureButton = document.getElementById("captureButton")
            captureButton.innerText = "Capture (0)"
            captureButton.removeAttribute("disabled")

            //do something to show success
            console.log("added to db")
        },
    })
}

async function authenticate() {
    //get reference to auth button
    const authButton = document.getElementById("authenticate-button")
    authButton.setAttribute("disabled", true)

    //get reference to video element
    const videoElement = document.getElementById("authenticationVideo")

    //get face descriptor
    const inputDetection = await faceapi.detectSingleFace(videoElement).withFaceLandmarks().withFaceDescriptor()
    const inputDescriptor = inputDetection.descriptor

    //get face data
    $.ajax({
        type: "POST",
        url: "getFaceData",
        success: (data, status, jqXHR) => {
            // parse retrieved data
            face_data_objects = JSON.parse(data)

            // convert descriptor data from string to float
            for (var i = 0; i < face_data_objects.length; i++) {
                descriptors = new Float32Array(face_data_objects[i]["descriptors"].split("+"))
                descriptor1 = descriptors.slice(0, 128)
                descriptor2 = descriptors.slice(128, 256)
                descriptor3 = descriptors.slice(256, 384)
                face_data_objects[i]["descriptors"] = [descriptor1, descriptor2, descriptor3]
            }

            var labeledFaceDescriptors = []
            for (var i = 0; i < face_data_objects.length; i++) {
                labeledFaceDescriptors.push(new faceapi.LabeledFaceDescriptors(
                    face_data_objects[i]["name"],
                    face_data_objects[i]["descriptors"],
                ));
            }

            //create facematcher with those
            console.log("created labeled descriptors")
            const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors)

            //find best match
            const bestMatch = faceMatcher.findBestMatch(inputDescriptor)
            console.log(bestMatch)

            //show message
            authButton.innerText = "Welcome " + bestMatch._label
            authButton.removeAttribute("disabled")
        }
    })
}