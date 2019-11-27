var module_data = {
	"question": "Was good at explaining things",
	"N/A": 0.02763018065887354,
	"Disagree": 0.10839532412327312,
	"Neither Agree nor Disagree": 0.13177470775770456,
	"Agree": 0.7321997874601488
};

var columns = ["N/A", "Disagree", "Neither Agree nor Disagree", "Agree"];

var chart = pieChart()
	.width(400)
	.height(400)
	.margin({
		top: 20,
		bottom: 20,
		left: 80,
		right: 100
	})
	.columns(columns);

var container = d3.select("body")
	.datum(module_data)
	.call(chart);
