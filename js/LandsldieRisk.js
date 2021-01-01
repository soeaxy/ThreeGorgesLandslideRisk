/**
 * @author [Yxsong]
 * @email [yxsong@cug.edu.cn]
 * @create date 2018-11-14 17:14:18
 * @modify date 2018-11-14 17:14:18
 * @desc [description]
 * The script is based on the modifications by RAin of NASA. 
 * Original codes: https://github.com/NASA-DEVELOP/RAiN
*/

//______________________________________________________________________________________________________________________________//
//Set variables calling on assets and collections
var LSM_NASA = ee.Image("users/wufvckshuo/Three_Gorges/ThreeGorges_LSM"), //三峡库区易发性图层
    // 三峡库区行政区划
    tabThreeGorges = ee.FeatureCollection("users/wufvckshuo/Three_Gorges/ThreeGorgesPolygon"),

    // 三峡库区历史滑坡分布
    landslide = ee.FeatureCollection("users/wufvckshuo/Three_Gorges/ThreeGorges_Landslide"),

    // TRMM降水
    TRMM = ee.ImageCollection('TRMM/3B42'), //TRMM Prescipitation Collection

    // MODIS陆地表面温度
    LSTcollection = ee.ImageCollection('MODIS/006/MOD11A2'), //MODIS Land Surface Temperature

    // NDWI指数
    NDWIcollection = ee.ImageCollection('MODIS/MOD09GA_006_NDWI'), //Terra MODIS NDWI collection

    // CHIRPS降水
    chirps = ee.ImageCollection("UCSB-CHG/CHIRPS/PENTAD"), //CHIRPS precipitation collection

    // NDVI
    NDVIcollection = ee.ImageCollection('MODIS/MOD09GA_006_NDVI'), //Terra MODIS NDVI collection

    // 全球地表水
    GSW = ee.Image('JRC/GSW1_0/GlobalSurfaceWater'), // Global Surface Water

    // 研究区边界
    NG = tabThreeGorges, // study area borders

    // 30m分辨率DEM
    srtm = ee.Image('USGS/SRTMGL1_003'), // Digital Elevation Model

    // GPM降水数据
    GPM = ee.ImageCollection('NASA/GPM_L3/IMERG_V06'), //Globap Recipitation Measurement Collection

    // 坡度数据
    slope = ee.Terrain.slope(srtm),//Slope

    // 坡向数据
    aspect = ee.Terrain.aspect(srtm);//Aspect
//______________________________________________________________________________________________________________________________//

Map.centerObject(tabThreeGorges);

var stDate = '2014-09-04';

//获取ago天前的日期YYYY-MM-DD
function getLastSevenDays(date, ago){
  var date = date || new Date(),
      timestamp, 
      newDate;
  if(!(date instanceof Date)){
      date = new Date(date.replace(/-/g, '/'));
  }
  timestamp = date.getTime();
  newDate = new Date(timestamp - ago * 24 * 3600 * 1000);
  var month = newDate.getMonth() + 1;
  month = month.toString().length == 1 ? '0' + month : month; 
  var day = newDate.getDate().toString().length == 1 ? '0' + newDate.getDate() :newDate.getDate();
  return [newDate.getFullYear(), month, day].join('-');
}



// print (dateRangeToday);
// Background info/// Intro panel has detail on how to use. Must re-run in order to bring it back


var panel_intro = ui.Panel();
panel_intro.style().set({ width: '620px',height: '550px', position: 'top-center',color: '#4874ba', fontWeight: 'bold'});
Map.add(panel_intro);

// Add a button to hide the Panel.
panel_intro.add(ui.Button({label: '关闭', style: {color: 'black'},
  onClick: function() {
    panel_intro.style().set('shown', false);}
}));

// Add the title text
var title = ui.Panel([ui.Label({value: '欢迎使用三峡库区滑坡风险动态评估集成工具', style: {fontSize: '25px', fontWeight: 'bold', textAlign: 'center',color:'black'}})]);
panel_intro.add(title);

var intro = ui.Panel([ui.Label({value: '在开始探索该工具之前，有一些使用工具的提示和技巧。'+
  '在屏幕的左下角有一个标有“探索”的按钮。按此按钮可以选择不同的图层进行可视化。 此外，您还可以选择要显示的图像的日期。 在屏幕的右下角，有一个标有“图例”的按钮。 在此面板中，将显示所有数据层的图例。 要关闭任一面板（图例或探索），请按地图上的任意位置。',
    style: {color: 'black',fontWeight: 'normal',}})]);
panel_intro.add(intro);

var intro2 = ui.Panel([ui.Label({value: '点击地图将显示降水，温度和植被绿度的时间序列图表。 带坐标的图表可以在屏幕右上角的控制台中找到。 请刷新以选择新坐标和时间序列图表。',
    style: {color: 'black',fontWeight: 'normal',}})]);
panel_intro.add(intro2);

var next = ui.Panel([ui.Label({value: '数据类型, 数据源, 分辨率, 日期, 静态/动态:',
    style: {color: 'black', fontWeight: 'bold'}})]);
panel_intro.add(next);

var nddi_data = ui.Panel([ui.Label({value: ' - 归一化干旱指数 (NDDI), NASA Terra MODIS-Calculated, 500 m, 2000 - 现在, 动态',
    style: {color: 'black', fontWeight: 'normal'}})]);
panel_intro.add(nddi_data);

var elv_data = ui.Panel([ui.Label({value: '- 高程, NASA SRTM, 30 m, 2000, 静态',
    style: {color: 'black', fontWeight: 'normal'}})]);
panel_intro.add(elv_data);

