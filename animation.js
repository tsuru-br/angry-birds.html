// code taken from one of the examples on popmotion.io
import {
	styler,
	value,
	listen,
	pointer,
	spring
} from "popmotion";
import "./useless";

const ball = document.querySelector(".box");
const divStyler = styler(ball);
const ballXY = value({
	x: 0,
	y: 0
}, divStyler.set);

listen(ball, "mousedown touchstart").start(e => {
	e.preventDefault();
	pointer(ballXY.get()).start(ballXY);
});

listen(document, "mouseup").start(() => {
	spring({
			from: ballXY.get(),
			velocity: ballXY.getVelocity(),
			to: {
				x: 0,
				y: 0
			},
			stiffness: 200
		})
		.start(ballXY);
});

var __assign = (this && this.__assign) || Object.assign || function (t) {
	for (var s, i = 1, n = arguments.length; i < n; i++) {
		s = arguments[i];
		for (var p in s)
			if (Object.prototype.hasOwnProperty.call(s, p))
				t[p] = s[p];
	}
	return t;
};
export const x = {};
export const y = __assign({}, x);