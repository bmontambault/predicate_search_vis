
// console.log("Generating the barcode charts...");

// This part just sets up the slider, no need to mess with this I don't think
var stdSlider = document.getElementById('controls');

noUiSlider.create(stdSlider, {
	start: [5, 95],
	connect: false,
	tooltips: true,
	range: {
		'min': 0,
		'max': 100
	},
	format: wNumb({
		decimals: 0
	})
});

// ---------------------------------------------------
function get_barcode_data(index, targets){

    return $.ajax({
    	url: 'http://localhost:5000/get_zscores',
        type: "POST",
        dataType: "JSON",
        data: JSON.stringify({'index':index, 'targets': targets}),
    });
}

// bar code chart starts here:
// getting dimensions of the div we want
var barcodeWidth = $("#bars").width()-40;
var barsheight = $("#bars").height()-10;
var barcodeHeight = 32;

// setting up domain and range for x and y of the chart
// hard coding the domain for x input because I know my data is 
// just a random number from 1-100. Will need to dynamically generate
// once you get your data in here
var x = d3.scaleLinear()
		.range([0, barcodeWidth]) 


// this function color the little bar marks based on the
// values of the slider
function colorUp(d) {
	var values = stdSlider.noUiSlider.get();
	var left = values[0];
	var right = values[1];
		if (((+d) <=left) || ((+d)>=right)) {
			return "orange";
		} else {
			return "gray";
		}
}

get_barcode_data([1, 2, 3, 4, 5], "radius_mean,perimeter_mean").then(function(res) {

	// console.log(res);
	// Add an svg for each element

	// var svgs = d3.select("#bars")
	// 			.selectAll("svg")
	// 				.data(res)

	// 	svgs.enter()
	// 		.append("svg")
	// 			.attr("class", "bsvgs")
	// 			.attr("width", barcodeWidth)
	// 			.attr("height", barcodeHeight)
	// 			.style("background-color", "#e8e8e8")
	// 			.attr("transform", "translate(35, 0)")


	// 	svgs.exit().remove();

	//Add little barcode marks per respective svg
	// var blips = d3.selectAll(".bsvgs").selectAll("rect")
	// 			.data(function(d) {
	// 				return d;
	// 			})

	// 	blips.enter()
	// 		.append("rect")
	// 			.attr("class", "bloop")
	// 			.attr("id", function(d, i) {
	// 				return i;
	// 			})
	// 			.attr("width", "3px")
	// 			.attr("height", barcodeHeight)	
	// 			.attr("x", function(d) {
	// 				return chartScale(d);
	// 			})
	// 			.style("fill", function(d) { // fill based on slider vals
	// 				var values = stdSlider.noUiSlider.get();
	// 				left = values[0];
	// 				right = values[1];
	// 				if (((+d) <=left) || ((+d)>=right)) {
	// 					return "orange";
	// 				} else {
	// 					return "#969696";
	// 				}
	// 			})
	// 			.style("stroke-width", "1px")
	// 			.style("stroke", "#ededed")
	// 			.on("mouseover", function(d) {
	// 				var currid = this.id;
	// 				d3.selectAll(".bloop").style("fill", function(d) {
	// 					if (this.id == currid) {
	// 						return "blue";
	// 					} else {
	// 						return colorUp(d);
	// 					}
	// 				});
	// 			})
	// 			.on("mouseout", function() {
	// 				d3.selectAll(".bloop").style("fill", function(d) {
	// 					return colorUp(d);
	// 				});
	// 				d3.selectAll(".unselected").style("fill", "gray");
	// 				d3.selectAll("circle").style("fill", "gray");
	// 			})
	// 			.on("click", function() {
	// 				var currid = this.id;
	// 				// interaction for isolating the connected marks
	// 				d3.selectAll(".bloop").style("fill", function(d) {
	// 					if (this.id == currid) {
	// 						if(colorUp(d) == "orange") {
	// 							return "orange";
	// 						} else {
	// 							return "gray";
	// 						}
	// 					return "blue";
	// 					} else {
	// 						return "none";
	// 					}
	// 				});
					
	// 				// 	// interaction for hilighting the respective data point circle
	// 				d3.selectAll("circle").style("fill", function(d) {
	// 					var thisid = itemID(d);
	// 					if (thisid == currid) {
	// 							return "gray";
	// 					} else {
	// 							return "none";
	// 					}
	// 				})

	// 		})


	// var labels = d3.selectAll(".bsvgs").selectAll("text")
	// 		.data(function(d, i) {
	// 			var list = datamap.keys();
	// 			// console.log(list[i]);
	// 			return list[i];
	// 		})

	// 	labels.enter()
	// 			.append("text")
	// 				.attr("class", "labels")
	// 				.text(function(d) {
	// 					return d;
	// 				})
	// 				.attr("x", function(d, i) {
	// 					return (5*(i+1)) + 20;
	// 				})
	// 				.attr("y", barcodeHeight/2)
	// 				.attr("transform", "translate(-20, 5)")
	// 				.style("padding", "5px")

	// 	labels.exit().remove();
});

// makeBars(data);

// reverse domain function for recoloring bar marks based on slider values
// var backwards = d3.scaleLinear()
// 					.domain([0, barcodeWidth])
// 					.range([0, 100])

// recolor function for barcode marks when the slider moves
// function recolor() {
// 	d3.selectAll(".bloop").style("fill", function() {
// 		var values = stdSlider.noUiSlider.get();
// 		left = values[0];
// 		right = values[1];
// 		var lilval = (Math.floor(backwards(this.x.baseVal.value)));
// 		return colorUp(lilval);
// 	})
// };


// stdSlider.noUiSlider.on('change', recolor);

// eventually will be functionality for the drop down control above the barcode charts
// leave this along for now I guess
$("#sorts").on("change", function() {
	console.log("doesn't work right this second");

});