var chirps_data = ui.Panel([ui.Label({value: '- 降雨, Climate Hazards Group CHIRPS, 5 km, 1981 - 现在, Dynamic',
    style: {color: 'black', fontWeight: 'normal'}})]);
panel_intro.add(chirps_data);

var gpm_data = ui.Panel([ui.Label({value: '- 降雨, NASA GPM, 10 km,  2014 - 现在, 动态',
    style: {color: 'black', fontWeight: 'normal'}})]);
panel_intro.add(gpm_data);

var trmm_data = ui.Panel([ui.Label({value: '- 降雨, NASA TRMM, 25 km, 1998 - 2015, 动态',
    style: {color: 'black', fontWeight: 'normal'}})]);
panel_intro.add(trmm_data);

var ndwi_data = ui.Panel([ui.Label({value: ' - 地表水, ESA Joint Research Center, 30 m, 1984 - 2015, 静态',
    style: {color: 'black', fontWeight: 'normal'}})]);
panel_intro.add(ndwi_data);

var stemp_data = ui.Panel([ui.Label({value: '- 温度 (陆地表面), NASA Terra MODIS, 1 km, 2000 - 现在, 动态',
    style: {color: 'black', fontWeight: 'normal'}})]);
panel_intro.add(stemp_data);

var ndvi_data = ui.Panel([ui.Label({value: '- 植被指数 (NDVI), NASA Terra MODIS,  500 m,  2000 - 现在, 动态',
    style: {color: 'black', fontWeight:'normal'}})]);
panel_intro.add(ndvi_data);

var end = ui.Panel([ui.Label({value: '按“关闭”按钮开始浏览该工具。请享用！',
    style: {color: 'black', fontWeight: 'bold'}})]);
panel_intro.add(end);

