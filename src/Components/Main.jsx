import React, { Suspense, useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import Model from './Model';
import { Canvas } from '@react-three/fiber'
import { Facemesh, OrbitControls } from '@react-three/drei';
import { pdProcessor } from './pdProcessor';

const Main = () => {

    const webcamRef = useRef(null)
    const canvasRef = useRef(null)

    const [mesh, setMesh] = useState("blue");
    const [stripes, setStripes] = useState("green");
    const [soul, setSoul] = useState("red");
    const [model, setModel] = useState(null);


    useEffect(() => {

        const canvasElement = canvasRef.current
        const context = canvasElement.getContext('2d');
        const videoElement = webcamRef.current.video;


        if (videoElement) {

            const aspectRatio = 1; // 1:1 aspect ratio for square video
            const maxWidth = 550; // Max width you want for the video
            const newWidth = Math.min(videoElement.offsetWidth, maxWidth);
            const newHeight = newWidth * aspectRatio;

            videoElement.style.width = `${newWidth}px`;
            videoElement.style.height = `${newHeight}px`;
        }

        if (canvasElement) {

            context.canvas.height = videoElement.offsetHeight
            context.canvas.width = videoElement.offsetWidth

        }

        predictFaceCharacteristics()
    })



    const predictFaceCharacteristics = async () => {
            await loadPDModel()
            await pdProcessor(model, webcamRef, canvasRef)


    }

    async function loadPDModel() {
        const pdModel = new Facemesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            },
        });
        await pdModel.initialize()
        setModel(pdModel)
    }

    return (
        <>
            <center>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <div>
                            <div className="position-absolute" style={{ zIndex: '10' }}>
                                <div className="position-relative w-100">
                                    <Canvas className='w-100'>
                                        <Suspense fallback={null}>
                                            <ambientLight />
                                            <spotLight intensity={0.9} angle={0.1} penumbra={1} position={[100, 105, 100]}
                                                castShadow
                                            />
                                            {/* <Model customColors={{ mesh: mesh, stripes: stripes, soul: soul }} />  */}
                                            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                                        </Suspense>
                                    </Canvas>
                                </div>

                            </div>
                            <div>
                                <Webcam
                                    id="webcam"
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    mirrored style={
                                        {

                                            maxWidth: '550px',
                                            width: '100%',
                                            objectFit: 'fill'
                                            // height: `${document.getElementById('webcam').offsetWidth}`,
                                            // height: '100%',
                                            // maxHeight: '550px'

                                        }

                                    }
                                    videoConstraints={{
                                        facingMode: 'user'
                                    }}
                                />



                                <canvas
                                    ref={canvasRef}
                                    id="output-canvas"
                                    style={{
                                        position: 'absolute',
                                        zIndex: '90',
                                        left: 0,
                                        width: '100%',
                                        // height: '100%',
                                        transform: `scaleX(-1)`
                                    }}
                                ></canvas>
                            </div>
                        </div>

                    </div>

                </div>
                <h2>Color Chooser</h2>


                <div className='d-flex justify-content-center colors'>
                    <div className="d-flex justify-content-center">
                        <div className="d-flex justify-content-center">
                            <input type="color" id="mesh" name="mesh"
                                value={mesh}
                                onChange={(e) => setMesh(e.target.value)}
                            />
                            <label for="mesh">Main</label>
                        </div>
                        <div className="d-flex justify-content-center">
                            <input type="color" id="stripes" name="stripes"
                                value={stripes}
                                onChange={(e) => setStripes(e.target.value)}
                            />
                            <label for="mesh">Stripes</label>
                        </div>
                        <div className="d-flex justify-content-center">
                            <input type="color" id="soul" name="soul"
                                value={soul}
                                onChange={(e) => setSoul(e.target.value)}
                            />
                            <label for="mesh">Soul</label>
                        </div>
                    </div>
                </div>
            </center>
        </>
    )
}

export default Main
