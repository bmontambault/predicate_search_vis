
// This is just a js file to enable the interactivity of the tabs at the bottom. I don't think 
// you'll need to mess with this, even if you want to generate the conent for the tabs themselves.

$(".go").on("click", function() {

	var feats = Object.values(selectedFeats);
	// var idxs = Object.keys(selectedFeats);
	// console.log(feats[0])
	if (feats.length == 0) {
		alert("Please choose a target variable from the barcode panel.");
	} else {
		if($("#welcome-tab").length) {
			$("#welcome-tab").remove();
			$("#welcome-scatter").remove();

			// console.log(feats[0]);
			generateTabs([1, 2, 3, 4, 5], "radius_mean,perimeter_mean");

		} else {
			// feats[0];
			generateTabs([4, 5, 8, 9, 14], "radius_mean,perimeter_mean");
		}
	}
})


function get_preds(index, targets){

    return $.ajax({
        url: 'http://localhost:5000/get_predicates',
        type : "POST",
        data: JSON.stringify({'index': index, 'targets': targets}),
        dataType: "JSON",
        success: function(resp, data){
            if (resp != null){
                return resp;
            }
        }
	})
}

var trays = [];

function generateTabs(idxs, feats) {

	get_preds(idxs, feats).then(function(res) {

        predicates = res['predicates'];

    	var frst_elemid = 0;
		var frst_curr_feats = Object.keys(predicates[0]);
		var frst_curr_ranges = Object.values(predicates[0]);
		makeLines(frst_curr_feats, frst_curr_ranges, frst_elemid);

		// The first tab and tray contents
		var $first_tab = $('<button class=" tablink tablink-selected" id="0">Predicate 1</button>');
		$(".tabs").append($first_tab);
		var first_feats = Object.keys(predicates[0]);
		var first_ranges = Object.values(predicates[0]);
		for (var k = 0; k < first_feats.length; k++) {

			var child = first_feats[k] + ": " + first_ranges[k] + "<br>";
			$(".explain").append(child);
		}

		// The rest of the tabs 
		for (var i = 1; i < predicates.length; i++) {
			var $curr_tab = $('<button class="tablink" id="' + i + '">Predicate ' + (i+1) + '</button>');
			$(".tabs").append($curr_tab);

		}

		$(".tablink").on("click", function() {

			var elemid = +(this.id);
			var curr_feats = Object.keys(predicates[elemid]);
			var curr_ranges = Object.values(predicates[elemid]);
			child = "";

			$(".tablink").toggleClass("tablink-selected");

			$(".explain").html(function() {
				for (var k = 0; k < curr_feats.length; k++) {
					child += curr_feats[k] + ": " + curr_ranges[k] + "<br>";
				}
				return child;
			})

			makeLines(curr_feats, curr_ranges, elemid);
		})
	});
}