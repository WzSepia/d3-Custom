/**
 * d3.v5
 * */

! function() {
	var Donut3D = {};

	function pieTop(d, rx, ry, ir) {
		if (d.endAngle - d.startAngle == 0) return "M 0 0";
		var sx = rx * Math.cos(d.startAngle), //startX:起始点坐标
			sy = ry * Math.sin(d.startAngle), //startY:起始点坐标
			ex = rx * Math.cos(d.endAngle), //endX:终点坐标
			ey = ry * Math.sin(d.endAngle); //endY:终点坐标

		var ret = [];
		//例如：M 130 0 A 130 100 0 0 1 84.05731873640664 76.28336758253036 L 0 0 A 0 0 0 0 0 0 0 z
		//M:起点，A：等于elliptical arc。画椭圆曲线到指定坐标
		ret.push("M", sx, sy, "A", rx, ry, "0", (d.endAngle - d.startAngle > Math.PI ? 1 : 0), "1", ex, ey, "L", ir * ex, ir *
			ey);
		ret.push("A", ir * rx, ir * ry, "0", (d.endAngle - d.startAngle > Math.PI ? 1 : 0), "0", ir * sx, ir * sy, "z");

		//console.log(ret.join(" "));
		return ret.join(" ");
	}

	function pieOuter(d, rx, ry, h) {
		var startAngle = (d.startAngle > Math.PI ? Math.PI : d.startAngle);
		var endAngle = (d.endAngle > Math.PI ? Math.PI : d.endAngle);

		var sx = rx * Math.cos(startAngle),
			sy = ry * Math.sin(startAngle),
			ex = rx * Math.cos(endAngle),
			ey = ry * Math.sin(endAngle);

		var ret = [];
		ret.push("M", sx, h + sy, "A", rx, ry, "0 0 1", ex, h + ey, "L", ex, ey, "A", rx, ry, "0 0 0", sx, sy, "z");
		return ret.join(" ");
	}
	/**
	 * 内壁画法
	 * */
	function pieInner(d, rx, ry, h, ir) {
		var startAngle = (d.startAngle < Math.PI ? Math.PI : d.startAngle);
		var endAngle = (d.endAngle < Math.PI ? Math.PI : d.endAngle);

		var sx = ir * rx * Math.cos(startAngle),
			sy = ir * ry * Math.sin(startAngle),
			ex = ir * rx * Math.cos(endAngle),
			ey = ir * ry * Math.sin(endAngle);

		var ret = [];
		ret.push("M", sx, sy, "A", ir * rx, ir * ry, "0 0 1", ex, ey, "L", ex, h + ey, "A", ir * rx, ir * ry, "0 0 0", sx, h +
			sy, "z");
		return ret.join(" ");
	}

	/**
	 * 文字画法
	 * */
	function getPercent(d) {
		return (d.endAngle - d.startAngle > 0.2 ?
			Math.round(1000 * (d.endAngle - d.startAngle) / (Math.PI * 2)) / 10 + '%' : '');
	}

	/**
	 * 连线画法
	 * */
	function pieLine(d, rx, ry, h) {
		var sx = rx * Math.cos(d.startAngle), //startX:起始点坐标
			sy = ry * Math.sin(d.startAngle), //startY:起始点坐标
			ex = rx * Math.cos(d.endAngle), //endX:终点坐标
			ey = ry * Math.sin(d.endAngle); //endY:终点坐标

		var ret = [];
		var p1_p2_len = Math.floor(Math.sqrt((ex - sx) ^ 2 + (ey - sy) ^ 2));
		var px = Math.floor(ex - sx);
		var py = Math.floor(ey - sy);

		ret.push(px, py);
		return ret.join(" ");
	}

	Donut3D.transition = function(id, data, rx, ry, h, ir) {
		function arcTweenInner(a) {
			var i = d3.interpolate(this._current, a);
			this._current = i(0);
			return function(t) {
				return pieInner(i(t), rx + 0.5, ry + 0.5, h, ir);
			};
		}

		function arcTweenTop(a) {
			var i = d3.interpolate(this._current, a);
			this._current = i(0);
			return function(t) {
				return pieTop(i(t), rx, ry, ir);
			};
		}

		function arcTweenOuter(a) {
			var i = d3.interpolate(this._current, a);
			this._current = i(0);
			return function(t) {
				return pieOuter(i(t), rx - .5, ry - .5, h);
			};
		}

		function textTweenX(a) {
			var i = d3.interpolate(this._current, a);
			this._current = i(0);
			return function(t) {
				return 0.6 * rx * Math.cos(0.5 * (i(t).startAngle + i(t).endAngle));
			};
		}

		function textTweenY(a) {
			var i = d3.interpolate(this._current, a);
			this._current = i(0);
			return function(t) {
				return 0.6 * rx * Math.sin(0.5 * (i(t).startAngle + i(t).endAngle));
			};
		}

		//
		var _data = d3.pie().sort(null).value(function(d) {
			return d.value;
		})(data);

		d3.select("#" + id).selectAll(".innerSlice").data(_data)
			.transition().duration(750).attrTween("d", arcTweenInner);

		d3.select("#" + id).selectAll(".topSlice").data(_data)
			.transition().duration(750).attrTween("d", arcTweenTop);

		d3.select("#" + id).selectAll(".outerSlice").data(_data)
			.transition().duration(750).attrTween("d", arcTweenOuter);

		d3.select("#" + id).selectAll(".percent").data(_data).transition().duration(750)
			.attrTween("x", textTweenX).attrTween("y", textTweenY).text(getPercent);
	}

	/**
	 * 元素ID：id
	 * 数据：data
	 * 位置：x,y,
	 * 多元半径大小：radius x,radius y
	 * 图形厚度：h
	 * 内环半径大小：ir（环形图）
	 * */
	Donut3D.draw = function(id, data, x, y, rx, ry, h, ir) {

		//定义pie
		var pie = d3.pie()
			.sort(null)
			.value(function(d) {
				return d.value;
			})

		//预处理饼图数据
		var _data = pie(data);

		console.log('_data', _data);

		var slices = d3.select("#" + id)
			.append("g")
			.attr("transform", "translate(" + x + "," + y + ")")
			.attr("class", "slices");

		//内环切面图
		slices.selectAll(".innerSlice")
			.data(_data)
			.enter().append("path")
			.attr("class", "innerSlice")
			.style("fill", function(d) {
				return d3.hsl(d.data.color).darker(0.7);
			})
			.attr("d", function(d) {
				return pieInner(d, rx + 0.5, ry + 0.5, h, ir);
			})
			.each(function(d) {
				this._current = d;
			});

		//主切面图
		slices.selectAll(".topSlice")
			.data(_data)
			.enter().append("path")
			.attr("class", "topSlice")
			.style("fill", function(d) {
				return d.data.color;
			})
			.style("stroke", function(d) {
				return d.data.color;
			})
			.attr("d", function(d) {
				return pieTop(d, rx, ry, ir);
			})
			.each(function(d) {
				this._current = d;
			});

		//类柱形侧面图
		slices.selectAll(".outerSlice")
			.data(_data)
			.enter().append("path")
			.attr("class", "outerSlice")
			.style("fill", function(d) {
				return d3.hsl(d.data.color).darker(0.7);
			})
			.attr("d", function(d) {
				return pieOuter(d, rx - .5, ry - .5, h);
			})
			.each(function(d) {
				this._current = d;
			});

		//label文字部分
		/* slices.selectAll(".percent")
			.data(_data)
			.enter().append("text")
			.attr("class", "percent")
			.attr("x", function(d) {
				return 0.6 * rx * Math.cos(0.5 * (d.startAngle + d.endAngle));
			})
			.attr("y", function(d) {
				return 0.6 * ry * Math.sin(0.5 * (d.startAngle + d.endAngle));
			})
			.text(getPercent).each(function(d) {
				this._current = d;
			}); */

		/**
		 * slices to text polylines(文字连线)
		 * 未启用
		 * */
		var radius = Math.min(x, y);

		const arc = d3.arc()
			.innerRadius(radius * 0.8)
			.outerRadius(radius * 0.8)

		const outerArc = d3.arc()
			.innerRadius(radius * 0.9)
			.outerRadius(radius * 0.9)

		const key = function(d) {
			return d.data;
		}

		var polylines = d3.select("#" + id)
			.append("g")
			.attr("class", "polylines")
			.attr("transform", "translate(" + (x) + "," + (y + h / 2) + ")")

		const polyline = polylines.selectAll("polyline")
			.data(_data, key)
			.enter().append("polyline");

		polyline.transition().duration(1000)
			.attrTween("points", function(d) {
				this._current = this._current || d;
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					var d2 = interpolate(t);
					var pos = outerArc.centroid(d); //终点(标准圆形可用)
					var p1 = arc.centroid(d); //中心点(标准圆形可用)
					var p2 = outerArc.centroid(d); //起点(标准圆形可用)
					pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);

					var sx = rx * Math.cos(d.startAngle),
						sy = ry * Math.sin(d.startAngle),
						ex = rx * Math.cos(d.endAngle),
						ey = ry * Math.sin(d.endAngle),
						pzx = rx * Math.cos(d.endAngle - d.startAngle),
						pzy = ry * Math.sin(d.endAngle - d.startAngle);

					var ret = [];

					var p1_p2_len = Math.floor(Math.sqrt((ex - sx) ^ 2 + (ey - sy) ^ 2));
					var px = (ex + sx) / 2;
					pos[0] = px - 50
					if (px > 0) pos[0] = px + 70;
					var py = (ey + sy) / 2;
					pos[1] = py - 70
					if (py > 0) pos[1] = py + h;
					ret.push(px, py);

					d.data.label_x = pos[0];
					d.data.label_y = pos[1];
					//起点，中点，终点
					return [ret, pos]; //pieLine(d, rx, ry, h)
					//return [0,0];//不绘制连线
				};
			})
			.style("stroke", function(d, i) {
				//return d.data.color
			})

		/**
		 * labels
		 * */
		slices.selectAll(".percent")
			.data(_data)
			.enter().append("text")
			.attr("class", "percent")
			.attr("x", function(d) {
				var pos = outerArc.centroid(d);
				var sx = rx * Math.cos(d.startAngle),
					sy = ry * Math.sin(d.startAngle),
					ex = rx * Math.cos(d.endAngle),
					ey = ry * Math.sin(d.endAngle);
				var ret = [];
				var px = (ex + sx) / 2;
				pos[0] = px - 70
				if (px > 0) pos[0] = px + 90;
				
				return pos[0];
			})
			.attr("y", function(d) {
				var pos = outerArc.centroid(d);
				var sx = rx * Math.cos(d.startAngle),
					sy = ry * Math.sin(d.startAngle),
					ex = rx * Math.cos(d.endAngle),
					ey = ry * Math.sin(d.endAngle);
				var py = (ey + sy) / 2;
				pos[1] = py - 60
				if (py > 0) pos[1] = py + h + 20;
				return pos[1];
			})
			.text(getPercent)
			.each(function(d) {
				this._current = d;
			})
			.style("fill", "#000");

		/**
		 * 标题
		 * */
		var titles = d3.select("#" + id)
			.append("g")
			.attr("class", "titles")
			.attr("transform", "translate(" + (svgWidth) / 2 + "," + h / 2 + ")")

		var title = titles.append("text")
			.attr("dy", ".35em")
			.text(title_text)
			.attr("transform", "translate(-50,0)")

		/**
		 * 图例
		 * 可以通过x，y属性调节图例文字以及方块位置
		 * */
		var legends = d3.select("#" + id)
			.append("g")
			.attr("class", "legends")
			.attr("transform", "translate(" + legend_pos.x + "," + legend_pos.y + ")")

		//文字
		legends.selectAll(".legend")
			.data(_data, key)
			.enter().append("text")
			.text(function(d) {
				return d.data.lable
			})
			.attr("y", function(d, i) {
				return 20 * i
			})
			.style("font-size", "14px")
			.style("font-family", "微软雅黑")
			.attr("dy", ".35em")
		//方块
		legends.selectAll(".legend")
			.data(_data, key)
			.enter().append("rect")
			.style("width", "14px")
			.style("height", "14px")
			.attr("x", function(d, i) {
				return -20;
			})
			.attr("y", function(d, i) {
				return 20 * i - 7;
			})
			.style("fill", function(d, i) {
				return d.data.color;
			})

		function midAngle(d) {
			return d.startAngle + (d.endAngle - d.startAngle) / 2;
		}
	}

	this.Donut3D = Donut3D;
}();
