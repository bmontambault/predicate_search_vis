import numpy as np
import itertools

class PredicateSearch:

    def __init__(self, search_data, score, c, b):
        self.search_data = search_data
        self.score = score
        self.c = c
        self.b = b
        self.base_predicates = self.search_data.predicates

        self.SMALL_NUM = 10 ** -5
        self.best_score = np.inf
        self.best_p = []

    def step(self, predicates):
        for p in predicates:
            self.score_predicate(p, self.c)
        eps = np.std([p.score for p in predicates]) * self.b
        merged_predicates = self.merge(predicates, self.c, eps)

        best_p = min(merged_predicates, key=lambda x: x.score)
        best_score = best_p.score
        best_p = [p for p in merged_predicates if p.score == best_score]

        best_single_score = min([p.best_score for p in best_p])
        pruned_predicates = self.prune(merged_predicates, best_single_score, self.SMALL_NUM)
        predicates = self.intersect(pruned_predicates)
        return predicates, best_p, best_score

    def search(self, maxiters=100):
        predicates = self.base_predicates.copy()
        for i in range(maxiters):
            predicates, best_p, best_score = self.step(predicates)
            if best_score < self.best_score:
                self.best_score = best_score
                self.best_p = best_p
            else:
                return best_p
            for p in predicates:
                self.score_predicate(p, self.c)
            predicates = [p for p in predicates if p.score < self.best_score]
            if len(predicates) == 0:
                return self.best_p

    def score_predicate(self, predicate, c):
        # print(predicate)
        all_scores = self.score[predicate.selected_index]
        score = all_scores.sum()
        size = len(predicate.selected_index)
        if size == 0:
            weighted_score = 0
        else:
            weighted_score = score / size ** c
        predicate.score = weighted_score
        predicate.best_score = np.max(all_scores)

    def merge_predicate(self, p, predicates, c, eps):
        for i in range(len(predicates)):
            new_p = predicates[i]
            if p.is_adjacent(new_p):
                merged_p = p.merge(new_p)
                self.score_predicate(merged_p, c)
                if (merged_p.score - eps) <= p.score:
                    del predicates[i]
                    return self.merge_predicate(merged_p, predicates, c, eps)
        return p, predicates

    def merge_feature(self, predicates, c, eps):
        merged_predicates = []
        while len(predicates) > 0:
            p = predicates.pop(0)
            p, predicates = self.merge_predicate(p, predicates, c, eps)
            merged_predicates.append(p)
        return merged_predicates

    def merge(self, predicates, c, eps):
        merged = []
        grouped = {tuple(k): list(g) for k, g in itertools.groupby(predicates, key=lambda x: x.features)}
        sorted_features = sorted(list(grouped.keys()), key=lambda x: max(grouped[x], key=lambda y: y.score).score)
        for k in sorted_features:
            sorted_predicates = sorted(grouped[k], key=lambda x: x.score)
            merged_features = self.merge_feature(sorted_predicates, c, eps)
            merged += merged_features
        return merged

    def prune(self, predicates, best_score, SMALL_NUM):
        return [p for p in predicates if p.best_score - SMALL_NUM < best_score]

    def intersect(self, predicates):
        new_predicates = [p1.merge(p2) for p1, p2 in itertools.combinations(predicates, 2) if not p1.is_adjacent(p2)]
        return new_predicates