from flask import Flask, render_template, request
import pandas as pd
import json
import pickle

app = Flask(__name__)
app.secret_key = ''
app.config['SESSION_TYPE'] = 'filesystem'

dataset = 'breast_cancer'
with open(f'models/{dataset}.pkl', 'rb') as f:
    model = pickle.load(f)
    predicate_search = model['predicate_search']
    distances = model['distances']
    projections = model['projections']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_zscores', methods=['GET', 'POST'])
def get_zscores():
    request_data = request.get_json(force=True)
    targets = request_data['targets']
    print(distances[targets])
    return json.dumps(distances[targets])

@app.route('/get_projections', methods=['GET', 'POST'])
def projection():
    request_data = request.get_json(force=True)
    targets = request_data['targets']
    print(projections[targets])
    return json.dumps(projections[targets])

@app.route('/get_predicates', methods=['GET', 'POST'])
def predicate_search():
    print("yeah?")
    request_data = request.get_json(force=True)
    targets = request_data['targets']
    index = request_data['index']

    raw_predicates = predicate_search.search(targets, index)
    predicates = [p.get_obj() for p in raw_predicates]
    return json.dumps(predicates)

if __name__ == "__main__":
    app.run()