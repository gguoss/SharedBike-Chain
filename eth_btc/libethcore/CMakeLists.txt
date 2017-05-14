aux_source_directory(. SRC_LIST)

file(GLOB HEADERS "*.h")

if ( CMAKE_COMPILER_IS_GNUCC )
    set(CMAKE_CXX_FLAGS  "${CMAKE_CXX_FLAGS} -Wno-error=unused-parameter")
endif ( CMAKE_COMPILER_IS_GNUCC )
if ( MSVC )
    set(CMAKE_CXX_FLAGS  "${CMAKE_CXX_FLAGS} /W4")
endif ( MSVC )

add_library(ethcore ${SRC_LIST} ${HEADERS})

find_package(Dev)
find_package(Eth)

target_include_directories(ethcore PRIVATE ..)
target_include_directories(ethcore PRIVATE ../utils)
target_link_libraries(ethcore ${Dev_DEVCORE_LIBRARIES})
target_link_libraries(ethcore ${Dev_DEVCRYPTO_LIBRARIES})
target_link_libraries(ethcore ${Eth_BITCOIN_LIBRARIES})
