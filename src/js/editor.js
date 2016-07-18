var $             = require('jquery');
var marked        = require('marked');
var Vue           = require('vue');
var fs            = require('fs');
var remote        = require('electron').remote;
var dialog        = remote.dialog;
var browserWindow = remote.BrowserWindow;

var inputArea   = null;
var footerArea  = null;
var filePath    = "";
var editor      = null;
var extensions  = ['txt', 'html', 'js', 'md'];
var saved_text  = '';

// using markdown preview
var viewModel = new Vue({
  el: '#input_area',
  data: {
    input: ''
  },
  filters: {
    marked: marked
  }
});

/**
 * onLoad
 */
function onLoad() {

  inputArea  = $('#input_area');
  footerArea = $('#footer');

  // Initialize editor
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

// Initialize editor
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
      openFile();
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
    }
  });
  editor.getSession().on('change', function() {
    viewModel.input = editor.getValue();
  });
  return editor;
}

/**
 * open file
 */
function openFile() {
  if (editor.getValue() !== saved_text) {
    if (confirm('変更が保存されていません。\n保存しますか？')) {
      saveFile();
      if (!confirm('ファイルを保存しました。\n新しいファイルを開きますか？')) {
        return;
      }
    } else {
      if (!confirm('変更を保存せずに新しいファイルを開きますか？')) {
        return;
      }
    }
  }
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
/**
 * read file
 * @param {string} path
 */
function readFile(path) {
  filePath = path;
  fs.readFile(path, function(error, text) {
    if (error !== null) {
      alert('error : ' + error);
      return;
    }
    footerArea.text(path);
    editor.setValue(text.toString(), -1);
    saved_text = editor.getValue();
  });
}

/**
 * save file
 */
function saveFile() {
  if (filePath === '') {
    saveNewFile();
  } else {
    writeFile(filePath, editor.getValue());
  }
}
/**
 * write file
 * @param {string} filePath
 * @param {string} text
 */
function writeFile(filePath, text) {
  fs.writeFile(filePath, text, function(error) {
    if (error !== null) {
      alert('error : ' + error);
      return;
    }
  });
  saved_text = editor.getValue();
}
/**
 * save new file
 */
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
        var text = editor.getValue();
        filePath = fileName;
        writeFile(filePath, text);
      }
    }
  );
}

/**
 * close file
 */
function closeFile() {
  if (editor.getValue() !== saved_text) {
    if (confirm('変更が保存されていません。\n保存しますか？')) {
      saveFile();
    } else {
      if (confirm('変更を保存せずにファイルを閉じますか？')) {
        initFileInfo();
      }
    }
  } else {
    initFileInfo();
  }
}

/**
 * init file info
 */
function initFileInfo() {
  filePath   = '';
  saved_text = '';
  editor.setValue('');
  footerArea.text('');
}