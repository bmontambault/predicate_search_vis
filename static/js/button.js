

$(document).ready(function() {

	$(".go").on("click", function() {
		console.log("CLICKKKK");

		get_scatter_data([0, 1, 3, 4, 6], "radius_mean,perimeter_mean").then(function(res) {

			console.log(res);

		});

	})

})


