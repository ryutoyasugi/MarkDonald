$             = require 'jquery'
marked        = require 'marked'
Vue           = require 'vue'
fs            = require 'fs'
remote        = require('electron').remote
dialog        = remote.dialog
browserWindow = remote.BrowserWindow

_$inputArea       = null
_$footerFilePath  = null
_$unsavedIcon     = null
_editor           = null
_filePath         = ''
_savedText        = ''
_EXTENSIONS       = ['txt', 'html', 'js', 'md']

# using markdown preview
viewModel = new Vue
  el: '#input_area'
  data:
    input: ''
  filters:
    marked: marked

# document ready
$ ->
  _$inputArea      = $ '#input_area'
  _$footerFilePath = $ '#footer_file_path'
  _$unsavedIcon    = $ '#unsaved_icon'

  # Initialize editor
  _editor = settingEditor()

  # documentにドラッグ&ドロップされた場合
  document.ondragover = document.ondrop = (e) ->
    e.preventDefault() # イベントの伝搬を止めて、アプリケーションのHTMLとファイルが差し替わらないようにする
    return false
  _$inputArea.ondragover = ->
    return false
  _$inputArea.ondragleave = _$inputArea.ondragend = ->
    return false
  _$inputArea.ondrop = (e) ->
    e.preventDefault()
    file = e.dataTransfer.files[0]
    readFile file.path
    return false

# Initialize editor
settingEditor = ->
  _editor = ace.edit 'input_txt'
  _editor.getSession().setMode 'ace/mode/markdown'
  _editor.setTheme 'ace/theme/twilight'
  _editor.getSession().setTabSize 2
  _editor.getSession().setUseWrapMode true
  _editor.commands.addCommand
    name: 'savefile'
    bindKey:
      win: 'Ctrl-S'
      mac: 'Command-S'
    exec: ->
      saveFile()
  _editor.commands.addCommand
    name: 'openfile'
    bindKey:
      win: 'Ctrl-O'
      mac: 'Command-O'
    exec: ->
      openFile()
  _editor.commands.addCommand
    name: 'closefile'
    bindKey:
      win: 'Ctrl-W'
      mac: 'Ctrl-W'
    exec: ->
      closeFile()
  _editor.commands.addCommand
    name: 'togglePreviewArea'
    bindKey:
      win: 'Ctrl-Shift-M'
      mac: 'Command-Shift-M'
    exec: ->
      $('#input_txt').toggleClass 'w50'
  _editor.getSession().on 'change', ->
    viewModel.input = _editor.getValue()
    checkUnsavedStat()
  return _editor

# open file
openFile = ->
  if _editor.getValue() isnt _savedText
    if confirm '変更が保存されていません。\n保存しますか？'
      saveFile()
      if !confirm 'ファイルを保存しました。\n新しいファイルを開きますか？'
        return
      else
        if !confirm '変更を保存せずに新しいファイルを開きますか？'
          return
  win = browserWindow.getFocusedWindow()
  dialog.showOpenDialog(
    win
    {
      properties: ['openFile']
      filters: [
        name: 'Documents'
        extensions: _EXTENSIONS
      ]
    }
    # [ファイル選択]ダイアログが閉じられた後のコールバック関数
    (filenames) ->
      if filenames
        readFile filenames[0]
    )
# read file
#  @param {string} path
readFile = (path) ->
  _filePath = path
  fs.readFile path, (error, text) ->
    if error isnt null
      alert "error : #{error}"
      return
    _$footerFilePath.text path
    _editor.setValue text.toString(), -1
    _savedText = _editor.getValue()
    checkUnsavedStat()

# save file
saveFile = ->
  if _filePath is ''
    saveNewFile()
  else
    writeFile _filePath, _editor.getValue()
# write file
#  @param {string} path
#  @param {string} text
writeFile = (path, text) ->
  fs.writeFile path, text, (error) ->
    if error isnt null
      alert "error : #{error}"
      return
  _savedText = _editor.getValue()
  checkUnsavedStat()
# save new file
saveNewFile = ->
  win = browserWindow.getFocusedWindow()
  dialog.showSaveDialog(
    win
    {
      properties: ['openFile']
      filters: [
        name: 'Documents'
        extensions: _EXTENSIONS
      ]
    }
    # セーブ用ダイアログが閉じられた後のコールバック関数
    (fileName) ->
      if fileName
        text      = _editor.getValue()
        _filePath = fileName
        writeFile _filePath, text
        _$footerFilePath.text _filePath
  )

# check unsaved file status
checkUnsavedStat = ->
  if _editor.getValue() isnt _savedText
    _$unsavedIcon.css 'display', 'inline'
  else
    _$unsavedIcon.css 'display', 'none'

# close file
closeFile = ->
  if _editor.getValue() isnt _savedText
    if confirm '変更が保存されていません。\n保存しますか？'
      saveFile()
    else
      if confirm '変更を保存せずにファイルを閉じますか？'
        initFileInfo()
  else
    initFileInfo()

# init file info
initFileInfo = ->
  _filePath  = ''
  _savedText = ''
  _editor.setValue ''
  _$footerFilePath.text ''
