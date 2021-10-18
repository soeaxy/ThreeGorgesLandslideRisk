/$$
 $ @Author: yxsong
 $ @Date: 2021-09-18 10:25:45
 $ @LastEditTime: 2021-10-18 14:50:49
 $ @LastEditors: yxsong
 $ @Description: 
 $ @FilePath: \ThreeGorgesLandslideRisk\js\ExportYichangGoujiaya.js
 $ @ 
 $/
// ROI
var HeHua = ee.FeatureCollection("users/wufvckshuo/Hehua_H49E006014"),
    YuanAn = ee.FeatureCollection("users/wufvckshuo/YuanAn_H49E006015"),
    HuangBoRiver = ee.FeatureCollection("users/wufvckshuo/HuangBoRiver");    
var fenxiang = ee.FeatureCollection("users/wufvckshuo/yichang/fenxiang");
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
  
var LT5_FengXiang_2009 = ee.ImageCollection("LANDSAT/LT05/C01/T1_SR")
            .filterBounds(fenxiang)
            .filterDate("2009-1-1", "2009-12-31")
            .filter(ee.Filter.lte("CLOUD_COVER", 50))
            .map(rmCloud)
            .map(scaleImage)

var LC8_FengXiang_2014 = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR")
            .filterBounds(fenxiang)
            .filterDate("2014-1-1", "2014-12-31")
            .filter(ee.Filter.lte("CLOUD_COVER", 50))
            .map(rmCloud)
            .map(scaleImage)

var LC8_FengXiang_2019 = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR")
            .filterBounds(fenxiang)
            .filterDate("2019-1-1", "2019-12-31")
            .filter(ee.Filter.lte("CLOUD_COVER", 50))
            .map(rmCloud)
            .map(scaleImage)

Map.addLayer(
  LT5_FengXiang_2009.median().clip(fenxiang), {bands: ['B4', 'B3', 'B2'], max: 128},'LT5_FengXiang_2009');
Map.centerObject(fenxiang,4);

Export.image.toDrive({
    image: LC8_FengXiang_2014.median().clip(fenxiang),
    description: 'LC8_FengXiang_2014',
    maxPixels:1e13,
    scale: 30,
    folder: 'Fenxiang',
    region: fenxiang.geometry()
    });
Export.image.toDrive({
    image: LC8_FengXiang_2019.median().clip(fenxiang),
    description: 'LC8_FengXiang_2019',
    maxPixels:1e13,
    scale: 30,
    folder: 'Fenxiang',
    region: fenxiang.geometry()
    });

function newFunction() {
    Export.image.toDrive({
        image: LT5_FengXiang_2009.median().clip(fenxiang),
        description: 'LT5_FengXiang_2009',
        maxPixels: 1e13,
        scale: 30,
        folder: 'Fenxiang',
        region: fenxiang.geometry()
    });
}

