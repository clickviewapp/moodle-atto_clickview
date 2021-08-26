var CVEventsApi = (function() {
    var VERSION = "1.1.1",
        handlers = {},
        guid = 1,
        _source = null,
		_targetOrigin = null,

    //Private methods
        isFunction = function(fn) {
            return (fn && typeof fn === 'function');
        },
        createGuid = function() {
            return guid++;
        },
        each = function(objs, fn) {
            if(typeof objs === 'undefined' || !isFunction(fn)) return;

            for(var n = 0; n < objs.length; n++) {
                var obj = objs[n],
                    ret = fn.apply(objs, [obj, n]);

                if(typeof ret !== 'undefined') return ret;
            }
        },

    //Post message handlers
        sendEvent = function(el, type, data) {
            type = type || "";
            data = data;

            var d = { type: type, data: data };

            el.postMessage(JSON.stringify(d), _targetOrigin || "*");
        },
        receiveEvent = function(e) {
			if(_targetOrigin && _targetOrigin !== e.origin)
				return;
			
			var d = {};
			
			try {
				d = JSON.parse(e.data);	
			} catch(e) {
				return;
			}
            
			var data = d.data || {},
                type = d.type || "";

            //Dont allow self triggering
            if(e.source == _source) return;

            triggerEvents(type, data, e);

            //Also trigger general message
            triggerEvents("message", data, e);
        },

    //on/off event handlers
        registerEvent = function(type, fn, once, ctx) {
            if(!handlers[type]) handlers[type] = [];

            //function is not a function? how silly
            if(!isFunction(fn)) return;

            if(!fn.guid) fn.guid = createGuid();

            //Check if this fn is already registered
            var found = each(handlers[type], function(obj) {
                if(obj.fn.guid === fn.guid)
                    return true;
            });

            //If we have a matching function above, return
            if(found)
                return;

            //Add to the list of handlers
            handlers[type].push({fn: fn, once: !!once, ctx: ctx});
        },
        unregisterEvent = function(type, fn) {
            //If we have no handlers, we dont go to do nuff'n
            if(!handlers) return;

            //We need a type of an event to unbind
            if(!type) return;

            //We have no events for this type
            if(!handlers[type]) return;

            //Remove all events for this type
            if(!isFunction(fn)) {
                delete handlers[type];
                return;
            }

            //Remove a single event
            each(handlers[type], function(obj, i) {
                if(obj.fn.guid === fn.guid) {
                    this.splice(i, 1);
                }
            });

            if(handlers[type].length === 0)
                delete handlers[type];
        },
        triggerEvents = function(type, data, e) {
            //If we have no handlers, we dont go to do nuff'n
            if(!handlers) return;

            //We need a type of an event to unbind
            if(!type) return;

            //We have no events for this type
            if(!handlers[type]) return;

            each(handlers[type], function(obj, i) {
                if(isFunction(obj.fn)) {
                    var args = [e];
                    obj.fn.apply(obj.ctx || null, args.concat(data));
                }
				
				if(obj.once)
					this.splice(i, 1);
            });
        };


    function CVEventsApi(targetEl, targetOrigin) {
        _source = window;
		_targetOrigin = targetOrigin;
		
        this._target   = targetEl;
        this._version  = VERSION;
        this._handlers = handlers;

        if(!this._target)
            throw new Error("No target specified");

        //Verify
        if(!this._target.postMessage)
            throw new Error("Target element is not supported");

        //Setup event handler
        if(_source.addEventListener)
            _source.addEventListener("message", receiveEvent, false);
        else if(_source.attachEvent)
            _source.attachEvent("onmessage", receiveEvent);
        else
            throw new Error("Cannot attach event listener");

        return this;
    }

    CVEventsApi.prototype = {
        on: function(type, fn, ctx) {
            registerEvent(type, fn, false, ctx);
        },
        one: function(type, fn, ctx) {
            registerEvent(type, fn, true, ctx);
        },
        off: function(type, fn) {
            unregisterEvent(type, fn);
        },
        trigger: function(type) {
            sendEvent(this._target, type, Array.prototype.slice.call(arguments, 1));
        },
    };

    return CVEventsApi;
})();