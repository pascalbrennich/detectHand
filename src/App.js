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
  const [trainData, setTrainData] = useState([])
  const [trainLabel, setTrainLabel] = useState([])
  const [middleFinger, setMiddleFinger] = useState(false)
  const [myCustomModel, setMyCustomModel] = useState(null)
  const [collectData, setCollectData] = useState(false)
  const [predictionViaModel, setPredictionViaModel] = useState(false)

  useEffect(() => {
    const generateModel = () => {
      const model = tf.sequential()

      const hidden = tf.layers.dense({
        units: 105,
        activation: 'sigmoid',
        inputDim: 21,
      })
      const output = tf.layers.dense({ units: 2, activation: 'softmax' })
      model.add(hidden)
      model.add(output)

      model.compile({ loss: 'categoricalCrossentropy', optimizer: 'sgd' })
      setMyCustomModel(model)
    }

    const load = async () => {
      console.log('loadHandpose')
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
    }

    const getTrainData = () => {
      console.log('GetTrainData')
      if (points.length > 12) {
        const heightOf11 = points[11][1]
        const isMiddleFinger = !points.reduce((acc, el, i) => {
          if (i !== 12 && i !== 11 && !acc) {
            return el[1] < heightOf11
          }
          return acc
        }, false)
        console.log(isMiddleFinger)
        setTrainData([...trainData, points.map((point) => point[1])])
        setTrainLabel([...trainLabel, isMiddleFinger ? 1 : 0])
      }
    }

    const predictViaCustomModel = async () => {
      console.log('Predict via custom Model')
      if (points.length > 12) {
        // const heightOf11 = points[11][1]
        // const isMiddleFinger = !points.reduce((acc, el, i) => {
        //   if (i !== 12 && i !== 11 && !acc) {
        //     return el[1] < heightOf11
        //   }
        //   return acc
        // }, false)
        // console.log(isMiddleFinger)
        // setTrainLabel([...trainLabel, isMiddleFinger ? 1 : 0])
        const mappedPoints = points.map((point) => point[1])
        const tensor = tf.tensor1d(mappedPoints)
        const prediction = await myCustomModel.predictOnBatch(tensor)
        tensor.dispose()
        console.log(prediction)
        prediction.print()
      }
    }

    if (collectData) getTrainData()

    if (video && model && active && !predictionViaModel) video.requestVideoFrameCallback(onFrame)

    if (!myCustomModel) generateModel()

    if (!model && active) load()

    if (predictionViaModel && myCustomModel) predictViaCustomModel()
  }, [model, active, myCustomModel, trainData, trainLabel, points, collectData, predictionViaModel])

  console.log(trainData.length)
  console.log(trainLabel.length)

  const train = async () => {
    const labelsTensor = tf.tensor1d(trainLabel, 'int32')

    const xs = tf.tensor2d(trainData)
    const ys = tf.oneHot(labelsTensor, 2)

    labelsTensor.dispose()

    console.log('training...')
    const result = await myCustomModel.fit(xs, ys, {
      epochs: 20,
      validationSplit: 0.1,
      shuffle: true,
    })
    console.log(result)
    console.log('model trained!')

    const prediction = await myCustomModel.predict(xs)
    console.log(Array.from(prediction.dataSync())[0])
  }

  return (
    <div className="App">
      <Webcam />
      <button onClick={() => setActive(!active)}>{active ? 'Deaktivieren' : 'Aktivieren'}</button>
      <button onClick={() => setCollectData(!collectData)}>
        {collectData ? 'Collecting Data' : 'Press To Start Collecting'}
      </button>
      <button
        disabled={!myCustomModel || trainData.length === 0 || trainLabel.length === 0}
        onClick={train}
      >
        train
      </button>
      <button disabled={!myCustomModel} onClick={() => setPredictionViaModel(!predictionViaModel)}>
        {predictionViaModel ? 'predicting...' : 'click to predict'}
      </button>
      <div>{middleFinger ? 'Du zeigst mir den MittelFinger!!!!!' : 'Brav!'}</div>
      <HandShape points={points} setMiddleFinger={setMiddleFinger} />
    </div>
  )
}

export default App
