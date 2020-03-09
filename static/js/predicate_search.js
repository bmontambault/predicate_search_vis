function predicate_search(targets, index){
    var data = {'targets': targets, 'index': index};
    return $.ajax({
        url: '/predicate_search',
        data: JSON.stringify(data),
        type : "POST",
        success: function(resp, data){
            var response = JSON.parse(resp);
            if (response != null){
                var predicates = response["predicates"];
            }
        }
    });
}


// functionname(arg1, arg2).then(function(res) {
//     console.log(res);
// })