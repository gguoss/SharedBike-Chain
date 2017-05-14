add_library(webthree WebThree.cpp WebThree.h)

eth_use(webthree REQUIRED Web3::whisper)

find_package(Eth)
find_package(Web3)

if ( CMAKE_COMPILER_IS_GNUCC )
    set(CMAKE_CXX_FLAGS  "${CMAKE_CXX_FLAGS} -Wno-error=unused-parameter")
endif ( CMAKE_COMPILER_IS_GNUCC )
if ( MSVC )
    set(CMAKE_CXX_FLAGS  "${CMAKE_CXX_FLAGS} /W4")
endif ( MSVC )

target_include_directories(webthree PRIVATE ..)
target_link_libraries(webthree ${Eth_ETHASH_LIBRARIES})
target_link_libraries(webthree ${Eth_ETHASHSEAL_LIBRARIES})
target_link_libraries(webthree ${Web3_WHISPER_LIBRARIES})
