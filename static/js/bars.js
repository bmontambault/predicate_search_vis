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

var selectedFeats = new Object();
var anoms = new Object();

var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

// set dimensions of the barcode vis
var barcodeWidth = $("#bars").width()-40;
var barsheight = $("#bars").height()-10;
var barcodeHeight = 32;

// set visual domain of the x axis of the barcode charts
var bar_x = d3.scaleLinear()
		.range([1, barcodeWidth-5]) 

var bc_data = [];
// get data from api and build a chart with it
var stdSlider = document.getElementById('controls');
var ninefive = 0;

function colorUp(d) {
	var value = stdSlider.noUiSlider.get();
		if ((d)>=value) {
			return "orange";
		} else {
			return "gray";
		}
}

get_barcode_data([1, 2, 3, 4, 5], "radius_mean,perimeter_mean").then(function(res) {

	var keys = Object.keys(res);
	var len = keys.length
	var vals = Object.values(res);
	var k = 20;

	
	for (var i = 0; i < 20; i++) {

		var trial = new Object()
		trial = vals[i];
		vals2 = Object.values(trial);

		curr_obj = {};
		curr_obj["fid"] = i;
		curr_obj["feature"] = keys[i];
		curr_obj["values"] = vals2;
		curr_obj["anomalies"] = [];

		bc_data.push(curr_obj);
	}
	
	var mmax = 0;


	for (var i = 0; i < vals.length; i++) {
		var fornow = d3.map(vals[i]);
		var currmax = d3.max(fornow.values());
		if(mmax < currmax) {
			mmax = currmax;
		}
	}

	if (len > 20) {
		var btn = $('<button id="seeMore">See more</button>');
		btn.insertAfter($("#bars"));
	}

	// This part just sets up the slider UI with the slider package (included)
	// var stdSlider = document.getElementById('controls');
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

	var backwards = d3.scaleLinear()
				.domain([0, barcodeWidth])
				.range([0, mmax+1])

	stdSlider.noUiSlider.on('change', function() {
		console.log("hiiii");
		recolor();
	});



// function to color the marks based on the slider values
// function colorUp(d) {
// 	var value = stdSlider.noUiSlider.get();
// 		if ((d)>=value) {
// 			return "orange";
// 		} else {
// 			return "gray";
// 		}
// }

function updateAnoms(elem, orange) {

	//get the feature of the current mark
	var dad_idx = d3.select(elem.parentNode)._groups[0][0].id;

	// if the list of anomalies for this feature already includes this mark
	if(bc_data[dad_idx].anomalies.includes(+elem.id)) {
		if(!orange) {
			// remove this mark from the feature's anomaly list
			index = bc_data[dad_idx].anomalies.indexOf(+elem.id);
			 bc_data[dad_idx].anomalies.splice(index, 1);
		}

	} else {
		if(orange) {
			//otherwise, add it to this feature's anomaly list
			bc_data[dad_idx].anomalies.push(+elem.id);
			anoms[+elem.id] = dad_idx;
		}
		// if this mark is not already in the anomaly list then add it
		if (!(elem.id in anoms)) {
			anoms[+elem.id] = dad_idx;
		}
	}
}

$("#sorts").change(function() {
	console.log("changingg")
	var selection = $("#sorts").val();
	if (selection == "Most anomalies"){
		console.log("bc_data length: " + bc_data.length);
		var sorted = bc_data.sort(function(x, y){
		   		return d3.descending(x.anomalies, y.anomalies);
			})
		makeBars(sorted);
		recolor();

	} else if (selection == "Target variable name") {
		var sorted = bc_data.sort(function(x, y){
	   		return d3.ascending(x.feature, y.feature);
		})
		makeBars(sorted);
		recolor();
	}
})

function makeBars(bc_data) {
	var selected = false;
	// Add an svg for each feature
	var svgs = d3.select("#bars")
				.selectAll("svg")
					.data(bc_data)

		svgs.enter()
			.append("svg")
				.attr("id", function(d) {
					return d.fid;
				})
				.attr("class", "barcode")
				.attr("width", barcodeWidth)
				.attr("height", barcodeHeight)
				.style("background-color", "#e8e8e8")
				.style("opacity", 0)
				.attr("transform", "translate(17, 10)")
				.on("mouseover", function(d) {
					div.transition()		
		                .duration(300)		
		                .style("opacity", 1);	

		            var ftname = "<b>Feature:</b> " +  bc_data[+this.id].feature;
		            var ftid = "<b>Feature:</b> " +  bc_data[+this.id].fid;
		            var as = "<b>Anomalies:</b> " + (bc_data[+this.id].anomalies).length;

		            div.html(ftname + "<br>" + ftid + "<br>" + as)	
		                .style("left", (d3.event.pageX + 70) + "px")		
		                .style("top", (d3.event.pageY + 55) + "px");	
				})
				.on("mouseout", function() {
					div.transition()		
		                .duration(500)		
		                .style("opacity", 0);
				})
				.on("click", function(d) {
					if (d3.select(this).classed("clicked")) {
						if (selected) {
							d3.select(this).classed("clicked", false);
							selected = false;
							delete selectedFeats[+this.id];
						} 
					} else if (!(d3.select(this).classed("clicked"))) {
						if (selected) {
							d3.select(".clicked").transition()
												 .duration(300)
												 .style("background-color", "blue")
												 	.style("opacity", .5)
												 .transition()
												 .duration(300)
												 .style("background-color", "#e8e8e8")
												 		.style("opacity", 1)
							selected = true;
						} else if (!selected) {
							d3.select(this).classed("clicked", true);
							selected = true;
							selectedFeats[+this.id] = bc_data[+this.id].feature;
						}
					}
				})
						

		d3.selectAll(".barcode").transition()
									.delay(function(d, i) {
										return 50*i;
									})
									.attr("transform", "translate(17, 0)")
									.style("opacity", 1)


		svgs.exit().remove();
// 	//Add little barcode marks per respective feaure svg
	var marks = d3.selectAll(".barcode").selectAll("rect")
				.data(function(d) {
					return d.values;
				})

		bar_x.domain([0, mmax+1]);

		marks.enter()
			.append("rect")
				.attr("id", function(d, i) {
					return i;
				})
				.attr("class", "mark")
				.attr("width", "3px")
				.attr("height", barcodeHeight)	
				.attr("x", function(d) {
					return 0;
					// return x(d);
				})
				.style("fill", function(d) { // fill based on slider vals
					var value = stdSlider.noUiSlider.get();
					if (d>=value) {
						var dad_idx = d3.select(this.parentNode)._groups[0][0].id;
						updateAnoms(this, true);
						return "orange";
					} else {
						return "#969696";
					}
				})
				.style("opacity", .7)
				.on("mouseover", function(d) {
					var currid = this.id;
					d3.selectAll(".mark").style("fill", function(d) {
						if (this.id == currid) {
							return "blue";
						} else {
							return colorUp(this.id);
						}
					});
					d3.selectAll("circle").style("fill", function(d) {
						if (this.id == currid) {
							return "blue";
						} else {
							return colorUp(d);
						}
					})
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
			})

		d3.selectAll(".mark").transition().duration(1000)
							.attr("x", function(d) {
								return bar_x(d);
							})
							.attr("fill", function(d) {
								colorUp(d);
							})
							.delay(300)

		marks.exit().remove();
	}

	makeBars(bc_data);

	
	function recolor() {

		console.log("calling recolor");
		d3.selectAll(".mark").style("fill", function() {

			var lilval = (Math.floor(backwards(this.x.baseVal.value)));
			if (colorUp(lilval) == "orange") {
				updateAnoms(this, true);
				return colorUp(lilval);
			}
			updateAnoms(this, false);
			return colorUp(lilval);
		})
	};



	$("#seeMore").on("click", function() {
			prepVizData(38, res);
			makeBars(bc_data);
		
	})

	function prepVizData(total, fullData) {

		if ((k+10) < total) {
			console.log("more to go");
			for (var i = k; i < k+10; i++) {

				var trial = new Object()
				trial = vals[i];
				vals2 = Object.values(trial);

				curr_obj = {};
				curr_obj["fid"] = i;
				curr_obj["feature"] = keys[i];
				curr_obj["values"] = vals2;
				curr_obj["anomalies"] = [i];

				bc_data.push(curr_obj);
			}
			k = k+10;

		} else if ((k+10) > total) {
			
			var remainder = total - k;
			console.log("remainder: " + remainder);

			for (var i = k; i < k+remainder; i++) {
				var trial = new Object()
				trial = vals[i];
				vals2 = Object.values(trial);

				curr_obj = {};
				curr_obj["fid"] = i;
				curr_obj["feature"] = keys[i];
				curr_obj["values"] = vals2;
				curr_obj["anomalies"] = [i];

				bc_data.push(curr_obj);
			}
			k = k+remainder;
			$("#seeMore").attr('disabled', true);
		}
		console.log(bc_data);
	}

});


$("#genScat").on("click", function() {

	var feats = Object.values(selectedFeats);

	// no features have been selected, remind user
	if (feats.length == 0) {
		alert("Please choose at least one target variable from the barcode panel");

	} else {
		//if this is the first time you've clicked generate projection...
		if($("#welcome-scatter").length) {

			$("#welcome-scatter").remove();
			$("welcome-tabs").remove();
			// makeScatter([], feats[0]);
			makeScatter([], "radius_mean,perimeter_mean")

		} else {
			feats[0];
			updateScatter([], "radius_mean,texture_mean")
			// updateScatter([], feats[0]);
		}
	}
})
