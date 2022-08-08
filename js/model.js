let model;

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/uFItTSZ94/";

// The minimum classification probability you need to make a "correct" classification
const PREDICTION_CONFIDENCE_THRESHOLD = .6;

// The number of classifications in a row you need to make a "correct" classification
const CONSECUTIVE_CORRECT_PREDICTION_THRESHOLD = 5;

const modelURL = URL + "model.json";
const metadataURL = URL + "metadata.json";

/**
 * Predicts with a given input and makes a 
 */
export async function predictAndInvokeHook(input, callback) {
  const prediction = await predict(input);
  updatePredictionList(prediction, callback);
}

// run the webcam image through the image model
export async function predict(input) {
  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // or files from your local hard drive
  // Note: the pose library adds "tmImage" object to your window (window.tmImage)
  model = await getModel()
  // predict can take in an image, video or canvas html element
  const prediction = await model.predict(input);
  return prediction;
}

export function extractCategory(predictionList) {
  const prediction = predictionList.filter(category => category['probability'] > PREDICTION_CONFIDENCE_THRESHOLD)[0];
  return prediction['className'];
}

export async function getTotalClasses() {
  const model = await getModel();
  return model.getTotalClasses();
}

let lastFivePredictions = [];
async function updatePredictionList(prediction, callback) {
  model = await getModel();
  const category = extractCategory(prediction);
  if (lastFivePredictions.length >= CONSECUTIVE_CORRECT_PREDICTION_THRESHOLD) {
    lastFivePredictions.pop()
  }
  lastFivePredictions.unshift(category);
  if (lastFivePredictions.every( (val, i, arr) => val === arr[0] ) && lastFivePredictions.length === CONSECUTIVE_CORRECT_PREDICTION_THRESHOLD) {
    const postiveId = lastFivePredictions[0];
    callback(postiveId);
  }
}

async function getModel() {
  if (model) {
    return model;
  } else {
    return await tmImage.load(modelURL, metadataURL);
  }
}


