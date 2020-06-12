// ROI
var xietan = ee.FeatureCollection("users/wufvckshuo/XietanNew"),
    nanyang = ee.FeatureCollection("users/wufvckshuo/NanyangNew");

//Landsat8 SR数据去云
function rmCloud(image) {
    var cloudShadowBitMask = (1 << 3);
    var cloudsBitMask = (1 << 5);
    var qa = image.select("pixel_qa");
    var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
                   .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
    return image.updateMask(mask);
  }
  
//缩放
function scaleImage(image) {
    var time_start = image.get("system:time_start");
    image = image.multiply(0.0001);
    image = image.set("system:time_start", time_start);
    return image;
  }
  
  //添加NDVI
  function NDVI(image) {
    return image.addBands(image.normalizedDifference(["B5", "B4"]).rename("NDVI"));
  }
  
var LC8Xietan = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR")
            .filterBounds(xietan)
            .filterDate("2015-1-1", "2015-12-31")
            .filter(ee.Filter.lte("CLOUD_COVER", 50))
            .map(rmCloud)
            .map(scaleImage)
            .map(NDVI);

var LC8Nanyang = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR")
            .filterBounds(nanyang)
            .filterDate("2015-1-1", "2015-12-31")
            .filter(ee.Filter.lte("CLOUD_COVER", 50))
            .map(rmCloud)
            .map(scaleImage)
            .map(NDVI);

// Add the resulting ImageCollection to the map, taking the median of
// overlapping pixel values.
Map.addLayer(
    LC8Xietan.median().clip(xietan), {},'LC8_Xietan');
Map.centerObject(xietan,4);

Export.image.toDrive({
    image: LC8Xietan.median().toFloat(),
    description: 'Landsat8_xietan',
    maxPixels:1e13,
    scale: 30,
    folder: 'xietan_nanyang',
    region: xietan.geometry()
  });

Export.image.toDrive({
    image: LC8Nanyang.median().toFloat(),
    description: 'Landsat8_nanyang',
    maxPixels:1e13,
    scale: 30,
    folder: 'xietan_nanyang',
    region: nanyang.geometry()
    });