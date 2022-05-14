import './App.css'
import { useEffect, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as handpose from '@tensorflow-models/handpose'
import '@tensorflow/tfjs-backend-webgl'
import Webcam from 'react-webcam'
import HandShape from './components/HandShape/HandShape'

function App() {
  const [model, setModel] = useState(null)
  const [active, setActive] = useState(false)
  const [points, setPoints] = useState([])
  const [middleFinger, setMiddleFinger] = useState(false)

  useEffect(() => {
    const load = async () => {
      const model = await handpose.load()
      setModel(model)
    }

    const video = document.querySelector('video')

    const predict = async () => {
      const predictions = await model.estimateHands(document.querySelector('video'))
      const points = []
      if (predictions.length > 0) {
        for (let i = 0; i < predictions.length; i++) {
          const keypoints = predictions[i].landmarks

          // Log hand keypoints.
          for (let i = 0; i < keypoints.length; i++) {
            const [x, y, z] = keypoints[i]
            points.push([x, y, z])
            // console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`)
          }
        }
      }
      setPoints(points)
    }

    const onFrame = async (now, metadata) => {
      await predict()
      if (active) video.requestVideoFrameCallback(onFrame)
    }

    if (video && model && active) video.requestVideoFrameCallback(onFrame)

    if (!model && active) load()
  }, [model, active])

  return (
    <div className="App">
      <Webcam />
      <button onClick={() => setActive(!active)}>{active ? 'Deaktivieren' : 'Aktivieren'}</button>
      <div>{middleFinger ? 'Du zeigst mir den MittelFinger!!!!!' : 'Brav!'}</div>
      <HandShape points={points} setMiddleFinger={setMiddleFinger} />
    </div>
  )
}

export default App
