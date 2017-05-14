``

### Build

Configure the project build with the following command. It will create the 
`build` directory with the configuration.

```shell
cmake -H. -Bbuild
cmake --build build


libethashseal/genesis/*
有许多文件，　都是genesis文件。　
比如我们所需要的内容　mainNetwork.cpp 修改后如下：
R"E(
{
        "sealEngine": "Ethash",
        "params": {
                "accountStartNonce": "0x00",
                "homsteadForkBlock": "0x118c30",
                "daoHardforkBlock": "0x1d4c00",
                "EIP150ForkBlock": "0x259518",
                "EIP158ForkBlock": "0x28d138",
                "metropolisForkBlock": "0xffffffffffffffffff",
                "networkID" : "0x00", // 网络号改为0x00，　因为以太坊主链是0x01, 测试链是0x02.
                "chainID": "0x00",
                "maximumExtraDataSize": "0x20",
                "tieBreakingGas": false,
                "minGasLimit": "0x1388",
                "maxGasLimit": "7fffffffffffffff",
                "gasLimitBoundDivisor": "0x0400",
                "minimumDifficulty": "0x020000",
                "difficultyBoundDivisor": "0x0800",
                "durationLimit": "0x78",
                "blockReward": "0x4563918244F40000",
                "registrar" : "0xc6d9d2cd449a754c494264e1809c50e34d64562b"
        },
        "genesis": {
                "nonce": "0x0000000000000042",
                "difficulty": "0x000300000",
                "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
                "author": "0x0000000000000000000000000000000000000000",
                "timestamp": "0x00",
                "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
                "extraData": "0x11bbe8db4e347b4e8c937c1c8370e4b5ed33adb3db69cbdb7a38e1e50b1b82fa",
                "gasLimit": "0x1388"
        },
        "accounts": {
        }
}
)E";

我们可以初始化添加accounts账户。
修改文件后，　只要重新make, 运行即可。
