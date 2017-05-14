set(LIBRARY bitcoin)

if (CPPETHEREUM)
	set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -fPIC")
endif ()

set(CMAKE_BUILD_TYPE Release)

if (NOT MSVC)
	set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -std=gnu99")
endif()

set(FILES 	auxpow.cpp
            auxpow.h
            utilstrencodings.h
            utilstrencodings.cpp
            transaction.h
          	transaction.cpp
          	pureheader.h
          	pureheader.cpp
            amount.h
            amount.cpp
            serialize.h
            tinyformat.h
            endian.h
            prevector.h
            byteswap.h
            script.h
            script.cpp
            common.h
            uint256.h
            uint256.cpp
            hash.h
            hash.cpp
            block.h
            block.cpp
            streams.h
            version.h
            zeroafterfree.h
            crypto/sha256.h
            crypto/sha256.cpp
            )

if ( CMAKE_COMPILER_IS_GNUCC )
    set(CMAKE_CXX_FLAGS  "${CMAKE_CXX_FLAGS} -Wno-error=unused-parameter")
endif ( CMAKE_COMPILER_IS_GNUCC )
if ( MSVC )
    set(CMAKE_CXX_FLAGS  "${CMAKE_CXX_FLAGS} /W4")
endif ( MSVC )

#if (MSVC)
#	list(APPEND FILES util_win32.c io_win32.c mmap_win32.c)
#else()
#	list(APPEND FILES io_posix.c)
#endif()

#list(APPEND FILES sha3.c sha3.h)

add_library(bitcoin ${FILES})
TARGET_LINK_LIBRARIES(bitcoin ssl)

#if (CRYPTOPP_FOUND)
#	TARGET_LINK_LIBRARIES(ethash ${CRYPTOPP_LIBRARIES})
#endif()

#if (UNIX AND NOT APPLE)
#	TARGET_LINK_LIBRARIES(ethash pthread m)
#endif()
