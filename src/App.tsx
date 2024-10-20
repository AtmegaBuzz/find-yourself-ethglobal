import { useEffect, useState } from 'react'
import './App.css'
import * as faceapi from "face-api.js"

function App() {
  const [refImage, setRefImg] = useState<HTMLImageElement | null>(null);



  const loadModels = async () => {

    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

  }

  const fetchRefImage = async () => {
    const refimg = await faceapi.fetchImage("/images/img4.jpeg");
    setRefImg(refimg);

  }


  const hasFace = async (image: HTMLImageElement) => {

    const findImageDetection = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();

    const redImageDetection = await faceapi.detectSingleFace(refImage!).withFaceLandmarks().withFaceDescriptor();


    const referenceDescriptors = new faceapi.LabeledFaceDescriptors("Reference Image", [redImageDetection?.descriptor!]);
    const faceMatcher = new faceapi.FaceMatcher([referenceDescriptors]);

    const matchResults = findImageDetection.map((detection) => faceMatcher.findBestMatch(detection.descriptor));

    const hasMatch = matchResults.some((result) => result.label !== 'unknown' && result.distance < 0.6); // Adjust distance threshold as needed

    return hasMatch

  }

  const detectFaces = async () => {

    await loadModels();

    await fetchRefImage();

    const findImages = ["/images/img1.jpg","/images/img2.jpg","/images/img3.jpg","/images/img4.jpeg","/images/img5.jpeg"]

    findImages.map(async (imgUrl)=> {

      const findImg = await faceapi.fetchImage(imgUrl);

      const hsface = await hasFace(findImg);

      console.log(hsface, imgUrl)

    })

  }


  useEffect(()=> {

    detectFaces();

  },[])

  return (
    <>
      <div className=' w-full h-[100vh] bg-red-400'>

      </div>
    </>
  )
}

export default App
