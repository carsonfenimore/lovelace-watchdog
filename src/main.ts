import { LitElement, html, css } from "lit";
import { property, state } from "lit/decorators.js";
import pjson from "../package.json";
import {LovelaceWatchdogConfig} from "./types";

const ALARM_FLASH_CYCLE_SECONDS = 3;

class LovelaceWatchdog extends LitElement {
  @property() _config: LovelaceWatchdogConfig;
  @property() _hass: any;
  @property() _hassReceived: Date;

  readonly _height = 50;

  static styles = css`
	.watchdog { 
		min-width: 100px;
        min-height: 50px;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        padding: 5px;
        vertical-align: middle;
        text-align: center;
        line-height: 50px;
        font-size: 20px;
        font-weight: 800;
    }
	@keyframes blinker {
	  50% {
	    opacity: 0;
	  }
	  100% {
	    opacity: 0.6;
	  }
	  0% {
	    opacity: 0.6;
	  }
	}
  `;

  static getStubConfig() {
    return {
    };
  }

  getBlinkMe(){
	var cycleSecs = ALARM_FLASH_CYCLE_SECONDS;
    if (this._config.alarm_flash_period) {
        cycleSecs = this._config.alarm_flash_period;
    }
    return html`<div class="watchdog" style="background-color: ${this._config.blink_color ? this._config.blink_color : "red"}; position: absolute; width: 100%; height: ${this._height}px; left: 0px; top: 0px; animation: blinker ${cycleSecs}s ease-in-out infinite;">&nbsp;</div>`;
  }

  set hass(hass) {
    this._hass = hass;
    this._hassReceived = new Date();
    this.requestUpdate();
  }

  setConfig(config: LovelaceWatchdogConfig) {
    if (!config) {
      throw new Error("No watchdog configuration given.");
    }
    this._config = config;
    this.periodicCheck();
  }

  periodicCheck() {
    window.setTimeout( () => {this.doCheck();}, 1000 );
  }

  doCheck() {
    this.requestUpdate();
    this.periodicCheck();
  }

  darkMode(){
    return this._hass.themes.darkMode;
  }

  dateDifferenceInSeconds(date1, date2) {
      return (date2.getTime() - date1.getTime()) / 1000;
  }

  getBackground(hasError){
    const defaultBGGood = "green";
    const defaultBGBad = "grey";
    return this.getColor(hasError, this._config.good_background_color, this._config.bad_background_color, defaultBGGood, defaultBGBad);
  }

  getForeground(hasError){
    const defaultFGGood = "white";
    const defaultFGBad = "white";
    return this.getColor(hasError, this._config.good_text_color, this._config.bad_text_color, defaultFGGood, defaultFGBad);
  }

  getColor(hasError, customColorGood, customColorBad, defaultColorGood, defaultColorBad){
    if (hasError) {
        if (customColorBad) 
            return customColorBad;
        return defaultColorBad;
    }
    if (customColorGood)
        return customColorGood;
    return defaultColorGood;
  }

  render() {
    var errorThreshSecs = 60;
    if (this._config.error_if_no_update_seconds)
        errorThreshSecs = this._config.error_if_no_update_seconds;

    var entityError = false;
    if (this._hass && this._config.entity){
        var lookup = this._hass.states[this._config.entity];
        entityError = (lookup && lookup.state != "on");
    }

    const secsDelta = this.dateDifferenceInSeconds(this._hassReceived, new Date());
    const haError = secsDelta > errorThreshSecs;

    const hasError = haError || entityError;
    //console.log(`Delta ${secsDelta}, error thresh ${errorThreshSecs}, errored? ${hasError}`);

    var text;
    var subtext;
    if (haError) {
        const defHAError = "HA Not Updating";
        if (this._config.entity) 
            text = defHAError;
        else
            text = this._config.bad_text ? this._config.bad_text : defHAError;
        subtext = html`<br/><span style="font-size: 16px">Last updated ${secsDelta}s ago</span>`;
    } else {
        if (this._config.entity){
           if (entityError)
               text = this._config.bad_text ? this._config.bad_text : "Entity error";
           else 
               text = this._config.good_text ? this._config.good_text : "Entity Good";
        }
        else  {
           text = this._config.good_text ? this._config.good_text : "HA Good";
        }
    }
    var lineHeight = this._height;
    if (subtext)
        lineHeight = this._height /2;

    var blinker;
    if (hasError){
        blinker = this.getBlinkMe();
    }
    return html`<div class="watchdog" style="width: 100%; height: ${this._height}px;  background-color: ${this.getBackground(hasError)}">&nbsp;</div>${blinker}<div class="watchdog" style="color: ${this.getForeground(hasError)}; background: none; position: absolute; width: 100%; height: ${this._height}px; line-height: ${lineHeight}px; left: 0px; top: 0px;">${text}${subtext}</div>`;
  }

  getCardSize() {
    return 3;
  }
}

if (!customElements.get("lovelace-watchdog")) {
  customElements.define("lovelace-watchdog", LovelaceWatchdog);
  console.groupCollapsed(
    `%cLOVELACE-WATCHDOG ${pjson.version} IS INSTALLED`,
    "color: green; font-weight: bold"
  );
  console.log(
    "Readme:",
    "https://github.com/carsonfenimore/lovelace-watchdog"
  );
  console.groupEnd();
} 
