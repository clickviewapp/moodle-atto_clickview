YUI.add('moodle-atto_clickview-button', function (Y, NAME) {

// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <https://www.gnu.org/licenses/>.

/*
 * @package    atto_clickview
 * @copyright  2021 ClickView Pty. Limited <info@clickview.com.au>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module moodle-atto_clickview-button
 */

/**
 * Atto text editor ClickView plugin.
 *
 * @namespace M.atto_clickview
 * @class Button
 * @extends M.editor_atto.EditorPlugin
 */

var COMPONENTNAME = 'atto_clickview';

Y.namespace('M.atto_clickview').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
	initializer: function (params) {
		this._onlineUrl = params.hostlocation;
		this._iframeUrl = params.iframeurl;
		this._consumerKey = params.consumerkey;
		this._schoolId = params.schoolid;

		this.addButton({
			icon: 'icon',
			iconComponent: COMPONENTNAME,
			callback: this._displayDialog,
			tags: 'iframe',
		});
	},

    /**
     * Display the ClickView embed tool.
     *
     * @method _displayDialogue
     * @private
     */
	_displayDialog: function () {
		var dialog = this.getDialogue({
            headerContent: M.util.get_string('pluginname', COMPONENTNAME),
			width: '824px'
		});

		dialog.set('bodyContent', '<iframe id="cv-plugin-frame" src="' + this._onlineUrl + this._iframeUrl + '?consumerKey=' + this._consumerKey + '&schoolId=' + this._schoolId +'" width="800" height="494" frameborder="0"></iframe>').show();
		
		var host = this.get('host');
		var self = this;

		var pluginFrame = document.getElementById('cv-plugin-frame');
		var eventsApi = new CVEventsApi(pluginFrame.contentWindow);
		eventsApi.on('cv-lms-addvideo', function (event, detail) {
			host.insertContentAtFocusPoint(detail.embedHtml);
			dialog.hide();
			eventsApi.off('cv-lms-addvideo');
			self.markUpdated();
		}, true);
		
		dialog.on('visibleChange', function(event) {
			if(event.newVal !== false) return;
			eventsApi.off('cv-lms-addvideo');
		});
	}
});

}, '@VERSION@', {"requires": ["moodle-editor_atto-plugin"]});
