var express = require('express');
var Web3 = require('web3')

var web3 = new Web3()
var router = express.Router();

web3.setProvider(new web3.providers.HttpProvider('http://172.104.75.191:8545'));
//web3.setProvider(new web3.providers.HttpProvider('http://192.168.199.126:8545'));
//web3.setProvider(new web3.providers.HttpProvider('http://172.17.89.224:8545'));

var Contract_pro = web3.eth.contract([{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"registrantsPaid","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"add_operation","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"deposit_quota","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"user_amount","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"money","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"own_list","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"far_contract_list","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"organizer","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"contract_addr","type":"address"}],"name":"reward","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"depository","outputs":[{"name":"owner_addr","type":"address"},{"name":"rent","type":"uint256"},{"name":"rent_value","type":"uint256"},{"name":"origin_distance","type":"uint256"},{"name":"update_distance","type":"uint256"},{"name":"out_of_bound","type":"uint256"},{"name":"reward_value","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"contract_address","type":"address"},{"name":"user_deposit_amount","type":"uint256"}],"name":"register","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"select_contract_address","type":"address"}],"name":"rent","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"destroy","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"user_contract_list","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"adamount","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"newquota","type":"uint256"}],"name":"changeQuota","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"user_list","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"used_contract_list","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"rent_info_map","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"build_map","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"contract_addr","type":"address"}],"name":"refund","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_from","type":"address"},{"indexed":false,"name":"_user_amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_to","type":"address"},{"indexed":false,"name":"_user_amount","type":"uint256"}],"name":"Refund","type":"event"}]);

var contract_inst = Contract_pro.at("0xd7a2a70f860c235e6f3871495428f4dba1f2dd4f");

/* GET users listing. */
router.get('/', function(req, res, next) {
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
});

router.get('/register_bike', function (req, res, next) {
  var user = req.cookies.me
  res.render('register_bike',{
    user: user,
  });
});

router.post('/register_bike', function (req, res, next) {
  var password = req.body.password;
  var rent = req.body.rent;
  console.log('Password = ' + password, ', rent: ' + rent);
  contract_inst.rent(password, {from:"0x00783e2679dde65b02155512a064ecfab088f393",gas:3200000});
  res.redirect('/user');
});

module.exports = router;