var express = require('express');
var Web3 = require('web3')

var web3 = new Web3()
var router = express.Router();

web3.setProvider(new web3.providers.HttpProvider('http://172.104.75.191:8545'));
//web3.setProvider(new web3.providers.HttpProvider('http://172.17.0.1:8545'));

var Contract_pro = web3.eth.contract([{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"registrantsPaid","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"add_operation","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"deposit_quota","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"user_amount","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"money","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"own_list","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"far_contract_list","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"organizer","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"contract_addr","type":"address"}],"name":"reward","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"depository","outputs":[{"name":"owner_addr","type":"address"},{"name":"rent","type":"uint256"},{"name":"rent_value","type":"uint256"},{"name":"origin_distance","type":"uint256"},{"name":"update_distance","type":"uint256"},{"name":"out_of_bound","type":"uint256"},{"name":"reward_value","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"contract_address","type":"address"},{"name":"user_deposit_amount","type":"uint256"}],"name":"register","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"select_contract_address","type":"address"}],"name":"rent","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"destroy","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"user_contract_list","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"adamount","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"newquota","type":"uint256"}],"name":"changeQuota","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"user_list","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"used_contract_list","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"rent_info_map","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"build_map","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"contract_addr","type":"address"}],"name":"refund","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_from","type":"address"},{"indexed":false,"name":"_user_amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_to","type":"address"},{"indexed":false,"name":"_user_amount","type":"uint256"}],"name":"Refund","type":"event"}]);

var contract_inst = Contract_pro.at("0xd7a2a70f860c235e6f3871495428f4dba1f2dd4f");

//get the deposit value about the contract
var value = contract_inst.deposit_quota.call();
console.log('the deposit value = ' + value.toString(10));


/* GET home page. */
var lines = 10
var user_name = null
var password = null

router.get('/', function (req, res, next) {
  login = req.cookies.lg
  user = req.cookies.me
  pass = req.cookies.mp
  console.log(login, user, pass)
  if (login != user + pass || user == null || pass == null) {
    res.redirect('/register');
  } else {
    var result = new Array();
    var list = new Set();
    var value = contract_inst.user_amount.call();
    for (i = value - 5; i < value; i++) {
      result[i] = contract_inst.user_contract_list.call(i);
      list.add(contract_inst.user_contract_list.call(i));
    }
    for (var item of list) {
      if (item=='0x') {
        continue;
      }
      result.push(item);
      console.log(item);
    }
    balance = contract_inst.money.call()
    console.log('Balance : ' + balance);
    res.render('user', {
      title: 'Express',
      balance: balance,
      result: result,
    });
  }
});

router.get('/rent', function (req, res, next) {
  var result = new Array();
  var list = new Set();
  var value = contract_inst.user_amount.call();
  for (i = value - 5; i < value; i++) {
    result[i] = contract_inst.user_contract_list.call(i);
    list.add(contract_inst.user_contract_list.call(i));
  }
  for (var item of list) {
    if (item=='0x') {
      continue;
    }
    result.push(item);
    console.log(item);
  }
  console.log('the 1st bicycle number:' + result);
  login = req.cookies.lg
  user = req.cookies.me
  pass = req.cookies.mp
  console.log(login, user, pass)
  if (login != user + pass || user == null || pass == null) {
    res.redirect('/register');
  } else {
    res.render('rent', {
      lines: lines,
      result: result,
      user: user,
    });
  }
});

router.get('/register', function (req, res, next) {
  res.render('register', {
  })
});

router.get('/detail', function (req, res, next) {
  address = req.query.bike_address
  var bike_info = contract_inst.depository.call(address)
  console.log(bike_info)
  res.render('detail', {
    owner: bike_info[0],
    rent: bike_info[1],
    origin_distance: bike_info[3],
    update_distance: bike_info[4],
    out_of_bound: bike_info[5],
    reward_value: bike_info[6],
    address: address,
  })
});

router.get('/rentbike', function (req, res, next) {
  address = req.query.address
  console.log(address);
  contract_inst.rent(address, { from: "0x00783e2679dde65b02155512a064ecfab088f393", gas: 3200000 });
  console.log('Bike is rent');
  res.redirect('/user');
});

router.get('/refund', function (req, res, next) {
  address = req.query.address
  console.log(address);
  contract_inst.refund(address, { from: "0x00783e2679dde65b02155512a064ecfab088f393", gas: 3200000 });
  contract_inst.withdraw({from:"0x00783e2679dde65b02155512a064ecfab088f393",gas:3200000});
  console.log('Bike is returned');
  res.redirect('/user');
});

router.get('/logout', function (req, res, next) {
  res.clearCookie('me');
  res.clearCookie('mp');
  res.clearCookie('lg');
  res.redirect('/');
});

router.post('/register', function (req, res, next) {
  user_name = req.body.user;
  password = req.body.password;
  var action = req.body.action;
  contract_inst.register("0xd73b5d9c45e5500683a3283893bbbd4a005cb117", 500,
    { from: "0x00783e2679dde65b02155512a064ecfab088f393", gas: 3200000 });
  contract_inst.register("0xd73b5d9c45e5500683a3283893bbbd4a005cb129", 500,
    { from: "0x00783e2679dde65b02155512a064ecfab088f393", gas: 3200000 });
  contract_inst.register("0xd73b5d9c45e5500683a3283893bbbd4a005cb134", 500,
    { from: "0x00783e2679dde65b02155512a064ecfab088f393", gas: 3200000 });
  contract_inst.register("0xd73b5d9c45e5500683a3283893bbbd4a005cb234", 500,
    { from: "0x00783e2679dde65b02155512a064ecfab088f393", gas: 3200000 });
  contract_inst.register("0xd73b5d9c45e5500683a3283893bbbd4a005cb345", 500,
    { from: "0x00783e2679dde65b02155512a064ecfab088f393", gas: 3200000 });
  contract_inst.register("0xd73b5d9c45e5500683a3283893bbbd4a005cb435", 500,
    { from: "0x00783e2679dde65b02155512a064ecfab088f393", gas: 3200000 });
  contract_inst.register("0xd73b5d9c45e5500683a3283893bbbd4a005cb093", 500,
    { from: "0x00783e2679dde65b02155512a064ecfab088f393", gas: 3200000 });
  if (user_name && password) {
    res.cookie('me',
      user_name,
      { expires: new Date(Date.now() + 900000), httpOnly: true });
    res.cookie('mp',
      password,
      { expires: new Date(Date.now() + 900000), httpOnly: true });
    res.cookie('lg',
      user_name + password,
      { expires: new Date(Date.now() + 900000), httpOnly: true });
  }
  res.redirect('/');
});

module.exports = router;
