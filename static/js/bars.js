// bars.js 
// -------------------------------------------------------

// api call to get barcode data
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

var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

// set dimensions of the barcode vis
var barcodeWidth = $("#bars").width()-40;
var barsheight = $("#bars").height()-10;
var barcodeHeight = 32;

// set visual domain of the x axis of the barcode charts
var x = d3.scaleLinear()
		.range([1, barcodeWidth-5]) 

// get data from api and build a chart with it
get_barcode_data([1, 2, 3, 4, 5], "radius_mean,perimeter_mean").then(function(res) {

	// process the data, create a map for better handling
	var ks = [];
	var vals = [];
	var dict = {};
	// var feats = d3.map();

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

	// This part just sets up the slider UI with the slider package (included)
	var stdSlider = document.getElementById('controls');
	var ninefive = Math.floor(0.95*(mmax));

	noUiSlider.create(stdSlider, {
		start: [ninefive],
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

// function to color the marks based on the slider values
function colorUp(d) {
	var value = stdSlider.noUiSlider.get();
		if ((d)>=value) {
			return "orange";
		} else {
			return "gray";
		}
}

	// Add an svg for each feature
	var svgs = d3.select("#bars")
				.selectAll("svg")
					.data(vals)

		svgs.enter()
			.append("svg")
				.attr("id", function(d, i) {
					return i;
				})
				.attr("class", "barcode")
				.attr("width", barcodeWidth)
				.attr("height", barcodeHeight)
				.style("background-color", "#e8e8e8")
				.attr("transform", "translate(17, 0)")
				.on("mouseover", function(d) {
					div.transition()		
		                .duration(300)		
		                .style("opacity", 1);		
		            div.html("<b>Feature: </b>" + ks[this.id] + "<br>" + "<b>Anomalies: </b>")	
		                .style("left", (d3.event.pageX + 10) + "px")		
		                .style("top", (d3.event.pageY - 28) + "px");	
				})
				.on("mouseout", function() {
					div.transition()		
		                .duration(500)		
		                .style("opacity", 0);
				})
				.on("click", function() {

					if (d3.select(this).classed("clicked")) {
						d3.select(this).classed("clicked", false);
					} else {
						d3.select(this).classed("clicked", true);
					}
				})

		// if the features get updated but I don't think they will...
		svgs.exit().remove();

	//Add little barcode marks per respective feaure svg
	var marks = d3.selectAll(".barcode").selectAll("rect")
				.data(function(d) {
					var vz = d3.map(d);
					var vzs = vz.values();
					return vzs;
				})

		x.domain([0, mmax+1]);

		marks.enter()
			.append("rect")
				.attr("id", function(d, i) {
					return i;
				})
				.attr("class", "mark")
				.attr("width", "3px")
				.attr("height", barcodeHeight)	
				.attr("x", function(d) {
					return x(d);
				})
				.style("stroke-width", "1px")
				.style("stroke", "#ededed")
				.style("fill", function(d) { // fill based on slider vals
					var value = stdSlider.noUiSlider.get();
					if (d>=value) {
						return "orange";
					} else {
						return "#969696";
					}
				})
				.on("mouseover", function(d) {
					var currid = this.id;
					d3.selectAll(".mark").style("fill", function(d) {
						if (this.id == currid) {
							return "blue";
						} else {
							return colorUp(d);
						}
					});
				})
				.on("mouseout", function() {
					d3.selectAll(".mark").style("fill", function(d) {
						return colorUp(d);
					});
					d3.selectAll(".unselected").style("fill", "gray");
					d3.selectAll("circle").style("fill", "gray");
				})
				.on("click", function() {
					var currid = this.id;
					// interaction for isolating the connected marks
					d3.selectAll(".mark").style("fill", function(d) {
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

	var backwards = d3.scaleLinear()
					.domain([0, barcodeWidth])
					.range([0, 100])
	function recolor() {
		d3.selectAll(".mark").style("fill", function() {
			var lilval = (Math.floor(backwards(this.x.baseVal.value)));
			return colorUp(lilval);
	})
};

	stdSlider.noUiSlider.on('change', recolor);

});


// reverse domain function for recoloring bar marks based on slider values


// recolor function for barcode marks when the slider moves





// eventually will be functionality for the drop down control above the barcode charts
// leave this along for now I guess
// $("#sorts").on("change", function() {
// 	console.log("doesn't work right this second");

// });