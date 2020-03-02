from flask import Flask, render_template, request
import pandas as pd
import json

from predicate_search import PredicateAnomalyDetection

data = pd.read_csv('static/data/norm_data.csv')
clf = PredicateAnomalyDetection()
clf.fit(data)

dummy = data.reset_index().to_dict('records')

app = Flask(__name__)
app.secret_key = ''
app.config['SESSION_TYPE'] = 'filesystem'

@app.route('/')
def index():

    return render_template('index.html', dummy=dummy)


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