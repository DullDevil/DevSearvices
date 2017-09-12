var http = require('http');
var url = require("url");
var handler = require("./handler")
var tools = require('./tools');
function onRequest(request, response){
  var urlParse = url.parse(request.url);
  var pathname = urlParse.pathname;
  var postData = "";
  request.setEncoding("UTF-8");
  request.addListener("data",function(posfDataChunk){
      postData += posfDataChunk;
  });
  request.addListener("end",function(){
    var postObject = {};
    if (!postData && urlParse.query) {
      postObject = tools.handleStringToObject(urlParse.query);
    } else {
      try {
        postObject = JSON.parse(postData)
      } catch (e) {
        postObject = tools.handleStringToObject(postData);
      }
    }
    handler.handlePath(pathname,request,response,postObject);
  });
}
http.createServer(onRequest).listen(8080);
