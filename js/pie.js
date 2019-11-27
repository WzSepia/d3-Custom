function pieChart() {

	var width = 400;
	var height = 300;

	var margin = {
		top: 80,
		bottom: 80,
		left: 120,
		right: 120,
	};

	var columns = [];

	var svg;

	var pformat = d3.format('.1%');

	var colourScale = d3.scaleOrdinal()
		.domain(['N/A', 'Disagree', 'Neither Agree nor Disagree', 'Agree'])
		.range(["#222", "hsla(0, 60%, 50%, 1)", "hsla(45, 70%, 60%, 1)", "hsla(90, 50%, 50%, 1)"]);

	var pie = d3.pie()
		.sort(null)
		.value(function(d) {
			return d.value;
		});

	var key = function(d) {
		return d.data.key;
	}

	function midAngle(d) {
		return d.startAngle + (d.endAngle - d.startAngle) / 2;
	}

	function chart(selection) {
		selection.each(function(data) {

			//draw the pie chart
			svg = d3.select(this)
				.append("svg")
				.attr("width", width)
				.attr("height", height)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

			width = width - margin.left - margin.right;
			height = height - margin.top - margin.bottom;

			svg = svg
				.append("g")
				.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

			svg.append("g")
				.attr("class", "slices");

			svg.append("g")
				.attr("class", "labels");

			svg.append("g")
				.attr("class", "lines");

			pie_data = [];
			columns.forEach(function(c) {
				if (+data[c] > 0) {
					pie_data.push({
						key: c,
						value: +data[c]
					});
				}
			});

			var radius = Math.min(width, height) / 2;

			var arc = d3.arc()
				.outerRadius(radius * 0.6)
				.innerRadius(radius * 0.1)
				.padAngle(.02)
				.padRadius(100)
				.cornerRadius(2);

			var labelArc = d3.arc()
				.outerRadius(radius * 0.4)
				.innerRadius(radius);

			var slice = svg.select(".slices")
				.selectAll("path.slice")
				.data(pie(pie_data), key);

			slice
				.enter()
				.insert("path")
				.attr("d", arc)
				.attr("class", "slice")
				.style("stroke", "black")
				.style("stroke-width", "0.5px")
				.style("fill", function(d) {
					return colourScale(d.data.key);
				});

			var text = svg.select(".labels")
				.selectAll("text")
				.data(pie(pie_data), key);

			text
				.enter()
				.append("text")
				.attr('class', 'label')
				.attr('id', function(d, j) {
					return 'l-' + j;
				})
				.attr("transform", function(d) {
					var pos = labelArc.centroid(d);
					pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
					return "translate(" + pos + ")";
				})
				.style("text-anchor", function(d) {
					return midAngle(d) < Math.PI ? "start" : "end";
				})
				.attr("dy", ".35em")
				.attr("dx", ".35em")
				.attr("fill", "#111")
				.text(function(d) {
					return d.data.key + " (" + pformat(d.data.value) + ")";
				})
				.call(wrap, margin.right - 20);

			arrangeLabels(svg, ".label");

			var polyline = svg.select(".lines")
				.selectAll("polyline")
				.data(pie(pie_data), key);

			polyline.enter()
				.append("polyline")
				.attr("points", function(d, j) {
					var offset = midAngle(d) < Math.PI ? 0 : 10;
					var label = d3.select('#l-' + j);
					var transform = getTransformation(label.attr("transform"));
					var pos = labelArc.centroid(d);
					pos[0] = transform.translateX + offset;
					pos[1] = transform.translateY;
					var mid = labelArc.centroid(d);
					mid[1] = transform.translateY;
					return [arc.centroid(d), mid, pos];
				});
		})
	}

	chart.margin = function(_) {
		if (!arguments.length) return margin;
		margin = _;
		return chart;
	};

	chart.width = function(_) {
		if (!arguments.length) return width;
		width = _;
		return chart;
	};

	chart.height = function(_) {
		if (!arguments.length) return height;
		height = _;
		return chart;
	};

	chart.columns = function(_) {
		if (!arguments.length) return columns;
		columns = _;
		return chart;
	};

	return chart;
}
