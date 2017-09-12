var fs = require('fs');
var vm = require('vm');
exports.handlePath = function (path,request,response,postObject) {

  try {
    if (path.endsWith('.js')) {
      loadResouce(path,response,"text/javascript");
    } else if (path.endsWith('.css')) {
      loadResouce(path,response,"text/css");
    } else if (path == '/' ) {
      loadCodeView(response);
    }  else if (path == '/code/upload'){
      handleCodeupload(response,postObject);
    } else if (path == '/code/download'){
      handleCodeDownload(response,postObject);
    } else if (path == '/code/query'){
      handleCodeQuery(response);
    } else if (path == '/code/delete'){
      handleCodeDelete(response,postObject);
    } else {
       handelAPIRequest(path,request,response,postObject);
    }
  } catch (e) {
    response.writeHead(500, {"Content-Type":"application/json"});
    response.write(JSON.stringify(e));
    response.end();
  }

};

function handleCodeDelete(response,postObject) {
  var fileName = "./file/" + Buffer(postObject.fileName).toString('base64');
  response.writeHead(200, {"Content-Type":"application/json"});
  fs.unlink(fileName,function(err){
    if (!err) {
      response.write("删除成功");
    } else {
      response.write("删除失败");
    }
    response.end();
  });
}


function handleCodeQuery(response) {
  response.writeHead(200, {"Content-Type":"application/json"});

  var fileName = "./file/";
  fs.readdir(fileName,function(e,data){
    if (!e) {
      var result = new Array();
      for (var i = 0; i < data.length; i++) {
         if (!data[i].startsWith(".")) {
           try {
             const fileName = new Buffer(data[i], 'base64').toString()
             result.push(fileName);
             result.sort()
           } catch (e) {

           }
         }
      }
    }
    response.write(JSON.stringify(result));
    response.end();
  });
}

function handleCodeupload(response,postObject) {
  var e = verifyCode(postObject.code);
  if (!e) {
    var fileName = "./file/" + Buffer(postObject.fileName).toString('base64');
    fs.writeFile(fileName,postObject.code,"UTF-8",function(e){
      if (!e) {
        response.writeHead(200, {"Content-Type":"application/json"});
        response.write("upload success");
      } else {
        response.writeHead(201, {"Content-Type":"application/json"});
        response.write("保存code出错");
      }
      response.end();
    })
  } else {

    response.writeHead(201, {"Content-Type":"application/json"});
    response.write(e);
    response.end();
  }

}
function handleCodeDownload(response,postObject) {
  response.writeHead(200, {"Content-Type":"application/json"});
  var fileName = "./file/" + Buffer(postObject.fileName).toString('base64');

  fs.readFile(fileName,function(e,data){
    if (!e) {
      var responseData = {"data":data}
      response.write(data);
    }
    response.end();
  });

}
//显示code编辑页面
function loadResouce(path,response,contentType) {
  if (!contentType) {
    contentType = "text/plain";
  }
  response.writeHead(200, {"Content-Type":contentType});
  path = '.' + path;
  fs.readFile(path,function(e,data){
    if (!e) {
      response.write(data);
    }
    response.end();
  });
}
function loadCodeView(response){
    response.writeHead(200, {"Content-Type":"text/html"});
    fs.readFile('./view/codeViewer.html',function(e,data){
      if (!e) {
        response.write(data);
      }
      response.end();
    });
}

// 数据处理
function handelAPIRequest(path,request,response,postObject){
  var responseObject = new Object();
  var sandbox = {
    response: response,
    params: postObject,
    timeout : 0,
    resObj : responseObject
  };

  var fileName = "./file/" + Buffer(path).toString('base64');;

  fs.readFile(fileName,function(error,data){
    if (error) {
      response.write("路径异常");
      response.end();
    } else {
      var result = runCode(sandbox,data,response)
    }
  })
}

// 运行动态脚本
function runCode (sandbox,code,response){
  try {
    sandbox.response.writeHead(200, {"Content-Type":"application/json"});
    sandbox.resObj.code = 100;

    var context = new vm.createContext(sandbox);

    const firstScript = new vm.Script(code);
    firstScript.runInContext(context);
    const jsonString =  JSON.stringify(sandbox.resObj,null,2);

    setTimeout(function(){
      sandbox.response.write(jsonString);
      sandbox.response.end();
    },sandbox.timeout)
    return true;
  } catch (e) {
    sandbox.response.writeHead(201, {"Content-Type":"application/json"});
    sandbox.response.write(e.stack);
    sandbox.response.end();
    return false;
  }
}

function verifyCode(code) {
  const sandbox = {
    params: {},
    resObj : {}
  };
  const context = new vm.createContext(sandbox);
  try {
    const script = new vm.Script(code);
    script.runInContext(context);
    return null;
  } catch (e) {
    return  e.stack;
  }
}
