/**
* mapEvent
* @param	event string
* @param	function command to be executed
* @param	boolean once only
*/

$commandMap.mapEvent("myEvent",MyEventCommand,false);

///// spec /////
// it should respond with myEventResponse when myEvent is dispatched.
// It should execute the command once only
// it should throw an error when the same event -> command combo is mapped twice


/**
* unmapEvent
* removes an event to commmand mapping. This will fail silently if no match is found
* @param	event string
* @param	function command to be removed
*/
$commandMap.unmapEvent("myEvent",MyEventCommand);

///// spec /////
// it should unmap the specified event -> command combination
// it should not complain if no match is found

/**
 * unmapEvents
 * unmap all events
 */
$commandMap.unmapEvents();

///// spec /////
// it should unmap all events
// it should unmap events that were added with once only