//THIS IS THE DATE WRAPPER!!!
var getLayers = function(stDate){
  //this sets the date for the whole deal
  // var dateRange = ee.Date(stDate).getRange('week');
  var day_7ago = getLastSevenDays(stDate, 7);
  var day_6ago = getLastSevenDays(stDate, 6);
  var day_5ago = getLastSevenDays(stDate, 5);
  var day_4ago = getLastSevenDays(stDate, 4);
  var day_3ago = getLastSevenDays(stDate, 3);
  var day_2ago = getLastSevenDays(stDate, 2);
  var day_1ago = getLastSevenDays(stDate, 1);
  var day_0ago = getLastSevenDays(stDate, -1);

  var dateRange = ee.DateRange(day_7ago, stDate);
  var dateRange7 = ee.DateRange(day_7ago, day_6ago);
  var dateRange6 = ee.DateRange(day_6ago, day_5ago);
  var dateRange5 = ee.DateRange(day_5ago, day_4ago);
  var dateRange4 = ee.DateRange(day_4ago, day_3ago);
  var dateRange3 = ee.DateRange(day_3ago, day_2ago);
  var dateRange2 = ee.DateRange(day_2ago, day_1ago);
  var dateRange1 = ee.DateRange(day_1ago, stDate);
  var dateRangeToday = ee.DateRange(stDate, day_0ago);

  print(dateRange); // I would say keep this on so the user can see what is the latest imgs date. 
  Map.layers().reset();
//KEEP THIS ABOVE ANYTHING YOU DON'T WANT TO SHOW AT THE START


//===============LAYER FUNCTIONS ===============================================================================================//
// Surface water
GSW = GSW.select('change_norm').clip(NG),{};

// LST - MODIS image * 0.02 - 273.15 - Digital Number (DN) to Celsius
function convertToCelsius(image){
  var result = image.toFloat().multiply(0.02).subtract(273.15);
  result = result.copyProperties(image); 
  return result; 
}

// LST - load the MODIS raw data
var LSTrange = LSTcollection.select('LST_Day_1km').filterDate(dateRange).reduce(ee.Reducer.mean());
var cLST = ee.Image(convertToCelsius(LSTrange)).clip(NG);

// GPM
// Calculate rainfall in date and sum 
var GPMtrim = GPM.select('precipitationCal').filterDate(dateRange);
var GPMrangeSum = GPMtrim.reduce(ee.Reducer.sum()).divide(2).clip(NG);
//apply a mask to the image greater than 1
var GPMmaskSum = GPMrangeSum.updateMask(GPMrangeSum.gte(1));
// Export.image(GPMrangeSum, 'GPMrangeSum', {});

// 计算前7日降雨量
var GPMtrim1 = GPM.select('precipitationCal').filterDate(dateRange1);
var GPMrangeSum1 = GPMtrim1.reduce(ee.Reducer.sum()).divide(2).clip(NG);

var GPMtrim2 = GPM.select('precipitationCal').filterDate(dateRange2);
var GPMrangeSum2 = GPMtrim2.reduce(ee.Reducer.sum()).divide(2).clip(NG);

var GPMtrim3 = GPM.select('precipitationCal').filterDate(dateRange3);
var GPMrangeSum3 = GPMtrim3.reduce(ee.Reducer.sum()).divide(2).clip(NG);

var GPMtrim4 = GPM.select('precipitationCal').filterDate(dateRange4);
var GPMrangeSum4 = GPMtrim4.reduce(ee.Reducer.sum()).divide(2).clip(NG);

var GPMtrim5 = GPM.select('precipitationCal').filterDate(dateRange5);
var GPMrangeSum5 = GPMtrim5.reduce(ee.Reducer.sum()).divide(2).clip(NG);

var GPMtrim6 = GPM.select('precipitationCal').filterDate(dateRange6);
var GPMrangeSum6 = GPMtrim6.reduce(ee.Reducer.sum()).divide(2).clip(NG);

var GPMtrim7 = GPM.select('precipitationCal').filterDate(dateRange7);
var GPMrangeSum7 = GPMtrim7.reduce(ee.Reducer.sum()).divide(2).clip(NG);

var GPMtrim0 = GPM.select('precipitationCal').filterDate(dateRangeToday);
var GPMrangeSum0 = GPMtrim0.reduce(ee.Reducer.sum()).divide(2).clip(NG);

var Rain_MultiBand = GPMrangeSum7.addBands(GPMrangeSum6).addBands(GPMrangeSum5).addBands(GPMrangeSum4).addBands(GPMrangeSum3).addBands(GPMrangeSum2).addBands(GPMrangeSum1);

print(Rain_MultiBand);

// 计算日最大降雨量
var GPMrangeMax = Rain_MultiBand.reduce(ee.Reducer.max());
// Export.image(GPMrangeMax, 'GPMrangeMaxSignalDAy', {});

Export.image.toDrive({
  image: GPMrangeMax.toFloat(),
  description: 'GPMrangeMaxSignalDAy',
  maxPixels:1e13,
  scale: 1000,
  folder: 'ThreeGorgesRainNasa',
  region: NG.geometry()
});

// Export.image(GPMrangeSum1,'GPMrangeSum1');
// Export.image(GPMrangeSum2,'GPMrangeSum2');
// Export.image(GPMrangeSum3,'GPMrangeSum3');
// Export.image(GPMrangeSum4,'GPMrangeSum4');
// Export.image(GPMrangeSum5,'GPMrangeSum5');
// Export.image(GPMrangeSum6,'GPMrangeSum6');
// Export.image(GPMrangeSum7,'GPMrangeSum7');

Export.image.toDrive({
  image: GPMrangeSum1.toFloat(),
  description: 'GPMrangeSum1',
  maxPixels:1e13,
  scale: 1000,
  folder: 'ThreeGorgesRainNasa',
  region: NG.geometry()
});

Export.image.toDrive({
  image: GPMrangeSum2.toFloat(),
  description: 'GPMrangeSum2',
  maxPixels:1e13,
  scale: 1000,
  folder: 'ThreeGorgesRainNasa',
  region: NG.geometry()
});

Export.image.toDrive({
  image: GPMrangeSum3.toFloat(),
  description: 'GPMrangeSum3',
  maxPixels:1e13,
  scale: 1000,
  folder: 'ThreeGorgesRainNasa',
  region: NG.geometry()
});

Export.image.toDrive({
  image: GPMrangeSum4.toFloat(),
  description: 'GPMrangeSum4',
  maxPixels:1e13,
  scale: 1000,
  folder: 'ThreeGorgesRainNasa',
  region: NG.geometry()
});

Export.image.toDrive({
  image: GPMrangeSum5.toFloat(),
  description: 'GPMrangeSum5',
  maxPixels:1e13,
  scale: 1000,
  folder: 'ThreeGorgesRainNasa',
  region: NG.geometry()
});

Export.image.toDrive({
  image: GPMrangeSum6.toFloat(),
  description: 'GPMrangeSum6',
  maxPixels:1e13,
  scale: 1000,
  folder: 'ThreeGorgesRainNasa',
  region: NG.geometry()
});

Export.image.toDrive({
  image: GPMrangeSum7.toFloat(),
  description: 'GPMrangeSum7',
  maxPixels:1e13,
  scale: 1000,
  folder: 'ThreeGorgesRainNasa',
  region: NG.geometry()
});


// CHIRPS - Calculate rainfall in date range and clips
var rCHIRPS = chirps.select("precipitation").filterDate(dateRange);
var CHIRPSsum = rCHIRPS.reduce(ee.Reducer.mean()).clip(NG);
var cCHIRPS = CHIRPSsum.updateMask(CHIRPSsum.gte(1));

// 计算ARI分母
var wArray = new Array();
var sumW = 0.0;
for (var i=0;i<7;i++)
{
    wArray[i] = Math.pow(i+1,-2);
    sumW+=wArray[i];
}

// 计算ARI
 var ARI = (GPMrangeSum1.multiply(wArray[0]).add(GPMrangeSum2.multiply(wArray[1])).add(GPMrangeSum3.multiply(wArray[2])).add(GPMrangeSum4.multiply(wArray[3])).add(GPMrangeSum5.multiply(wArray[4])).add(GPMrangeSum6.multiply(wArray[5])).add(GPMrangeSum7.multiply(wArray[6]))).divide(sumW);

// Tropical Rainfall Measuring Mission (TRMM) - use dateRange to filter range and sum
var TRMMdate = TRMM.select('precipitation').filterDate(dateRange);
var TRMMrangeSum = TRMMdate.reduce(ee.Reducer.sum()).multiply(3).clip(NG);
var TRMMmaskSum = TRMMrangeSum.updateMask(TRMMrangeSum.gte(1));

// Normalized Difference Vegetation Index (NDVI)
var NDVIimages = NDVIcollection.filterDate(dateRange).reduce(ee.Reducer.mean());
var cNDVI = NDVIimages.clip(NG);

// Normalized Difference Water Index (NDWI)
var NDWIimages = NDWIcollection.filterDate(dateRange).reduce(ee.Reducer.mean());
var cNDWI = NDWIimages.clip(NG);

// Normalized Difference Drought Index (NDDI) - Do band math to find NDDI
var NDDI = cNDVI.subtract(cNDWI).divide(cNDVI.add(cNDWI));
var cNDDI = NDDI.clip(NG);

// Digital Elevation Model
var srtm_niger = ee.Image(srtm).clip(NG);

// Slope
var cSlope = slope.clip(NG);

// Aspect
var cAspect = aspect.clip(NG);

// LSM_NASA
var LSM_NASAViz = {min: 1, max: 5, palette: ['00FFFF', '0000FF', 'A0522D', 'FF00FF', 'FF0000']};

// Rain Reclassify
// var rainReclassify = cCHIRPS.gt(10).add(CHIRPSsum.gt(30)).add(CHIRPSsum.gt(60)).add(CHIRPSsum.gt(130));
var rainReclassify = GPMrangeSum.gt(10).add(GPMrangeSum.gt(30)).add(GPMrangeSum.gt(60)).add(GPMrangeSum.gt(100));
var rainReclassifyViz = {palette: ['000000', '0000FF', '00FF00', 'FFFF00', 'FF69B4', 'FF0000']};

//  Landslide Hazard Prediction
var landslideHazard = rainReclassify.add(LSM_NASA);
Export.image(landslideHazard,'landslideHazard',{});

var landslideHazardViz = {min:2, max: 10, palette: [ '0000FF', '00FF00', 'FFFF00', 'FF69B4', 'FF0000']};

// Create image collection from images
var stackCombinedImage = cSlope.addBands(cAspect).addBands(cNDVI).addBands(cNDDI).addBands(cNDWI).addBands(srtm_niger).addBands(cCHIRPS).addBands(cLST);
print('stackCombinedImage is : ',stackCombinedImage);

//================================LAND OF LEGENDS= ==[======> ===================================================================//

//_______________________________________________________________________________________________________________________________//
// Water (Precipitation, GRACE) Legend
var Waterviz = {min:0, max:600, palette: ['FFFFFF','fefbd8','04e9e7','019ff4','0300f4','02fd02']};

// Create legend title
var WaterlegendTitle = ui.Label({value: 'Rainfall',style: {fontWeight: 'bold',fontSize: '14px',
    margin: '0 0 4px 10',padding: '0'}});
// create text on top of legend
var mmPent = ui.Label({value:'(mm)'});
var mmMax = ui.Label({value: '100 / 600'});

// create the legend image
var lon = ee.Image.pixelLonLat().select('latitude');
var Watergradient = lon.multiply((Waterviz.max-Waterviz.min)/100.0).add(Waterviz.min);
var WaterlegendImage = Watergradient.visualize(Waterviz);
var GThumb = ui.Thumbnail({image: WaterlegendImage,params: {bbox:'0,0,20,100', dimensions:'20x250'},
    style: {padding: '1px', position: 'bottom-center'}});
var mmMin = ui.Label({value: '0 / 0'});

// set position of panel
var Waterlegend = ui.Panel({
  widgets: [WaterlegendTitle, mmPent, mmMax, GThumb, mmMin],
  style: {position: 'bottom-left',padding: '8px 4px'}});

// End  Water (Precipitation, GRACE) Legend______________________________________________________________________________________//

//_______________________________________________________________________________________________________________________________//
// Surface Water Change Legend
var Surfviz = {min:-100, max:100, palette: ['FF0000' ,'FFFFFF' , '0000FF']};

// Create legend title
var SurflegendTitle = ui.Label({value: 'Surface Water',style: {fontWeight: 'bold',fontSize: '14px',
    margin: '0 0 4px 10',padding: '0'}});
// create text on top of legend
var perc = ui.Label({value:'% Change'});
var Surfmax = ui.Label({value: '100'});

// create the legend image
var Surfgradient = lon.multiply((Surfviz.max-Surfviz.min)/100.0).add(Surfviz.min);
var SurflegendImage = Surfgradient.visualize(Surfviz);
var Surfthumb = ui.Thumbnail({image: SurflegendImage,params: {bbox:'0,0,20,100', dimensions:'20x250'}, 
    style: {padding: '1px', position: 'bottom-center'}});
var Surfmin = ui.Label({value: '-100'});

// set position of panel
var Surflegend = ui.Panel({
  widgets: [SurflegendTitle, perc, Surfmax, Surfthumb, Surfmin],
  style: {position: 'bottom-left',padding: '8px 4px'}});

// End Surf Legend_____________________________________________________________________________________________________________//


//______________________________________________________________________________________________________________________________//
// LST Legend 

// LST create vizualization parameters
var LSTviz = {min:14, max:50, palette:['4e7bb5', '5a83b8', '6c8db8', '7d99ba', '8ca4ba', 'a4b7bd', 'bec9bd', 
    'd9e0bf', 'edf0c0','ffffbf','ffe1a6','fab682','f7a372','f7a774','f0855b','ed7a53','e86b48','de4733', 'd62f27']};

// create the legend image
var gradient = lon.multiply((LSTviz.max-LSTviz.min)/100.0).add(LSTviz.min);
var LSTlegendImage = gradient.visualize(LSTviz);

var Lcl1 = 14;
var Lcl2 = 16;
var Lcl3 = 18;
var Lcl4 = 20;
var Lcl5 = 22;
var Lcl6 = 24;
var Lcl7 = 26;
var Lcl8 = 28;
var Lcl9 = 30;
var Lcl10 = 32;
var Lcl11 = 34;
var Lcl12 = 36;
var Lcl13 = 38;
var Lcl14 = 40;
var Lcl15 = 42;
var Lcl16 = 44;
var Lcl17 = 46;
var Lcl18 = 48;
var Lcl19 = 50;

// Define an sld style color ramp to apply to the image.
var LSTsld_ramp =
  '<RasterSymbolizer>' +
    '<ColorMap type="ramp" extended="false" >' +
      '<ColorMapEntry color="#ffffbf" quantity="0" label="0"/>' +
      '<ColorMapEntry color="#4e7bb5" quantity="'+Lcl1+'" label="'+Lcl1+'" />' +
      '<ColorMapEntry color="#5a83b8" quantity="'+Lcl2+'" label="'+Lcl2+'" />' +
      '<ColorMapEntry color="#6c8db8" quantity="'+Lcl3+'" label="'+Lcl3+'" />' +
      '<ColorMapEntry color="#7d99ba" quantity="'+Lcl4+'" label="'+Lcl4+'" />' +
      '<ColorMapEntry color="#8ca4ba" quantity="'+Lcl5+'" label="'+Lcl5+'" />' +
      '<ColorMapEntry color="#a4b7bd" quantity="'+Lcl6+'" label="'+Lcl6+'" />' +
      '<ColorMapEntry color="#bec9bd" quantity="'+Lcl7+'" label="'+Lcl7+'" />' +
      '<ColorMapEntry color="#d9e0bf" quantity="'+Lcl8+'" label="'+Lcl8+'" />' +
      '<ColorMapEntry color="#edf0c0" quantity="'+Lcl9+'" label="'+Lcl9+'" />' +
      '<ColorMapEntry color="#ffffbf" quantity="'+Lcl10+'" label="'+Lcl10+'" />' +
      '<ColorMapEntry color="#ffe1a6" quantity="'+Lcl11+'" label="'+Lcl11+'" />' +
      '<ColorMapEntry color="#fab682" quantity="'+Lcl12+'" label="'+Lcl12+'" />' +
      '<ColorMapEntry color="#f7a372" quantity="'+Lcl13+'" label="'+Lcl13+'" />' +
      '<ColorMapEntry color="#f7a774" quantity="'+Lcl14+'" label="'+Lcl14+'" />' +
      '<ColorMapEntry color="#f0855b" quantity="'+Lcl15+'" label="'+Lcl15+'" />' +
      '<ColorMapEntry color="#ed7a53" quantity="'+Lcl16+'" label="'+Lcl16+'" />' +
      '<ColorMapEntry color="#e86b48" quantity="'+Lcl17+'" label="'+Lcl17+'" />' +
      '<ColorMapEntry color="#de4733" quantity="'+Lcl18+'" label="'+Lcl18+'" />' +
      '<ColorMapEntry color="#d62f27" quantity="'+Lcl19+'" label="'+Lcl19+'" />' +
    '</ColorMap>' +
  '</RasterSymbolizer>';

var LSTnice = cLST.sldStyle(LSTsld_ramp);

var LSTTitle = ui.Label({value: 'Temp',style: {fontWeight: 'bold',fontSize: '14px',margin: '0 0 4px 10',padding: '0'}});
var LSTLabel = ui.Label('(C)');
var LSTMax = ui.Label(LSTviz.max);
var LSTThumb = ui.Thumbnail({image: LSTlegendImage,params: {bbox:'0,0,20,100', dimensions:'20x250'},
    style: {padding: '1px', position: 'bottom-center'}});
var LSTMin = ui.Label(LSTviz.min);

// set position of panel
var LSTlegend = ui.Panel({
  widgets: [LSTTitle, LSTLabel, LSTMax, LSTThumb, LSTMin],
  style: {position: 'bottom-left',padding: '8px 4px'}});

//End LST Legend________________________________________________________________________________________________________________//

//______________________________________________________________________________________________________________________________//
//GPM Legend

// create vizualization parameters
var GPMviz = {min:0, max:100, palette:['FFFFFF','646464', '04e9e7', '019ff4', '0300f4', '02fd02']};
 
var Gcl1 = 0;
var Gcl2 = 20;
var Gcl3 = 40;
var Gcl4 = 60;
var Gcl5 = 80;
var Gcl6 = 100;

// Define an sld style color ramp to apply to the image.
var GPMsld_ramp =
  '<RasterSymbolizer>' +
    '<ColorMap type="ramp" extended="false" >' +
      '<ColorMapEntry color="#FFFFFF" quantity="0" label="0"/>' +
      '<ColorMapEntry color="#04e9e7" quantity="'+Gcl1+'" label="'+Gcl1+'" />' +
      '<ColorMapEntry color="#019ff4" quantity="'+Gcl2+'" label="'+Gcl2+'" />' +
      '<ColorMapEntry color="#0300f4" quantity="'+Gcl3+'" label="'+Gcl3+'" />' +
      '<ColorMapEntry color="#02fd02" quantity="'+Gcl4+'" label="'+Gcl4+'" />' +
      '<ColorMapEntry color="#01c501" quantity="'+Gcl5+'" label="'+Gcl5+'" />' +
      '<ColorMapEntry color="#008e00" quantity="'+Gcl6+'" label="'+Gcl6+'" />' +
    '</ColorMap>' +
  '</RasterSymbolizer>';

var GPMnice = GPMmaskSum.sldStyle(GPMsld_ramp).clip(NG);

//______________________________________________________________________________________________________________________________//
// CHIRPS uses same legend as GRACE

var CHIRPSnice = CHIRPSsum.sldStyle(GPMsld_ramp);

//______________________________________________________________________________________________________________________________//
//TRMM uses same legend as GRACE
var TRMMnice = TRMMmaskSum.sldStyle(GPMsld_ramp).clip(NG);
var Slopenice = slope.sldStyle(GPMsld_ramp).clip(NG);


//______________________________________________________________________________________________________________________________//
//NDVI and NDDI use same NDVI legend

var NDVIviz = {min:0, max:0.35, palette:['d34b0c','d3620c','d37d0c','d3870c','d39b0c','d3b90c','d3c60c','cdd30c','bcd30c',
    '9ed30c','8ad30c','7ad30c','5cd30c','34d30c','0cd310','0cd331']};

var cl1 = 0;
var cl2 = 0.25;
var cl3 = 0.5;
var cl4 = 0.75;
var cl5 = 0.1;
var cl6 = 0.125;
var cl7 = 0.15;
var cl8 = 0.175;
var cl9 = 0.2;
var cl10 = 0.225;
var cl11 = 0.25;
var cl12 = 0.275;
var cl13 = 0.3;
var cl14 = 0.325;
var cl15 = 0.35;

var NDVIsld_ramp =
  '<RasterSymbolizer>' +
    '<ColorMap type="ramp" extended="false" >' +
      '<ColorMapEntry color="#d34b0c" quantity="0" label="0"/>' +
      '<ColorMapEntry color="#d3620c" quantity="'+cl1+'" label="'+cl1+'" />' +
      '<ColorMapEntry color="#d37d0c" quantity="'+cl2+'" label="'+cl2+'" />' +
      '<ColorMapEntry color="#d3870c" quantity="'+cl3+'" label="'+cl3+'" />' +
      '<ColorMapEntry color="#d39b0c" quantity="'+cl4+'" label="'+cl4+'" />' +
      '<ColorMapEntry color="#d3b90c" quantity="'+cl5+'" label="'+cl5+'" />' +
      '<ColorMapEntry color="#d3c60c" quantity="'+cl6+'" label="'+cl6+'" />' +
      '<ColorMapEntry color="#cdd30c" quantity="'+cl7+'" label="'+cl7+'" />' +
      '<ColorMapEntry color="#bcd30c" quantity="'+cl8+'" label="'+cl8+'" />' +
      '<ColorMapEntry color="#9ed30c" quantity="'+cl9+'" label="'+cl9+'" />' +
      '<ColorMapEntry color="#8ad30c" quantity="'+cl10+'" label="'+cl10+'" />' +
      '<ColorMapEntry color="#7ad30c" quantity="'+cl11+'" label="'+cl11+'" />' +
      '<ColorMapEntry color="#5cd30c" quantity="'+cl12+'" label="'+cl12+'" />' +
      '<ColorMapEntry color="#34d30c" quantity="'+cl13+'" label="'+cl13+'" />' +
      '<ColorMapEntry color="#0cd310" quantity="'+cl14+'" label="'+cl14+'" />' +
      '<ColorMapEntry color="#0cd331" quantity="'+cl15+'" label="'+cl15+'" />' +
    '</ColorMap>' +
  '</RasterSymbolizer>';

//visualize
var NDVInice = cNDVI.sldStyle(NDVIsld_ramp);
var NDWInice = cNDWI.sldStyle(NDVIsld_ramp);
// Create legend title
var NDVITitle = ui.Label({value: 'Veg / Drought',style: {fontWeight: 'bold',fontSize: '14px',margin: '0 0 4px 10',padding: '0'}});
var NDVImax = ui.Label({value: NDVIviz.max +' / 17.5'});
var NDVILabel = ui.Label({value: 'Indices'});

// create the legend image
var NDVIlon = ee.Image.pixelLonLat().select('latitude');
var NDVIgradient = NDVIlon.multiply((NDVIviz.max-NDVIviz.min)/100.0).add(NDVIviz.min);
var NDVIlegendImage = NDVIgradient.visualize(NDVIviz);
//create thumbnail of the image
var NDVIThumb = ui.Thumbnail({image: NDVIlegendImage,params: {bbox:'0,0,20,100', dimensions:'20x250'},
    style: {padding: '1px', position: 'bottom-center'}});
var NDVImin = ui.Label({value: NDVIviz.min +' / -17.5'});

// set position of panel and add wigets
var NDVIlegend = ui.Panel({
  style: {position: 'bottom-left',padding: '8px 4px'},
  widgets: [NDVITitle,NDVILabel, NDVImax, NDVIThumb, NDVImin]
});

//______________________________________________________________________________________________________________________________//

var NDDIviz = {min:-17.5, max:17.5, palette:['d34b0c','d3620c','d37d0c','d3870c','d39b0c','d3b90c','d3c60c',
    'cdd30c','bcd30c','9ed30c','8ad30c','7ad30c','5cd30c','34d30c','0cd310','0cd331']};

var Dcl1 = -17.5;
var Dcl2 = -15;
var Dcl3 = -12.5;
var Dcl4 = -10;
var Dcl5 = -7.5;
var Dcl6 = -5;
var Dcl7 = -2.5;
var Dcl8 = 0;
var Dcl9 = 2.5;
var Dcl10 = 5;
var Dcl11 = 7.5;
var Dcl12 = 10;
var Dcl13 = 12.5;
var Dcl14 = 15;
var Dcl15 = 17.5;

var NDDIsld_ramp =
  '<RasterSymbolizer>' +
    '<ColorMap type="ramp" extended="false" >' +
      '<ColorMapEntry color="#d34b0c" quantity="0" label="0"/>' +
      '<ColorMapEntry color="#d3620c" quantity="'+Dcl1+'" label="'+Dcl1+'" />' +
      '<ColorMapEntry color="#d37d0c" quantity="'+Dcl2+'" label="'+Dcl2+'" />' +
      '<ColorMapEntry color="#d3870c" quantity="'+Dcl3+'" label="'+Dcl3+'" />' +
      '<ColorMapEntry color="#d39b0c" quantity="'+Dcl4+'" label="'+Dcl4+'" />' +
      '<ColorMapEntry color="#d3b90c" quantity="'+Dcl5+'" label="'+Dcl5+'" />' +
      '<ColorMapEntry color="#d3c60c" quantity="'+Dcl6+'" label="'+Dcl6+'" />' +
      '<ColorMapEntry color="#cdd30c" quantity="'+Dcl7+'" label="'+Dcl7+'" />' +
      '<ColorMapEntry color="#bcd30c" quantity="'+Dcl8+'" label="'+Dcl8+'" />' +
      '<ColorMapEntry color="#9ed30c" quantity="'+Dcl9+'" label="'+Dcl9+'" />' +
      '<ColorMapEntry color="#8ad30c" quantity="'+Dcl10+'" label="'+Dcl10+'" />' +
      '<ColorMapEntry color="#7ad30c" quantity="'+Dcl11+'" label="'+Dcl11+'" />' +
      '<ColorMapEntry color="#5cd30c" quantity="'+Dcl12+'" label="'+Dcl12+'" />' +
      '<ColorMapEntry color="#34d30c" quantity="'+Dcl13+'" label="'+Dcl13+'" />' +
      '<ColorMapEntry color="#0cd310" quantity="'+Dcl14+'" label="'+Dcl14+'" />' +
      '<ColorMapEntry color="#0cd331" quantity="'+Dcl15+'" label="'+Dcl15+'" />' +
    '</ColorMap>' +
  '</RasterSymbolizer>';

var NDDInice = cNDDI.sldStyle(NDDIsld_ramp);
//_____________________________________________________________________________________________________________________________//

// Elevation legend 

var SRTMviz = {min: 200, max: 2022, palette: ['AFF0E9', 'F8FCB3', '2FAB2B', '12823F', 'F2A202', '870801', 'FFFCFF']};

// create the legend image
var SRTMgradient = lon.multiply((SRTMviz.max-SRTMviz.min)/100.0).add(SRTMviz.min);
var SRTMlegendImage = SRTMgradient.visualize(SRTMviz);

// Create legend title
var SRTMTitle = ui.Label({value: 'Elevation',style: {fontWeight: 'bold',fontSize: '14px',margin: '0 0 2px 8',padding: '0'}});
var SRTMlabel = ui.Label({value: '(m)'});
var SRTMmax = ui.Label(SRTMviz.max);
// create thumbnail from the image
var SRTMthumb = ui.Thumbnail({image: SRTMlegendImage,params: {bbox:'0,0,20,100', dimensions:'20x250'},
    style: {padding: '1px', position: 'bottom-center'}});
var SRTMmin = ui.Label(SRTMviz.min);

// Set position of panel
var SRTMlegend = ui.Panel({
  widgets:[SRTMTitle,SRTMlabel, SRTMmax, SRTMthumb, SRTMmin],
  style: {position: 'bottom-left',padding: '8px 4px',}});

//____________________________________________________________________________________________________________________________//

//____________________________________________________________________________________________________________________________//
// Panel Layers and Date Selector
//BUILDING THE MAP!!!

//Layers list
var layers = [
  ui.Map.Layer(NDDInice, {}, '归一化干旱指数（NDDI）:周平均', false),
  ui.Map.Layer(NDWInice,{},'归一化水体指数（NDWI）:周平均',false),
  ui.Map.Layer(srtm_niger, SRTMviz, '高程', false),
  ui.Map.Layer(CHIRPSnice, {}, '降雨 (CHIRPS): 周累积', false),
  ui.Map.Layer(GPMnice, {}, '降雨 (GPM): 周累积', true),
  ui.Map.Layer(TRMMnice, {}, '降雨 (TRMM): 周累积', false),
  ui.Map.Layer(GSW, Surfviz, '地表水: 改变', false),
  ui.Map.Layer(LSTnice, {}, '温度: 周平均', false),
  ui.Map.Layer(NDVInice, {} , '归一化植被指数（NDVI）: 周平均', false),
  ui.Map.Layer(Slopenice,{},'坡度',false),
  ui.Map.Layer(cAspect,{},'坡向',false),
  ui.Map.Layer(landslide,{},'历史滑坡',false),
  ui.Map.Layer(LSM_NASA,LSM_NASAViz,'滑坡易发性图层',false),
  ui.Map.Layer(rainReclassify,rainReclassifyViz,'降雨等级',false),
  ui.Map.Layer(ARI.sldStyle(GPMsld_ramp),{},'ARI指数',true),
  ui.Map.Layer(landslideHazard,landslideHazardViz,'滑坡风险预测',true),
];

// Export.image(cSlope,"cSlope");
// Export.image(cAspect,"cAspect");
// Export.image(srtm_niger,"srtm_niger");
// Export.image(GSW,"GSW");
// Export.image(cNDVI,"cNDVI");
// Export.image(cNDDI,"cNDDI");



//We need this magic button to add the layers
Map.layers().reset(layers);

//_____________DiDi's Amazing Panel Wizardry____ =====+*** _________________________________//

//The panel to hold all the layers
var panel_layers = ui.Panel({
  style: {width: '250px', height: '500px',position: 'top-left', color: 'black', shown: false}
});

Map.add(panel_layers);

//Top of left Panel intro
var intro = ui.Panel([ui.Label({value: '图层管理',style: {fontSize: '25px', fontWeight: 'bold'}}),]);

//Date panel... here lies the date selector funtionality. It calls functions at the top to reset and add updated layers to the map
var dateText = ui.Textbox({placeholder: 'yyyy-mm-dd', onChange: function(text){ },style: {width: '100px'}});

var dateButton = ui.Button({label: '导航', 
  onClick: function(){
  getLayers(dateText.getValue());
  }});

var datePanel = ui.Panel({layout: ui.Panel.Layout.flow('horizontal'), widgets:[dateText, dateButton], 
    style: {width: '200px', height: '60px', position:'top-right'}});

panel_layers.add(intro);
panel_layers.add(datePanel);
//

var nav = layers.map(function(layer) {
  var name = layer.getName();
  return ui.Button(name, function() {
    Map.layers().forEach(function(mapLayer) {
      mapLayer.setShown(mapLayer.getName() == name);
    });
  });
});

panel_layers.add(ui.Panel(nav, ui.Panel.Layout.flow('vertical')));

// Create a button to unhide the panel.
var button2 = ui.Button({
  label: '探索',
  style: {position: 'bottom-left', color: 'FF6700'},
  onClick: function() {
    // Hide the button.
    button2.style().set('shown', false);
    // Display the panel.
    panel_layers.style().set('shown', true);

    // Temporarily make a map click hide the panel
    // and show the button.
    var listenerId = Map.onClick(function() {
      panel_layers.style().set('shown', false);
      button2.style().set('shown', true);
      // Once the panel is hidden, the map should not try to close it by listening for clicks.
      Map.unlisten(listenerId);
    });
  }
});

// Add the button to the map and the panel to root.
Map.add(button2);

//_________________________________________________________________________________________________
// Panel Legends

var vertRamp = ui.Panel({
  widgets: [Waterlegend, LSTlegend, NDVIlegend, SRTMlegend, Surflegend],
  layout: ui.Panel.Layout.Flow('horizontal')
  });

var panel_legends = ui.Panel();
panel_legends.style().set({width: '590px',  height: '500px',  position: 'top-right',  color: 'black',  shown: false});

Map.add(panel_legends);

var Lintro = ui.Panel([
  ui.Label({
    value: '图例',
    style: {fontSize: '25px', fontWeight: 'bold'}
  }),
]);

// Add a button to close legend
  // Add a button to hide the Panel.
var Closebut = ui.Button({label: '关闭', style: {color: 'black'},
  onClick: function() {
    panel_legends.style().set('shown', false);
    button.style().set('shown', true);
    }
  });
//
// Add a button to hide the Panel.
var Welbut = ui.Button({label: '欢迎信息', style: {color: 'black'},
  onClick: function() {
    panel_intro.style().set('shown', true);}
  });
//

var buts = ui.Panel({layout: ui.Panel.Layout.flow('horizontal'), widgets:[Lintro, Welbut, Closebut], 
    style: {width: '500px', height: '60px', position:'top-right'}});

//panel_legends.add(Lintro);
panel_legends.add(buts);
panel_legends.add(vertRamp);
// panel_legends.add(aglegend);

// Create a button to unhide the panel.
var button = ui.Button({
  label: '图例',
  style: {position: 'bottom-right', color: 'FF6700'},
  onClick: function() {
    // Hide the button.
    button.style().set('shown', false);
    // Display the panel.
    panel_legends.style().set('shown', true);

    // Temporarily make a map click hide the panel
    // and show the button.
    var listenerId = Map.onClick(function() {
      panel_legends.style().set('shown', false);
      button.style().set('shown', true);
      // Once the panel is hidden, the map should not try to close it by listening for clicks.
      Map.unlisten(listenerId);
    });
  }
});

// Add the button to the map and the panel to root.
Map.add(button);

//START WRAPPER 
  };

