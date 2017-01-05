/*--- waitForKeyElements():  A utility function, for Greasemonkey scripts,
    that detects and handles AJAXed content.
    Usage example:
        waitForKeyElements (
            "div.comments"
            , commentCallbackFunction
        );
        //--- Page-specific function to do what we want when the node is found.
        function commentCallbackFunction (jNode) {
            jNode.text ("This comment changed by waitForKeyElements().");
        }
    IMPORTANT: This function requires your script to have loaded jQuery.
*/
function waitForKeyElements(
    selectorTxt,             /* Required: The jQuery selector string that specifies the desired element(s). */
    actionFunction,          /* Required: The code to run when elements are found. It is passed a jNode to the matched element. */
    maxWaitMillis,           /* Optional: The max. # of milliseconds to wait looking for the element. */
    actionFunction_NotFound, /* Optional: The code to run when elements are not found in the time period. */
    bWaitOnce,               /* Optional: If false, will continue to scan for new elements even after the first match is found. */
    iframeSelector           /* Optional: If set, identifies the iframe to search. */
) {
    var targetNodes, btargetsFound;

    // is the target found?
    if (typeof iframeSelector == "undefined")
        targetNodes = $(selectorTxt);
    else
        targetNodes = $(iframeSelector).contents()
                                           .find(selectorTxt);

    if (targetNodes && targetNodes.length > 0) {
        btargetsFound = true;
        /*--- Found target node(s).  Go through each and act if they
            are new.
        */
        targetNodes.each(function () {
            var jThis = $(this);
            var alreadyFound = jThis.data('alreadyFound') || false;

            if (!alreadyFound) {
                //--- Call the payload function.
                var cancelFound = actionFunction(jThis);
                if (cancelFound)
                    btargetsFound = false;
                else
                    jThis.data('alreadyFound', true);
            }
        });
    }
    else {
        btargetsFound = false;
    }

    // unique key for the selector -- used to keep track of the timer, and the # of times it's ticked
    var controlKey = selectorTxt.replace(/[^\w]/g, "_");

    //--- Get the timer-control variable for this selector.
    var controlObj = waitForKeyElements.controlObj || {};
    var timeControl = controlObj[controlKey];

    //*** get the timer-control-count var for this selector
    var controlObj_IntervalCount = waitForKeyElements.controlObj_IntervalCount || {};
    var timeControl_IntervalCount = controlObj_IntervalCount[controlKey];

    //--- Now set or clear the timer as appropriate.
    if (btargetsFound && bWaitOnce && timeControl) {
        // target found - stop the timer
        clearInterval(timeControl);
        delete controlObj[controlKey]
        delete controlObj_IntervalCount[controlKey]
    }
    else if (maxWaitMillis != null && controlObj_IntervalCount[controlKey] > 1 && controlObj_IntervalCount[controlKey] * 300 > maxWaitMillis) {
        // waited long enough -- stop the timer, fire the not found callback
        console.log(controlObj_IntervalCount[controlKey] * 300 + " > " + maxWaitMillis);
        clearInterval(timeControl);
        delete controlObj[controlKey]
        delete controlObj_IntervalCount[controlKey]
        if (actionFunction_NotFound)
            actionFunction_NotFound();
    }
    else {
        //--- Set a timer, if needed -- this keeps firing on the scheduled interval.
        if (!timeControl) {

            controlObj_IntervalCount[controlKey] = 0; //*** not ticked yet

            timeControl = setInterval(function () {
               
                controlObj_IntervalCount[controlKey]++;  //*** inc.  total interval ticks
                console.log("waitForKeyElements - controlObj_IntervalCount[controlKey] = " + controlObj_IntervalCount[controlKey]);

                waitForKeyElements(selectorTxt,
                                   actionFunction,
                                   maxWaitMillis,
                                   actionFunction_NotFound,
                                   bWaitOnce,
                                   iframeSelector);
            }, 300 // wait ms
            );

            controlObj[controlKey] = timeControl; // keep track of the timer for this selector
        }
    }
    waitForKeyElements.controlObj = controlObj;
    waitForKeyElements.controlObj_IntervalCount = controlObj_IntervalCount;
}