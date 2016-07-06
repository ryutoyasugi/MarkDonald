var fs = require('fs');
var remote = require('electron').remote;
var dialog = remote.dialog;
var browserWindow = remote.BrowserWindow;

var inputArea = null;
var footerArea = null;
var currentPath = "";
var editor = null;
var extensions = ['txt', 'html', 'js', 'md'];

function onLoad() {
  // 入力関連領域
  inputArea = document.getElementById("input_area");
  // フッター領域
  footerArea = document.getElementById("footer_fixed");

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
  editor = ace.edit("input_txt");
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
  return editor;
}

function openLoadFile() {
  var win = browserWindow.getFocusedWindow();

  dialog.showOpenDialog(
    win,
    // どんなダイアログを出すかを指定するプロパティ
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
    // フッター部分に読み込み先のパスを設定
    footerArea.innerHTML = path;
    // テキスト入力エリアに設定
    editor.setValue(text.toString(), -1);
  });
}

function saveFile() {
  // 初期入力エリアに設定されたテキストを保存しようとしたときは新規ファイルを作成
  if (currentPath === "") {
    saveNewFile();
    return;
  }
  var win = browserWindow.getFocusedWindow();
  dialog.showMessageBox(win, {
      title: 'ファイルの上書き保存を行います。',
      type: 'info',
      buttons: ['OK', 'Cancel'],
      detail: '本当に保存しますか？'
    },
    // メッセージボックスが閉じられた後のコールバック関数
    function(respnse) {
      // OKボタン(ボタン配列の0番目がOK)
      if (respnse === 0) {
        var data = editor.getValue();
        writeFile(currentPath, data);
      }
    }
  );
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
    // どんなダイアログを出すかを指定するプロパティ
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
