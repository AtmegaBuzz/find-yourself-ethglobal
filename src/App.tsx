import { useEffect, useState } from 'react'
import './App.css'
import * as faceapi from "face-api.js"

function App() {
  const [refImages, setRefImgs] = useState<HTMLImageElement[] | null>(null);



  const loadModels = async () => {

    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

    console.log("Models Loaded")

  }

  const fileToImageElement = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string; // Cast to string
        img.onload = () => resolve(img);
        img.onerror = (error) => reject(error);
      };

      reader.onerror = (error) => reject(error);

      reader.readAsDataURL(file);
    });
  };

  const loadReferenceImages = async (filelist: FileList) => {
    const images = Array.from(filelist);
    const httpImages = await Promise.all(images.map((file) => fileToImageElement(file)))
    setRefImgs(httpImages);
  }


  const hasFace = async (findImageDetection: any, refImageDetections: any) => {

    const referenceDescriptors = new faceapi.LabeledFaceDescriptors("Reference Image", refImageDetections);
    const faceMatcher = new faceapi.FaceMatcher([referenceDescriptors]);

    const matchResults = findImageDetection.map((detection: any) => faceMatcher.findBestMatch(detection.descriptor));

    const hasMatch = matchResults.some((result: any) => result.label !== 'unknown' && result.distance < 0.6); // Adjust distance threshold as needed

    return hasMatch

  }

  const detectFaces = async () => {

    // Generate Rederence Image Detections 
    let allRefImageDescriptors: Float32Array<ArrayBufferLike>[] = []

    refImages?.map(async (refImage) => {
      const redImageDetection = await faceapi.detectSingleFace(refImage!).withFaceLandmarks().withFaceDescriptor();
      allRefImageDescriptors.push(redImageDetection?.descriptor!);
    })

    const findImages = ["/images/img1.jpg", "/images/img2.jpg", "/images/img3.jpg", "/images/img4.jpeg", "/images/img5.jpeg", "/images/img6.jpg", "/images/img7.jpg", "/images/img8.jpg", "/images/img9.jpeg", "/images/img10.jpg"]

    findImages.map(async (imgUrl) => {

      const findImg = await faceapi.fetchImage(imgUrl);
      const findImageDetection = await faceapi.detectAllFaces(findImg).withFaceLandmarks().withFaceDescriptors();


      const hsface = await hasFace(findImageDetection, allRefImageDescriptors);

      console.log(hsface, imgUrl)

    })

  }


  useEffect(() => {

    loadModels();

  }, [])

  return (
    <>

      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
          </div>
          <input id="dropzone-file" type="file" className="hidden" multiple accept="image/*" onChange={(e) => loadReferenceImages(e.target.files!)} />
        </label>
      </div>

      <div className='w-full flex justify-center items-center'>
        <button onClick={detectFaces}>Check</button>
      </div>

    </>
  )
}

export default App
