
// This is just a js file to enable the interactivity of the tabs at the bottom. I don't think 
// you'll need to mess with this, even if you want to generate the conent for the tabs themselves.

// console.log("Building predicate tabs...");

// function showTab(id, elem, color) {
	
// 	console.log("getting called?");
// 	var i, tabcontent, tablinks;

// 	tabcontent = document.getElementsByClassName("content");
// 	for (i = 0; i < tabcontent.length; i++) {
// 		tabcontent[i].style.display = "none";
// 	}

// 	tablinks = tabcontent = document.getElementsByClassName("tablink");
// 		for (i = 0; i < tablinks.length; i++) {
// 		tablinks[i].style.backgroundColor = "#e8e8e8";
// 	}

// 	document.getElementById(id).style.display = "flex";
// 	elem.style.backgroundColor = c\olor;

// }


$(".go").on("click", function() {

	var feats = Object.values(selectedFeats);
	if (feats.length == 0) {
		alert("Please choose a target variable from the barcode panel.");
	} else {
		if($("#welcome-tab").length) {
			$("#welcome-tab").remove();
			$("#welcome-scatter").remove();
			generateTabs([1, 2, 3, 4, 5], "radius_mean,perimeter_mean");

		} else {
			feats[0];
			generateTabs([1, 2, 3, 4, 5], "radius_mean,perimeter_mean");
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

		// The first tab and tray contents
		var $first_tab = $('<button class=" tablink tablink-selected" id="0">Predicate 1</button>');
		$(".tabs").append($first_tab);
		var first_feats = Object.keys(res[0]);
		var first_ranges = Object.values(res[0]);
		for (var k = 0; k < first_feats.length; k++) {

			var child = first_feats[k] + ": " + first_ranges[k] + "<br>";
			$(".explain").append(child);
		}

		// The rest of the tabs 
		for (var i = 1; i < res.length; i++) {
			var $curr_tab = $('<button class="tablink" id="' + i + '">Predicate ' + (i+1) + '</button>');
			$(".tabs").append($curr_tab);

		}

		$(".tablink").on("click", function() {

			var elemid = +(this.id);
			var curr_feats = Object.keys(res[elemid]);
			var curr_ranges = Object.values(res[elemid]);
			child = "";

			$(".tablink").toggleClass("tablink-selected");

			$(".explain").html(function() {
				for (var k = 0; k < curr_feats.length; k++) {
					child += curr_feats[k] + ": " + curr_ranges[k] + "<br>";
					console.log(child);
				}
				return child;
			})
		})
	});
}