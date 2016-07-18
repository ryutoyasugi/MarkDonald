var $             = require('jquery');
var marked        = require('marked');
var Vue           = require('vue');
var fs            = require('fs');
var remote        = require('electron').remote;
var dialog        = remote.dialog;
var browserWindow = remote.BrowserWindow;

var _$inputArea       = null;
var _$footerFilePath  = null;
var _$unsavedIcon     = null;
var _editor           = null;
var _filePath         = '';
var _savedText        = '';
var _EXTENSIONS       = ['txt', 'html', 'js', 'md'];

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

  _$inputArea  = $('#input_area');
  _$footerFilePath = $('#footer_file_path');
  _$unsavedIcon = $('#unsaved_icon');

  // Initialize editor
  _editor = settingEditor();

  // documentにドラッグ&ドロップされた場合
  document.ondragover = document.ondrop = function(e) {
    e.preventDefault(); // イベントの伝搬を止めて、アプリケーションのHTMLとファイルが差し替わらないようにする
    return false;
  };
  _$inputArea.ondragover = function() {
    return false;
  };
  _$inputArea.ondragleave = _$inputArea.ondragend = function() {
    return false;
  };
  _$inputArea.ondrop = function(e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    readFile(file.path);
    return false;
  };
}

// Initialize editor
function settingEditor() {
  _editor = ace.edit("input_md");
  _editor.getSession().setMode("ace/mode/markdown");
  _editor.setTheme("ace/theme/twilight");
  _editor.getSession().setTabSize(2);
  _editor.getSession().setUseWrapMode(true);
  _editor.commands.addCommand({
    name: 'savefile',
    bindKey: {
      win: 'Ctrl-S',
      mac: 'Command-S'
    },
    exec: function() {
      saveFile();
    }
  });
  _editor.commands.addCommand({
    name: 'openfile',
    bindKey: {
      win: 'Ctrl-O',
      mac: 'Command-O'
    },
    exec: function() {
      openFile();
    }
  });
  _editor.commands.addCommand({
    name: 'closefile',
    bindKey: {
      win: 'Ctrl-W',
      mac: 'Ctrl-W'
    },
    exec: function() {
      closeFile();
    }
  });
  _editor.getSession().on('change', function() {
    viewModel.input = _editor.getValue();
    checkUnsavedStat();
  });
  return _editor;
}

/**
 * open file
 */
function openFile() {
  if (_editor.getValue() !== _savedText) {
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
        extensions: _EXTENSIONS
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
  _filePath = path;
  fs.readFile(path, function(error, text) {
    if (error !== null) {
      alert('error : ' + error);
      return;
    }
    _$footerFilePath.text(path);
    _editor.setValue(text.toString(), -1);
    _savedText = _editor.getValue();
    checkUnsavedStat();
  });
}

/**
 * save file
 */
function saveFile() {
  if (_filePath === '') {
    saveNewFile();
  } else {
    writeFile(_filePath, _editor.getValue());
  }
}
/**
 * write file
 * @param {string} path
 * @param {string} text
 */
function writeFile(path, text) {
  fs.writeFile(path, text, function(error) {
    if (error !== null) {
      alert('error : ' + error);
      return;
    }
  });
  _savedText = _editor.getValue();
  checkUnsavedStat();
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
        extensions: _EXTENSIONS
      }]
    },
    // セーブ用ダイアログが閉じられた後のコールバック関数
    function(fileName) {
      if (fileName) {
        var text = _editor.getValue();
        _filePath = fileName;
        writeFile(_filePath, text);
      }
    }
  );
}

/**
 * check unsaved file status
 */
function checkUnsavedStat() {
  if (_editor.getValue() !== _savedText) {
    _$unsavedIcon.css('display', 'inline');
  } else {
    _$unsavedIcon.css('display', 'none');
  }
}

/**
 * close file
 */
function closeFile() {
  if (_editor.getValue() !== _savedText) {
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
  _filePath   = '';
  _savedText = '';
  _editor.setValue('');
  _$footerFilePath.text('');
}