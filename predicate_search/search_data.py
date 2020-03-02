import numpy as np
import pandas as pd
from .predicate import Feature, DiscSingleFeaturePredicate, ContSingleFeaturePredicate, CompoundPredicate

class SearchData:

    def __init__(self, data, disc_cols=[], bins=100, min_val=None, max_val=None):
        self.data = data
        self.disc_cols = disc_cols
        self.bins = bins

        if min_val is None:
            self.min_val = data.min()
        else:
            self.min_val = min_val
        if max_val is None:
            self.max_val = data.max()
        else:
            self.max_val = max_val
        self.disc_data = pd.DataFrame()
        for col in self.data.columns:
            self.disc_data[col] = self.discritize(col)

        self.features = [self.get_feature(col) for col in self.data.columns]
        self.predicates = self.get_predicates()
        for p in self.predicates:
            p.set_data(self.disc_data)

    def discritize(self, col):
        d = self.data[col]
        disc_d = ((d - self.min_val[col]) / (self.max_val[col] - self.min_val[col]) * (self.bins - 1)).astype(int)
        return disc_d

    def get_disc_to_cont(self, data, disc_data, cols):
        disc_to_cont = {}
        for col in cols:
            a = pd.Series(self.clean[col], index=self.search_clean.disc_data[col])
            min_a = a.groupby(a.index).min()
            max_a = a.groupby(a.index).max()
            disc_to_cont[col] = {'min': min_a, 'max': max_a}
        return disc_to_cont

    def get_adj_matrix(self, col):
        unique = sorted(self.disc_data[col].unique())
        if col in self.disc_cols:
            adj = np.zeros(shape=(len(unique), len(unique)))
        else:
            adj = np.abs(np.arange(len(unique))[:, None] - np.arange(len(unique))[None, :]) <= 1
        adj_matrix = pd.DataFrame(adj, index=unique, columns=unique)
        return adj_matrix

    def get_feature(self, col):
        return Feature(col, self.disc_data[col].unique(), self.get_adj_matrix(col), col in self.disc_cols)

    def get_predicates(self):
        predicates = []
        for feature in self.features:
            for value in feature.values:
                if feature.is_disc:
                    p = DiscSingleFeaturePredicate(feature, [value])
                else:
                    p = ContSingleFeaturePredicate(feature, [(value, value)])
                predicates.append(p)
        return predicates

    def disc_predicate_to_cont(self, predicate):
        if predicate is None:
            return None
        if type(predicate) == CompoundPredicate:
            new_base_predicates = []
            for f in predicate.features:
                feature = predicate.predicates[f].feature
                intervals = predicate.predicates[f].intervals

                cont_intervals = []
                for min_val, max_val in intervals:
                    q = f"{f} >= {min_val} and {f} <= {max_val}"
                    idx = self.disc_data.query(q).index
                    cont_min_val = self.data[f].iloc[idx].min()
                    cont_max_val = self.data[f].iloc[idx].max()
                    cont_intervals.append((cont_min_val, cont_max_val))
                p = ContSingleFeaturePredicate(feature, cont_intervals)
                p.set_data(self.data)
                new_base_predicates.append(p)
            new_predicate = CompoundPredicate(new_base_predicates)
        else:
            feature = predicate.feature
            f = feature.feature
            intervals = predicate.intervals

            cont_intervals = []
            for min_val, max_val in intervals:
                q = f"{f} >= {min_val} and {f} <= {max_val}"
                idx = self.disc_data.query(q).index
                cont_min_val = self.data[f].iloc[idx].min()
                cont_max_val = self.data[f].iloc[idx].max()
                cont_intervals.append((cont_min_val, cont_max_val))
            new_predicate = ContSingleFeaturePredicate(feature, cont_intervals)
        return new_predicate