var editor = null;


document.addEventListener('DOMContentLoaded', function () {
  queryAllData();
  var myTextarea = document.getElementById("codeViewer");

  var themeName =  window.localStorage.getItem("themeName");
  if (themeName == undefined) {
    themeName = "default";
  }


  var themeIndex = window.localStorage.getItem("themeIndex")
  if (themeIndex == undefined) {
    themeIndex = 0;
  }
  var themeE = document.getElementById("theme")
  if (themeE) {
    themeE.selectedIndex = themeIndex;
  }

  editor = CodeMirror.fromTextArea(myTextarea, {
    lineNumbers: true,
    mode: { name: "javascript", globalVars: true},
    styleActiveLine : true,
    theme : themeName,
    tabSize : 2,
    lineWrapping : true,
    cursorHeight : 0.85
  });

  // 设置自定义快捷键
  var mac = CodeMirror.keyMap["default"] == CodeMirror.keyMap.macDefault;
  var ctrl = mac ? "Cmd-" : "Ctrl-";
  var extraKeys = {};
  extraKeys[ctrl+"/"] = function(cm) {
    cm.toggleComment({ indent: true });
  };
  extraKeys[ctrl+"S"] = function(cm) {
    uploadCode();
  };
  extraKeys["Esc"] = "autocomplete";

  editor.setOption("extraKeys",extraKeys);

})

// 设置主题
function selectTheme(e) {
  var theme = e.options[e.selectedIndex].textContent;
  editor.setOption("theme", theme);
  window.localStorage.setItem("themeName",theme)
  window.localStorage.setItem("themeIndex",e.selectedIndex);
}

// 修改列表信息
function renderListView(data) {
  var list = window.document.getElementById('queryList');
  list.innerHTML = "";
  for (var i = 0;i < data.length;i ++) {
    var li = window.document.createElement('li')

    var label = window.document.createElement('label');
    const content = data[i];
    label.textContent =  content;
    li.addEventListener('click', function click(){
      listItemClick(content)
    }, false)
    li.classList.add('list-item');
    li.appendChild(label);
    list.appendChild(li);
  }
}
function listItemClick(s){
  var urlInput = window.document.getElementById('urlInput');
  urlInput.value = s;

  downloadCode();
}
function uploadCode() {
   var codeViewer = window.document.getElementById('codeViewer');
   var urlInput = window.document.getElementById('urlInput');

   var xhr = getHttpObj();
   xhr.open("post", '/code/upload', true);
   xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");//缺少这句，后台无法获取参数
   xhr.onreadystatechange = function() {
     if (xhr.readyState == 4) {
       if (xhr.status == 200) {
         queryAllData();
         document.getElementById("saveTip").style.visibility="visible";
         setTimeout(function () {
           document.getElementById("saveTip").style.visibility="hidden";
         }, 1000);
       } else {
         console.log(xhr.responseText)
         alert("保存失败，错误原因看控制台")
       }
     }
   };
   var filename =  urlInput.value;
   if (!filename) {
     alert("请输入对应的请求");
   } else {
     if (!filename.startsWith("/")) {
       filename = '/' + filename;
     }
     var content = JSON.stringify({"fileName":filename,"code":editor.getValue()});
     xhr.send(content);
   }
}

function deleteCode() {
  var filename = window.document.getElementById('urlInput').value;
  if (!filename) {
    alert("请输入文件名");
    return;
  }

  var xhr = getHttpObj();
  xhr.open("post", '/code/delete', true);

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 ) {
      if (xhr.status == 200) {
        queryAllData();
      } else {
        alert(xhr.responseText);
      }
    }
  }
  const data = {"fileName":filename}
  xhr.send(JSON.stringify(data))
}
function downloadCode() {
  var codeViewer = window.document.getElementById('codeViewer');
  var urlInput = window.document.getElementById('urlInput');

  var xhr = getHttpObj();
  xhr.open("post", '/code/download', true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");//缺少这句，后台无法获取参数
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        editor.setValue(xhr.responseText);
      } else {
        alert(xhr.responseText);
      }
    }
  };
  if (!urlInput.value) {
    alert("请输入对应的请求");
  } else {
    var content = JSON.stringify({"fileName":urlInput.value});
    xhr.send(content);
  }
}

function queryAllData(){
  var xhr = getHttpObj();
  xhr.open("post",  '/code/query', true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");//缺少这句，后台无法获取参数
  var that = this;
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      try {
        renderListView(JSON.parse(xhr.responseText));
      } catch (e) { }
    }
  }
  xhr.send()
}
function getHttpObj() {
  var httpobj = null;
  try {
      httpobj = new ActiveXObject("Msxml2.XMLHTTP");
  }
  catch (e) {
      try {
          httpobj = new ActiveXObject("Microsoft.XMLHTTP");
      }
      catch (e1) {
          httpobj = new XMLHttpRequest();
      }
  }
  return httpobj;
}
