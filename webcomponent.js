(function()  {
let tmpl = document.createElement('template');
tmpl.innerHTML = `
  <style>
  :host(.vu_fixed) {
	background-image: url(https://github.wdf.sap.corp/pages/D037083/AppDesign_CustomWidgets/gauge/css/vu_fixed.png);
	background-size: 100% 100%;
	background-repeat: no-repeat;
}

.vu_turning {
	background-image: url(https://github.wdf.sap.corp/pages/D037083/AppDesign_CustomWidgets/gauge/css/vu_turning.png);
	background-repeat: no-repeat;
	background-size: 100% 100%;
	position: absolute;
	width: 100%;
	height: 100%;
	transform-origin: 50% 100%;
	transition: 1s ease-out
}

:host(.knob_fixed) {
	background-image: url(https://github.wdf.sap.corp/pages/D037083/AppDesign_CustomWidgets/gauge/css/knob_fixed.png);
	background-size: 100% 100%;
	background-repeat: no-repeat;
}

.knob_turning {
	background-image: url(https://github.wdf.sap.corp/pages/D037083/AppDesign_CustomWidgets/gauge/css/knob_turning.png);
	background-repeat: no-repeat;
	background-size: 100% 100%;
	position: absolute;
	width: 100%;
	height: 100%;
	transform-origin: 51% 52;
}
  </style>
  <div id="needle"><div>
`;

class Gauge extends HTMLElement {

	constructor() {
		super();
		this._shadowRoot = this.attachShadow({mode: 'open'});
		this._shadowRoot.appendChild(tmpl.content.cloneNode(true));
		this.style.height = "100%";
		this._shadowRoot.addEventListener("mousedown", this.makeMouseDownHandler(this.mouseStart.bind(this), this.mouseFeedback.bind(this), this.mouseFinish.bind(this), this.mouseAbort.bind(this)));
		this._val = 0;
		this._look = "vu";
		this._rotate_angle = 360; // depends on used picture
		this.needle = this._shadowRoot.querySelector("#needle");
		this.adjustCssClasses();
	};



    get val() {
    	return Math.round(this._val);
    }
    set val(value) {
		this._val =  Math.max(0, Math.min(100, value));
		var angle = this._val / 100 * this._rotate_angle;
		this.needle.style.transform = "rotate(" + angle + "deg)";
	};


	get look() {
		return this._look;
	}

	set look(value) {
		this._look = value;
		this.adjustCssClasses();
		this.val = this.val; // Refresh to fit to new scaling
	};

//	this.afterUpdate = function() {
//		if (_datacell) {
//			var percent = _datacell.data[0] / 1000;
//			this.val(percent);
//		}
//	};



	adjustCssClasses() {
		this._rotate_angle = this._look === "vu" ? 80 : 270;
		this.className  = this._look + "_fixed";
		this.needle.className = this._look + "_turning";
	}

	makeMouseDownHandler(mouseStart, mouseFeedback, mouseFinish, mouseAbort) {
		return function(e) {
			var mouseMoveHappend = false;
			function cleanup() {
				$(document).unbind("mousemove", mousemove);
				$(document).unbind("mouseup", mouseup);
				$(document).unbind("keydown", abort);
			}

			var lastE = e;
			function mousemove(e) {
				// The following line detects this a mouseup outside of the browser in IE happened in the meantime
				if ($.browser.msie && event && event.button == 0) {
					mouseup(lastE);
				} else {
					mouseMoveHappend = true;
					lastE = e;
					mouseFeedback(e.pageX, e.pageY);
				}
			}

			function mouseup(e) {
				cleanup();
				mouseFinish(e.pageX, e.pageY);
			}

			function abort(e) {
				if (e.which === 27) {
					cleanup();
					mouseAbort();
				}
			}

			if (e.which == 1) { // Check only left mouse button
				mouseMoveHappend = false;
				e.preventDefault();
				e.stopPropagation();
				mouseStart(e.pageX, e.pageY);
				$(document).mouseup(mouseup);
				$(document).mousemove(mousemove);
				$(document).keydown(abort);
			}
		};
	}

	/**
	 * xc = x-coordinate of dial's center of rotation
	 * yc = y-coordinate of dial's center of rotation
	 * x = x-coordinate of mouse pointer
	 * y = y-coordinate of mouse pointer
	 * rotate_angle = angular range of dial in degrees
	 */
	getPercentValue(xc, yc, x, y) {
		var alpha = Math.atan2(x - xc, yc - y) / Math.PI * 180;
		var halfRange = this._rotate_angle / 2;

		if (alpha < -halfRange) {
			alpha = -halfRange;
		} else if (alpha > halfRange) {
			alpha = halfRange;
		}
		var percentValue = (alpha / this._rotate_angle + 0.5) * 100;
		return percentValue;
	}

	storeCenter () {
		var screenX = this.getBoundingClientRect().left;
		var screenY = this.getBoundingClientRect().top;

		var relativeCenter = getComputedStyle(this.needle)["transform-origin"];
		relativeCenter = relativeCenter.replace(/px/g, ""); // Remove "px"
		var aSplit = relativeCenter.split(" ");

		this.center = {
			x: screenX + parseFloat(aSplit[0]),
			y: screenY + parseFloat(aSplit[1])
		};
	};

	mouseStart (x, y) {
		this.storeCenter();
		this.orgAngle = this.getPercentValue(this.center.x, this.center.y, x, y);
		this.orgVal = this.val;
	};

	mouseFeedback (x, y) {
		var newAngle = this.getPercentValue(this.center.x, this.center.y, x, y);
		var turnBy = newAngle - this.orgAngle;
		this.val = this.orgVal + turnBy;
	};

	mouseFinish (x, y) {
		var event = new Event('onTurn');
		this.dispatchEvent(event);
	};

	mouseAbort() {
		this.val = this.orgVal;
	};

  }
  customElements.define('com-sap-sample-gauge', Gauge);
})();
