

$(document).ready(function() {

	$(".go").on("click", function() {
		console.log("CLICKKKK");

		predicate_search("targets", "indices").then(function(res) {

			console.log(res);

		});

	})

})


