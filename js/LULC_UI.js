var l8Col = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR")
              //.filterBounds(districts)
              .filterDate("2018-5-1", "2018-10-1")
              .filter(ee.Filter.lte("CLOUD_COVER", 50))
              .map(rmCloud)
              .map(scaleImage)
              .map(NDVI);

var esri_lulc2020 = ee.ImageCollection("projects/sat-io/open-datasets/landcover/ESRI_Global-LULC_10m");
// var sampleArea = ee.FeatureCollection("users/balakumaran247/TN_Districts");

var l8Image = l8Col.select(["B1", "B2", "B3", "B4", "B5", "B6", "B7", "NDVI"]).median();
              //.clip(sampleArea);


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

var lulc = ee.Image(esri_lulc2020.mean()).select("b1");

var training = input.addBands(lulc).sample({
    numPixels: 5000,
    seed: 0
  });

// study area
var roi = ee.FeatureCollection("users/wufvckshuo/MiddleReachesOfYangtze");

var modis = ee.Image('MODIS/051/MCD12Q1/2011_01_01').select('Land_Cover_Type_1');

var lulc = ee.Image(esri_lulc2020.mean()).select("b1");

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

var S2 = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR"),
    train_image = l8Image,
    HuangBoRiver = ee.FeatureCollection("users/wufvckshuo/HuangBoRiver"),
    JuzhangRiver = ee.FeatureCollection("users/wufvckshuo/JuzhangRiver"),
    districts = roi,
    vegetation = 
    /* color: #d63000 */
    /* shown: false */
    geometry,
    waterbody = 
    /* color: #98ff00 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([78.19614950011885, 10.964513934235267]),
            {
              "class": 1,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([78.23237005065596, 10.959626589742268]),
            {
              "class": 1,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([78.23056760619795, 10.96459819808733]),
            {
              "class": 1,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([78.20919576476729, 10.95794127981695]),
            {
              "class": 1,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([78.20541921447432, 10.961986007510163]),
            {
              "class": 1,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([78.19034624164699, 10.969174231082917]),
            {
              "class": 1,
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([78.3111124514099, 10.966237956330897]),
            {
              "class": 1,
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([78.34604049290961, 10.959188209830582]),
            {
              "class": 1,
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([78.43286334482478, 10.940662403542344]),
            {
              "class": 1,
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([78.42367946115779, 10.948330933711588]),
            {
              "class": 1,
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([78.00915723547742, 11.041559863550845]),
            {
              "class": 1,
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([78.00572400793835, 11.042233797461098]),
            {
              "class": 1,
              "system:index": "11"
            }),
        ee.Feature(
            ee.Geometry.Point([78.00126081213757, 11.047625213046386]),
            {
              "class": 1,
              "system:index": "12"
            }),
        ee.Feature(
            ee.Geometry.Point([78.03789733892701, 11.434137563710939]),
            {
              "class": 1,
              "system:index": "13"
            }),
        ee.Feature(
            ee.Geometry.Point([78.03347705847047, 11.43308597142324]),
            {
              "class": 1,
              "system:index": "14"
            }),
        ee.Feature(
            ee.Geometry.Point([78.03918479925416, 11.432328822559157]),
            {
              "class": 1,
              "system:index": "15"
            }),
        ee.Feature(
            ee.Geometry.Point([78.01697963307105, 11.41987799600249]),
            {
              "class": 1,
              "system:index": "16"
            }),
        ee.Feature(
            ee.Geometry.Point([78.01672214100562, 11.422696385873914]),
            {
              "class": 1,
              "system:index": "17"
            }),
        ee.Feature(
            ee.Geometry.Point([78.0151342732688, 11.421013768424288]),
            {
              "class": 1,
              "system:index": "18"
            }),
        ee.Feature(
            ee.Geometry.Point([78.04125916075533, 11.438492996502799]),
            {
              "class": 1,
              "system:index": "19"
            }),
        ee.Feature(
            ee.Geometry.Point([78.03400646757906, 11.436978725656742]),
            {
              "class": 1,
              "system:index": "20"
            }),
        ee.Feature(
            ee.Geometry.Point([78.02696835112398, 11.409762534139443]),
            {
              "class": 1,
              "system:index": "21"
            }),
        ee.Feature(
            ee.Geometry.Point([78.20851823211311, 11.398123431124974]),
            {
              "class": 1,
              "system:index": "22"
            }),
        ee.Feature(
            ee.Geometry.Point([77.79061122384128, 11.60448737878705]),
            {
              "class": 1,
              "system:index": "23"
            }),
        ee.Feature(
            ee.Geometry.Point([77.78333059410251, 11.568892529839204]),
            {
              "class": 1,
              "system:index": "24"
            }),
        ee.Feature(
            ee.Geometry.Point([77.83053747276462, 11.569481138051584]),
            {
              "class": 1,
              "system:index": "25"
            }),
        ee.Feature(
            ee.Geometry.Point([77.82101026634372, 11.563805221571599]),
            {
              "class": 1,
              "system:index": "26"
            }),
        ee.Feature(
            ee.Geometry.Point([77.83336988548434, 11.56788348430962]),
            {
              "class": 1,
              "system:index": "27"
            }),
        ee.Feature(
            ee.Geometry.Point([77.82890668968356, 11.568976616802479]),
            {
              "class": 1,
              "system:index": "28"
            }),
        ee.Feature(
            ee.Geometry.Point([78.11641765468455, 11.614511679725872]),
            {
              "class": 1,
              "system:index": "29"
            }),
        ee.Feature(
            ee.Geometry.Point([78.1191642367158, 11.612914283509975]),
            {
              "class": 1,
              "system:index": "30"
            }),
        ee.Feature(
            ee.Geometry.Point([78.11135364406444, 11.599882551554842]),
            {
              "class": 1,
              "system:index": "31"
            }),
        ee.Feature(
            ee.Geometry.Point([78.11212612026073, 11.596183110289589]),
            {
              "class": 1,
              "system:index": "32"
            }),
        ee.Feature(
            ee.Geometry.Point([78.18977086802101, 11.710345361820384]),
            {
              "class": 1,
              "system:index": "33"
            }),
        ee.Feature(
            ee.Geometry.Point([78.19122998972512, 11.710177273321445]),
            {
              "class": 1,
              "system:index": "34"
            }),
        ee.Feature(
            ee.Geometry.Point([78.1792136933384, 11.689249457132643]),
            {
              "class": 1,
              "system:index": "35"
            }),
        ee.Feature(
            ee.Geometry.Point([78.17878453989601, 11.685887411433026]),
            {
              "class": 1,
              "system:index": "36"
            }),
        ee.Feature(
            ee.Geometry.Point([78.25053899546242, 11.720598566917644]),
            {
              "class": 1,
              "system:index": "37"
            }),
        ee.Feature(
            ee.Geometry.Point([78.2535430695591, 11.718581573029695]),
            {
              "class": 1,
              "system:index": "38"
            }),
        ee.Feature(
            ee.Geometry.Point([77.81365980968174, 11.032790064713806]),
            {
              "class": 1,
              "system:index": "39"
            }),
        ee.Feature(
            ee.Geometry.Point([77.81838049754795, 11.026977147042878]),
            {
              "class": 1,
              "system:index": "40"
            }),
        ee.Feature(
            ee.Geometry.Point([77.8086816297501, 11.03826589647334]),
            {
              "class": 1,
              "system:index": "41"
            }),
        ee.Feature(
            ee.Geometry.Point([77.86322995320698, 11.028720235790667]),
            {
              "class": 1,
              "system:index": "42"
            }),
        ee.Feature(
            ee.Geometry.Point([77.88909033532433, 11.083142562735594]),
            {
              "class": 1,
              "system:index": "43"
            }),
        ee.Feature(
            ee.Geometry.Point([77.90877089977346, 11.072564076286403]),
            {
              "class": 1,
              "system:index": "44"
            }),
        ee.Feature(
            ee.Geometry.Point([77.93409686985362, 11.068464228663249]),
            {
              "class": 1,
              "system:index": "45"
            }),
        ee.Feature(
            ee.Geometry.Point([77.89356735611715, 11.074478700251513]),
            {
              "class": 1,
              "system:index": "46"
            }),
        ee.Feature(
            ee.Geometry.Point([77.90041939946798, 11.170344431577128]),
            {
              "class": 1,
              "system:index": "47"
            }),
        ee.Feature(
            ee.Geometry.Point([77.88119332524923, 11.161460702519992]),
            {
              "class": 1,
              "system:index": "48"
            }),
        ee.Feature(
            ee.Geometry.Point([77.8685739383774, 11.171820242171684]),
            {
              "class": 1,
              "system:index": "49"
            })]),
    builtup = 
    /* color: #0b4a8b */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([78.00355898627333, 11.076356561512164]),
            {
              "class": 2,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([78.00162779578261, 11.07715676286614]),
            {
              "class": 2,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([78.00029742011122, 11.076272329663414]),
            {
              "class": 2,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([77.9998253513246, 11.072102822855362]),
            {
              "class": 2,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([77.99849497565322, 11.073029385055865]),
            {
              "class": 2,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([78.00222861060195, 11.070712974056883]),
            {
              "class": 2,
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([78.00347315558486, 11.070544507087575]),
            {
              "class": 2,
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([77.99068438300185, 11.075303661660561]),
            {
              "class": 2,
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([77.98956858405165, 11.074756152240926]),
            {
              "class": 2,
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([78.01905142554335, 11.069786404526397]),
            {
              "class": 2,
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([78.02012430914931, 11.07180800699484]),
            {
              "class": 2,
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([78.02016722449355, 11.071007791019925]),
            {
              "class": 2,
              "system:index": "11"
            }),
        ee.Feature(
            ee.Geometry.Point([78.0137299228578, 11.071218374383252]),
            {
              "class": 2,
              "system:index": "12"
            }),
        ee.Feature(
            ee.Geometry.Point([78.0090092349916, 11.07206070632204]),
            {
              "class": 2,
              "system:index": "13"
            }),
        ee.Feature(
            ee.Geometry.Point([78.0078934360414, 11.069070416972204]),
            {
              "class": 2,
              "system:index": "14"
            }),
        ee.Feature(
            ee.Geometry.Point([78.00600516089492, 11.069870638241213]),
            {
              "class": 2,
              "system:index": "15"
            }),
        ee.Feature(
            ee.Geometry.Point([78.00282942542128, 11.069365235588858]),
            {
              "class": 2,
              "system:index": "16"
            }),
        ee.Feature(
            ee.Geometry.Point([78.00081240424208, 11.069617937024065]),
            {
              "class": 2,
              "system:index": "17"
            }),
        ee.Feature(
            ee.Geometry.Point([78.00308691748671, 11.07951523833905]),
            {
              "class": 2,
              "system:index": "18"
            }),
        ee.Feature(
            ee.Geometry.Point([78.03162562140517, 11.071723773837306]),
            {
              "class": 2,
              "system:index": "19"
            }),
        ee.Feature(
            ee.Geometry.Point([78.03106772193007, 11.070586623838983]),
            {
              "class": 2,
              "system:index": "20"
            }),
        ee.Feature(
            ee.Geometry.Point([77.99115888830026, 11.048555699552173]),
            {
              "class": 2,
              "system:index": "21"
            }),
        ee.Feature(
            ee.Geometry.Point([77.9891847824653, 11.04821874004789]),
            {
              "class": 2,
              "system:index": "22"
            }),
        ee.Feature(
            ee.Geometry.Point([77.98774711843332, 11.052388586676571]),
            {
              "class": 2,
              "system:index": "23"
            }),
        ee.Feature(
            ee.Geometry.Point([77.98684589620431, 11.052430706037125]),
            {
              "class": 2,
              "system:index": "24"
            }),
        ee.Feature(
            ee.Geometry.Point([77.99581068875146, 11.055643957953945]),
            {
              "class": 2,
              "system:index": "25"
            }),
        ee.Feature(
            ee.Geometry.Point([77.9961969268496, 11.056086206029176]),
            {
              "class": 2,
              "system:index": "26"
            }),
        ee.Feature(
            ee.Geometry.Point([77.99510258557153, 11.05855983544083]),
            {
              "class": 2,
              "system:index": "27"
            }),
        ee.Feature(
            ee.Geometry.Point([77.99703377606225, 11.057843820454073]),
            {
              "class": 2,
              "system:index": "28"
            }),
        ee.Feature(
            ee.Geometry.Point([77.99748438717675, 11.056685557214397]),
            {
              "class": 2,
              "system:index": "29"
            }),
        ee.Feature(
            ee.Geometry.Point([77.99465197445703, 11.057949116885316]),
            {
              "class": 2,
              "system:index": "30"
            }),
        ee.Feature(
            ee.Geometry.Point([77.99336451412988, 11.059612795479744]),
            {
              "class": 2,
              "system:index": "31"
            }),
        ee.Feature(
            ee.Geometry.Point([77.99295681835962, 11.058833605414783]),
            {
              "class": 2,
              "system:index": "32"
            }),
        ee.Feature(
            ee.Geometry.Point([77.99273193107453, 11.053177009048033]),
            {
              "class": 2,
              "system:index": "33"
            }),
        ee.Feature(
            ee.Geometry.Point([77.99133718238679, 11.05361926084343]),
            {
              "class": 2,
              "system:index": "34"
            }),
        ee.Feature(
            ee.Geometry.Point([77.99099385963288, 11.05389303543022]),
            {
              "class": 2,
              "system:index": "35"
            }),
        ee.Feature(
            ee.Geometry.Point([77.99238860832062, 11.055935806971332]),
            {
              "class": 2,
              "system:index": "36"
            }),
        ee.Feature(
            ee.Geometry.Point([77.9929250501236, 11.055851569250938]),
            {
              "class": 2,
              "system:index": "37"
            }),
        ee.Feature(
            ee.Geometry.Point([77.99941412234222, 11.051915894328634]),
            {
              "class": 2,
              "system:index": "38"
            }),
        ee.Feature(
            ee.Geometry.Point([77.99896351122771, 11.052126491410288]),
            {
              "class": 2,
              "system:index": "39"
            }),
        ee.Feature(
            ee.Geometry.Point([78.00281580591336, 11.044217237402309]),
            {
              "class": 2,
              "system:index": "40"
            }),
        ee.Feature(
            ee.Geometry.Point([78.00905998850003, 11.044785864094065]),
            {
              "class": 2,
              "system:index": "41"
            }),
        ee.Feature(
            ee.Geometry.Point([78.0117207398428, 11.044132996317268]),
            {
              "class": 2,
              "system:index": "42"
            }),
        ee.Feature(
            ee.Geometry.Point([77.99891050958767, 11.045775693114997]),
            {
              "class": 2,
              "system:index": "43"
            }),
        ee.Feature(
            ee.Geometry.Point([77.9993825783743, 11.045544031302907]),
            {
              "class": 2,
              "system:index": "44"
            }),
        ee.Feature(
            ee.Geometry.Point([77.99833029599338, 11.04825672438208]),
            {
              "class": 2,
              "system:index": "45"
            }),
        ee.Feature(
            ee.Geometry.Point([77.99768656582981, 11.048741103485106]),
            {
              "class": 2,
              "system:index": "46"
            }),
        ee.Feature(
            ee.Geometry.Point([78.07431842112068, 11.045842713580873]),
            {
              "class": 2,
              "system:index": "47"
            }),
        ee.Feature(
            ee.Geometry.Point([78.0738892676783, 11.045863773731732]),
            {
              "class": 2,
              "system:index": "48"
            }),
        ee.Feature(
            ee.Geometry.Point([78.06215192102913, 11.040156417572753]),
            {
              "class": 2,
              "system:index": "49"
            })]),
    wasteland = /* color: #ffc82d */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([78.01013035430154, 11.072418715260826]),
            {
              "class": 3,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([78.15471000686411, 11.51596750737192]),
            {
              "class": 3,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([78.15594587740006, 11.517014466395542]),
            {
              "class": 3,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([78.14998064455094, 11.51596318284509]),
            {
              "class": 3,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([78.15154705461563, 11.51417599178998]),
            {
              "class": 3,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([78.1504956286818, 11.515080101625522]),
            {
              "class": 3,
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([78.17510757860245, 11.514344198491075]),
            {
              "class": 3,
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([78.17551527437271, 11.5152483077859]),
            {
              "class": 3,
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([78.18112249620053, 11.514580187905864]),
            {
              "class": 3,
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([78.14599400159562, 11.494482710638861]),
            {
              "class": 3,
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([78.14837580320085, 11.49571280587302]),
            {
              "class": 3,
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([78.10556103788744, 11.519583746140624]),
            {
              "class": 3,
              "system:index": "11"
            }),
        ee.Feature(
            ee.Geometry.Point([78.1075887879027, 11.519972716503577]),
            {
              "class": 3,
              "system:index": "12"
            }),
        ee.Feature(
            ee.Geometry.Point([78.10725619398485, 11.520340660946163]),
            {
              "class": 3,
              "system:index": "13"
            }),
        ee.Feature(
            ee.Geometry.Point([78.07745158854239, 11.524314804824153]),
            {
              "class": 3,
              "system:index": "14"
            }),
        ee.Feature(
            ee.Geometry.Point([78.07616412821524, 11.524714281167787]),
            {
              "class": 3,
              "system:index": "15"
            }),
        ee.Feature(
            ee.Geometry.Point([78.07564914408438, 11.525744507012028]),
            {
              "class": 3,
              "system:index": "16"
            }),
        ee.Feature(
            ee.Geometry.Point([78.09714881441862, 11.527605211464142]),
            {
              "class": 3,
              "system:index": "17"
            }),
        ee.Feature(
            ee.Geometry.Point([78.0994164713648, 11.533423184584375]),
            {
              "class": 3,
              "system:index": "18"
            }),
        ee.Feature(
            ee.Geometry.Point([78.1000816592005, 11.533086793920413]),
            {
              "class": 3,
              "system:index": "19"
            }),
        ee.Feature(
            ee.Geometry.Point([78.11880355350519, 11.541488673835369]),
            {
              "class": 3,
              "system:index": "20"
            }),
        ee.Feature(
            ee.Geometry.Point([78.11824565403009, 11.541993244575954]),
            {
              "class": 3,
              "system:index": "21"
            }),
        ee.Feature(
            ee.Geometry.Point([78.12300087161543, 11.540103921582496]),
            {
              "class": 3,
              "system:index": "22"
            }),
        ee.Feature(
            ee.Geometry.Point([78.14816932817537, 11.5384711271997]),
            {
              "class": 3,
              "system:index": "23"
            }),
        ee.Feature(
            ee.Geometry.Point([78.14814787050325, 11.537819381641954]),
            {
              "class": 3,
              "system:index": "24"
            }),
        ee.Feature(
            ee.Geometry.Point([78.15035801073152, 11.537525044442377]),
            {
              "class": 3,
              "system:index": "25"
            }),
        ee.Feature(
            ee.Geometry.Point([78.15098028322298, 11.536831248393545]),
            {
              "class": 3,
              "system:index": "26"
            }),
        ee.Feature(
            ee.Geometry.Point([78.15072279115755, 11.536158474829698]),
            {
              "class": 3,
              "system:index": "27"
            }),
        ee.Feature(
            ee.Geometry.Point([78.14911346574861, 11.537861429788123]),
            {
              "class": 3,
              "system:index": "28"
            }),
        ee.Feature(
            ee.Geometry.Point([78.15111727061101, 11.538744439402512]),
            {
              "class": 3,
              "system:index": "29"
            }),
        ee.Feature(
            ee.Geometry.Point([78.15165371241399, 11.538933655387005]),
            {
              "class": 3,
              "system:index": "30"
            }),
        ee.Feature(
            ee.Geometry.Point([78.1515464240534, 11.539732565915031]),
            {
              "class": 3,
              "system:index": "31"
            }),
        ee.Feature(
            ee.Geometry.Point([78.16511071795716, 11.548600007974597]),
            {
              "class": 3,
              "system:index": "32"
            }),
        ee.Feature(
            ee.Geometry.Point([78.16584027880921, 11.548789217311464]),
            {
              "class": 3,
              "system:index": "33"
            }),
        ee.Feature(
            ee.Geometry.Point([78.16575444812074, 11.549840377969]),
            {
              "class": 3,
              "system:index": "34"
            }),
        ee.Feature(
            ee.Geometry.Point([78.1648103105475, 11.55005060962759]),
            {
              "class": 3,
              "system:index": "35"
            }),
        ee.Feature(
            ee.Geometry.Point([78.16654838198914, 11.549609122962469]),
            {
              "class": 3,
              "system:index": "36"
            }),
        ee.Feature(
            ee.Geometry.Point([78.12177897871173, 11.547241816122176]),
            {
              "class": 3,
              "system:index": "37"
            }),
        ee.Feature(
            ee.Geometry.Point([78.12225104749835, 11.546316786379482]),
            {
              "class": 3,
              "system:index": "38"
            }),
        ee.Feature(
            ee.Geometry.Point([78.17265230070933, 11.52620733975045]),
            {
              "class": 3,
              "system:index": "39"
            }),
        ee.Feature(
            ee.Geometry.Point([78.17308145415171, 11.525955040308562]),
            {
              "class": 3,
              "system:index": "40"
            }),
        ee.Feature(
            ee.Geometry.Point([78.17316728484019, 11.525450440745118]),
            {
              "class": 3,
              "system:index": "41"
            }),
        ee.Feature(
            ee.Geometry.Point([78.17995626244588, 11.518751851998662]),
            {
              "class": 3,
              "system:index": "42"
            }),
        ee.Feature(
            ee.Geometry.Point([78.18004209313436, 11.519151336248786]),
            {
              "class": 3,
              "system:index": "43"
            }),
        ee.Feature(
            ee.Geometry.Point([78.17989188942953, 11.519719023417181]),
            {
              "class": 3,
              "system:index": "44"
            }),
        ee.Feature(
            ee.Geometry.Point([78.18270284447713, 11.519382616344648]),
            {
              "class": 3,
              "system:index": "45"
            }),
        ee.Feature(
            ee.Geometry.Point([78.02244474263726, 10.890637619478897]),
            {
              "class": 3,
              "system:index": "46"
            }),
        ee.Feature(
            ee.Geometry.Point([78.02139331670342, 10.890532263406097]),
            {
              "class": 3,
              "system:index": "47"
            }),
        ee.Feature(
            ee.Geometry.Point([78.02025606008111, 10.891817604947562]),
            {
              "class": 3,
              "system:index": "48"
            }),
        ee.Feature(
            ee.Geometry.Point([78.50500104394288, 10.842176962508418]),
            {
              "class": 3,
              "system:index": "49"
            })]);

var now = ee.Date(Date.now()); // Today
var present_year = now.get('year'); // Year to be displayed in Title
var start_date = now.advance(-6, 'month'); // 6 Months before Today

ui.root.clear(); // Clear default UI to use custom layout and widgets

var title = ui.Label('Yichang Landuse/Landcover Classification', {
  stretch: 'horizontal',
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: '24px'
});
present_year.evaluate(function(value){
  title.setValue('Yichang Landuse/Landcover Classification - '+ 
    JSON.stringify(value))});

var map_properties = function (map) {
  /* Changes the properties and style of the Map */
  var styledMapType = {
  Grey: [
    {stylers: [{ saturation: -80 }]},
    { featureType: 'road', elementType: 'geometry',
      stylers: [{ lightness: 100 },{ visibility: 'simplified' }]},
    { featureType: 'road', elementType: 'labels'},
    { featureType: 'water', stylers: [{ visibility: 'simplified' }]},
    { featureType: "administrative", elementType: "geometry", 
                    stylers: [{ visibility: 'simplified' }]}
  ]
  };
  map.setOptions("Grey", styledMapType);
  map.setControlVisibility({
    all: false,
    zoomControl: true,
    scaleControl: true,});
  return map;
};

function maskS2clouds(image) {
  /* removal of clouds by using the 'QA60' band */
  var qa = image.select('QA60');
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  return image.updateMask(mask);
}

var state_map = ui.Map();
map_properties(state_map);
state_map.addLayer(districts, {color: 'black'}, 'boundary');
state_map.centerObject(districts);
/* Welcome Screen - Title and styled map
with TN districts layer and District Selector */
ui.root.widgets().reset([title, state_map]);
ui.root.setLayout(ui.Panel.Layout.Flow('vertical'));

var calNDVI = function (image) {
  var ndvi = image.normalizedDifference(['B5', 'B4']).rename('NDVI');
  return image.addBands(ndvi);
};
var calNDWI = function (image) {
  var ndwi = image.normalizedDifference(['B3', 'B5']).rename('NDWI');
  return image.addBands(ndwi);
};

/* Training the Random Forest Classifier with Sentinel2 image */
var newfc = vegetation.merge(waterbody).merge(builtup).merge(wasteland);
var bands = ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "NDVI"];
//train_image = calNDVI(train_image);
//train_image = calNDWI(train_image);
// var training = train_image.select(bands).sampleRegions({
//   collection: newfc, 
//   properties: ['class'], 
//   scale: 30,
//   tileScale: 16,
// });
// var classifier = ee.Classifier.smileRandomForest(10).train({
//   features: training, 
//   classProperty: 'class', 
//   inputProperties: bands,
// });

// Make a Random Forest classifier and train it.
var classifier = ee.Classifier.smileRandomForest(10)
    .train({
      features: training,
      classProperty: 'b1',
      inputProperties: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7']
    });

// Classify the input imagery.
var classified = input.classify(classifier);

var calculation = function (district) {
  /* RF Classification, Statistics and Widgets */
  var district_label = ui.Label(district, {
    fontWeight: 'bold',
    fontSize: '22px',
    position: 'top-center'});
  // Filter the selected district from the districts file
  district = districts.filter(ee.Filter.eq('dist_name', district));
  var S2_bands = ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "NDVI"];
  // var S2_collection = S2.filterDate(start_date, now)
  //                   .filterBounds(district)
  //                   .select(S2_bands)
  //                   .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 10)
  //                   .sort('CLOUDY_PIXEL_PERCENTAGE', false).map(maskS2clouds);
  
  var image = l8Col.median().clip(district);
  //image = calNDVI(image);
  image = calNDWI(image);
  // RF Classification for the selected district
  var classified = image.select(S2_bands).classify(classifier);
  classified = classified.clipToCollection(district);
  
  ui.root.remove(state_map); //removes the welcome screen map
  var classified_map = ui.Map(); //map to display the classification layer
  map_properties(classified_map);
  
  var classification_palette = ['#00FF00', '#0000FF', '#FF0000', '#FFC0CB'];
  classified_map.addLayer(classified, 
          {min: 0, max: 3, palette: classification_palette}, 
          'classification');
  classified_map.centerObject(district);
  classified_map.add(district_label);
  
  var callout = ui.Map(); //callout for S2 image inside classification map
  map_properties(callout);
  callout.setControlVisibility({zoomControl: false, scaleControl: false});
  callout.style().set({
    border: '1.5px solid black',
    position: 'bottom-left',
    height: '100px',
    width: '100px',
  });
  var rgbViz = {min: 0,max: 2500, bands: ['B4', 'B3', 'B2']};
  callout.addLayer(image, rgbViz, 'RGB');
  classified_map.add(callout);
  var callout_label = ui.Label('Landsat-8', {position: 'top-left'});
  callout.add(callout_label);
  
  var panel_left = ui.Panel(); //panel for NDVI and NDWI maps
  panel_left.style().set({
    width: '30%',
    height: '100%',
    border: '1px solid black',
    position: 'middle-left',
    stretch: 'vertical',
  });
  
  var panel_right = ui.Panel();// Legend, District map & statistics
  panel_right.style().set({
    width: '20%',
    height: '100%',
    border: '1px solid black',
    position: 'middle-right',
    stretch: 'vertical',
  });
  
  var ndvi_map = ui.Map();
  map_properties(ndvi_map);
  ndvi_map.style().set({border: '1px solid black', margin: '4px'});
  var ndviViz = {
    min: 0, 
    max: 0.6, 
    palette: ['#FF0000', '#FF8C00', '#FFFF00', '#32CD32', '#006400']
  };
  ndvi_map.addLayer(image.select('NDVI').clipToCollection(district), ndviViz, 'NDVI');
  panel_left.add(ndvi_map);
  var ndvi_label = ui.Label('NDVI', {
    fontWeight: 'bold',
    fontSize: '18px',
    position: 'top-center'
  });
  ndvi_map.add(ndvi_label);
  
  var ndwi_map = ui.Map();
  map_properties(ndwi_map);
  ndwi_map.style().set({border: '1px solid black', margin: '4px'});
  var ndwiViz = {
    min: -0.4, 
    max: 0.1, 
    palette: ['#ff0000', '#FF8C00', '#FFFF00', '#0000FF']
  };
  ndwi_map.addLayer(image.select('NDWI').clipToCollection(district), ndwiViz, 'NDWI');
  panel_left.add(ndwi_map);
  var ndwi_label = ui.Label('NDWI', {
    fontWeight: 'bold',
    fontSize: '18px',
    position: 'top-center'
  });
  ndwi_map.add(ndwi_label);
  
  //Link all maps for actions (pan,zoom) to be synced between them
  var linker = ui.Map.Linker([classified_map, ndvi_map, ndwi_map, callout]);
  
  //Legend for the 4 classes, placed in the right panel
  var legend = ui.Panel({
  style: {
    border: '1px solid black',
    margin: '4px',
    height: '124px',
    stretch: 'horizontal',
    }
  });
  var legendTitle = ui.Label('Legend',{fontWeight: 'bold',fontSize: '18px',});
  legend.add(legendTitle);
  var makeRow = function(color, name) {
      var colorBox = ui.Label({
        style: {
          backgroundColor: color,
          padding: '8px',
          margin: '0 0 4px 4px'
        }
      });
      var description = ui.Label({
        value: name,
        style: {margin: '0 0 4px 6px'}
      });
      return ui.Panel({
        widgets: [colorBox, description],
        layout: ui.Panel.Layout.Flow('horizontal')
      });
  };
  var names = ['Vegetation','Waterbody','Built-up', 'Wasteland'];
  for (var i = 0; i < 4; i++) {
  legend.add(makeRow(classification_palette[i], names[i]));
  } //we can use for loop since ui elements are client side
  panel_right.add(legend);
  
  var statistics_panel = ui.Panel(); //chart with area statistics
  statistics_panel.style().set({
    border: '1px solid black',
    margin: '2px',
    stretch: 'both',
  });
  panel_right.add(statistics_panel);
  var statistics_title = ui.Label('Area in Hectares', {
    fontWeight: 'bold', 
    fontSize: '18px'
  });
  var veg_label = ui.Label('Vegetation  : Computing...');
  var water_label = ui.Label('Waterbody : Computing...');
  var built_label = ui.Label('Built-up  : Computing...');
  var waste_label = ui.Label('Wasteland : Computing...');
  statistics_panel.add(statistics_title);
  statistics_panel.add(veg_label);
  statistics_panel.add(water_label);
  statistics_panel.add(built_label);
  statistics_panel.add(waste_label);
  
  var Lmap = ui.Map(); //displays the district location in state map
  map_properties(Lmap);
  Lmap.setControlVisibility({zoomControl: false});
  Lmap.style().set({border: '1px solid black', margin: '2px'});
  Lmap.addLayer(districts, {color: 'black'}, 'boundary');
  Lmap.centerObject(districts);
  Lmap.addLayer(district, {color: 'red'}, 'district');
  panel_right.add(Lmap);
  var state_label = ui.Label('长江中游遥感地质解译', {position: 'top-left'});
  Lmap.add(state_label);
  
  var info_panel = ui.Panel({
  style: {
    border: '1px solid black',
    margin: '4px',
    height: '125px',
    stretch: 'horizontal',
    }
  });
  panel_right.add(info_panel);
  var infoTitle = ui.Label('说明',{
    fontWeight: 'bold',
    fontSize: '18px',
    textAlign: 'center'
  });
  info_panel.add(infoTitle);
  var infoDesc = ui.Label('App displays the current Landuse/Landcover \
                    Classification generated by Random Forest Classifier');
  info_panel.add(infoDesc);
  
  /* New layout of Classification map at centre,
  NDVI, NDWI maps at the left and
  Legends, area statistics, district location map and info panel at the left*/
  var mapGrid = ui.Panel();
  mapGrid.style().set({
    width: '100%',
    height: '100%',
    border: '1px solid black',
    stretch: 'horizontal',
  });
  mapGrid.setLayout(ui.Panel.Layout.Flow('horizontal'));
  mapGrid.add(panel_left);
  mapGrid.add(classified_map);
  mapGrid.add(panel_right);
  // reset the welcome screen to new layout
  ui.root.widgets().reset([title, mapGrid]);
  ui.root.setLayout(ui.Panel.Layout.Flow('vertical'));
  
  /* Area Chart generation and display in the right panel */
  var area_classified = ee.Image.pixelArea().divide(1e4).addBands(classified)
    .reduceRegion({
      reducer: ee.Reducer.sum().group(1, 'group'),
      geometry: district.geometry(),
      scale: 50,
      tileScale: 16,
      maxPixels: 10e10
      });
  var outputReducers = ee.List(area_classified.get('groups'));
  var area_values = ee.List([ee.Dictionary(outputReducers.get(0)).get('sum'),
                              ee.Dictionary(outputReducers.get(1)).get('sum'),
                              ee.Dictionary(outputReducers.get(2)).get('sum'),
                              ee.Dictionary(outputReducers.get(3)).get('sum')]);
  area_values.evaluate(function (value) {
    var dataTable = {
      cols: [{id: 'area', label: 'Area (Ha)', type: 'string'},
              {id: 'class', label: 'class', type: 'number'}],
      rows: [{c: [{v: 'Vegetation'}, {v: value[0]}]},
              {c: [{v: 'Waterbody'}, {v: value[1]}]},
              {c: [{v: 'Built-up'}, {v: value[2]}]},
              {c: [{v: 'Wasteland'}, {v: value[3]}]},]
    };
    var options = {
      title: 'Area Statistics (log scale)',
      vAxis: {title: 'Area (Ha)', logScale: true},
      legend: {position: 'none'},
      hAxis: {
        title: 'Class',
      }
    };
    var chart = new ui.Chart(dataTable, 'ColumnChart', options);
    statistics_panel.clear();
    statistics_panel.add(chart);
  });
};

var places = {
  dists: ['qingjiang', 'juzhanghe', 'huangbaihe', 'zhongdianqu', 'xiangxihe'],
}; // District names to be displayed in the District Selector menu

var select = ui.Select({
  items: places.dists,
  onChange: function(key) {
    calculation(key);
  }
});
// District selector - Dropdown menu in Welcome screen
select.setPlaceholder('Select a District');
select.style().set('position', 'top-center');
state_map.add(select);

