function predicate_search(targets, index){
    var data = {'targets': targets, 'index': index}
    $.ajax({
        url: '/predicate_search',
        data: JSON.stringify(data),
        type : "POST",
        success: function(resp, data){
            var response = JSON.parse(resp);
            if (response != null){
                var predicates = response["predicates"]
                console.log(predicates)
                //now populate small multiples
            }
        }
    });
}