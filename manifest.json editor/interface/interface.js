var editor = null;
var formatter = null;

var main = {};

main.formatterToEditor = function() {
    try {
        editor.set(formatter.get());
    }
    catch (err) {
        main.showError(err);
    }
};

main.editorToFormatter = function () {
    try {
        formatter.set(editor.get());
    }
    catch (err) {
        main.showError(err);
    }
};

main.eventParams = {};
main.onMouseDown = function (event) {
    var leftButtonDown = event.which ? (event.which == 1) : (event.button == 1);
    if (!leftButtonDown) {
        return;
    }

    if (!main.eventParams.mousedown) {
        main.eventParams.mousedown = true;
        main.eventParams.mousemove =
            JSONEditor.Events.addEventListener(document, 'mousemove', main.onMouseMove);
        main.eventParams.mouseup =
            JSONEditor.Events.addEventListener(document, 'mouseup', main.onMouseUp);
        main.eventParams.screenX = event.screenX;
        main.eventParams.splitterValue = main.getSplitterValue();
    }
    JSONEditor.Events.preventDefault(event);
};

main.onMouseMove = function (event) {
    var width = (window.innerWidth || document.body.offsetWidth ||
        document.documentElement.offsetWidth);

    var diff = event.screenX - main.eventParams.screenX;

    var value = main.eventParams.splitterValue + diff / width;
    main.setSplitterValue(value);

    main.resize();

    JSONEditor.Events.preventDefault(event);
};

main.onMouseUp = function (event) {
    if (main.eventParams.mousedown) {
        JSONEditor.Events.removeEventListener(document, 'mousemove', main.eventParams.mousemove);
        JSONEditor.Events.removeEventListener(document, 'mouseup', main.eventParams.mouseup);
        main.eventParams.mousemove = undefined;
        main.eventParams.mouseup = undefined;
        main.eventParams.mousedown = false;
    }
    JSONEditor.Events.preventDefault(event);
};

/**
 * Set a value for the splitter (UI is not adjusted)
 * @param {Number} value   A number between 0.1 and 0.9
 * @return {Number} value  The stored value
 */
main.setSplitterValue = function (value) {
    value = Number(value);
    if (value < 0.1) {
        value = 0.1;
    }
    if (value > 0.9) {
        value = 0.9;
    }

    main.splitterValue = value;

    try {
        localStorage['splitterValue'] = value;
    }
    catch (e) {
        console.log(e);
    }
    return value;
};

/**
 * Get the splitter value from local storage
 * @return {Number} value   A value between 0.1 and 0.9
 */
main.getSplitterValue = function () {
    var value = main.splitterValue;
    if (value == undefined) {
        // read from localStorage once
        try {
            if (localStorage['splitterValue'] != undefined) {
                value = Number(localStorage['splitterValue']); // read
                value = main.setSplitterValue(value);          // verify and store
            }
        }
        catch (e) {
            console.log(e);
        }
    }
    if (value == undefined) {
        value = main.setSplitterValue(0.5);
    }
    if (value == undefined) {
        value = 0.5;
    }
    return value;
};

main.load = function() {
    var json = {
  "name": "AppName",
  "description": "Chrome App Description",
  "version": "1",
  "manifest_version": 2,
  "app": {
    "launch": {
      "local_path": "launchFile.html"
    }
  },
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
};

    try {
        // formatter
        var container = document.getElementById("jsonformatter");
        formatter = new JSONFormatter(container);
        formatter.set(json);
        formatter.onError = function (err) {
            main.showError(err);
        };

        // editor
        container = document.getElementById("jsoneditor");
        editor = new JSONEditor(container);
        editor.set(json);

        // splitter
        var domSplitter = document.getElementById('splitter');

        /*
        domSplitter.innerHTML =
            '<br><br><br>' +
                '<button id="toForm" onclick="this.focus(); main.formatterToEditor();" title="JSON to Editor" class="convert"><div class="convert-right"></div></button><br>' +
                '<br>' +
                '<button id="toJSON" onclick="this.focus(); main.editorToFormatter();" title="Editor to JSON" class="convert"><div class="convert-left"></div></button>';
        */
        domSplitter.appendChild(document.createElement('br'));
        domSplitter.appendChild(document.createElement('br'));
        domSplitter.appendChild(document.createElement('br'));
        var toForm = document.createElement('button');
        toForm.id = 'toForm';
        toForm.title = 'JSON to Editor';
        toForm.className = 'convert';
        toForm.innerHTML = '<div class="convert-right"></div>';
        toForm.onclick = function () {
            this.focus();
            main.formatterToEditor();
        };
        domSplitter.appendChild(toForm);
        domSplitter.appendChild(document.createElement('br'));
        domSplitter.appendChild(document.createElement('br'));
        var toJSON = document.createElement('button');
        toJSON.id = 'toJSON';
        toJSON.title = 'Editor to JSON';
        toJSON.className = 'convert';
        toJSON.innerHTML = '<div class="convert-left"></div>';
        toJSON.onclick = function () {
            this.focus();
            main.editorToFormatter();
        };
        domSplitter.appendChild(toJSON);

        JSONEditor.Events.addEventListener(domSplitter, "mousedown", main.onMouseDown);

        // resize
        JSONEditor.Events.addEventListener(window, 'resize', main.resize);

        // TODO: implement a focus method
        formatter.textarea.focus();

        // TODO: a nicer method to check for changes
        var formatterLastContent;
        var editorLastContent;
        function checkChange () {
            try {
                // check for change in formatter
                var formatterJSON = formatter.get();
                var formatterContent = JSON.stringify(formatterJSON);
                if (formatterContent != formatterLastContent) {
                    formatterLastContent = formatterContent;
                    editorLastContent = formatterContent;
                    editor.set(formatterJSON);
                }
                else {
                    // check for change in editor
                    var editorJSON = editor.get();
                    var editorContent = JSON.stringify(editorJSON);
                    if (editorContent != editorLastContent) {
                        editorLastContent = editorContent;
                        formatterLastContent = editorContent;
                        formatter.set(editorJSON);
                    }
                }
            }
            catch (err) {
                main.showError(err);
            }

            setTimeout(checkChange, 1000);
        }
        /* TODO: use checkChange
         checkChange();
         */
    } catch (err) {
        var msg = err.message || err;
        main.showError('Error: ' + msg);
    }
};

