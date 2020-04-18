import pandas as pd 

data = pd.read_csv('landslideSample.txt')
print(data.head())

data.dropna(axis=0, how='any', inplace=True)
print(data.head())
print(data.tail())

xCol = [item for item in data.columns if item not in ['OBJECTID','lon','lat','Class']]
X = data[xCol]
y = data['Class']
GeoID = data['OBJECTID']
print(data['Class'].value_counts())





