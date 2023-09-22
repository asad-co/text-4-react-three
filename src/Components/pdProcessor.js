import { FACEMESH_RIGHT_IRIS, FACEMESH_LEFT_IRIS, } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors } from "@mediapipe/drawing_utils";

var faceMesh = null;
var camera = null;
let width = 640.0;
let height = 480.0;
var detection;

// Function to calculate distance between two points / pupils
const getDistance = (p1, p2) => {
    return Math.sqrt(
        Math.pow(p1.x - p2.x, 2) +
        Math.pow(p1.y - p2.y, 2) +
        Math.pow(p1.z - p2.z, 2)
    );
};
export const pdProcessorEnd = async () => {
    if (camera) {
        await camera.stop()

    }
}





export const pdProcessor = async (model, webcamRef, canvasRef, updatePdValue, facingMode,updateDistance) => {
    console.log('pdProcessor called')

    faceMesh = model
    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
    });

    // Function to run canvas with video and Face Mesh when ready




    const onResults = async (results) => {
        // Setting canvas - references and context
        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement.getContext("2d");
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        distanceCalculator(results, updateDistance)
        // Loading Face Mesh landmarks for iris and getting coordinates for pupils
        if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
            let pupils = {
                left: {
                    x:
                        (results.multiFaceLandmarks[0][FACEMESH_LEFT_IRIS[0][0]].x +
                            results.multiFaceLandmarks[0][FACEMESH_LEFT_IRIS[2][0]].x) /
                        2.0,
                    y:
                        (results.multiFaceLandmarks[0][FACEMESH_LEFT_IRIS[0][0]].y +
                            results.multiFaceLandmarks[0][FACEMESH_LEFT_IRIS[2][0]].y) /
                        2.0,
                    z:
                        (results.multiFaceLandmarks[0][FACEMESH_LEFT_IRIS[0][0]].z +
                            results.multiFaceLandmarks[0][FACEMESH_LEFT_IRIS[2][0]].z) /
                        2.0,
                    width: getDistance(
                        results.multiFaceLandmarks[0][FACEMESH_LEFT_IRIS[0][0]],
                        results.multiFaceLandmarks[0][FACEMESH_LEFT_IRIS[2][0]]
                    ),
                },
                right: {
                    x:
                        (results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[0][0]].x +
                            results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[2][0]].x) /
                        2.0,
                    y:
                        (results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[0][0]].y +
                            results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[2][0]].y) /
                        2.0,
                    z:
                        (results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[0][0]].z +
                            results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[2][0]].z) /
                        2.0,
                    width: getDistance(
                        results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[0][0]],
                        results.multiFaceLandmarks[0][FACEMESH_RIGHT_IRIS[2][0]]
                    ),
                },
            };

            // Setting variables for calculation disance between pupils
            let distance = getDistance(pupils.left, pupils.right);
            let irisWidthInMM = 12.0;
            let pupilWidth = Math.min(pupils.left.width, pupils.right.width);
            let pd = (irisWidthInMM / pupilWidth) * distance;

            // Setting real-time pupillary distance
            updatePdValue(pd.toFixed(0));

            // Drawing Face Mesh landmarks of iris on canvas (and face oval and tessellation if you want)
            for (const landmarks of results.multiFaceLandmarks) {
                drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, {
                    color: "#FF3030",
                    lineWidth: 1,
                });
                drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, {
                    color: "#FF3030",
                    lineWidth: 1,
                });
            }
        }
        canvasCtx.restore();
    };

    faceMesh.onResults(onResults);


    // Starting new camera
    const videoElement = webcamRef.current;


    // console.log(videoElement)
    // console.log("videoElement" + webcamRef.current.video.readyState)
    if (
        typeof videoElement !== "undefined" &&
        videoElement !== null
        // && videoElement.video.readyState === 4
        // && faceMesh!==null
    ) {


        camera = new Camera(videoElement.video, {
            onFrame: async () => {
                await faceMesh.send({ image: videoElement.video });

            },
            facingMode: facingMode,
            width: width,
            height: height,
        });

        camera.start();


    }


    return () => { }
}


const distanceCalculator = (results, updateDistance) => {
    var irisLeftMinX = -1;
    var irisLeftMaxX = -1;
    if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
            for (const point of FACEMESH_LEFT_IRIS) {
                var point0 = landmarks[point[0]];
                if (irisLeftMinX == -1 || point0.x * width < irisLeftMinX) {
                    irisLeftMinX = point0.x * width;
                }
                if (irisLeftMaxX == -1 || point0.x * width > irisLeftMaxX) {
                    irisLeftMaxX = point0.x * width;
                }
            }


        }
    }

    var dx = irisLeftMaxX - irisLeftMinX;
    var dX = 11.7;

    // Logitech HD Pro C922	Norm focal
    var normalizedFocaleX = 1.40625;
    var fx = Math.min(width, height) * normalizedFocaleX;
    var dZ = (fx * (dX / dx)) / 10.0;
    dZ = dZ.toFixed(2);
    //console.log(dZ + " cm");
    if(dZ!=='Infinity'){
        updateDistance(dZ + " cm")
    }
    else{
        updateDistance('calculating...')
    }


    //   canvasCtx.fillStyle = "red";
    //   canvasCtx.font = "30px Arial";
    //   canvasCtx.fillText(dZ + " cm", width * 0.75, 50);

}