main.resize = function() {
    var domEditor = document.getElementById('jsoneditor');
    var domFormatter = document.getElementById('jsonformatter');
    var domSplitter = document.getElementById('splitter');
    var domAd = document.getElementById('ad');
    var domAdInfo = document.getElementById('adInfo');

    var width = window.innerWidth || document.body.offsetWidth || document.documentElement.offsetWidth;
    var height = window.innerHeight || document.body.offsetHeight || document.documentElement.offsetHeight;
    var adWidth = domAd ? domAd.clientWidth : 0;
    var splitterWidth = domSplitter.clientWidth;
    if (adWidth) {
        width -= (adWidth + 15); // Not so nice, +15 here for the margin
    }

    var splitterLeft = width * main.getSplitterValue();

    // resize formatter
    domFormatter.style.width = (splitterLeft) + 'px';

    // resize editor
    // the width has a -1 to prevent the width from being just half a pixel
    // wider than the window, causing the content elements to wrap...
    domEditor.style.left = (splitterLeft + splitterWidth) + 'px';
    domEditor.style.width = (width - splitterLeft - splitterWidth - 1) + 'px';
    //editor.onResize(); // TODO

    // resize ad text
    if (domAdInfo && domAd) {
        var infoHeight = domAdInfo.clientHeight;
        domAd.style.paddingTop = infoHeight + 'px';
    }
};

main.errorFrame = undefined;

main.showError = function (message) {
    if (!main.errorFrame) {
        var width = 500;
        var top = 5;
        var windowWidth = document.body.offsetWidth ||  window.innerWidth;
        main.errorFrame = document.createElement('div');
        main.errorFrame.style.position = 'absolute';
        main.errorFrame.style.left = (windowWidth - width) / 2 + 'px';
        main.errorFrame.style.width = width + 'px';
        main.errorFrame.style.top = top + 'px';
        document.body.appendChild(main.errorFrame);
    }

    var error = document.createElement('div');
    error.className = 'error';
    error.style.position = 'relative';
    main.errorFrame.appendChild(error);

    var table = document.createElement('table');
    table.style.width = '100%';
    error.appendChild(table);
    var tbody = document.createElement('tbody');
    table.appendChild(tbody);
    var tr = document.createElement('tr');
    tbody.appendChild(tr);

    var tdMessage = document.createElement('td');
    tdMessage.innerHTML = message;
    tr.appendChild(tdMessage);

    var tdClose = document.createElement('td');
    tdClose.style.textAlign = 'right';
    tdClose.style.verticalAlign = 'top';
    tr.appendChild(tdClose);

    var closeDiv = document.createElement('button');
    closeDiv.innerHTML = '&times;';
    closeDiv.title = 'Close error message';
    tdClose.appendChild(closeDiv);
    closeDiv.onclick = function () {
        if (error.parentNode) {
            error.parentNode.removeChild(error);
        }

        if (main.errorFrame.childNodes.length == 0) {
            main.errorFrame.parentNode.removeChild(main.errorFrame);
            main.errorFrame = undefined;
        }
    }
};

main.hideAds = function() {
    var domAd = document.getElementById("ad");
    if (domAd) {
        domAd.parentNode.removeChild(domAd);
        main.resize();
    }
};

main.removeAds = function () {
    var domRemoveAds = document.getElementById('removeAds');
    var domChromeAppInfo = document.getElementById('chromeAppInfo');
    if (domRemoveAds) {
        domRemoveAds.style.display = 'none';
    }
    if (domChromeAppInfo) {
        domChromeAppInfo.style.display = '';
    }
    main.resize();
};
