'use strict';

var CryptoJS = require("crypto-js");
var axios = require('axios').default;
var FormData = require('form-data');

var apikey = "your apikey";
var virtualAccount = "your va";
var url = 'https://sandbox.ipaymu.com/api/v2/payment';

module.exports = function (product, price, description, referenceId, name, email, phone, url = 'http://localhost:8080') {
  var formData = new FormData();
  formData.append('product[]', product);
  formData.append('qty[]', '1');
  formData.append('price[]', price);
  formData.append('description[]', description);
  formData.append('returnUrl', `${url}/success_payment`);
  formData.append('notifyUrl', `${url}/callback_payment`);
  formData.append('cancelUrl', `${url}/cancel_payment`);
  formData.append('referenceId', referenceId);
  formData.append('buyerName', name);
  formData.append('buyerEmail', email);
  formData.append('buyerPhone', phone);
  var body = {
    "product": [product],
    "qty": ["1"],
    "price": [price],
    "returnUrl": `${url}/success_payment`,
    "cancelUrl": `${url}/cancel_payment`,
    "notifyUrl": `${url}/callback_payment`,
    "referenceId": referenceId,
    "buyerName": name,
    "buyerPhone": phone,
    "buyerEmail": email,
  }
  var bodyEncrypt = CryptoJS.SHA256(JSON.stringify(body));
  var stringtosign = "POST:"+ virtualAccount +":"+ bodyEncrypt +":"+ apikey;
  var signature = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(stringtosign, apikey));
  var config = {
    method: 'post',
    url: new URL(url).toString(),
    headers: {
      'Content-Type': 'application/json',
      'signature': signature,
      'va': virtualAccount,
      'timestamp': Math.floor(Date.now() / 1000),
      ...formData.getHeaders()
    },
    data: formData
  };
  const { status, data } = await axios(config);
  if (!status == 200) throw data;
  return data;
}
