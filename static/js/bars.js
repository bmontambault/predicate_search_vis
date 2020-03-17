
// console.log("Generating the barcode charts...");

function get_barcode_data(index, targets){

    return $.ajax({
    	url: 'http://localhost:5000/get_zscores',
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

var barcodeWidth = $("#bars").width()-40;
var barsheight = $("#bars").height()-10;
var barcodeHeight = 32;
console.log(barcodeWidth);
var x = d3.scaleLinear()
		.range([0, barcodeWidth]) 

// this function color the little bar marks based on the
// values of the slider

get_barcode_data([1, 2, 3, 4, 5], "radius_mean,perimeter_mean").then(function(res) {

	var ks = [];
	var vals = [];
	var dict = {};

	var datamap = d3.map(res);

	for (property in datamap) {
		ks.push(property);
	}

	for (var i = 0; i < 30; i++) {
		var elem = ks[i];
		vals.push(datamap[elem]);
		dict[elem] = datamap[elem];
	}

	var mmax = 0;

	for (var i = 0; i < vals.length; i++) {
		var fornow = d3.map(vals[i]);
		var currmax = d3.max(fornow.values());
		if(mmax < currmax) {
			mmax = currmax;
		}
	}

// This part just sets up the slider, no need to mess with this I don't think
var stdSlider = document.getElementById('controls');
var ninefive = Math.floor(0.95*(mmax));

noUiSlider.create(stdSlider, {
	start: [0, ninefive],
	connect: false,
	tooltips: true,
	range: {
		'min': 0,
		'max': mmax+1
	},
	format: wNumb({
		decimals: 0
	})
});

function colorUp(d) {
	var values = stdSlider.noUiSlider.get();
	var left = values[0];
	var right = values[1];
		if (((d) <=left) || ((d)>=right)) {
			return "orange";
		} else {
			return "gray";
		}
}

	// Add an svg for each element
	var svgs = d3.select("#bars")
				.selectAll("svg")
					.data(vals)

		svgs.enter()
			.append("svg")
				.attr("id", "barcode")
				.attr("class", "bsvgs")
				.attr("width", barcodeWidth)
				.attr("height", barcodeHeight)
				.style("background-color", "#e8e8e8")
				.attr("transform", "translate(17, 0)")


		svgs.exit().remove();

	//Add little barcode marks per respective svg
	var blips = d3.selectAll("#barcode").selectAll("rect")
				.data(function(d) {
					var vz = d3.map(d);
					var vzs = vz.values();
					return vzs;
				})

		x.domain([0, mmax]);
		console.log(x(83));

		blips.enter()
			.append("rect")
				.attr("id", function(d, i) {
					return i;
				})
				.attr("class", "bloop")
				.attr("width", "3px")
				.attr("height", barcodeHeight)	
				.attr("x", function(d) {
					return x(d);
				})
				.style("stroke-width", "1px")
				.style("stroke", "#ededed")
				.style("fill", function(d) { // fill based on slider vals
					var values = stdSlider.noUiSlider.get();
					left = values[0];
					right = values[1];
					if (((d) <=left) || ((d)>=right)) {
						return "orange";
					} else {
						return "#969696";
					}
				})
				.on("mouseover", function(d) {
					console.log(d);
					var currid = this.id;
					d3.selectAll(".bloop").style("fill", function(d) {
						if (this.id == currid) {
							return "blue";
						} else {
							return colorUp(d);
						}
					});
				})
				.on("mouseout", function() {
					d3.selectAll(".bloop").style("fill", function(d) {
						return colorUp(d);
					});
					d3.selectAll(".unselected").style("fill", "gray");
					d3.selectAll("circle").style("fill", "gray");
				})
				.on("click", function() {
					var currid = this.id;
					// interaction for isolating the connected marks
					d3.selectAll(".bloop").style("fill", function(d) {
						if (this.id == currid) {
							if(colorUp(d) == "orange") {
								return "orange";
							} else {
								return "gray";
							}
						return "blue";
						} else {
							return "none";
						}
					});
					
					// 	// interaction for hilighting the respective data point circle
					// d3.selectAll("circle").style("fill", function(d) {
					// 	var thisid = itemID(d);
					// 	if (thisid == currid) {
					// 			return "gray";
					// 	} else {
					// 			return "none";
					// 	}
					// })

			})

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
// $("#sorts").on("change", function() {
// 	console.log("doesn't work right this second");

// });