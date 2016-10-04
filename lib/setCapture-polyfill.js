/* Copyright 2016 Joseph N. Musser II, MIT license */

if (typeof Element.prototype.setCapture === 'undefined') {
    var mouseEventNames = ['click', 'dblclick', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup'];
    var captureElement = null;

    Element.prototype.setCapture = function () {
        captureElement = this;
        for (var i = 0; i < mouseEventNames.length; i++)
            window.addEventListener(mouseEventNames[i], handleCapturedEvent, true);
    };

    var originalReleaseCapture = Document.prototype.releaseCapture;
    Document.prototype.releaseCapture = function () {
        if (originalReleaseCapture != null) originalReleaseCapture.call(this);

        for (var i = 0; i < mouseEventNames.length; i++)
            window.removeEventListener(mouseEventNames[i], handleCapturedEvent, true);
        captureElement = null;
    };

    function handleCapturedEvent(event) {
        try {
            window.removeEventListener(event.type, handleCapturedEvent, true);
            try {
                captureElement.dispatchEvent(cloneMouseEvent(event));
            } finally {
                window.addEventListener(event.type, handleCapturedEvent, true);
            }
        } finally {
            event.stopImmediatePropagation();
        }
    }

    // Not intended to be used with subclasses of MouseEvent
    function cloneMouseEvent(event) {
        var eventToDispatch;

        if (document.createEvent) { // IE prevents the use of new MouseEvent(ev.type, ev)
            eventToDispatch = document.createEvent('MouseEvent');
            eventToDispatch.initMouseEvent(event.type,
                event.bubbles,
                event.cancelable,
                event.view,
                event.detail,
                event.screenX,
                event.screenY,
                event.clientX,
                event.clientY,
                event.ctrlKey,
                event.altKey,
                event.shiftKey,
                event.metaKey,
                event.button,
                event.relatedTarget);
        } else {
            eventToDispatch = new MouseEvent(event.type, event);
        }

        var buttonsValue = event.buttons;
        if (eventToDispatch.buttons !== buttonsValue)
            Object.defineProperty(eventToDispatch, 'buttons', { get: function () { return buttonsValue; } });

        return eventToDispatch;
    }
}
