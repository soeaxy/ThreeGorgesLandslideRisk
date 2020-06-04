// ROI
    
var HeHua = ee.FeatureCollection("users/wufvckshuo/Hehua_H49E006014"),
    YuanAn = ee.FeatureCollection("users/wufvckshuo/YuanAn_H49E006015"),
    HuangBoRiver = ee.FeatureCollection("users/wufvckshuo/HuangBoRiver");    

// var roi = ee.FeatureCollection("users/wufvckshuo/China_City").filter(ee.Filter.eq('NAME', '桂林市'));
var lib = require("users/wangweihappy0/myTrainingShare:training03/pubLibs");
var roi = YuanAn;
Map.centerObject(roi, 7);
Map.addLayer(ee.Image());
Map.addLayer(roi, {color:"red"}, "roi");

function getYearCol(sDate, eDate, lxCol, region) {
  var yearList = ee.List.sequence(ee.Date(sDate).get("year"), ee.Number(ee.Date(eDate).get("year")).subtract(1));
  var yearImgList = yearList.map(function(year) {
    year = ee.Number(year);
    var _sdate = ee.Date.fromYMD(year, 1, 1);
    var _edate = ee.Date.fromYMD(year.add(1), 1, 1);
    
    var tempCol = lxCol.filterDate(_sdate, _edate);
    var img = tempCol.max().clip(region);
    img = img.set("date", _sdate.format("yyyy"));
    img = img.set("system:index", _sdate.format("yyyy"));
    img = img.set("system:time_start", _sdate.millis());
    return img;
  });
  
  var yearImgCol = ee.ImageCollection.fromImages(yearImgList);
  return yearImgCol;
}

var startDate = "1988-01-01";
var endDate = "2020-01-01";
var l4Col = lib.getL4SRCollection(startDate, endDate, roi);
var l5Col = lib.getL5SRCollection(startDate, endDate, roi);
var l7Col = lib.getL7SRCollection("2012-1-1", "2013-1-1", roi);
var l8Col = lib.getL8SRCollection(startDate, endDate, roi);
var lxCol = l8Col.merge(l7Col)
                .merge(l5Col)
                .merge(l4Col)
                .filter(ee.Filter.calendarRange(4, 10, "month"))
                .sort("system:time_start");
var yearCol = getYearCol(startDate, endDate, lxCol, roi);
// print("yearCol", yearCol);
var visParam = {
  min: 0,
  max: 0.9,
  palette: [
    'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718', '74A901',
    '66A000', '529400', '3E8601', '207401', '056201', '004C00', '023B01',
    '012E01', '011D01', '011301'
  ],
};
// Map.addLayer(yearCol.select('NDVI').first(), visParam, "1988");

var dateList = yearCol.reduceColumns(ee.Reducer.toList(), ["date"])
                      .get("list");
// print("yearList", dateList);
dateList.evaluate(function(dates) {
  for (var i=0; i<dates.length; i++) {
    var image = yearCol.filter(ee.Filter.eq("date", dates[i])).first();
    Export.image.toAsset({
      image: image.toFloat(),
      description: "YuanAn-OLI-"+dates[i],
      assetId: "amazing/bjNDVI-"+dates[i],
      region: roi.geometry().bounds(),
      scale: 30, 
      maxPixels: 1e13
    });
  }
});

