// height width setting
var margin = {
        top: 20,
        right: 210,
        bottom: 50,
        left: 70
    },
    outerWidth = (1050*1),
    outerHeight = (500*1),
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]).nice();

var y = d3.scale.linear()
    .range([height, 0]).nice();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(-height);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickSize(-width);

// labels mapping
var xCat = ["veggie_num","scaledx"],
    yCat = ["fast_num", "scaledy"],
    rCat = "POPESTIMATE2017",
    srCat = "scaledPopulation",
    colorCat = "Region",
	mapCat = "NAME";

var labels = {
    "veggie_num": "Number of Vegetarian Restaurants",
    "fast_num": "Number of Fast Food Restaurants",
	"scaledx": "Number of Vegetarian Restaurants per 100K",
	"scaledy": "Number of Fast Food Restaurants per 100K",
    "POPESTIMATE2017": "Population"
}

// set Faled
var scaled = 0;

/*****************map setting*****************/
// global variables
// 0: fast food, 1:veggie
var veggieOrFast = 1;
var selectedState = 0;

//color setting
var colorDomainB = ["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]
var colorDomainR = ["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#b30000","#7f0000"];


// set svg
var svgMap = d3.select("#map")
.append("svg")
.attr("width", outerWidth)
.attr("height", outerHeight);
	
// drawing map
var projection = d3.geo.albersUsa()
						.translate([width/1.7, height/1.7])
						.scale([1000]);
var path = d3.geo.path().projection(projection);
/********************************************/

// scatter plot Dataset
d3.csv("data/processed_population.csv", function(data){
	
	data.forEach(function(d) {
		d[xCat[0]] = +d[xCat[0]];
		d[yCat[0]] = +d[yCat[0]];
		d[rCat] =+d[rCat];
		d[srCat] = d[rCat]/100000;
		
		// add scaled data
		d[xCat[1]] = d[xCat[0]]/d[rCat]*100000;
		d[yCat[1]] = d[yCat[0]]/d[rCat]*100000;
	});
	
	// data max min
	var xMaxMin = max_min(data, xCat[1]);
	var yMaxMin = max_min(data, yCat[1]);
	maxMin = [xMaxMin, yMaxMin];
	
	// set Domain
	var xMax = d3.max(data, function(d) {
			return d[xCat[0]];
		}) * 1.05,
		xMin = d3.min(data, function(d) {
			return d[xCat[0]];
		}),
		xMin = xMin > 0 ? 0 : xMin,
		yMax = d3.max(data, function(d) {
			return d[yCat[0]];
		}) * 1.05,
		yMin = d3.min(data, function(d) {
			return d[yCat[0]];
		}),
		yMin = yMin > 0 ? 0 : yMin;
	x.domain([xMin, xMax]);
	y.domain([yMin, yMax]);
	
	var xMean = Math.round(d3.mean(data, function(d){
		return d[xCat[1]];
	}));
	var yMean = Math.round(d3.mean(data, function(d){
		return d[yCat[1]];
	}));
	
	// set Color for labels
    var color = d3.scale.category10();

	// zoom function
	function zoom() {
		
		svg.select(".x.axis").call(xAxis);
		svg.select(".y.axis").call(yAxis);
		svg.selectAll(".dot")
			.attr({
				cx: function(d) {
					return x(d[xCat[scaled]]);
				},
				cy: function(d) {
					return y(d[yCat[scaled]]);
				}
			})
	}
	
    var zoomBeh = d3.behavior.zoom()
        .x(x)
        .y(y)
        .scaleExtent([0, 1000])
        .on("zoom", zoom);
	
	// setting width height
	var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoomBeh);
		
	svg.append("rect")
        .attr("width", width)
        .attr("height", height);
	
    svg.append("g")
        .classed("x axis", true)
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .classed("label", true)
        .attr("x", width)
        .attr("y", margin.bottom - 10)
        .style("text-anchor", "end")
        .text(labels[xCat[0]]);
		
    svg.append("g")
        .classed("y axis", true)
        .call(yAxis)
        .append("text")
        .classed("label", true)
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("dy", "1.5em")
        .style("text-anchor", "end")
        .text(labels[yCat[0]]);
	
	// add data
	var objects = svg.append("svg")
		.classed("objects", true)
		.attr("width", width)
		.attr("height", height);
		objects.append("svg:line")
		.classed("axisLine hAxisLine", true)
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", width)
		.attr("y2", 0)
		.attr("transform", "translate(0," + height + ")");
		
		objects.append("svg:line")
		.classed("axisLine vAxisLine", true)
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", 0)
		.attr("y2", height);
		
		objects.selectAll(".dot")
		.data(data)
		.enter().append("circle")
		.classed("dot", true)
		.attr({
			r: function(d) {
				return 4 * Math.sqrt(d[srCat] / Math.PI);
			},
			cx: function(d) {
				return x(d[xCat[0]]);
			},
			cy: function(d) {
				return y(d[yCat[0]]);
			}
		})
		.style("fill", function(d) {
			return color(d[colorCat]);
		});
		
	// mouse movement tooltip event
	objects.selectAll("circle")
	.on("mouseover", function(d){
		var mouse = d3.mouse(this);
		d3.select(this).append("text")
			.attr("id", "tooltip")
			.attr("x", mouse[0])
			.attr("y", mouse[1])
			.attr("text-anchor", "middle")
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("font-weight", "bold")
			.attr("fill", "black")
			.text(d);
	})
			// tooltip add
			.on("mouseover", function(d){
				var mouse = d3.mouse(this);
				var xPosition = mouse[0];
				var yPosition = mouse[1];

				// title
				d3.select("#scattertip")
					.style("left", xPosition + "px")
					.style("top", yPosition + "px")
					.select("#title")
					.text(d[mapCat])
					.style("weight", "bold");

				d3.select("#scattertip")
					.style("left", xPosition + "px")
					.style("top", yPosition + "px")
					.select("#xval")
					.text("Vegetarian: "+Math.round(d[xCat[scaled]]));
					
				d3.select("#scattertip")
					.style("left", xPosition + "px")
					.style("top", yPosition + "px")
					.select("#yval")
					.text("Fast-Food: "+Math.round(d[yCat[scaled]]));

				d3.select("#scattertip")
					.style("left", xPosition + "px")
					.style("top", yPosition + "px")
					.select("#pop")
					.text("Population: "+d[rCat]);

				d3.select("#scattertip").style("visibility","visible");
				d3.select("#scattertip").attr("display","block");
			})
			.on("mouseout", function(){
				// hide the tooltip
				d3.select("#scattertip").style("visibility","hidden");
				d3.select("#scattertip").attr("display","none");
			});
	
	// legends
	var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .classed("legend", true)
        .attr("transform", function(d, i) {
            return "translate(0," + i * 20 + ")";
        });
    legend.append("rect")
        .attr("x", width + 10)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", color);
		
	// legend onclick
	var clicked = 0;
    legend.on("click", function(type) {
		if(clicked ==type){
			d3.select(this)
			.style("opacity", 1);
			d3.selectAll(".dot")
			.transition()
			.duration(500)
			.style("opacity", 1)
			.style("stroke", "none")
			.style("fill", function(d) {
				return d[colorCat];
			});
			
			d3.selectAll(".legend")
			.style("opacity", 1);
			
		clicked=0;
		} else{
			// dim all of the icons in legend
			d3.selectAll(".legend")
				.style("opacity", 0.1);
			// make the one selected be un-dimmed
			d3.select(this)
				.style("opacity", 1);
			// select all dots and apply 0 opacity (hide)
			d3.selectAll(".dot")
			// .transition()
			// .duration(500)
			.style("opacity", 0.0)
			// filter out the ones we want to show and apply properties
			.filter(function(d) {
				return d[colorCat] == type;
			})
			.style("opacity", 1) // need this line to unhide dots
			.style("stroke", "black")
			// apply stroke rule
			.style("fill", function(d) {
				return d[colorCat];
			});
			
			clicked= type;
		}
    });
	
	// legend text
    legend.append("text")
        .attr("x", width + 26)
        .attr("dy", ".65em")
        .text(function(d) {
            return d;
        });
	
	// zoom, scale buttons
    d3.select("button.reset").on("click", change)
    d3.select("button.scale").on("click", scale)
	
	// scale based on population
	function scale(){
		// domain setting
		xMax = d3.max(data, function(d) {
			return d[xCat[1]];
		});
		xMin = d3.min(data, function(d) {
			return d[xCat[1]];
		});
		
		yMax = d3.max(data, function(d) {
			return d[yCat[1]];
		});
		yMin = d3.min(data, function(d) {
			return d[yCat[1]];
		});

		var xPad = 1
		var yPad = 1
		zoomBeh.x(x.domain([xMin-xPad, xMax+xPad])).y(y.domain([yMin-yPad, yMax+yPad]));

		var svg = d3.select("#scatter").transition();
		svg.select(".x.axis").duration(750).call(xAxis).select(".label").text(labels[xCat[1]]);
		svg.select(".y.axis").duration(750).call(yAxis).select(".label").text(labels[yCat[1]]);

		// dot resizing
		objects.selectAll(".dot")
		.transition()
		.duration(1000)
		.attr({
				r: function(d) {
					return 6;
				},
				cx: function(d) {
					return x(d[xCat[1]]);
				},
				cy: function(d) {
					return y(d[yCat[1]]);
				}
			});
		
		scaled=1;
	}
	
	// reset the zoom
	function change() {
			xMax = d3.max(data, function(d) {
				return d[xCat[0]];
			});
			xMin = d3.min(data, function(d) {
				return d[xCat[0]];
			});		
			yMax = d3.max(data, function(d) {
				return d[yCat[0]];
			});
			yMin = d3.min(data, function(d) {
				return d[yCat[0]];
			});

			
			var xPad = 100
			var yPad = 30
			zoomBeh.x(x.domain([xMin-xPad, xMax+xPad])).y(y.domain([yMin-yPad, yMax+yPad]));

			var svg = d3.select("#scatter").transition();
			svg.select(".x.axis").duration(750).call(xAxis).select(".label").text(labels[xCat[0]]);
			svg.select(".y.axis").duration(750).call(yAxis).select(".label").text(labels[yCat[0]]);
			objects.selectAll(".dot").transition().duration(1000)
				.attr({
					r: function(d) {
						return 4 * Math.sqrt(d[srCat] / Math.PI);
					},
					cx: function(d) {
						return x(d[xCat[0]]);
					},
					cy: function(d) {
						return y(d[yCat[0]]);
					}
				})
				
			// set scaled false
			scaled=0;
		}
  
	function transform(d) {
        return "translate(" + x(d[xCat[scaled]]) + "," + y(d[yCat[scaled]]) + ")";
    }
	
	/******************* map plot *******************/
	var colorMap;
	// GeoJSON
	var jsonData;
	function mapData(vof=0){
		d3.json("data/us-states.json", function(json){
			jsonData = json;
			// 0: fast, 1: veggie
			// color domain selection
			if(vof==0){
				colorMap = d3.scale.quantize()
				.range(colorDomainR);
				colorMap.domain([
						d3.min(data, function(d){return d[xCat[1]];}),
						d3.max(data, function(d){ return d[xCat[1]];})
				])
			} else{
				colorMap = d3.scale.quantize()
				.range(colorDomainB);
				colorMap.domain([
					d3.min(data, function(d){return d[yCat[1]];}),
					d3.max(data, function(d){ return d[yCat[1]];})
				])
			}
	
				// merge the data and geoJSON
				// loop through data value
				for (var i=0; i<data.length; i++){
					
					// state name
					var dataState = data[i][mapCat];
					
					// data value
					var dataValueX = Math.round(data[i][xCat[1]]);
					var dataValueY = Math.round(data[i][yCat[1]]);
					
					// find the corresponding state inside the GeoJSON
					for(var j =0; j<json.features.length; j++){
						var jsonState = json.features[j].properties.name;
						
						if(dataState==jsonState){
							json.features[j].properties.valuex = dataValueX;
							json.features[j].properties.valuey = dataValueY;
							//stop looking
							break;
						}
					}
				}
		// clear existing path
		svgMap.selectAll("path").remove();
		
		svgMap.selectAll("path")
				.data(jsonData.features)
				.enter()
				.append("path")
				.attr("d", path)
				.style("stroke", "#fff")
				.style("stroke-width", "2")
				.attr("fill", function(d){
					// get data Value
					if(vof==0){
						var value = d.properties.valuex;
					} else{
						var value = d.properties.valuey
					}
					if(value){
						return colorMap(value);
					} else {
						// in case undefined
						return "#ccc";
					}
				})
				// tooltip add
				.on("mouseover", function(d){
					// parent mouse x,y position
					var xPosition = d3.event.pageX;
					var yPosition = d3.event.pageY;
					
					// title
					d3.select("#maptip")
						.style("left", xPosition + "px")
						.style("top", yPosition + "px")
						.select("#title")
						.text(d.properties.name+" ");
					if(vof==0){
						d3.select("#maptip")
							.style("left", xPosition + "px")
							.style("top", yPosition + "px")
							.select("#value")
							.text("Fast Food"+": "+d.properties.valuex+" ");
					} else{
						d3.select("#maptip")
							.style("left", xPosition + "px")
							.style("top", yPosition + "px")
							.select("#value")
							.text("Vegetarian"+": "+d.properties.valuey+" ");
					}
					
					//Show the tooltip
					d3.select("#maptip").style("visibility","visible");
					
				})
				.on("mouseout", function(){
					//Hide the tooltip
					d3.select("#maptip").style("visibility","hidden");
					d3.select("#maptip").attr("display","none");
				})
				.on("click", function(d,i){
					selectedState= i;
					barChart(veggieOrFast, i);
				});
		});
		

	
	}
	
	// starts with vegetarian
	mapData(1);
	
	// map buttons
	d3.select("button.fast").on("click", function(){ 
		mapData(0);
		barChart(0,selectedState);
		veggieOrFast=0;
	});
	d3.select("button.veggie").on("click", function(){ 
		mapData(1);
		barChart(1,selectedState);
		veggieOrFast=1;
	});

	/************************************************************************/
	
	/*********************Grouped Horizontal Bar Charts**********************/
	
	function barChart(vof, state=0){
		
		// selected states data
		var selectedLabel = data[state][mapCat]
		var xData = Math.round(data[state][xCat[1]]);
		var yData = Math.round(data[state][yCat[1]]);
		
		// max, min data in each category
		var xyCat =[yCat, xCat];
		var maxLabel = data[maxMin[vof][2]][mapCat]+" (Max)";
		var minLabel = data[maxMin[vof][3]][mapCat]+" (Min)";
		var maxData = maxMin[vof][0];
		var minData = maxMin[vof][1];
		var maxYData = Math.round(data[maxMin[vof][2]][xyCat[vof][1]]);
		var minYData = Math.round(data[maxMin[vof][3]][xyCat[vof][1]]);
		
		if(vof==1){
			var barData = {
			  labels: [	maxLabel, selectedLabel, minLabel],
			  series: [	{ label: 'Vegetarian',  values: [maxData, yData, minData] },
				{  label: 'Fast Food',  values: [maxYData, xData, minYData ]	},]
			};
		} else{
			var barData = {
			  labels: [	maxLabel, selectedLabel, minLabel ],
			  series: [	 { label: 'Vegetarian',  values: [maxYData, yData, minYData] },
			 {  label: 'Fast Food',  values: [maxData, xData, minData ]	},]
			};
		}

		var chartWidth       = 400,
			barHeight        = 25,
			groupHeight      = barHeight * barData.series.length,
			gapBetweenGroups = 25,
			spaceForLabels   = 180,
			spaceForLegend   = 150,
			extraHeight 	 = 30;

		// Zip the series data together (first values, second values, etc.)
		var zippedData = [];
		for (var i=0; i<barData.labels.length; i++) {
		  for (var j=0; j<barData.series.length; j++) {
			zippedData.push(barData.series[j].values[i]);
		  }
		}

		// Color scale
		var colorBar = d3.scale.category10();
		var chartHeight = barHeight * zippedData.length + gapBetweenGroups * barData.labels.length;

		var xBar = d3.scale.linear()
			.domain([0, d3.max(zippedData)])
			.range([0, chartWidth]);

		var yBar = d3.scale.linear()
			.range([chartHeight + gapBetweenGroups, 0]);

		var yBarAxis = d3.svg.axis()
			.scale(yBar)
			.tickFormat('')
			.tickSize(0)
			.orient("left");

		
		// Specify the chart area and dimensions
		var chart = d3.select(".chart")
			.attr("width", spaceForLabels + chartWidth + spaceForLegend)
			.attr("height", chartHeight+extraHeight);
		
		// remove current chart
		chart.selectAll("g").remove();
		
		// Create bars
		var bar = chart.selectAll("g")
			.data(zippedData)
			.enter().append("g")
			.attr("transform", function(d, i) {
			  return "translate(" + spaceForLabels + "," + (i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i/barData.series.length))+ extraHeight) + ")";
			});

		// Create rectangles of the correct width
		bar.append("rect")
			.attr("fill", function(d,i) { 
			return d3.rgb(colorBar(i % barData.series.length));})
			.attr("class", "bar")
			.attr("width", xBar)
			.attr("height", barHeight - 1);

		// Add text label in bar
		bar.append("text")
			.attr("x", function(d) { return xBar(d) - 2; })
			.attr("y", barHeight / 2)
			.attr("fill", "white")
			.attr("dy", ".35em")
			.text(function(d) { return d; });

		// Draw labels
		bar.append("text")
			.attr("class", "label")
			.attr("x", function(d) { return -10; })
			.attr("y", groupHeight / 2)
			.attr("dy", ".35em")
			.text(function(d,i) {
			  if (i % barData.series.length == 0)
				return barData.labels[Math.floor(i/barData.series.length)];
			  else
				return ""});

		chart.append("g")
			  .attr("class", "y axis")
			  .attr("transform", "translate(" + spaceForLabels + ", " + -gapBetweenGroups/2 + ")")
			  .call(yBarAxis);

		// Draw legend
		var legendRectSize = 18,
			legendSpacing  = 4;

		var legendBar = chart.selectAll('.legend')
			.data(barData.series)
			.enter()
			.append('g')
			.attr('transform', function (d, i) {
				var height = legendRectSize + legendSpacing;
				var offset = -gapBetweenGroups/2;
				var horz = spaceForLabels + chartWidth + 40 - legendRectSize;
				var vert = i * height - offset;
				return 'translate(' + horz + ',' + vert + ')';
			});

		legendBar.append('rect')
			.attr('width', legendRectSize)
			.attr('height', legendRectSize)
			.style('fill', function (d, i) { return colorBar(i); })
			.style('stroke', function (d, i) { return colorBar(i); });

		legendBar.append('text')
			.attr('class', 'legend')
			.attr('x', legendRectSize + legendSpacing)
			.attr('y', legendRectSize - legendSpacing)
			.text(function (d) { return d.label; });
			
		// add mean annotation
		if(vof==0){
			var temp = xMean;
			var tempCol = "#e17f0e";
		} else{
			var temp = yMean;
			var tempCol = "#4e8dba";
		}
		
		var annotation = chart.append("g")
			.attr( "transform", "translate(" +(xBar(temp)+spaceForLabels) + ", " + 0 + ")");
		// draw line
		annotation.append("rect")
				.attr("transform", "translate(" +0 + ", " + extraHeight + ")")
				.attr("width", 1)
				.attr("height", (groupHeight+gapBetweenGroups)*3)
				.style('fill', tempCol);
		// add text
		annotation.append("text")
			.attr("x", 50)
			.attr("y", 20)
			.style("fill", tempCol)
			.style("font-size", "14px")
			.text("Mean value: " + temp);
		
	}
	
	// default bar: veggie
	barChart(1);

});
// min-max function
function max_min(data_val, column){
	var max= 0, min =999 , maxIdx=0, minIdx = 0;
	for(var i =0; i<data_val.length; i++){
		var temp = data_val[i][column];
		if(temp> max){
			max = temp;
			maxIdx = i;
		}
		if(temp<min){
			min = temp;
			minIdx = i;
		}
	}
	return [Math.round(max),Math.round(min), maxIdx, minIdx];
}

// onepage-scroll main function
$(document).ready(function(){
	$(".main").onepage_scroll({
		sectionContainer: "section",
		responsiveFallback: 100,
		loop: true,
		keyboard: true
	});
});
function to_about_page(){
	$(".main").moveTo(3);
}

// blocking scrolling on scatter plot