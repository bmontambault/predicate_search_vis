
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

	var line_div = d3.select("#sml-mpls").append("div")	
					    .attr("class", "tooltip")				
					    .style("opacity", 0);

	get_line_data([1, 2, 3, 4, 5], "radius_mean,perimeter_mean").then(function(res) {

		var pred_data = res['predicate_data'];
		var preds = res['predicates'];
		var pred_ranges = preds[prednum];

		var data_for_lines = []

		for (var i = 0; i < vars.length; i++) {

			var currobj = new Object;
			currobj["var_name"] = vars[i];
			currobj["line_data"] = pred_data[vars[i]];
			data_for_lines[vars[i]] = currobj;
		}

		var actual = d3.entries(data_for_lines);

// 	// add an svg for each line chart we want
	var lsvgs = d3.select("#sml-mpls")
			.selectAll("svg")
				.data(actual, function(d) {
					return d.key;
				})

		lsvgs.enter()
			.append("svg")
				.attr("class", "linez")
				.attr("id", function(d, i) {
					return d.key;
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
							return d.key;
						})

		d3.selectAll(".linez").on("mouseover", function(d, i) {

					line_div.transition()		
		                .duration(100)		
		                .style("opacity", 1)
		            	.style("left", (d3.event.pageX + 40) + "px")		
		                .style("top", (d3.event.pageY + 45) + "px")
		                
		                var currid = this.id
		                var curr_range = pred_ranges[currid];
						var left = curr_range[0][0];
						var right = curr_range[0][1];

		            line_div.html("<b>" + this.id +"</b>" + "<br>" + right + "<br>" + left)
				})
				.on("mouseout", function() {
					line_div.transition()		
		                .duration(500)		
		                .style("opacity", 0);
				})

		lsvgs.exit().remove();

		var lx = d3.scaleLinear().range([0, (lineChartWidth-5)]);
		var ly = d3.scaleLinear().range([(lineChartHeight-5), 0]);

		lx.domain([0, actual[0].value.line_data.length]);

		// instantiate the line object
		var vline = d3.line()
						.x(function(d, i) {
							return lx(i); 
						}) 
						.y(function(d) {
							return ly(d);
						})

	// append lines to each svg,
	// note that y domain is dynamically generated here.
	var vlines = d3.selectAll(".linez").selectAll("path").data(actual, function(d) {
		return d.value.line_data;
	});

		vlines.enter().append("path")
						.attr("class", "vlines")
						.attr("d", function(d) {
							ly.domain([0, d3.max(d.value.line_data)]);
							return vline(d.value.line_data);
						})
						.style("fill", "none")
						.attr("transform", "translate(1, 2)")
						.style("stroke-width", "1px")
						.style("stroke", "gray")

		var toplines = d3.selectAll(".linez").append("rect")
								.attr("class", "topline")
								.attr("x", 0)
								.attr("y", function(d) {

									var curr_range = pred_ranges[d.key];
									var left = curr_range[0][0];
									var right = curr_range[0][1];
									return ly(right);

								})
								.attr("width", lineChartWidth)
								.attr("height", function(d) {

									var curr_range = pred_ranges[d.key];
									var left = curr_range[0][0];
									var right = curr_range[0][1];

									if ((ly(right) - ly(left)) == 0) {
										return 2;
									} else {
										return (ly(right) - ly(left));
									}
								})
								.style("fill", "orange")
								.style("opacity", 0.4)


  		var xaxes = d3.selectAll(".linez").append("g")
  						.attr("class", "axis")
  						.attr("transform", "translate(3," + (lineChartHeight-16) + ")")
  						.call(d3.axisBottom(lx)
  							.tickFormat(d3.format(".0f",))
        					.tickSize(3));
					

		vlines.exit().remove();

	d3.selectAll(".linez").append("g")
      .call(d3.brush().extent([[0, 0], [lineChartWidth, lineChartHeight]])
      	.on("brush", brushed)
      	.on("end", brushended));


     function brushed() {
	var s = d3.event.selection,
				x0 = s[0][0],
				y0 = s[0][1],
				dx = s[1][0],
				dy = s[1][1];

}

function brushended() {
	if (!d3.event.selection) {

		d3.selectAll("circle")
			.transition()
			.duration(150)
			.ease(d3.easeLinear)
			.style("fill", function(d) {
				return "gray";
				// return colorUp(this.id);
			})
		}
	
}

	})

}

