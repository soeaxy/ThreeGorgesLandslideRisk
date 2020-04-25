var rock = ee.Image("users/wufvckshuo/rockThreeGorges");
var landslide = ee.FeatureCollection("users/wufvckshuo/Three_Gorges/ThreeGorges_Landslide"),
    DEM = ee.Image("USGS/SRTMGL1_003"),
    roi = ee.FeatureCollection("users/wufvckshuo/Three_Gorges/ThreeGorgesPolygon"),
    // 坡向 
    aspect = ee.Terrain.products(DEM).select('aspect'),
    // 坡度数据
    slope = ee.Terrain.slope(DEM);//Slope

//时间序列数据处理
 
var rock = ee.Image("users/wufvckshuo/rockThreeGorges");       
var l8Col = ee.ImageCollection("LANDSAT/LC08/C01/T1_TOA")
              .filterBounds(roi)
              .filterDate("2019-1-1", "2019-12-31")
              //去云
              .map(ee.Algorithms.Landsat.simpleCloudScore)
              .map(function(image) {
                return image.updateMask(image.select("cloud").lte(20));
              });

var visParam = {
  min: 0, 
  max: 0.3,
  bands: ["B4", "B3", "B2"]
};
Map.addLayer(l8Col.median().clip(roi), visParam, "l8Image");

//NDWI: (B03 - B05)/(B03 + B05)
function NDWI(image) {
  return image.addBands(
    image.normalizedDifference(["B3", "B5"])
      .rename("NDWI"));
}
  
//NDVI: (B05 - B04)/(B05 + B04)
function NDVI(img) {
  var ndvi = img.normalizedDifference(["B5","B4"]);
  return img.addBands(ndvi.rename("NDVI"));
}
  
//EVI: 2.5*(B05 - B04) / (B05 + 6*B04 - 7.5*B02 + 1)
function EVI(img) {
  var nir = img.select("B5");
  var red = img.select("B4");
  var blue = img.select("B2");
  var evi = img.expression(
    "2.5 * (B5 - B4) / (B5 + 6*B4 - 7.5*B2 + 1)",
    {
      "B5": nir,
      "B4": red,
      "B2": blue
    }
  );
  return img.addBands(evi.rename("EVI"));
}

function addSlope(img){
  return img.addBands(slope.rename("SLOPE"));
}
function addAspect(img){
  return img.addBands(aspect.rename("ASPECT"));
}
function addDEM(img){
  return img.addBands(DEM.rename("ELEVATION"));
}
//添加各种指数
l8Col = l8Col.map(NDVI)
             .map(NDWI)
             .map(EVI)
             .map(addSlope)
             .map(addAspect)
             .map(addDEM);
print(l8Col);

var l8Image = l8Col.median().clip(roi);
var bands = [
  "B1", "B2", "B3", "B4", "B5", "B6", "B7",
  "EVI", "NDWI", "NDVI","SLOPE", "ELEVATION"
];
var sampleData = ee.FeatureCollection("users/wufvckshuo/landslideSamplePoint");
//切分生成训练数据和验证数据
sampleData = sampleData.randomColumn('random');
var sample_training = sampleData.filter(ee.Filter.lte("random", 0.007)); 
var sample_validate  = sampleData.filter(ee.Filter.gt("random", 0.007));

//生成监督分类训练使用的样本数据
var training = l8Image.sampleRegions({
  collection: sample_training, 
  properties: ["Class"], 
  scale: 30
});

//生成监督分类验证使用的样本数据
var validation = l8Image.sampleRegions({
  collection: sample_validate, 
  properties: ["Class"], 
  scale: 30
});

//初始化分类器
var classifier =  ee.Classifier.smileRandomForest(50).train({
  features: training, 
  classProperty: "Class",
  inputProperties: bands
  
}).setOutputMode('PROBABILITY');

//影像数据调用classify利用训练数据训练得到分类结果
var classified = l8Image.classify(classifier);
//训练结果的混淆矩阵
var trainAccuracy = classifier.confusionMatrix();

//导出训练精度结果CSV
Export.table.toDrive({
  collection: ee.FeatureCollection([
    ee.Feature(null, {
      matrix: trainAccuracy.array(),
      kappa: trainAccuracy.kappa(),
      accuracy: trainAccuracy.accuracy()
    }
  )]),
  description: "l8TrainConf",
  folder:"training01",
  fileFormat: "CSV"
});
  
//导出影像
// var resultImg = classified.clip(roi).toByte();
var resultImg = classified.clip(roi);
Map.centerObject(resultImg,2);
var reclassedImg = resultImg.select(0).gt(0.2).add(resultImg.gt(0.4)).add(resultImg.gt(0.6)).add(resultImg.gt(0.8));

Map.addLayer(reclassedImg.randomVisualizer())
// resultImg = resultImg.remap([0,1,2,3,4], [1,2,3,4,5]);
Export.image.toAsset({
  image: resultImg, 
  description: 'Asset-l8Classifiedmap',
  assetId: "training01/l8Classifiedmap",
  region: roi,
  scale:30,
  crs: "EPSG:4326",
  maxPixels: 1e13
});

Export.image.toDrive({
  image:reclassedImg,
  description:'Drive-l8Classifiedmap',
  fileNamePrefix: "l8Classifiedmap",
  folder:"training01",
  region: roi,
  scale:300,
  crs: "EPSG:4326",
  maxPixels:1e13
});


//验证数据集合调用classify进行验证分析得到分类验证结果
var validated = validation.classify(classifier);
//验证结果的混淆矩阵
var testAccuracy = validated.errorMatrix("type", "classification");

//导出验证精度结果CSV
Export.table.toDrive({
  collection: ee.FeatureCollection([
    ee.Feature(null, {
      matrix: testAccuracy.array(),
      kappa: testAccuracy.kappa(),
      accuracy: testAccuracy.accuracy()
    }
  )]),
  description: "l8TestConf",
  folder:"training01",
  fileFormat: "CSV"
});
