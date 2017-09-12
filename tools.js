exports.handleStringToObject = function (string) {
  var array = new Array();
  array = string.split("&")
  var postDataObject = new Object();
  for (var i = 0; i < array.length; i++) {
      var subArray = array[i].split("=");
      postDataObject[subArray[0]] = subArray[1];
  }

  return postDataObject;
};

exports.url_decode = function (url) {
  url = decodeURI(url);
  url = url.replace(/\%3A/g, ":");
  url = url.replace(/\%2F/g, "/");
  url = url.replace(/\%3F/g, "?");
  url = url.replace(/\%3D/g, "=");
  url = url.replace(/\%26/g, "&");
  url = url.replace(/\%2C/g, ",");

  return url;
};

exports.url_encode = function (url) {
  url = encodeURI(url);
  url = url.replace( ":",/\%3A/g);
  url = url.replace( "/",/\%2F/g);
  url = url.replace( "?",/\%3F/g);
  url = url.replace( "=",/\%3D/g);
  url = url.replace( "&",/\%26/g);
  url = url.replace( ",",/\%2C/g);
  return url;
};

exports.getNowFormatDate = function () {
  var date = new Date();
  var seperator1 = "-";
  var seperator2 = ":";
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
      month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate
          + " " + date.getHours() + seperator2 + date.getMinutes()
          + seperator2 + date.getSeconds();
  return currentdate;
};
