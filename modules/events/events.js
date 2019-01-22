/**
 * Analyzes events bound to DOM elements
 */
/* global Document: true, Element: true, window: true */
'use strict';

module.exports = phantomas => {
	phantomas.setMetric('eventsBound'); // @desc number of EventTarget.addEventListener calls @offenders
	phantomas.setMetric('eventsDispatched'); // @desc number of EventTarget.dispatchEvent calls @offenders
	phantomas.setMetric('eventsScrollBound'); // @desc number of scroll event bounds @offenders
};
