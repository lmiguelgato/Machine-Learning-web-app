import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import axios from 'axios'
import socketIOClient from 'socket.io-client'

// Constants
import { ENDPOINT, TRAIN_ROUTE } from '../../constant'

const WebSocket = (props) => {
  const [isTraining, setIsTraining] = useState(false)
  const [isPredicting, setIsPredicting] = useState(false)
  const [userId, setUserId] = useState('')
  const [trainingStatus, setTrainingStatus] = useState('')
  const [predictionStatus, setPredictionStatus] = useState('')
  const [progress, setProgress] = useState(0)
  const [time, setTime] = useState('')

  const startTrain = async () => {
    setIsTraining(true)

    const apiResponse = await axios.post(
      TRAIN_ROUTE,
      {
        user_id: userId,
        dataset_up_to_date: false // TODO get this from actual state
      }
    )

    setTime(apiResponse.data.status)
  }

  const togglePredict = async () => {
    if (isPredicting) {
      setIsPredicting(false)
      setPredictionStatus('')
    } else {
      setIsPredicting(true)
      setPredictionStatus('Prediction ...')
    }
    /* while (isPredicting) {
      setStatus(s => s + ' + Prediction ...')
    } */
    /*
    const apiResponse = await axios.post(
      TRAIN_ROUTE,
      {
        user_id: userId,
        dataset_up_to_date: false // TODO get this from actual state
      }
    ) */
  }

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT)

    socket.on('connected', data => setUserId(data.user_id))

    socket.on('status', data => {
      if (data.current === data.total) {
        setIsTraining(false)
        setProgress(0)
        setTrainingStatus(data.status)
        setTime(start => start + ', finished at ' + data.time)
      } else {
        setProgress(Math.floor(100 * data.current / data.total))
        setTrainingStatus(data.status)
      }
    })
  }, [ENDPOINT])

  return (
    <div>
      <Button
          variant="success"
          size="lg"
          disabled={isTraining}
          onClick={!isTraining ? startTrain : null}
          className="Button">
          { isTraining ? '🧠 Training model (' + progress + ' %)' : '🚀 Click to train' }
      </Button>
      <Button
          variant="success"
          size="lg"
          onClick={togglePredict}
          className="Button">
          { isPredicting ? '🚫 Stop classification' : '🦾 Try classification' }
      </Button>
      <br />
      { time }
      <h4 className="Message">{ trainingStatus }</h4>
      <h4 className="Message">{ predictionStatus }</h4>
    </div>
  )
}

export default WebSocket
