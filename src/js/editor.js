var $ = require('jquery');
var marked        = require('marked');
var Vue           = require('vue');
var fs            = require('fs');
var remote        = require('electron').remote;
var dialog        = remote.dialog;
var browserWindow = remote.BrowserWindow;

var inputArea   = null;
var footerArea  = null;
var currentPath = "";
var editor      = null;
var extensions  = ['txt', 'html', 'js', 'md'];

var viewModel = new Vue({
  el: '#input_area',
  data: {
    input: ''
  },
  filters: {
    marked: marked
  }
});

function onLoad() {

  inputArea  = $('#input_area');
  footerArea = $('#footer');

  editor = settingEditor();

  // documentにドラッグ&ドロップされた場合
  document.ondragover = document.ondrop = function(e) {
    e.preventDefault(); // イベントの伝搬を止めて、アプリケーションのHTMLとファイルが差し替わらないようにする
    return false;
  };
  inputArea.ondragover = function() {
    return false;
  };
  inputArea.ondragleave = inputArea.ondragend = function() {
    return false;
  };
  inputArea.ondrop = function(e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    readFile(file.path);
    return false;
  };
}

function settingEditor() {
  editor = ace.edit("input_md");
  editor.getSession().setMode("ace/mode/markdown");
  editor.setTheme("ace/theme/twilight");
  editor.getSession().setTabSize(2);
  editor.getSession().setUseWrapMode(true);
  editor.commands.addCommand({
    name: 'savefile',
    bindKey: {
      win: 'Ctrl-S',
      mac: 'Command-S'
    },
    exec: function() {
      saveFile();
    }
  });
  editor.commands.addCommand({
    name: 'openfile',
    bindKey: {
      win: 'Ctrl-O',
      mac: 'Command-O'
    },
    exec: function() {
      openLoadFile();
    }
  });
  editor.commands.addCommand({
    name: 'closefile',
    bindKey: {
      win: 'Ctrl-W',
      mac: 'Ctrl-W'
    },
    exec: function() {
      closeFile();
      return false;
    }
  });
  editor.getSession().on('change', function() {
    viewModel.input = editor.getValue();
  });
  return editor;
}

function openLoadFile() {
  var win = browserWindow.getFocusedWindow();

  dialog.showOpenDialog(
    win,
    {
      properties: ['openFile'],
      filters: [{
        name: 'Documents',
        extensions: extensions
      }]
    },
    // [ファイル選択]ダイアログが閉じられた後のコールバック関数
    function(filenames) {
      if (filenames) readFile(filenames[0]);
    });
}

function readFile(path) {
  currentPath = path;
  fs.readFile(path, function(error, text) {
    if (error !== null) {
      alert('error : ' + error);
      return;
    }
    footerArea.text(path);
    editor.setValue(text.toString(), -1);
  });
}

function saveFile() {
  if (currentPath === "") {
    saveNewFile();
  } else {
    writeFile(currentPath, editor.getValue());
  }
}

function writeFile(path, data) {
  fs.writeFile(path, data, function(error) {
    if (error !== null) {
      alert('error : ' + error);
      return;
    }
  });
}

function saveNewFile() {
  var win = browserWindow.getFocusedWindow();
  dialog.showSaveDialog(
    win,
    {
      properties: ['openFile'],
      filters: [{
        name: 'Documents',
        extensions: extensions
      }]
    },
    // セーブ用ダイアログが閉じられた後のコールバック関数
    function(fileName) {
      if (fileName) {
        var data = editor.getValue();
        currentPath = fileName;
        writeFile(currentPath, data);
      }
    }
  );
}

function closeFile() {
  footerArea.text(null);
  editor.setValue(null);
}
