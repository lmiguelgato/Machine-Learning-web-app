import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Webcam from "react-webcam";
import * as tf from '@tensorflow/tfjs';


function MLCamera(props) {
  const [capture, setCapture] = useState(false);

  const webcamRef = React.useRef(null);

  const takePicture = React.useCallback(
    () => {
      const imageSrc = webcamRef.current.getScreenshot();
      convertURIToImageData(imageSrc).then(function(imageData) {
        const tensorImage = tf.browser.fromPixels(imageData);
        const reversedImage = tensorImage.reverse(1);
        const croppedImage = cropImage(reversedImage);
        const batchedImage = croppedImage.expandDims(0).toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
      });
    },
    [webcamRef]
  );

  function convertURIToImageData(URI) {
    return new Promise(function(resolve, reject) {
      if (URI == null) return reject();
      var canvas = document.createElement('canvas'),
          context = canvas.getContext('2d'),
          image = new Image();
      image.addEventListener('load', function() {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(context.getImageData(0, 0, canvas.width, canvas.height));
      }, false);
      image.src = URI;
    });
  }

  const cropImage = (img) => {
    const size = Math.min(img.shape[0], img.shape[1]);
    const centerHeight = img.shape[0] / 2;
    const beginHeight = centerHeight - (size / 2);
    const centerWidth = img.shape[1] / 2;
    const beginWidth = centerWidth - (size / 2);
    return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
  }

  const toggleOnOff = () => {
      if (capture) {
        setCapture(false)
      } else {
        setCapture(true)
      }
  }

  return (
    <>
      { capture
        ? <>
          <Webcam audio={false}
            screenshotFormat="image/jpeg"
            ref={webcamRef}
            height="200px"
            className="WebCam"
          />
          </>
        : null
      }
      <br />      
      { capture 
          ? <Button
              variant="success"
              size="sm"
              onClick={takePicture}
              className="Button">
              📷 Capture
            </Button>
          : null
      }
      <Button className="Button"
      variant="success"
      size="sm"
      onClick={toggleOnOff}>
      { capture ? '⛔ Turn off webcam' : '🎥 Turn on webcam' }
      </Button>
    </>
  );
}

export default MLCamera;