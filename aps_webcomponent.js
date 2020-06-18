(function()  {
let tmpl = document.createElement('template');
tmpl.innerHTML = `
		<form id="form">
			<fieldset>
				<legend>Gauge Box Properties</legend>
				<table>
					<tr>
						<td>Value</td>
						<td><input id="aps_val" type="text" name="val" size="20" maxlength="20"></td>
					</tr>
					<tr>
						<td>Look</td>
						<td><input type="radio" name="aps_look" checked value="vu">
							VU-Meter<br/>
							<input type="radio"  name="aps_look" value="knob">
							Volume Knob<br/>
						</td>
					</tr>
				</table>
			</fieldset>
			<button type="submit">Submit</button>
		</form>
`;

class GaugeAps extends HTMLElement {
		  constructor() {
		    super();
		    this._shadowRoot = this.attachShadow({mode: 'open'});
		    this._shadowRoot.appendChild(tmpl.content.cloneNode(true));
		    this._shadowRoot.getElementById("form").addEventListener("submit", this._submit.bind(this));
		  }

		  _submit(e) {
		    	e.preventDefault();
		    	var event = new Event('submit');
		    	this.dispatchEvent(event);
				return false;
		  }

		  get val() {
			 return this._shadowRoot.getElementById("aps_val").value ;
	      }

		  set val(value) {
			  this._shadowRoot.getElementById("aps_val").value = value;
		  }

		  get look() {
				 return this._shadowRoot.querySelector("input[name='aps_look']:checked").value;
		      }

		 set look(value) {
			 this._shadowRoot.querySelector("input[name='aps_look'][value='" + value + "']").checked = "checked";
		 }

		  static get observedAttributes() {
			  return ['val', 'look'];
	      }

		  attributeChangedCallback(name, oldValue, newValue) {
			 if (oldValue != newValue) {
				  this[name] = newValue;
			 }
		  }
}

customElements.define('com-sap-sample-gauge-aps', GaugeAps);
})();