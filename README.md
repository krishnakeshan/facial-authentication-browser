# facial-authentication-browser
## Authenticating Users With Face Recognition in the browser


### Usage:
It's a small web application with 3 primary tabs:
1. Enroll
2. Authenticate
3. Modify

#### Enrollment
To enroll new users, make sure the face of the candidate is clearly visible in the webcam output and click the "Capture" button. The button remains disabled while the face detection and recognition models run in the background. Once finished, the button becomes active again and you can continue taking pictures (upto 3).

You then just need to enter your details and press the "Enroll" button. Note, here USN is a unique identifier of the individual and cannot be the same for any two enrollments.

#### Authentication
To authenticate existing users, switch to the "Authenticate" tab (on the left). Again, make sure the individual's face is clearly visible in the webcam output and press the "Authenticate" button. The application then searches for best matches amongst the enrollments already existing and changes the "Authenticate" button's message to a welcome message.

#### Modify
Not yet implemented.

### Development
#### Components
The application is made up of a single **index.html** file and styled with an accompanying **styles.css** file. It heavily relies on [Bootstrap](https://getbootstrap.com/) for layout and overall UI.

The storage is implemented in the browser with [PouchDB](https://pouchdb.com/) and only implements in-browser storage. You are free to extend it to interact with your own server.
