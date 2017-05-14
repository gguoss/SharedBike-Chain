#include "EthAuxMaker.h"

#include <glog/logging.h>

#include "bitcoin/util.h"
#include "bitcoin/utilstrencodings.h"

#include "Utils.h"
#include "utilities_js.hpp"

// eth zmq pub msg type: "hashblock", "hashtx", "rawblock", "rawtx"
//
#define ETH_ZMQ_HASHBLOCK      "hashblock"
#define ETH_ZMQ_HASHTX         "hashtx"

EthAuxBlockMaker::EthAuxBlockMaker(const string &zmqEthAddr,
                                   const string &rpcAddr,
                                   const string &rpcUserpass,
                                   const string &kafkaBrokers,
                                   uint32_t kRpcCallInterval,
                                   bool isCheckZmq) :
running_(true), zmqContext_(1/*i/o threads*/),
zmqEthAddr_(zmqEthAddr),
rpcAddr_(rpcAddr), rpcUserpass_(rpcUserpass),
lastCallTime_(0), kRpcCallInterval_(kRpcCallInterval),
kafkaBrokers_(kafkaBrokers),
kafkaProducer_(kafkaBrokers_.c_str(), KAFKA_TOPIC_ETH_AUXBLOCK, 0/* partition */),
isCheckZmq_(isCheckZmq)
{
}

EthAuxBlockMaker::~EthAuxBlockMaker() {}

bool EthAuxBlockMaker::checkEthZMQ() {
  //
  // eth MUST with option: -zmqpubhashtx
  //
  zmq::socket_t subscriber(zmqContext_, ZMQ_SUB);
  subscriber.connect(zmqEthAddr_);
  subscriber.setsockopt(ZMQ_SUBSCRIBE,
                        ETH_ZMQ_HASHTX, strlen(ETH_ZMQ_HASHTX));
  zmq::message_t ztype, zcontent;

  LOG(INFO) << "check eth zmq, waiting for zmq message 'hashtx'...";
  try {
    subscriber.recv(&ztype);
    subscriber.recv(&zcontent);
  } catch (std::exception & e) {
    LOG(ERROR) << "eth zmq recv exception: " << e.what();
    return false;
  }
  const string type    = std::string(static_cast<char*>(ztype.data()),    ztype.size());
  const string content = std::string(static_cast<char*>(zcontent.data()), zcontent.size());

  if (type == ETH_ZMQ_HASHTX) {
    string hashHex;
    Bin2Hex((const uint8 *)content.data(), content.size(), hashHex);
    LOG(INFO) << "eth zmq recv hashtx: " << hashHex;
    return true;
  }

  LOG(ERROR) << "unknown zmq message type from eth: " << type;
  return false;
}

bool EthAuxBlockMaker::callRpcGetAuxBlock(string &resp) {
  //
  // curl -v  --user "username:password"
  // -d '{"jsonrpc": "1.0", "id":"curltest", "method": "getauxblock","params": []}'
  // -H 'content-type: text/plain;' "http://127.0.0.1:8336"
  //
  string request = "{\"jsonrpc\":\"2.0\",\"id\":\"1\",\"method\":\"eth_getAuxBlock\",\"params\":[]}";
  bool res = bitcoindRpcCall(rpcAddr_.c_str(), rpcUserpass_.c_str(),
                             request.c_str(), resp);
  if (!res) {
    LOG(ERROR) << "eth rpc failure";
    return false;
  }
  return true;
}

string EthAuxBlockMaker::makeAuxBlockMsg() {
  string aux;
  if (!callRpcGetAuxBlock(aux)) {
    return "";
  }
  DLOG(INFO) << "getauxblock json: " << aux;

  JsonNode r;
  if (!JsonNode::parse(aux.c_str(),
                       aux.c_str() + aux.length(), r)) {
    LOG(ERROR) << "decode getauxblock json failure: " << aux;
    return "";
  }

  // check fields
  if (r["result"].type() != Utilities::JS::type::Array) {
    LOG(ERROR) << "eth_getAuxBlock missing some fields";
    return "";
  }

  LOG(INFO) << "ethereum aux check fields aux block hash:" << r["result"].array()[0].str().c_str() << "bits:" << r["result"].array()[1].str().c_str();

  // message for kafka
  string msg = Strings::Format("{\"created_at_ts\":%u,"
                               " \"hash\":\"%s\", \"bits\":\"%s\","
                               " \"rpc_addr\":\"%s\", \"rpc_userpass\":\"%s\""
                               "}",
                               (uint32_t)time(nullptr),
                               r["result"].array()[0].str().c_str(),
                               r["result"].array()[1].str().c_str(),
                               rpcAddr_.c_str(), rpcUserpass_.c_str());

  return msg;
}

