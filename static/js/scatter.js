
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
// var margin = {top:0, right:0, bottom:20, left:20},
sc_width = canvasW-10;
sc_height = canvasH-10;

// ranges for the x and y axes on the screen
var sct_x = d3.scaleLinear()
			.range([25, (sc_width-25)]);

var sct_y = d3.scaleLinear()
			.range([(sc_height-25), 30]);

var sc_svg = d3.select("#scatter")
		.append("svg")
			.attr("class", "sct")
			.attr("width", sc_width)
			.attr("height", sc_height)
			.append("g")
				.attr("transform", "translate(20, -20)")

var xs = d3.scaleLinear();
var xaxis = d3.axisBottom(xs);
var plotx = d3.select(".sct").append("g");

var ys = d3.scaleLinear();
var yaxis = d3.axisLeft(ys);
var ploty = d3.select(".sct").append("g");
var anoms = [];

// collect data from api and build the scatter plot
function makeScatter(idxs, feats, fidx) {

	anoms = bc_data[fidx].anomalies;

	get_scatter_data(idxs, feats).then(function(res) {

		sct_x.domain(d3.extent(res, function(d) { return +(d.x)}));
		sct_y.domain(d3.extent(res, function(d) { return +(d.y)}));


		xs.domain(d3.extent(res, function(d) { return +(d.x)}));
		xs.range([0, (sc_width-20)]);
		plotx.attr("transform", "translate(15," + (sc_height-20) +")")
							.transition().duration(1000).call(xaxis.tickFormat(d3.format(".2f",)).tickSize(3))

		ys.domain(d3.extent(res, function(d) { return +(d.y)}));
		ys.range([(sc_height-30), 0]);
		ploty.attr("transform", "translate(23, 5)")
							.transition().duration(1000).call(yaxis.tickSize(2))

		// draw a point for each data point
		var svgCircles = d3.select(".sct").select("g").selectAll("circle")
					.data(res, function(d) {
						return d.x;
					})

			svgCircles.enter()
					.append("circle")
						.attr("id", function(d) {
							return d.index;
						})
						.attr("r", "5px")
						.attr("cx", function(d) {
							return (sct_x(+(d.x)));
						})
						.attr("cy", function(d) {
							return (sct_y(+(d.y)))
						})
						.style("fill", function(d) {
							if (anoms.includes(d.index)) {
								return "orange";
							} else {
								return "gray";
							}
						})
						.style("stroke-width", "1px")
						.style("stroke", "white")
						.style("opacity", 0)
						.transition().duration(300)
							.style("opacity", 1)



		svgCircles.exit().remove()

	})
}

sc_svg.append("g")
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
					if (anoms.includes(d.index)) {
						return "orange";
					} else {
						return "gray";
					}
				}
			})
			.attr("class", function(d) {
				if (sct_x(d.x) >= x0 && sct_x(d.x) <= dx && sct_y(d.y) >= y0 && sct_y(d.y) <= dy) {
					batch[this.id] = +this.id;
					return "selected";
				} else {
					delete batch[this.id];
					return "unselected";
				}
			})

		idMarks(batch);
}


function brushended() {
	if (!d3.event.selection) {

		d3.selectAll("circle")
			.transition()
			.duration(150)
			.ease(d3.easeLinear)
			.style("fill", function(d) {
				if (anoms.includes(d.index)) {
					return "orange";
				} else {
					return "gray";
				}
			})
		}

		d3.selectAll(".mark").style("fill", function(d) {
			return colorUp(d);
		});
		d3.selectAll(".mark").style("opacity", .7);
	
}

function idMarks(points) {
	var pts = Object.values(batch);
	d3.selectAll(".mark").style("fill", function(d) {
		if (pts.includes(+this.id))  {
			return "blue";
		} else {
			return "gray";
		}
	})
	d3.selectAll(".mark").style("opacity", function(d) {
		if (pts.includes(+this.id))  {
			return 1;
		} else {
			return .2;
		}
	})
}
