 #include <stdlib.h>
#include <stdio.h>
#include <signal.h>
#include <err.h>
#include <errno.h>
#include <unistd.h>

#include <iostream>

#include <boost/interprocess/sync/file_lock.hpp>
#include <glog/logging.h>
#include <libconfig.h++>

#include "zmq.hpp"

#include "Utils.h"
#include "EthAuxMaker.h"

using namespace std;
using namespace libconfig;

EthAuxBlockMaker *gEthAuxBlockMaker = nullptr;

void handler(int sig) {
  if (gEthAuxBlockMaker) {
    gEthAuxBlockMaker->stop();
  }
}

void usage() {
  fprintf(stderr, "Usage:\n\tethauxmaker -c \"ethauxmaker.cfg\" -l \"log_ethauxmaker\"\n");
}

int main(int argc, char **argv) {
  char *optLogDir = NULL;
  char *optConf   = NULL;
  int c;

  if (argc <= 1) {
    usage();
    return 1;
  }
  while ((c = getopt(argc, argv, "c:l:h")) != -1) {
    switch (c) {
      case 'c':
        optConf = optarg;
        break;
      case 'l':
        optLogDir = optarg;
        break;
      case 'h': default:
        usage();
        exit(0);
    }
  }

  // Initialize Google's logging library.
  google::InitGoogleLogging(argv[0]);
  FLAGS_log_dir         = string(optLogDir);
  // Log messages at a level >= this flag are automatically sent to
  // stderr in addition to log files.
  FLAGS_stderrthreshold = 3;    // 3: FATAL
  FLAGS_max_log_size    = 100;  // max log file size 100 MB
  FLAGS_logbuflevel     = -1;   // don't buffer logs
  FLAGS_stop_logging_if_full_disk = true;

  // Read the file. If there is an error, report it and exit.
  Config cfg;
  try
  {
    cfg.readFile(optConf);
  } catch(const FileIOException &fioex) {
    std::cerr << "I/O error while reading file." << std::endl;
    return(EXIT_FAILURE);
  } catch(const ParseException &pex) {
    std::cerr << "Parse error at " << pex.getFile() << ":" << pex.getLine()
    << " - " << pex.getError() << std::endl;
    return(EXIT_FAILURE);
  }

  // lock cfg file:
  //    you can't run more than one process with the same config file
  boost::interprocess::file_lock pidFileLock(optConf);
  if (pidFileLock.try_lock() == false) {
    LOG(FATAL) << "lock cfg file fail";
    return(EXIT_FAILURE);
  }

  signal(SIGTERM, handler);
  signal(SIGINT,  handler);

  bool isCheckZmq = true;
  cfg.lookupValue("eth.is_check_zmq", isCheckZmq);
  int32_t rpcCallInterval = 5;
  cfg.lookupValue("eth.rpcinterval", rpcCallInterval);

  gEthAuxBlockMaker = new EthAuxBlockMaker(cfg.lookup("eth.zmq_addr"),
                                           cfg.lookup("eth.rpc_addr"),
                                           cfg.lookup("eth.rpc_userpwd"),
                                           cfg.lookup("kafka.brokers"),
                                           rpcCallInterval, isCheckZmq);

  try {
    if (!gEthAuxBlockMaker->init()) {
      LOG(FATAL) << "ethauxmaker init failure";
    } else {
      gEthAuxBlockMaker->run();
    }
    delete gEthAuxBlockMaker;
  } catch (std::exception & e) {
    LOG(FATAL) << "exception: " << e.what();
    return 1;
  }

  google::ShutdownGoogleLogging();
  return 0;
}