void EthAuxBlockMaker::submitAuxblockMsg(bool checkTime) {
  ScopeLock sl(lock_);

  /*if (checkTime &&
      lastCallTime_ + kRpcCallInterval_ > time(nullptr)) {
    return;
  }*/

  const string auxMsg = makeAuxBlockMsg();
  if (auxMsg.length() == 0) {
    LOG(ERROR) << "getauxblock failure";
    return;
  }
  lastCallTime_ = (uint32_t)time(nullptr);

  // submit to Kafka
  LOG(INFO) << "sumbit to Kafka, msg len: " << auxMsg.length();
  kafkaProduceMsg(auxMsg.c_str(), auxMsg.length());
}

void EthAuxBlockMaker::threadListenEth() {
  zmq::socket_t subscriber(zmqContext_, ZMQ_SUB);
  subscriber.connect(zmqEthAddr_);
  subscriber.setsockopt(ZMQ_SUBSCRIBE,
                        ETH_ZMQ_HASHBLOCK, strlen(ETH_ZMQ_HASHBLOCK));

  while (running_) {
    zmq::message_t ztype, zcontent;
    try {
      if (subscriber.recv(&ztype, ZMQ_DONTWAIT) == false) {
        if (!running_) { break; }
        usleep(50000);  // so we sleep and try again
        continue;
      }
      subscriber.recv(&zcontent);
    } catch (std::exception & e) {
      LOG(ERROR) << "eth zmq recv exception: " << e.what();
      break;  // break big while
    }
    const string type    = std::string(static_cast<char*>(ztype.data()),    ztype.size());
    const string content = std::string(static_cast<char*>(zcontent.data()), zcontent.size());

    if (type == ETH_ZMQ_HASHBLOCK)
    {
      string hashHex;
      Bin2Hex((const uint8 *)content.data(), content.size(), hashHex);
      LOG(INFO) << ">>>> eth recv hashblock: " << hashHex << " <<<<";
      submitAuxblockMsg(false);
    }
    else
    {
      LOG(ERROR) << "unknown message type from eth: " << type;
    }
  } /* /while */

  subscriber.close();
  LOG(INFO) << "stop thread listen to eth";
}

void EthAuxBlockMaker::kafkaProduceMsg(const void *payload, size_t len) {
  kafkaProducer_.produce(payload, len);
}

bool EthAuxBlockMaker::init() {
  map<string, string> options;
  // set to 1 (0 is an illegal value here), deliver msg as soon as possible.
  options["queue.buffering.max.ms"] = "1";
  if (!kafkaProducer_.setup(&options)) {
    LOG(ERROR) << "kafka producer setup failure";
    return false;
  }

  // setup kafka and check if it's alive
  if (!kafkaProducer_.checkAlive()) {
    LOG(ERROR) << "kafka is NOT alive";
    return false;
  }

  // check eth
  {
    string response;
    string request = "{\"jsonrpc\":\"2.0\",\"id\":\"1\",\"method\":\"net_version\",\"params\":[]}";
    bool res = bitcoindRpcCall(rpcAddr_.c_str(), rpcUserpass_.c_str(),
                               request.c_str(), response);
    if (!res) {
      LOG(ERROR) << "eth rpc call failure";
      return false;
    }
    LOG(INFO) << "eth net_version: " << response;

    JsonNode r;
    if (!JsonNode::parse(response.c_str(),
                         response.c_str() + response.length(), r)) {
      LOG(ERROR) << "decode netversion failure";
      return false;
    }

    // check fields
    /*if (r["result"]["connections"].int32() <= 0) {
      LOG(ERROR) << "eth connections is zero";
      return false;
    }*/
  }

  //if (isCheckZmq_ && !checkEthZMQ())
  //  return false;
  
  return true;
}

void EthAuxBlockMaker::stop() {
  if (!running_) {
    return;
  }
  running_ = false;
  LOG(INFO) << "stop ethereum auxblock maker";
}

void EthAuxBlockMaker::run() {
  //
  // listen eth zmq for detect new block coming
  //
  //thread threadListenEth = thread(&EthAuxBlockMaker::threadListenEth, this);

  // getauxblock interval
  while (running_) {
    sleep(1);
    submitAuxblockMsg(true);
  }

  //if (threadListenEth.joinable())
  //  threadListenEth.join();
}

