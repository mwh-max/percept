/**
 * DOM fixture required before percept.js module-level code executes.
 * Every element referenced by getElementById/querySelector at load time
 * must exist here, otherwise the module will throw.
 */
document.body.innerHTML = `
  <select id="profile"></select>
  <select id="style-toggle">
    <option value="emotional">Emotional</option>
    <option value="technical">Technical</option>
  </select>
  <textarea id="markup"></textarea>
  <div id="feedback-output"></div>
  <span id="tone-preview"></span>
  <input type="file" id="profile-upload" />
  <div id="loading-indicator" hidden></div>
  <button id="analyze">Analyze</button>
  <button id="copy-feedback">Copy</button>
  <button id="export-json">Export JSON</button>
  <button id="export-text">Export Text</button>
  <button id="export-csv">Export CSV</button>
  <button id="copy-all-feedback">Copy All</button>
  <div id="toast-container"></div>
  <button id="settings-btn">Settings</button>
  <dialog id="settings-modal">
    <button id="close-settings">Close</button>
    <input type="checkbox" id="tone-preview-toggle" />
    <input type="checkbox" id="autosave-toggle" />
    <input type="checkbox" id="live-analysis-toggle" />
  </dialog>
  <button id="undo-btn">Undo</button>
  <button id="redo-btn">Redo</button>
`;
