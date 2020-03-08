from flask import Flask, render_template, request
import pandas as pd
import json
import numpy as np
import itertools


from predicate_search import PredicateAnomalyDetection

data = pd.read_csv('static/data/normalized_breast_cancer.csv')
clf = PredicateAnomalyDetection()
clf.fit(data)

dummy = data.reset_index().to_dict('records')

app = Flask(__name__)
app.secret_key = ''
app.config['SESSION_TYPE'] = 'filesystem'


def get_distances(df, mean, cov, k=3):
    res = {}
    for n in range(1, k + 1):
        for group in itertools.combinations(df.columns, n):
            features = list(group)
            m = mean[features].values
            c = cov[features].loc[features].values
            x = df[features].values

            VI = np.linalg.inv(c)
            dist = np.diag(np.sqrt(np.dot(np.dot((x - m), VI), (x - m).T)))
            res['|'.join(group)] = dist.tolist()
    return res

@app.route('/')
def index():

    distances = get_distances(data, clf.mean, clf.cov)
    return render_template('index.html', dummy=dummy, distances=distances)


@app.route('/predicate_search', methods=['GET', 'POST'])
def predicate_search():

    request_data = request.get_json(force=True)
    targets = request_data['targets']
    index = request_data['index']

    print(targets, index)
    raw_predicates = clf.search()
    predicates = [p.get_obj() for p in raw_predicates]
    print(predicates)
    return json.dumps({'predicates': predicates})

if __name__ == "__main__":
    app.run()