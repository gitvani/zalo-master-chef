
var express = require('express');
var ZaloOA = require('zalo-sdk').ZaloOA;

var oaid = process.env.OAID;
var secretKey = process.env.SECRET_KEY;
console.log(oaid);
console.log(secretKey);
const server = express();
var zaConfig = {
  oaid: oaid,
  secretkey: secretKey
}
var ZOAClient = new ZaloOA(zaConfig);

server.get('/', (req, res) => {
  res.send('Hello World! ', oaid, secretKey);
  console.log("Server is started");
})
server.get('/webhook', (req, res) => {
  console.log("User had send a message.")
  var data = req.query;
  var message = data.message;
  var userId = data.fromuid;
  console.log(message, userId);
  // lấy thông tin người dùng 
  ZOAClient.api('getprofile', { uid: userId }, function (response) {
    var userProfile = response.data;
    var message = userProfile.displayName;
    sendTextMessage(userId, "Xin chào bạn " + message);
  });

  var params = {
    uid: userId,
    links: [{
      link: 'https://developers.zalo.me/',
      linktitle: 'Zalo For Developers',
      linkdes: 'Document For Developers',
      linkthumb: 'https://developers.zalo.me/web/static/images/bg.jpg'
    }]
  }
  ZOAClient.api('sendmessage/links', 'POST', params, function (response) {
    console.log(response);
  });

  ZOAClient.api('sendmessage/image', 'POST', {
    uid: userId,
    message: 'Zalo SDK Nodejs',
    'imageid': '57-134185-combo-sac-du-phong-10000-mah-cap-micro-usb-20-cm-a-18-300x300.jpg'
  }, function (response) {
    console.log(response);
  });

  var params = {
    uid: userId,
    actionlist: [{
      action: 'oa.open.inapp',
      title: 'Send interactive messages',
      description: 'This is a test for API send interactive messages',
      thumb: 'https://developers.zalo.me/web/static/images/bg.jpg',
      href: 'https://developers.zalo.me',
      data: 'https://developers.zalo.me',
      popup: {
        title: 'Open Website Zalo For Developers',
        desc: 'Click ok to visit Zalo For Developers and read more Document',
        ok: 'ok',
        cancel: 'cancel'
      }
    }]
  }
  ZOAClient.api('sendmessage/actionlist', 'POST', params, function (response) {
    console.log(response);
  });

  ZSClient.api('me/friends', function (response) {
    console.log(response);
  });

  //Get list of your friends with offset and limit
  ZSClient.api('me/friends', { offset: 10, limit: 50 }, function (response) {
    console.log(response);
  });

  //Get  list of your friends who you can intvite to use your App.
  ZSClient.api('me/invitable_friends', { offset: 10, limit: 50, fields: 'id, name, picture' }, function (response) {
    console.log(response);
  });
})

function sendTextMessage(userId, message) {
  ZOAClient.api('sendmessage/text', 'POST', { uid: userId, message: message }, function (response) {
  });
}

var listener = server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function () {
  console.log("Server listening at: " + listener.address().address + ":" + listener.address().port);
});
