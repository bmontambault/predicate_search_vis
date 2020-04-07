import pandas as pd
import itertools
import numpy as np
import argparse
import pickle
from sklearn.manifold import TSNE

from predicate_search import AnomalyDetection

def train_model(data):
    clf = AnomalyDetection()
    clf.fit(data)
    return clf

def get_distances(data, mean, cov, features):
    m = mean[features].values
    c = cov[features].loc[features].values
    x = data[features].values

    VI = np.linalg.inv(c)
    dist = np.diag(np.sqrt(np.dot(np.dot((x - m), VI), (x - m).T)))
    records = dict(zip(range(len(data)), dist.tolist()))
    return records

def get_projection(data, features, z_scores=None):
    if len(features) == 1:
        print('1', features)
        x = list(data[features].values.ravel())
        y = list(z_scores)
        records = [{'x': x[i], 'y': y[i], 'index': i} for i in range(len(x))]
    elif len(features) == 2:
        print('2', features)
        x = list(data[features[0]].values.ravel())
        y = list(data[features[1]].values.ravel())
        records = [{'x': x[i], 'y': y[i], 'index': i} for i in range(len(x))]
    else:
        print('3', features)
        tsne = TSNE(n_components=2)
        X = tsne.fit_transform(data[features])
        records = pd.DataFrame(X).rename(columns={0: 'x', 1: 'y'}).assign(index=range(len(data))).to_dict('records')
    print(records[:10])
    return records

def preprocessing(data, k=3):
    print('training model')
    clf = train_model(data)
    print('training complete')

    all_features_key = ','.join(data.columns)
    print(f'getting distances for {data.columns}')
    distances = {all_features_key: get_distances(data, clf.mean, clf.cov, data.columns)}
    print(f'getting projections for {data.columns}')
    projections = {all_features_key: get_projection(data, data.columns)}
    for n in range(1, k + 1):
        for group in itertools.combinations(data.columns, n):
            features = list(group)
            print(f'getting distances for {features}')
            dist = get_distances(data, clf.mean, clf.cov, features)
            print(f'getting projections for {features}')
            proj = get_projection(data, features, dist.values())
            key = ','.join(features)
            distances[key] = dist
            projections[key] = proj
    return clf, distances, projections

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('data_path')
    parser.add_argument('name')
    parser.add_argument('--k', default=2)
    args = vars(parser.parse_args())
    data_path = args['data_path']
    name = args['name']
    k = int(args['k'])

    data = pd.read_csv(data_path)
    model = dict(zip(['predicate_search', 'distances', 'projections'], preprocessing(data, k)))
    model['data'] = data

    with open(f'models/{name}.pkl', 'wb') as f:
        pickle.dump(model, f)