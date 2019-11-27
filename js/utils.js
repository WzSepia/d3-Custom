function getTransformation(transform) {
	/*
	 * This code comes from a StackOverflow answer to a question looking
	 * to replace the d3.transform() functionality from v3.
	 * http://stackoverflow.com/questions/38224875/replacing-d3-transform-in-d3-v4
	 */
	var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

	g.setAttributeNS(null, "transform", transform);
	var matrix = g.transform.baseVal.consolidate()
		.matrix;

	var {
		a,
		b,
		c,
		d,
		e,
		f
	} = matrix;
	var scaleX, scaleY, skewX;
	if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
	if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
	if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
	if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
	return {
		translateX: e,
		translateY: f,
		rotate: Math.atan2(b, a) * Math.PI / 180,
		skewX: Math.atan(skewX) * Math.PI / 180,
		scaleX: scaleX,
		scaleY: scaleY
	};
}


function arrangeLabels(selection, label_class) {
	var move = 1;
	while (move > 0) {
		move = 0;
		selection.selectAll(label_class)
			.each(function() {
				var that = this;
				var a = this.getBoundingClientRect();
				selection.selectAll(label_class)
					.each(function() {
						if (this != that) {
							var b = this.getBoundingClientRect();
							if ((Math.abs(a.left - b.left) * 2 < (a.width + b.width)) && (Math.abs(a.top - b.top) * 2 < (a.height + b.height))) {
								var dx = (Math.max(0, a.right - b.left) + Math.min(0, a.left - b.right)) * 0.01;
								var dy = (Math.max(0, a.bottom - b.top) + Math.min(0, a.top - b.bottom)) * 0.02;
								var tt = getTransformation(d3.select(this)
									.attr("transform"));
								var to = getTransformation(d3.select(that)
									.attr("transform"));
								move += Math.abs(dx) + Math.abs(dy);

								to.translate = [to.translateX + dx, to.translateY + dy];
								tt.translate = [tt.translateX - dx, tt.translateY - dy];
								d3.select(this)
									.attr("transform", "translate(" + tt.translate + ")");
								d3.select(that)
									.attr("transform", "translate(" + to.translate + ")");
								a = this.getBoundingClientRect();
							}
						}
					});
			});
	}
}

function wrap(text, width) {
	text.each(function() {
		var text = d3.select(this);
		var words = text.text()
			.split(/\s+/)
			.reverse();
		var word;
		var line = [];
		var lineHeight = 1;
		var y = 0 //text.attr("y");
		var x = 0;
		var dy = parseFloat(text.attr("dy"));
		var dx = parseFloat(text.attr("dx"));
		var tspan = text.text(null)
			.append("tspan")
			.attr("x", x)
			.attr("y", y);
		while (word = words.pop()) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node()
				.getComputedTextLength() > width - x) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan")
					.attr("x", x)
					.attr("dy", lineHeight + "em")
					.attr("dx", dx + "em")
					.text(word);
			}
		}
	});
}
