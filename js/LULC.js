// 无UI版

// Define a region of interest as a point.  Change the coordinates
// to get a classification of any place where there is imagery.
var roi = ee.Geometry.Point(-122.3942, 37.7295);

var geometry = /* color: #d63000 */ee.Feature(
        ee.Geometry.Point([-122.0888, 37.1845]),
        {
          "prop1": 1,
          "system:index": "0"
        }),
    esri_lulc2020 = ee.ImageCollection("projects/sat-io/open-datasets/landcover/ESRI_Global-LULC_10m");
function addClassLabel(image) {
    return image.addBands(image.rename("CLASS"));
  }
// Load Landsat 5 input imagery.
var landsat = ee.Image(ee.ImageCollection('LANDSAT/LT05/C01/T1_TOA')
  // Filter to get only one year of images.
  .filterDate('1985-01-01', '1985-12-31')
  // Filter to get only images under the region of interest.
  .filterBounds(roi)
  // Sort by scene cloudiness, ascending.
  .sort('CLOUD_COVER')
  // Get the first (least cloudy) scene.
  .first());

// Compute cloud score.
var cloudScore = ee.Algorithms.Landsat.simpleCloudScore(landsat).select('cloud');

// Mask the input for clouds.  Compute the min of the input mask to mask
// pixels where any band is masked.  Combine that with the cloud mask.
var input = landsat.updateMask(landsat.mask().reduce('min').and(cloudScore.lte(50)));

// Use MODIS land cover, IGBP classification, for training.
var modis = ee.Image('MODIS/051/MCD12Q1/2011_01_01').select('Land_Cover_Type_1');

var lulc = ee.Image(esri_lulc2020.mean()).select("b1");

// Sample the input imagery to get a FeatureCollection of training data.
var training = input.addBands(lulc).sample({
  numPixels: 5000,
  seed: 0
});

// Make a Random Forest classifier and train it.
var classifier = ee.Classifier.smileRandomForest(10)
    .train({
      features: training,
      classProperty: 'b1',
      inputProperties: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7']
    });

// Classify the input imagery.
var classified = input.classify(classifier);

// Get a confusion matrix representing resubstitution accuracy.
var trainAccuracy = classifier.confusionMatrix();
print('Resubstitution error matrix: ', trainAccuracy);
print('Training overall accuracy: ', trainAccuracy.accuracy());

// Sample the input with a different random seed to get validation data.
var validation = input.addBands(lulc).sample({
  numPixels: 5000,
  seed: 1
  // Filter the result to get rid of any null pixels.
}).filter(ee.Filter.neq('B1', null));

// Classify the validation data.
var validated = validation.classify(classifier);

// Get a confusion matrix representing expected accuracy.
var testAccuracy = validated.errorMatrix('Land_Cover_Type_1', 'classification');
print('Validation error matrix: ', testAccuracy);
print('Validation overall accuracy: ', testAccuracy.accuracy());

// Define a palette for the IGBP classification.
var igbpPalette = [
  "#1A5BAB",
  "#358221",
  "#A7D282",
  "#87D19E",
  "#FFDB5C",
  "#EECFA8",
  "#ED022A",
  "#EDE9E4",
  "#F2FAFF",
  "#C8C8C8"
];

// Display the input and the classification.
Map.centerObject(roi, 10);
Map.addLayer(input, {bands: ['B3', 'B2', 'B1'], max: 0.4}, 'landsat');
Map.addLayer(classified, {palette: igbpPalette, min: 0, max: 17}, 'classification');