getLayers(stDate);
//END WRAPPER

// Here lies the magic that makes the time series charts work when the map is pressed. Let's try to make this a control on the map

var lon = ui.Label();
var lat = ui.Label();

Map.onClick(function(coords) {
  lon.setValue('lon: '+ coords.lon);
  lat.setValue('lat: ' + coords.lat);
print('Longitude:', lon);
print('Latitude:', lat);
// Add a red dot to the map //
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  var dot = ui.Map.Layer(point, {color: '000000'}, 'Pixel Selector');
Map.layers().set(1, dot);
Map.style().set('cursor', 'crosshair');

// Print a Precipitaiton chart //
  var chart1 = ui.Chart.image.series(chirps, point, ee.Reducer.mean(), 1000);
  chart1.setSeriesNames(['Chirps']);
  chart1.setOptions({
    title: 'Total Precipitation Over Time',
    vAxis: {title: 'Rainfall (mm)'},
    hAxis: {title: 'Date', format: 'MM-yy', gridlines: {count: 8}},
  });
  //SidePanel.widgets().set(1, chart1);
print(chart1);
// Print a LST chart //
function convertToCelsius(image){
  var result = image.toFloat().multiply(0.02).subtract(273.15);
  result = result.copyProperties(image, ['system:time_start']); 
  return result; 
}
//Load the MODIS raw data
   var LSTchart = ee.ImageCollection('MODIS/MOD11A2').map(convertToCelsius);
   var chart2 = ui.Chart.image.series(LSTchart.select('LST_Day_1km'), point, ee.Reducer.mean(), 1000);
  chart2.setSeriesNames(['Land Surface Temperature']);
  chart2.setOptions({
    title: 'Land Surface Temperature Over Time',
    colors: ['#8e2108'],
    vAxis: {title: 'Temperature (°C)'},
    hAxis: {title: 'Date', format: 'MM-yy', gridlines: {count: 7}},
  });
  //SidePanel.widgets().set(3, chart2);
print(chart2);
// Print an NDVI chart //
   var bands = ee.ImageCollection('MODIS/MCD43A4_NDVI');
//Select date for bands
   var NDVIcollection = bands.select('NDVI');
   var chart3 = ui.Chart.image.series(NDVIcollection, point, ee.Reducer.mean(), 1000);
  chart3.setSeriesNames(['Normalized Difference Vegetation Index ']);
  chart3.setOptions({
    title: 'NDVI over time',
    colors: ['#137524'],
    vAxis: {title: 'Vegetation Greenness'},
    hAxis: {title: 'Date', format: 'MM-yy', gridlines: {count: 7}},
  });
  //SidePanel.widgets().set(2, chart3);
print(chart3);
});

//THIS IS THE END!!!!!.... of the code. :D
