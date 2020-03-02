import numpy as np
import pandas as pd
import scipy.stats as st

from .model import RobustNormal
from .search_data import SearchData
from .predicate_search import PredicateSearch

class PredicateAnomalyDetection:

    def __init__(self, c=.8, b=.1):
        self.c = c
        self.b = b

    def fit(self, df):
        self.df = df
        self.model = RobustNormal()
        self.model.fit(df)
        self.mean = pd.Series(self.model.params['mean'].ravel(), index=df.columns)
        self.cov = pd.DataFrame(self.model.params['cov'], index=df.columns, columns=df.columns)

    def score(self, targets):
        mean = self.mean[targets].values
        cov = self.cov[targets][targets].values
        vals = self.df[targets]
        score = st.multivariate_normal(mean, cov).logpdf(vals)
        return score

    def search(self, targets=None):
        if targets is None:
            targets = self.df.columns
        data = self.df[targets]
        search_data = SearchData(data)
        score = self.score(targets)
        predicate_search = PredicateSearch(search_data, score, c=self.c, b=self.b)
        best_p = predicate_search.search()

        cont_p = []
        for p in best_p:
            cont_p.append(search_data.disc_predicate_to_cont(p))
        return cont_p