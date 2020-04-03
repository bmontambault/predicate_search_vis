
// This is just a js file to enable the interactivity of the tabs at the bottom. I don't think 
// you'll need to mess with this, even if you want to generate the conent for the tabs themselves.

console.log("Building predicate tabs...");

function showTab(id, elem, color) {
	
	console.log("getting called?");
	var i, tabcontent, tablinks;

	tabcontent = document.getElementsByClassName("content");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}

	tablinks = tabcontent = document.getElementsByClassName("tablink");
		for (i = 0; i < tablinks.length; i++) {
		tablinks[i].style.backgroundColor = "#e8e8e8";
	}

	document.getElementById(id).style.display = "flex";
	elem.style.backgroundColor = color;

}

// function firsttab() {
// 	console.log("here we go");
// 	$("#defaultOpen").style("display", "flex");
// }

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

// $(".go").on("click", function() {
// 	console.log(batch);
// })

get_preds([1, 2, 3, 4, 5], "radius_mean,perimeter_mean").then(function(res) {

	var datamap = d3.map(res);
	var vals = datamap.values();
	var first = d3.map(vals[0]);

	var fstbtn = $("<button id = 'defaultOpen' class='tablink'></button>").text("Predicate " + 1);
	$(".tabs").append(fstbtn);

	var fstexplain = $("<div id = '1' class = 'content'></div>").html(first.keys() + " " + first.values());
	$(".explain").append(fstexplain);

	for (var i = 1; i < vals.length; i++) {
		num = i+1;
		var next = d3.map(vals[i]);
		var btn = $("<button class='tablink'></button>").text("Predicate " + num);
		$(".tabs").append(btn);

		var nextexplain = $("<div id = '"+ num + " class = 'content'></div>").html(next.keys() + " " + next.values());
		$(".explain").append(nextexplain);
	}
});


$(document).ready(function() {

	$(".tablink").on("click", function() {
		console.log("hello?");
		var thisid = this.id;
		showTab(thisid, this, "white");
	})

})
