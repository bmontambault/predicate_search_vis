
console.log("Generating the scatter plot/projection...");

function get_scatter_data(index, targets){

    return $.ajax({
    	url: 'http://localhost:5000/get_projections',
        type: "POST",
        dataType: "JSON",
        data: JSON.stringify({'index':index, 'targets': targets}),
    });
}

// grab the dimensions of the div we want
var canvasW = $("#scatter").width();
var canvasH = $("#scatter").height();

// setting up dimensions for the scatter plot
var margin = {top:10, right:10, bottom: 20, left:20},
	width = canvasW - margin.left - margin.right;
	height = canvasH - margin.top - margin.bottom;

// ranges for the x and y axes on the screen
var x = d3.scaleLinear()
			.range([0, width-40]);

var y = d3.scaleLinear()
			.range([height-30, 0]);

	// create an svg for the scatter plot
var svg = d3.select("#scatter")
			.append("svg")
				.attr("width", width)
				.attr("height", height)
				.style("border", "2px solid #e8e8e8")
				.style("border-radius", "5px")
				.append("g")
					.attr("transform", "translate(" + (margin.left+10) + ", " + margin.top + ")")

// collect data from api and build the scatter plot
get_scatter_data([1, 2, 3, 4, 5], "radius_mean,perimeter_mean").then(function(res) {
	
	// console.log(res);

	// domains for the input from the data
	x.domain(d3.extent(res, function(d) { return +(d.x)}));
	y.domain(d3.extent(res, function(d) { return +(d.y)}));

	//instantiate the axes for x and y
	var xAxis = d3.axisBottom(x);
	var yAxis = d3.axisLeft(y);

		// draw a point for each data point
		svg.selectAll("circle")
				.data(res)
				.enter()
				.append("circle")
					.attr("id", function(d) {
						return d.index;
					})
					.attr("r", "4px")
					.attr("cx", function(d) {
						return (x(+(d.x)));
					})
					.attr("cy", function(d) {
						return (y(+(d.y)))
					})
					.style("fill", "gray")
})

// update function. Anytime a change is made the data, the vis will get redrawn
// as long as you give it the updated data.

function updateScatter(data) {

	var svgCircles = d3.selectAll("circle")
						.data(data)

		svgCircles.enter()
			.append("circle")
			.attr("id", function(d) {
				return d.index;
			})
			.attr("r", "4px")
				.attr("cx", function(d) {
					return (x(+(d.x)));
				})
				.attr("cy", function(d) {
					return (y(+(d.y)))
				})
				.style("fill", "blue");

		svgCircles.exit().remove();
}

svg.append("g")
      .call(d3.brush().extent([[0, 0], [width, height]])
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

				if (x(d.x) >= x0 && x(d.x) <= dx && y(d.y) >= y0 && y(d.y) <= dy) {
					return "blue";
				} else {
					return "gray";
				}
			})
			.attr("class", function(d) {
				if (x(d.x) >= x0 && x(d.x) <= dx && y(d.y) >= y0 && y(d.y) <= dy) {
					return "selected";
				} else {
					return "unselected";
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
