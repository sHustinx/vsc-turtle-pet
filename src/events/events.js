export class Events {
    static events = [];
    static callbacks = [];

    /**
     * Subscribe to an event and register a callback function.
     * @param {string} event The name of the event to subscribe to. Check for typos!
     * @param {function(data)} callback The callback that the event should trigger.
     */
    static subscribe(event, callback) {
        if (typeof callback !== 'function' || callback.length < 1) {
            throw new TypeError('Callback must be a function that accepts at least one argument');
        }

        let index = Events.events.indexOf(event);
        
        if (index === -1) {
            // if event doesn't exist, add it and create new callback list
            Events.events.push(event);
            Events.callbacks.push([callback]);
        } else {
            // if event exists, add callback to existing list
            Events.callbacks[index].push(callback);
        }
    }

    /**
     * Unsubscribe a callback from an event.
     * @param {string} event The name of the event to unsubscribe from. Check for typos!
     * @param {function(data)} callback The callback that you want to unsubscribe.
     */
    static unsubscribe(event, callback) {
        let index = Events.events.indexOf(event);
        debugger;
        if (index !== -1) {
            let callbackIndex = Events.callbacks[index].indexOf(callback);
            if (callbackIndex !== -1) {
                Events.callbacks[index].splice(callbackIndex, 1);
                // if no more callbacks for this event, remove the event
                if (Events.callbacks[index].length === 0) {
                    Events.events.splice(index, 1);
                    Events.callbacks.splice(index, 1);
                }
            }
        }
    }

    /**
     * Trigger an event and call all registered callbacks.
     * @param {string} event The name of the event to trigger. Check for typos!
     * @param {*} data The data you wish to pass to the callbacks.
     */
    static trigger(event, data) {
        let index = Events.events.indexOf(event);
        if (index !== -1) {
            // call all callbacks for this event
            Events.callbacks[index].forEach(callback => callback(data));
        }
    }
}