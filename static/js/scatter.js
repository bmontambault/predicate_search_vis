
console.log("Generating the scatter plot/projection...");

function itemID(d) {
	var rid = d.readings;
	id = rid = rid.substring(1);
	return id;
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

// domains for the input from the data
// just using t1 and t2 as placeholders for x and y right now
x.domain(d3.extent(dummy, function(d) { return +(d.t1)}));
y.domain(d3.extent(dummy, function(d) { return +(d.t2)}));

//instantiate the axes for x and y
var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);

// create an svg for the scatter plot
var svg = d3.select("#scatter")
			.append("svg")
				.attr("width", width)
				.attr("height", height)
				.style("border", "2px solid #e8e8e8")
				.style("border-radius", "5px")
				.append("g")
					.attr("transform", "translate(" + (margin.left+10) + ", " + margin.top + ")")

	// draw a point for each data point
	svg.selectAll("circle")
			.data(dummy)
			.enter()
			.append("circle")
				.attr("id", function(d) {
					itemID(d);
				})
				.attr("r", "4px")
				.attr("cx", function(d) {
					return (x(+(d.t1)));
				})
				.attr("cy", function(d) {
					return (y(+(d.t2)))
				})
				.style("fill", "gray")

// update function. Anytime a change is made the data, the vis will get redrawn
// as long as you give it the updated data.

function updateScatter(data) {

	var svgCircles = d3.selectAll("circle")
						.data(data)

		svgCircles.enter()
			.append("circle")
			.attr("id", function(d) {
				return itemID(d);
			})
			.attr("r", "4px")
				.attr("cx", function(d) {
					return (x(+(d.t1)));
				})
				.attr("cy", function(d) {
					return (y(+(d.t2)))
				})
				.style("fill", "blue");

		svgCircles.exit().remove();
}

selected = [];
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
				if (x(+d.t1) >= x0 && x(+d.t1) <= dx && y(+d.t2) >= y0 && y(+d.t2) <= dy) {
					return "blue";
				} else {
					return "gray";
				}
			})
			.attr("class", function(d) {
				if (x(+d.t1) >= x0 && x(+d.t1) <= dx && y(+d.t2) >= y0 && y(+d.t2) <= dy) {
					return "selected";
				} else {
					return "unselected";
				}
			})

	getThoseBars();
}

function getThoseBars(){
	selected = [];
	d3.selectAll(".selected").style("id", function(d) {

		selected.push(d);
		return 
	})
	makeBars(selected);
	selected = [];

}

function brushended() {
	// console.log(d3.event.selection);
	if (!d3.event.selection) {
		makeBars(dummy);

		d3.selectAll("circle")
			.transition()
			.duration(150)
			.ease(d3.easeLinear)
			.style("fill", "gray")

	}
	getThoseBars();
}

