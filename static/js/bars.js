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
var x = d3.scaleLinear()
		.range([1, barcodeWidth-5]) 

var bc_data = [];
// get data from api and build a chart with it

get_barcode_data([1, 2, 3, 4, 5], "radius_mean,perimeter_mean").then(function(res) {

	var l = 0;
	var keys = Object.keys(res);
	var len = keys.length
	var vals = Object.values(res);
	
	for (var i = 0; i < 30; i++) {

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

	console.log(bc_data[1]);
	
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

function updateAnoms(elem, orange) {

	var dad_idx = d3.select(elem.parentNode)._groups[0][0].id;

	if(bc_data[dad_idx].anomalies.includes(elem.id)) {
		if(!orange) {
			index = bc_data[dad_idx].anomalies.indexOf(elem.id);
			 bc_data[dad_idx].anomalies.splice(index, 1);
		}
	} else {
		if(orange) {
			bc_data[dad_idx].anomalies.push(elem.id);
		}
	}
}

// console.log(updateAnoms(["69", "2", "4"], "5", false, true));

function makeBars(bc_data) {
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
				.attr("transform", "translate(17, 0)")
				.on("mouseover", function(d) {
					div.transition()		
		                .duration(300)		
		                .style("opacity", 1);	

		            var ftname = "<b>Feature:</b> " +  bc_data[+this.id].feature;
		            var as = "<b>Anomalies:</b> " + (bc_data[+this.id].anomalies).length;

		            div.html(ftname + "<br>" + as)	
		                .style("left", (d3.event.pageX + 10) + "px")		
		                .style("top", (d3.event.pageY - 28) + "px");	
				})
				.on("mouseout", function() {
					div.transition()		
		                .duration(500)		
		                .style("opacity", 0);
				})
				.on("click", function(d) {
					if (d3.select(this).classed("clicked")) {
						d3.select(this).classed("clicked", false);
						var ck = this.id;
						delete selectedFeats[ck];
					} else {
						d3.select(this).classed("clicked", true);
						selectedFeats[this.id] = "added";
					}
					console.log(selectedFeats);
				})

		svgs.exit().remove();
// 	//Add little barcode marks per respective feaure svg
	var marks = d3.selectAll("svg").selectAll("rect")
				.data(function(d) {
					return d.values;
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
						var dad_idx = d3.select(this.parentNode)._groups[0][0].id;
						updateAnoms(this, true);
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
			})
	}

	makeBars(bc_data);

	$("#sorts").change(function() {
		console.log("drippity drop!");
		var selection = $("#sorts").val();
		console.log(selection);
		if (selection == "Most anomalies"){
			console.log("most anomalies");
		} else if (selection == "Target variable name") {
			console.log("target variable name");
		}
	})


	var backwards = d3.scaleLinear()
					.domain([0, barcodeWidth])
					.range([0, mmax+1])

	function recolor() {

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

	stdSlider.noUiSlider.on('change', recolor);
	
});


// reverse domain function for recoloring bar marks based on slider values

// recolor function for barcode marks when the slider moves

// eventually will be functionality for the drop down control above the barcode charts
// leave this along for now I guess
// $("#sorts").on("change", function() {
// 	console.log("doesn't work right this second");

// });