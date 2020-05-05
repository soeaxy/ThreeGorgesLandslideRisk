"""
===============================================
Feature transformations with ensembles of trees
===============================================

Transform your features into a higher dimensional, sparse space. Then
train a linear model on these features.

First fit an ensemble of trees (totally random trees, a random
forest, or gradient boosted trees) on the training set. Then each leaf
of each tree in the ensemble is assigned a fixed arbitrary feature
index in a new feature space. These leaf indices are then encoded in a
one-hot fashion.

Each sample goes through the decisions of each tree of the ensemble
and ends up in one leaf per tree. The sample is encoded by setting
feature values for these leaves to 1 and the other feature values to 0.

The resulting transformer has then learned a supervised, sparse,
high-dimensional categorical embedding of the data.

"""

# Author: Tim Head <betatim@gmail.com>
# Modified by Songyingxu
# License: BSD 3 clause

import numpy as np
np.random.seed(10)
import pickle

import matplotlib.pyplot as plt

from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import (RandomTreesEmbedding, RandomForestClassifier,
                              GradientBoostingClassifier)
from sklearn.preprocessing import OneHotEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_curve
from sklearn.pipeline import make_pipeline
import pandas as pd
n_estimator = 10

def dataPrepare(filePath,flag=0):
    data = pd.read_csv(filePath)
    data.dropna(axis=0, how='any', inplace=True)
    if flag==0:
        colName = ['TGRA_DEM_P', 'Aspect_rec', 'Slope', 'water', 'road', 'curvature']
        x_columns = [x for x in data.columns if x not in ['Class','GeoID','FID','lon','lat','Class','LSM2019']]
        X = data[colName]
        y = data['Class']
        GeoID = data['GeoID']
        print(data.head())
        print(x_columns)
        return X, y, GeoID
    else :
        colName = ['TGRA_DEM_P', 'Aspect_rec', 'Slope', 'water', 'road', 'curvature']
        x_columns = [x for x in data.columns if x not in ['Class','GeoID','FID','lon','lat','Class','LSM2019']]
        X = data[colName]
        GeoID = data['GeoID']
        print(x_columns)
        print(data.head())
        return X, GeoID

def trainModel(X,y):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3)

    # It is important to train the ensemble of trees on a different subset
    # of the training data than the linear regression model to avoid
    # overfitting, in particular if the total number of leaves is
    # similar to the number of training samples
    X_train, X_train_lr, y_train, y_train_lr = train_test_split(
        X_train, y_train, test_size=0.3)

    # Unsupervised transformation based on totally random trees
    rt = RandomTreesEmbedding(max_depth=3, n_estimators=n_estimator,
                            random_state=0)

    rt_lm = LogisticRegression(max_iter=1000)
    pipeline = make_pipeline(rt, rt_lm)
    pipeline.fit(X_train, y_train)
    y_pred_rt = pipeline.predict_proba(X_test)[:, 1]
    fpr_rt_lm, tpr_rt_lm, _ = roc_curve(y_test, y_pred_rt)

    # Supervised transformation based on random forests
    rf = RandomForestClassifier(max_depth=3, n_estimators=n_estimator)
    rf_enc = OneHotEncoder()
    rf_lm = LogisticRegression(max_iter=1000)
    rf.fit(X_train, y_train)
    rf_enc.fit(rf.apply(X_train))
    rf_lm.fit(rf_enc.transform(rf.apply(X_train_lr)), y_train_lr)

    y_pred_rf_lm = rf_lm.predict_proba(rf_enc.transform(rf.apply(X_test)))[:, 1]
    fpr_rf_lm, tpr_rf_lm, _ = roc_curve(y_test, y_pred_rf_lm)

    # Supervised transformation based on gradient boosted trees
    grd = GradientBoostingClassifier(n_estimators=n_estimator)
    grd_enc = OneHotEncoder()
    grd_lm = LogisticRegression(max_iter=1000)
    grd.fit(X_train, y_train)
    grd_enc.fit(grd.apply(X_train)[:, :, 0])
    grd_lm.fit(grd_enc.transform(grd.apply(X_train_lr)[:, :, 0]), y_train_lr)

    y_pred_grd_lm = grd_lm.predict_proba(
        grd_enc.transform(grd.apply(X_test)[:, :, 0]))[:, 1]
    fpr_grd_lm, tpr_grd_lm, _ = roc_curve(y_test, y_pred_grd_lm)

    # The gradient boosted model by itself
    y_pred_grd = grd.predict_proba(X_test)[:, 1]
    fpr_grd, tpr_grd, _ = roc_curve(y_test, y_pred_grd)

    # The random forest model by itself
    y_pred_rf = rf.predict_proba(X_test)[:, 1]
    fpr_rf, tpr_rf, _ = roc_curve(y_test, y_pred_rf)

        # 以写二进制的方式打开文件
    file = open("./grd_lm.pickle", "wb")
    pickle.dump(grd, file)
    file.close()

    plt.figure(1)
    plt.plot([0, 1], [0, 1], 'k--')
    plt.plot(fpr_rt_lm, tpr_rt_lm, label='RT + LR')
    plt.plot(fpr_rf, tpr_rf, label='RF')
    plt.plot(fpr_rf_lm, tpr_rf_lm, label='RF + LR')
    plt.plot(fpr_grd, tpr_grd, label='GBT')
    plt.plot(fpr_grd_lm, tpr_grd_lm, label='GBT + LR')
    plt.xlabel('False positive rate')
    plt.ylabel('True positive rate')
    plt.title('ROC curve')
    plt.legend(loc='best')
    plt.show()

    plt.figure(2)
    plt.xlim(0, 0.2)
    plt.ylim(0.8, 1)
    plt.plot([0, 1], [0, 1], 'k--')
    plt.plot(fpr_rt_lm, tpr_rt_lm, label='RT + LR')
    plt.plot(fpr_rf, tpr_rf, label='RF')
    plt.plot(fpr_rf_lm, tpr_rf_lm, label='RF + LR')
    plt.plot(fpr_grd, tpr_grd, label='GBT')
    plt.plot(fpr_grd_lm, tpr_grd_lm, label='GBT + LR')
    plt.xlabel('False positive rate')
    plt.ylabel('True positive rate')
    plt.title('ROC curve (zoomed in at top left)')
    plt.legend(loc='best')
    plt.show()

def applyModel():
    file = open("./grd_lm.pickle", "rb")
    model = pickle.load(file)
    file.close()
    return model

# save results
def saveResults(GeoID, y_pred, y_predprob, result_file):
    results = np.vstack((GeoID,y_pred,y_predprob))
    results = np.transpose(results)
    header_string = 'GeoID, y_pred, y_predprob'
    np.savetxt(result_file, results, header = header_string, fmt = '%d,%d,%0.5f',delimiter = ',')
    print('Saving file Done!')

if __name__ == "__main__":
    sampleData = r'data\landslideSample.txt'
    X, y, _= dataPrepare(sampleData,flag=0)
    trainModel(X,y)
    model = applyModel()
    allData = r'data\allPoint.txt'
    X, GeoID= dataPrepare(allData,flag=1)
    y_pred = model.predict(X)
    y_pred_proba = model.predict_proba(X)[:,1]
    result_file = './result.txt'
    saveResults(GeoID, y_pred, y_pred_proba, result_file)