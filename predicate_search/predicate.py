import numpy as np

class Feature:

    def __init__(self, feature, values, adj_matrix, is_disc):
        self.feature = feature
        self.values = sorted(values)
        self.adj_matrix = adj_matrix
        self.is_disc = is_disc

    def __repr__(self):
        return str(self.feature)


class SingleFeaturePredicate(object):

    def __init__(self):
        self.data = None
        self.selected_index = None

    def merge(self, predicate):
        return CompoundPredicate([self, predicate])

    def set_data(self, data):
        self.data = data
        self.selected_index = list(data.query(self.query).index)


class DiscSingleFeaturePredicate(SingleFeaturePredicate):

    def __init__(self, feature, values):
        super().__init__()
        self.feature = feature
        self.features = [feature.feature]
        self.values = values
        self.query = self.get_query()

    def get_query(self):
        return f"{self.feature.feature} in {self.values}"

    def merge(self, predicate):
        if self.feature != predicate.feature:
            return super().merge(predicate)

    def is_adjacent(self, predicate):
        if type(self) != type(predicate):
            return False
        if self.feature == predicate.feature:
            return True


class ContSingleFeaturePredicate(SingleFeaturePredicate):

    def __init__(self, feature, intervals):
        super().__init__()
        self.feature = feature
        self.features = [feature.feature]
        self.intervals = intervals
        self.query = self.get_query()

    def get_query(self):
        return " or ".join([f"({self.feature.feature} >= {interval[0]} and {self.feature.feature} <= {interval[1]})"
                            for interval in self.intervals])

    def merge_interval_lists(self, intervals_a, intervals_b):
        intervals = []
        while len(intervals_a) > 0 and len(intervals_b) > 0:
            if intervals_a[0][0] < intervals_b[0][0]:
                intervals.append(intervals_a.pop(0))
            else:
                intervals.append(intervals_b.pop(0))
        if len(intervals_a) > 0:
            intervals += intervals_a
        if len(intervals_b) > 0:
            intervals += intervals_b
        return intervals

    def merge_overlapping_intervals(self, interval_a, interval_b):
        # first interval contains second interval: return first interval
        if interval_a[1] > interval_b[1]:
            return [interval_a]
        # first interval overlaps second interval: return start of first interval and end of second interval
        # endpoints are adjacent: return start of first interval and end of second interval
        elif interval_a[1] > interval_b[0] or self.feature.adj_matrix[interval_a[1]][interval_b[0]]:
            return [(interval_a[0], interval_b[1])]
        # intervals not overlapping or adjacent
        else:
            return [interval_a, interval_b]

    def merge_intervals(self, intervals):
        len_intervals = len(intervals)
        i = 0
        while i < len_intervals - 1:
            intervals_a = intervals[i]
            intervals_b = intervals[i + 1]
            merged = self.merge_overlapping_intervals(intervals_a, intervals_b)
            if len(merged) == 1:
                len_intervals -= 1
                intervals[i + 1] = merged[0]
                del intervals[i]
            else:
                i += 1
        return intervals

    def merge(self, predicate):
        if self.feature != predicate.feature:
            return super().merge(predicate)
        else:
            intervals = self.merge_intervals(
                self.merge_interval_lists(self.intervals.copy(), predicate.intervals.copy()))
            new_predicate = ContSingleFeaturePredicate(self.feature, intervals)
            if self.selected_index is not None and predicate.selected_index is not None:
                new_predicate.selected_index = list(self.selected_index) + list(predicate.selected_index)
            return new_predicate

    def is_adjacent(self, predicate):
        if type(self) != type(predicate):
            return False
        if self.feature != predicate.feature:
            return False
        merged_intervals = self.merge_intervals(
            self.merge_interval_lists(self.intervals.copy(), predicate.intervals.copy()))
        return len(merged_intervals) < len(self.intervals) + len(predicate.intervals)

    def __repr__(self):
        return f"{self.feature.feature}: {self.intervals}"


class CompoundPredicate():

    def __init__(self, base_predicates):
        self.data = None
        self.base_predicates = sorted(base_predicates, key=lambda x: x.feature.feature)
        self.predicates = {k: self.merge_single_feature_predicates(list(p)) for k, p in
                           itertools.groupby(self.base_predicates, key=lambda x: x.feature.feature)}
        self.features = list(self.predicates.keys())
        self.selected_index = np.array(list(set.intersection(*map(set,
                                                                  [p.selected_index for p in
                                                                   self.predicates.values()]))))

    def merge_single_feature_predicates(self, predicates):
        p = predicates[0]
        for next_p in predicates[1:]:
            p = p.merge(next_p)
        return p

    def merge(self, predicate):
        base_predicates = {}
        for k, v in self.predicates.items():
            if k in predicate.predicates:
                print((predicate.predicates[k].feature.adj_matrix))
                base_predicates[k] = v.merge(predicate.predicates[k])
            else:
                base_predicates[k] = v
        for k, v in predicate.predicates.items():
            if k not in base_predicates:
                base_predicates[k] = v
        return CompoundPredicate(base_predicates.values())

    def get_score(self, scores, alpha):
        predicate_scores = scores[self.selected_index]
        size = len(predicate_scores)
        score = predicate_scores.sum()
        if len(size) == 0:
            return 0
        return score / (size ** alpha)

    def set_score(self, scores, alpha):
        self.score = self.get_score(scores, alpha)

    def is_adjacent(self, predicate):
        if type(self) != type(predicate):
            return False
        if self.features != predicate.features:
            return False
        adj = np.array([self.predicates[f].is_adjacent(predicate.predicates[f]) and
                        not np.all(self.predicates[f].selected_index == predicate.predicates[f].selected_index)
                        for f in self.features]).astype(int)
        eq = np.array([np.all(self.predicates[f].selected_index == predicate.predicates[f].selected_index)
                       for f in self.features]).astype(int)
        return sum(adj) == 1 and sum(eq) == len(self.features) - 1

    def __repr__(self):
        return '{' + f"{list(self.predicates.values())}"[1:-1] + '}'