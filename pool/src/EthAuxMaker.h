#ifndef ETH_AUX_MAKER_H_
#define ETH_AUX_MAKER_H_

#include "Common.h"
#include "Kafka.h"

#include "zmq.hpp"


class EthAuxBlockMaker {
  atomic<bool> running_;
  mutex lock_;

  zmq::context_t zmqContext_;
  string zmqEthAddr_;

  string rpcAddr_;
  string rpcUserpass_;
  atomic<uint32_t> lastCallTime_;
  uint32_t kRpcCallInterval_;

  string kafkaBrokers_;
  KafkaProducer kafkaProducer_;
  bool isCheckZmq_;

  bool checkEthZMQ();
  bool callRpcGetAuxBlock(string &resp);
  string makeAuxBlockMsg();

  void submitAuxblockMsg(bool checkTime);
  void threadListenEth();

  void kafkaProduceMsg(const void *payload, size_t len);

public:
  EthAuxBlockMaker(const string &zmqEthAddr,
                   const string &rpcAddr, const string &rpcUserpass,
                   const string &kafkaBrokers, uint32_t kRpcCallInterval,
                   bool isCheckZmq);
  ~EthAuxBlockMaker();

  bool init();
  void stop();
  void run();
};


#endif
