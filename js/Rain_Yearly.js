var modis = ee.ImageCollection('MODIS/MOD13A1');

var months = ee.List.sequence(1, 12);

// Group by month, and then reduce within groups by mean();
// the result is an ImageCollection with one image for each
// month.
var byMonth = ee.ImageCollection.fromImages(
      months.map(function (m) {
        return modis.filter(ee.Filter.calendarRange(m, m, 'month'))
                    .select(1).sum()
                    .set('month', m);
}));
print(byMonth);

Map.addLayer(ee.Image(byMonth.first()));