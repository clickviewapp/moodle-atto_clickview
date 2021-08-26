

Y.namespace("M.atto_clickview").Button = Y.Base.create("button", Y.M.editor_atto.EditorPlugin, [], {
	name: 'ClickView Plugin for Atto',
	initializer: function (params) {
		this._onlineUrl = params.onlineUrl;
		this._consumerKey = params.consumerKey;
		this._schoolId = params.schoolId;
		
		if(params.allowIframe){
			this.addButton({
				callback: this._displayDialog,
				iconurl: 'https://' + this._onlineUrl + '/Assets/images/icons/cv-logo.png',
				tags: 'iframe',
				icon: 'clickview',
				iconComponent: 'atto_clickview'
			});
		}
	},
	_displayDialog: function () {
		var dialog = this.getDialogue({
			width: '824px'
		});
		dialog.set('headerContent', 'ClickView Plugin for Atto');
		dialog.set('bodyContent', '<iframe id="cv-plugin-frame" src="' + this._onlineUrl + '/v3/plugins/base?consumerKey=' + this._consumerKey +'&schoolId=' + this._schoolId +'" width="800" height="494" frameborder="0"></iframe>').show();
		
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