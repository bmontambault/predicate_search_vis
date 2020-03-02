import numpy as np
import pandas as pd
import scipy.stats as st
import seaborn as sns

class NormData:

    def __init__(self, n, m, alpha=1, beta=10, k=1, q=8, bins=100):
        self.n = n
        self.m = m
        self.alpha = alpha
        self.beta = beta
        self.k = min(k, m)
        self.q = q
        self.bins = bins

        self.clean, self.clean_mean, self.clean_cov = self.generate_norm(n, m, alpha, beta)
        self.anomalies, self.anom_mean, self.anom_cov = self.generate_norm(n, m, alpha, beta)
        self.search_clean = SearchData(self.clean)
        self.search_anomalies = SearchData(self.anomalies)
        self.predicate, self.disc_predicate = self.insert_anomalies()

    def generate_norm(self, n, m, alpha=1, beta=.1):
        mean = np.random.normal(0, 10, size=m)
        cov = st.invwishart(df=alpha + m, scale=np.ones(m) * beta).rvs()
        if m > 1:
            data = np.random.multivariate_normal(mean, cov, size=n)
        else:
            data = np.random.normal(mean, cov, size=n)
        df = pd.DataFrame(data)
        df.columns = [f"f{col}" for col in df.columns]
        return df, mean, cov

    def generate_feature_predicate(self, feature, index=None):
        if index is None:
            index = list(self.search_clean.disc_data.index)
        predicates = [p for p in self.search_clean.predicates if p.feature.feature == feature
                      and len(set(p.selected_index).intersection(set(index))) > 0]
        if len(predicates) == 0:
            return None

        start = np.random.randint(0, len(predicates) - 2)
        end = np.random.randint(start + 1, len(predicates) - 1)
        all_p = predicates[start:end]
        p = all_p[0]
        for new_p in all_p[1:]:
            p = p.merge(new_p)
        return p

    def generate_predicate(self, search_data, features):
        if len(features) == 0:
            return None
        predicate = self.generate_feature_predicate(features[0].feature)
        predicate.set_data(search_data.disc_data)
        for f in features[1:]:
            p = self.generate_feature_predicate(f.feature, predicate.selected_index)
            if p != None:
                p.set_data(search_data.disc_data)
                predicate = predicate.merge(p)
        return predicate

    def insert_anomalies(self, targets=None):
        if targets is None:
            targets = list(self.clean.columns)
        features = np.random.choice(self.search_clean.features, self.k, replace=False)
        target_features = [f for f in features if f.feature in targets]
        other_features = [f for f in features if f.feature not in targets]

        target_predicate = self.generate_predicate(self.search_anomalies, target_features)
        other_predicate = self.generate_predicate(self.search_clean, other_features)
        if target_predicate is None:
            predicate = other_predicate
        elif other_predicate is None:
            predicate = target_predicate
        else:
            predicate = target_predicate.merge(other_predicate)

        self.predicate = predicate
        clean_target = self.clean[~self.clean.index.isin(predicate.selected_index)][targets]
        anomalies_target = self.anomalies[self.anomalies.index.isin(predicate.selected_index)][targets]
        other_columns = self.clean[[col for col in self.clean.columns if col not in targets]]
        self.tainted = pd.concat([other_columns, pd.concat([clean_target, anomalies_target])], axis=1)

        cont_target_predicate = self.search_anomalies.disc_predicate_to_cont(target_predicate)
        cont_other_predicate = self.search_clean.disc_predicate_to_cont(other_predicate)
        if cont_target_predicate is None:
            cont_predicate = cont_other_predicate
        elif cont_other_predicate is None:
            cont_predicate = cont_target_predicate
        else:
            cont_predicate = cont_target_predicate.merge(cont_other_predicate)

        return predicate, cont_predicate

    def plot(self):
        concatenated = pd.concat([self.clean.assign(label='data'),
                                  self.anomalies.assign(label='anomaly')])
        sns.pairplot(concatenated, hue='label')