import itertools
import numpy as np

class PredicateSearch:

    def __init__(self, predicates, c=1):
        self.predicates = predicates
        self.all_features = list(set([p.feature for p in predicates]))
        self.c = c

    def group_predicates(self, predicates, c):
        grouped = {tuple(k): list(g) for k, g in itertools.groupby(predicates, key=lambda x: x.features)}
        for k, v in grouped.items():
            grouped[k] = sorted(v, key=lambda x: x.get_influence(c), reverse=True)
        sorted_features = sorted(grouped.keys(), key=lambda k: grouped[k][0].get_influence(c), reverse=True)
        return sorted_features, grouped

    def merge_same_features(self, predicates, c):
        predicates = predicates.copy()
        merged_predicates = []
        while len(predicates) > 0:
            p = predicates.pop(0)
            p, predicates = self.merge_predicate_list(p, predicates, c)
            merged_predicates.append(p)
        return merged_predicates

    def merge_predicate_list(self, p, predicates, c):
        old_influence = p.get_influence(c)
        for i in range(len(predicates)):
            new_p = predicates[i]
            if p.is_adjacent(new_p):
                merged_p = p.merge(new_p)
                new_influence = merged_p.get_influence(c)
                # print(p, old_influence, merged_p, new_influence)
                if new_influence >= old_influence:
                    del predicates[i]
                    return self.merge_predicate_list(merged_p, predicates, c)
        return p, predicates

    def merge_adjacent(self, predicates, c):
        merged = []
        sorted_features, grouped = self.group_predicates(predicates, c)
        for k in sorted_features:
            merged_features = self.merge_same_features(grouped[k], c)
            merged += merged_features
        merged_filtered = ([next(v) for k, v in itertools.groupby(merged, lambda x: x.query)])
        return merged_filtered

    def prune(self, predicates, best_point_influence):
        return [p for p in predicates if max(p.point_influence) >= best_point_influence]

    def intersect(self, predicates):
        new_predicates = [p1.merge(p2) for p1, p2 in itertools.combinations(predicates, 2) if not p1.is_adjacent(p2)]
        new_predicates_filtered = ([next(v) for k, v in itertools.groupby(new_predicates, lambda x: x.query)])
        return new_predicates_filtered

    def prune_results(self, results, best_influence, c, SMALL_NUM):
        return [a for b in [r for r in results if r[-1].get_influence(c) >= best_influence - SMALL_NUM] for a in b]

    def set_influence_equal(self, p1, p2):
        x1 = np.log(p1.point_influence.sum())
        x2 = np.log(p2.point_influence.sum())
        s1 = np.log(p1.size)
        s2 = np.log(p2.size)
        return (x1 - x2) / (s1 - s2)

    def get_c_scale(self, predicates, eps=10**-3):
        sorted_predicates = sorted(predicates, key=lambda x: x.get_influence(1), reverse=True)
        next_worst_predicate = sorted_predicates[0]
        for p in sorted_predicates[1:-1]:
            next_worst_predicate = next_worst_predicate.merge(p)
        worst_predicate = next_worst_predicate.merge(sorted_predicates[-1])

        c_min = self.set_influence_equal(worst_predicate, next_worst_predicate) - eps
        return c_min

    def rescale(self, val, in_min, in_max, out_min, out_max):
        return out_min + (val - in_min) * ((out_max - out_min) / (in_max - in_min))

    def search_features(self, features=None, index=None, c=None, maxiters=100):
        print('features: ', features)
        if c is None:
            c = self.c
        if features is None:
            features = self.all_features
        SMALL_NUM = 10**-4
        predicates = [p for p in self.predicates if p.feature in features]
        if index is not None:
            predicates = [p for p in predicates if not set(index).isdisjoint(p.selected_index)]

        c_min = self.get_c_scale(predicates)
        scaled_c = self.rescale(c, 0, 1, c_min, 1)

        best_influence = -np.inf
        best_predicate = None
        for i in range(maxiters):
            # if i > 0:
            #     for p in sorted(predicates, key=lambda x: x.get_influence(scaled_c))[:20]:
            #         print(p, p.get_influence(scaled_c), best_predicate, best_influence)
            #     print()

            predicates = [p for p in predicates if p.get_influence(scaled_c) >= best_influence - SMALL_NUM]
            if len(predicates) == 0 or len(predicates) > 300:
                return best_predicate

            # print(f'merging {len(predicates)}')
            # if len(predicates) > 200:
            #     for p in predicates:
            #         print(p)
            merged = self.merge_adjacent(predicates, scaled_c)
            # print('done merging')
            #
            # for p in sorted(merged, key=lambda x: x.get_influence(c), reverse=True):
            #     print(p, p.get_influence(scaled_c))
            # print()

            best_predicate = max(merged, key=lambda x: x.get_influence(scaled_c))
            best_influence = best_predicate.get_influence(scaled_c)
            best_point_influence = min(best_predicate.point_influence)

            pruned = self.prune(merged, best_point_influence)
            predicates = self.intersect(pruned)

        return best_predicate

    def search(self, targets=None, index=None, c=None, maxiters=2):
        if targets is None:
            targets = self.all_features
        target_predicates = self.search_features(targets, index, c, maxiters)
        other_features = [f for f in self.all_features if f not in targets]
        if len(other_features) == 0:
            return [target_predicates]
        else:
            other_predicates = self.search_features(other_features, index, c, maxiters)
            predicates = [target_predicates, other_predicates]
            return predicates