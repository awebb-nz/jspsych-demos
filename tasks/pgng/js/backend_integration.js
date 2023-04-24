// The backend URL is composed of a hostname (localhost for testing, kyblab2.etc
// for running) and a port (which is specific to a particular experiment)
// These should be set for each experiment
const BACKEND_HOST = "http://127.0.0.1";
const BACKEND_PORT = "8000";
const BACKEND_URL = `${BACKEND_HOST}:${BACKEND_PORT}`;

// These are the routes the backend understands. They allow creation of a new
// participant, saving of complete or incomplete data, and finalisation of the
// experiment
const CREATE_PATH = "create";
const COMPLETE_SAVE_PATH = "complete";
const INCOMPLETE_SAVE_PATH = "incomplete";
const COMPLETE_SUCCESS_PATH = "complete_success";
const COMPLETE_FAILURE_PATH = "complete_failure";

/**
 * Notify the server that there is a new participant. This will generate and
 * return a new internal ID for that participant. The ID will be null in the
 * case that the prolific id has been seen before
 * 
 * @param pid The prolific id of the new participant 
 * @returns A promise of json with the value "id": "SOMERANDOMSTRING" for the
 * new participant, or "id": null if the pid is not unique
 */
async function create_participant(pid) {
  const response = await fetch(`${BACKEND_URL}/${CREATE_PATH}/${pid}`, {
    keepalive: true,
    method: 'POST',
  });
  return response.json();
}

/**
 * Sends incomplete data (e.g. after each trial) to the backend to be saved. The
 * backend will save it in a directory of incomplete data.
 *
 * @param id The internal id of the participant 
 * @param data The data to be saved
 */
function send_incomplete(id, data) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', `${BACKEND_URL}/${INCOMPLETE_SAVE_PATH}/${id}`);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(data));
}

/**
 * Sends completed data to the backend to be saved. The
 * backend will remove any incomplete data, and write the completed data to the
 * completed data directory
 *
 * @param id The internal id of the participant 
 * @param data The data to be saved
 */
function send_complete(id, data) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', `${BACKEND_URL}/${COMPLETE_SAVE_PATH}/${id}`);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(data));
}

/**
 * Notifies the backend of the success or failure of the experiment. This will
 * cause the backend to move any saved data to either the completed or the
 * invalid data directories
 *
 * @param id The internal id of the participant 
 * @param data Whether or not the participant completed the experiment
 * succesfully
 */
function complete(id, success = true) {
  var xhr = new XMLHttpRequest();
  var path = COMPLETE_SUCCESS_PATH;
  if (!success) {
    path = COMPLETE_FAILURE_PATH;
  }
  xhr.open('POST', `${BACKEND_URL}/${path}/${id}`);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(null);
}

/**
 * Parse the prolific user id out of the url.
 * The id is a String variable with identifier "PROLIFIC_PID" that is automatically set when a 
 * participant was redirected to the website by prolific.
 * 
 * @returns Prolific user id (String) or None if no user id was found 
 */
function get_prolific_id() {
  // parse our prolific user id from URL parameters
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
  var prolific_participant_id = urlParams.get('PROLIFIC_PID')
  return prolific_participant_id
}
