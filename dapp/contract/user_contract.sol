contract user_bicycle_info {

    #区块链上单车的属性，用户可以根据需求灵活添加更多属性
    address owner_addr;      #拥有者
    uint public  rent_flag;  #租赁属性
    uint public  rent_value;
    uint public  sell_flag;  #买卖属性
    uint public  sell_value;
    uint public origin_distance;  #位置属性
    uint public update_distance;
    uint public out_of_bound;
    uint public reward_value;  #奖励属性
	
   function Bicycle_info() { 
   owner_addr = msg.sender;
   rent_value = 2;
   rent_flag = 0;
   sell_flag = 0;
   sell_value = 300;
   origin_distance = 0;
   update_distance = 0;
   out_of_bound = 0;
   reward_value = 1;
   
  }
}