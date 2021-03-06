
var express = require('express');
var ZaloOA = require('zalo-sdk').ZaloOA;
var request = require('request');

var jsonFile = require('./final-rel-path.json');

// constant
var MUA_HANG = 'mua hàng';
var TU_VAN = 'tư vấn';
var GIA_MAT_HANG = 'giá mặt hàng';
var LOAI_MAT_HANG = 'loại mặt hằng';
var THONG_SO_KY_THUAT = 'thông số kỹ thuật';
var THONG_TIN_BO_SAC = 'thông tin bộ sạc';
var THONG_TIN_THIET_BI = 'thông tin thiết bị';
var THONG_TIN_THE_NHO = 'thông tin thẻ nhớ';
var THONG_TIN_SAN_PHAM = 'thông tin sản phẩm';
var THONG_TIN_THIET_BI_LUU_TRU = 'thông tin thiết bị lưu trữ';
var MAN_HINH_HIEN_THI = 'màn hình hiển thị';
var CAU_HINH_CHI_TIET = 'cấu hình chi tiết';
var THONG_SO_VAT_LY = 'thông số vật lý';
var KET_NOI_TINH_NANG = 'kết nối và tính năng';
var THRESHOLD = 0.85;

const server = express();
server.use('/public', express.static('public'));
// var oaid = process.env.OAID;
// var secretKey = process.env.SECRET_KEY;
////////// Master Chef page/////////
var oaid = '3726559350739287571';
var secretKey = 'Q72RCPL86JUZ4RyGM4Mi';
/// Khanh - Master Chef page ////////////
// var oaid = '2546696898504745117';
// var secretKey = '5PBCEmZRhh7902VUKGHk';

console.log(oaid);
console.log(secretKey);

var zaConfig = {
  oaid: oaid,
  secretkey: secretKey
}

var ZOAClient = new ZaloOA(zaConfig);
var common = require('./common.js')(ZOAClient);

global.cache = [];

server.get('/', (req, res) => {
  res.send('Hello World! ', oaid, secretKey);
  console.log("Server is started");
});

server.get('/webhook', (req, res) => {
  console.log("User had send a message.");
  var data = req.query;
  var message = data.message;
  var userId = data.fromuid;

  console.log(message, userId);
  // lấy thông tin người dùng 
  ZOAClient.api('getprofile', { uid: userId }, function (response) {
    console.log(response);
    if (response.errorCode < 0) {
      common.sendTextMessage(userId, 'Đã xảy ra lỗi, ' + response.errorMsg);
      return;
    }
    var profile = response.data;
    var username = profile.displayName;
    var options = {
      url: encodeURI('https://api.wit.ai/message?v=16/12/2017&q=' + message),
      headers: {
        'Authorization': 'Bearer 6ACPVMBT56A2L3IYAJHKBRQQO2YCH6TN'
      }
    };

    request(options, function (error, response, body) {
      var data = JSON.parse(body).entities;
      var mainCase = Object.keys(data)[0];
      console.log(mainCase);
      try {
        switch (mainCase) {
          case 'greetingAsking':
            common.sendTextMessage(userId, 'Xin chào, ' + username + " . Mình là Chef, chat bot tư vấn tự động. Mình có thể giúp gì cho bạn.");
            break;
          case 'saleAsking':
            common.sendTextMessage("Đợi mình kiểm tra tí nhé.");
            var saleAsking = require('./saleAsking.js')(ZOAClient, userId, jsonFile, data);
            saleAsking.excute();
            break;
          case 'advisoryAsking':
          common.sendTextMessage("Đợi mình kiểm tra tí nhé.");
          var advisoryAsking = require('./advisoryAsking.js')(ZOAClient, userId, jsonFile, data);
          advisoryAsking.execute();
          break;
          case 'fullTechInfoAsking':
            common.sendTextMessage("Đợi mình xem tí nhé.");
            var fullTechInfoAsking = require('./fullTechInfoAsking.js')(ZOAClient, userId, jsonFile, data);
            fullTechInfoAsking.execute();
            break;
          case 'policyAsking':
            common.sendTextMessage("....");
            var policyAsking = require('./policyAsking.js')(ZOAClient, userId, jsonFile, data);
            policyAsking.execute();
            break;
          case 'priceAsking':
            common.sendTextMessage("Để mình kiểm tra ngay giá của nó.");
            var priceAsking = require('./priceAsking.js')(ZOAClient, userId, jsonFile, data);
            priceAsking.execute();
            break;
          case 'memory':
            common.sendTextMessage("OK nhè.");
            var priceAskingEnhance = require('./priceAskingEnhance.js')(ZOAClient, userId, jsonFile, data);
            priceAskingEnhance.execute(data.memory[0].value);
            break;
          default:
            // cung cấp thêm thông tin bộ nhớ 
            common.sendTextMessage(userId, 'Xin lỗi, ' + username + ' mình không hiểu lắm. Bạn có thể diễn tả lại không ạ.');
            break;
        }
      } catch (error) {
        common.sendTextMessage(userId, 'Mình không hiểu lắm. Bạn có thể diễn tả lại không ạ.');
      }

    });
  });
})

var listener = server.listen(process.env.PORT || 3000, process.env.IP || "127.0.0.1", function () {
  console.log("Server listening at: " + listener.address().address + ":" + listener.address().port);
});
