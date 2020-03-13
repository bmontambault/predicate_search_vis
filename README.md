# predicates search vis

## Endpoints

### Input
Each endpoint receives two values from the frontend

1) index: list of row numbers for data points selected in the scatterplot

`[0, 1, 4, 32, 34 ... ]`

2) targets: comma separated string indicating list of target features

`'f1'`

`'f1,f2,f4'`

Each endpoint will return a result for the selected index and targets

Inputs can be sent via an ajax request:

```
return $.ajax({
        url: '/endpoint',
        data: JSON.stringify({'index': index, 'targets': targets}),
        type : "POST",
        success: function(resp, data){
            var response = JSON.parse(resp);
            if (response != null){
                //do something
            }
```

### /get_zscores
Returns z-score/mahalanobis distance for each point. The key is the row number of the point and the value is the z-score/distance

`{0: 1.321, 1: 0.453, 2: 2.761 ... }`

### /get_projections
Returns 2d projection

`[{'index': 0, 'x': 0.231, 'y': 0.432}, {index: 1, 'x': 1.54, 'y': 2.123} ... ]`

### /get_predicates
Returns a list of predicates

```[{'f1': [(0, 1), (3, 4)], 'f2': [(1, 2)]}, {'f1': [(5, 6)]} ... ]```
