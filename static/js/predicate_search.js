function predicate_search(targets, index){
    var data = {'targets': targets, 'index': index};
    return $.ajax({
        url: '/get_predicates',
        data: JSON.stringify(data),
        type : "POST",
        success: function(resp, data){
            console.log("hiii from predicate search");
            var response = JSON.parse(resp);
            if (response != null){
                var predicates = response["predicates"];
            }
        }
    });
}
