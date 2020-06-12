// ROI
    
var HeHua = ee.FeatureCollection("users/wufvckshuo/Hehua_H49E006014"),
    YuanAn = ee.FeatureCollection("users/wufvckshuo/YuanAn_H49E006015"),
    HuangBoRiver = ee.FeatureCollection("users/wufvckshuo/HuangBoRiver");  
    
var dataset = ee.ImageCollection('MODIS/006/MOD17A3HGF')
                  .filter(ee.Filter.date('2019-01-01', '2019-12-31'));
var npp = dataset.select('Npp');
var nppVis = {
  min: 0.0,
  max: 19000.0,
  palette: ['bbe029', '0a9501', '074b03'],
};
Map.setCenter(6.746, 46.529, 2);
Map.addLayer(npp, nppVis, 'NPP');

Export.image.toDrive({
    image: npp.median().clip(HuangBoRiver),
    description: 'npp_2019_HuangBoRiver',
    maxPixels:1e13,
    scale: 30,
    folder: 'yichang2020',
    region: HuangBoRiver.geometry()
    });

Export.image.toDrive({
    image: npp.median().clip(HeHua),
    description: 'npp_2019_HeHua',
    maxPixels:1e13,
    scale: 30,
    folder: 'yichang2020',
    region: HeHua.geometry()
    });
Export.image.toDrive({
    image: npp.median().clip(YuanAn),
    description: 'npp_2019_YuanAn',
    maxPixels:1e13,
    scale: 30,
    folder: 'yichang2020',
    region: YuanAn.geometry()
    });