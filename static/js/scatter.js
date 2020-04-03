
function get_scatter_data(index, targets){

    return $.ajax({
    	url: 'http://localhost:5000/get_projections',
        type: "POST",
        dataType: "JSON",
        data: JSON.stringify({'index':index, 'targets': targets}),
        success: function(resp, data){
            if (resp != null){
                return resp;
            }
        }
    });
}

var batch = new Object();

// grab the dimensions of the div we want
var canvasW = $("#scatter").width();
var canvasH = $("#scatter").height();

// setting up dimensions for the scatter plot
var margin = {top:10, right:10, bottom: 20, left:20},
	sc_width = canvasW - margin.left - margin.right;
	sc_height = canvasH - margin.top - margin.bottom;

// ranges for the x and y axes on the screen
var sct_x = d3.scaleLinear()
			.range([0, sc_width-40]);

var sct_y = d3.scaleLinear()
			.range([sc_height-30, 0]);


var svg = d3.select("#scatter")
		.append("svg")
			.attr("width", sc_width)
			.attr("height", sc_height)
			.style("border", "2px solid #e8e8e8")
			.style("border-radius", "5px")
			.append("g")
				.attr("transform", "translate(" + (margin.left+10) + ", " + margin.top + ")")


// collect data from api and build the scatter plot
function makeScatter(idxs, feats) {

	get_scatter_data(idxs, feats).then(function(res) {

		console.log(res[0]);
		console.log(res[1]);

		// domains for the input from the data
		sct_x.domain(d3.extent(res, function(d) { return +(d.x)}));
		sct_y.domain(d3.extent(res, function(d) { return +(d.y)}));

			// draw a point for each data point
			svg.selectAll("circle")
					.data(res)
					.enter()
					.append("circle")
						.attr("id", function(d, i) {
							return i;
						})
						.attr("r", "4px")
						.attr("cx", function(d) {
							return (sct_x(+(d.x)));
						})
						.attr("cy", function(d) {
							return (sct_y(+(d.y)))
						})
						.style("fill", "gray")
						.transition().duration(500)
	})
}

// // update function. Anytime a change is made the data, the vis will get redrawn
// // as long as you give it the updated data.

function update(data) {

	// console.log("in update!");
	// console.log(data[0]);
	// console.log(data[1]);

	sct_x.domain(d3.extent(data, function(d) { return +(d.x)}));
	sct_y.domain(d3.extent(data, function(d) { return +(d.y)}));

	var svgCircles = svg.selectAll("circle")
					.data(data);

	// draw a point for each data point
		svgCircles.enter()
			.append("circle")
				.attr("id", function(d, i) {
					console.log(d.index);
					return i;
				})
				.attr("r", "4px")
				.attr("cx", function(d) {
					console.log("HELLOOOO???")
					return (sct_x(+(d.x)));
				})
				.attr("cy", function(d) {
					return (sct_y(+(d.y)))
				})
				.style("fill", "blue")
				.transition().duration(500)

	svgCircles.exit().remove();

}

function updateScatter(idxs, feats) {
	get_scatter_data(idxs, feats).then(function(res) {
		update(res);
	})
}


function runData() {

}



svg.append("g")
      .call(d3.brush().extent([[0, 0], [sc_width, sc_height]])
      	.on("brush", brushed)
      	.on("end", brushended));


function brushed() {
	var s = d3.event.selection,
				x0 = s[0][0],
				y0 = s[0][1],
				dx = s[1][0],
				dy = s[1][1];


	d3.selectAll("circle")
			.style("fill", function(d) {

				if (sct_x(d.x) >= x0 && sct_x(d.x) <= dx && sct_y(d.y) >= y0 && sct_y(d.y) <= dy) {
					return "blue";
				} else {
					return "gray";
				}
			})
			.attr("class", function(d) {
				if (sct_x(d.x) >= x0 && sct_x(d.x) <= dx && sct_y(d.y) >= y0 && sct_y(d.y) <= dy) {
					batch[this.id] = this.id;
					return "selected";
				} else {
					return "unselected";
					delete batch[this.id];
				}
			})

}


function brushended() {
	if (!d3.event.selection) {

		d3.selectAll("circle")
			.transition()
			.duration(150)
			.ease(d3.easeLinear)
			.style("fill", "gray")
		}
}

