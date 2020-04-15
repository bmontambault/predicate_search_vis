
// console.log("Generating the line charts...");

function get_line_data(index, targets){

    return $.ajax({
    	url: 'http://localhost:5000/get_predicates',
        type: "POST",
        dataType: "JSON",
        data: JSON.stringify({'index':index, 'targets': targets}),
    });
}

var lineChartWidth = $("#sml-mpls").width() - 20;
var lineChartHeight = 150;


function makeLines(vars, ranges, prednum) {

	// console.log(ranges);

	var line_div = d3.select("#sml-mpls").append("div")	
					    .attr("class", "tooltip")				
					    .style("opacity", 0);

	get_line_data([1, 2, 3, 4, 5], "radius_mean,perimeter_mean").then(function(res) {

		//actual point data
		var pred_data = res['predicate_data'];
		//list of preds and their ranges
		var preds = res['predicates'];
		var pred_ranges = preds[prednum];
		console.log(pred_ranges)

		var data_for_lines = []

		for (var i = 0; i < vars.length; i++) {
			var currvar = vars[i];
			data_for_lines.push(pred_data[currvar])
		}

// 	// add an svg for each line chart we want
	var lsvgs = d3.select("#sml-mpls")
			.selectAll("svg")
				.data(data_for_lines)

		lsvgs.enter()
			.append("svg")
				.attr("class", "linez")
				.attr("id", function(d, i) {
					console.log(vars[i])
					return vars[i];
				})
				.attr("width", lineChartWidth)
				.attr("height", lineChartHeight)
				.style("background-color", "#e8e8e8")
				.append("g")
				.append("text")
						.attr("x", 5)
						.attr("y", 15)
						.attr("font-size", "12px")
						.attr("color", "gray")
						.text(function(d, i) {
							return vars[i];
						})

		d3.selectAll(".linez").on("mouseover", function(d, i) {

					line_div.transition()		
		                .duration(100)		
		                .style("opacity", 1)
		            	.style("left", (d3.event.pageX + 40) + "px")		
		                .style("top", (d3.event.pageY + 45) + "px")

		                var curr_range = ranges[i][0];
						var left = curr_range[0];
						var right = curr_range[1];

		            line_div.html("<b>" + this.id +"</b>" + "<br>" + right + "<br>" + left)
				})
				.on("mouseout", function() {
					line_div.transition()		
		                .duration(500)		
		                .style("opacity", 0);
				})


		var lx = d3.scaleTime().range([0, lineChartWidth-5]);
		var ly = d3.scaleLinear().range([lineChartHeight-5, 0]);

	// 	// instantiate the line object
		var vline = d3.line()
						.x(function(d, i) {
							return lx(i); 
						}) 
						.y(function(d) {
							return ly(d);
						})

		lx.domain([0, data_for_lines[0].length+5]);

	// 	// append lines to each svg,
	// 	// note that y domain is dynamically generated here.
		var vlines = d3.selectAll(".linez").selectAll("g")
							.attr("class", function(d, i) {
								return "vlines";
							})
							.append("path")
							.attr("class", "line")
							.attr("d", function(d) {
						ly.domain([0, d3.max(d)]);
						return vline(d);
					})
					.style("fill", "none")
					.attr("transform", "translate(1, 2)")
					.style("stroke-width", "1.5px")
					.style("stroke", "gray")


		// var toplines = d3.selectAll(".linez").append("rect")
		// 						.attr("class", "topline")
		// 						.attr("x", 0)
		// 						.attr("y", function(d, i) {

		// 							var curr_range = ranges[i][0];
		// 							console.log("hellooooooo", curr_range)
		// 							var left = curr_range[0];
		// 							var right = curr_range[1];
		// 							return ly(right);
		// 						})
		// 						.attr("width", lineChartWidth)
		// 						.attr("height", function(d, i) {
		// 							var curr_range = ranges[i][0];
		// 							var left = curr_range[0];
		// 							var right = curr_range[1];

		// 							if ((ly(right) - ly(left)) == 0) {
		// 								return 2;
		// 							} else {
		// 								return (ly(right) - ly(left));
		// 							}
		// 						})
		// 						.style("fill", "orange")
		// 						.style("opacity", 0.4)


		d3.selectAll(".linez").append("g")
						.attr("class", "axis")
						.attr("transform", "translate(3," + (lineChartHeight-16) + ")")
						.call(d3.axisBottom(lx)
        					.tickFormat(d3.format(".0f",))
        					.tickSize(3));

		lsvgs.exit().remove();			
		// toplines.exit().remove();
		vlines.exit().remove();

	})

}

// makeLines(["radius_mean", "perimeter_mean"], [[0.3984443364122509, 0.3984443364122509], [0.3827535159141377,0.3827535159141377]], 0);