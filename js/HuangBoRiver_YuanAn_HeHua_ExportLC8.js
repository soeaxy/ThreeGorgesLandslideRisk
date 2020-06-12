// ROI
    
var HeHua = ee.FeatureCollection("users/wufvckshuo/Hehua_H49E006014"),
    YuanAn = ee.FeatureCollection("users/wufvckshuo/YuanAn_H49E006015"),
    HuangBoRiver = ee.FeatureCollection("users/wufvckshuo/HuangBoRiver");    

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
function addNDVI(image) {
    return image.addBands(image.normalizedDifference(["B5", "B4"]).rename("NDVI"));
  }
  
var LT5_YuanAn_2009 = ee.ImageCollection("LANDSAT/LT05/C01/T1_SR")
            .filterBounds(xietan)
            .filterDate("2009-4-1", "2009-09-30")
            .filter(ee.Filter.lte("CLOUD_COVER", 50))
            .map(rmCloud)
            .map(scaleImage)
            .map(addNDVI);

Map.addLayer(
  LT5_YuanAn_2009.median().clip(xietan), {bands: ['B4', 'B3', 'B2'], max: 128},'LT5_YuanAn_2009');
Map.centerObject(xietan,4);

