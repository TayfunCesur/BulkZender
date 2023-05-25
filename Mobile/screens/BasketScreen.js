import { View, SafeAreaView, StatusBar, FlatList, Clipboard, TouchableOpacity, Linking, Image, ActivityIndicator } from 'react-native'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import LinearGradient from 'react-native-linear-gradient';
import FontedText from "../components/FontedText"
import BackgroundTimer from 'react-native-background-timer';
import { MetaMaskSDK, ConnectionStatus, EventType } from '@metamask/sdk';
import "react-native-get-random-values"
import "@ethersproject/shims"
import { ethers } from 'ethers';
import uuid from 'react-native-uuid';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { BULK_SENDER_CONTRACT } from "../app.config"
import { useDispatch } from 'react-redux';
import { resetState } from '../reducers/homeSlice';
import { getRpcByChainId } from '../utils';
const sdk = new MetaMaskSDK({
  openDeeplink: (link) => {
    Linking.openURL(link);
  },
  timer: BackgroundTimer,
  enableDebug: true,
  developerMode: true,
  autoConnect: true,
  logging: true,
  dappMetadata: {
    url: 'https://tayfuncesur.com',
    name: 'BulkZender',
  },
  storage: {
    enabled: true,
  },
});

const BasketScreen = ({ route, navigation }) => {
  const { basketItems } = route.params;
  const dispatch = useDispatch();
  const totalAmount = route.params.basketItems.reduce((n, { amount }) => parseFloat(n) + parseFloat(amount), 0)
  const [items, setItems] = useState([])
  const [ethereum] = useState(sdk.getProvider());
  const [account, setAccount] = useState();
  const [connected, setConnected] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [isApproved, setIsApproved] = useState(null);
  const [response, setResponse] = useState({ state: "", tx: "" });
  const [status, setConnectionStatus] = useState(ConnectionStatus.DISCONNECTED);
  const ERC20ABI = [
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  ]
  const getAddressText = (text, start, end) => (
    text.substring(0, start) + "..." + text.substring(text.length - end, text.length)
  )

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    })
  }, [])

  useEffect(() => {
    if (!ethereum) {
      console.warn('invalid provider state');
      return;
    }

    try {
      var result = basketItems.reduce(function (map, obj) {
        map[obj.token] = basketItems.filter((x) => x.token == obj.token);
        return map;
      }, {});
      setItems(result)

      ethereum.on('disconnect', () => {
        console.log('useEffect::ethereum on "disconnect"');
        setConnected(false);
      });

      sdk.on(
        EventType.CONNECTION_STATUS,
        (_connectionStatus) => {
          setConnectionStatus(_connectionStatus);
        },
      );
    } catch (err) {
      console.log('ERROR', err);
    }
  }, []);

  const observeTx = async (action, txHash) => {
    var interval = setInterval(async function () {
      try {
        const receipt = await new ethers.providers.JsonRpcProvider(getRpcByChainId(parseInt(ethereum.chainId))).send(
          'eth_getTransactionReceipt',
          [txHash],
        );
        if (parseInt(receipt.status) == 1) {
          setResponse({
            state: "SUCCESS",
            tx: txHash
          })
          clearInterval(interval)
          if (action == "APPROVE") {
            checkIsApproved()
          } else if (action == "EXECUTE") {
            dispatch(resetState({}))
          }
        }
      } catch (e) {
        console.log(e)
        setResponse({
          state: "FAILED",
          tx: txHash
        })
        clearInterval(interval)
      }
    }, 3000);
  }

  const connect = async () => {
    try {
      const result = (await ethereum?.request({
        method: 'eth_requestAccounts',
      }));
      setConnected(true);
      setAccount(result?.[0]);
      checkIsApproved()

    } catch (e) {
      console.log('CONNECT ERROR', e);
    }
  };

  const checkIsApproved = async () => {
    const to = basketItems[0].token
    try {
      setShowLoading(true)
      // Workaround, until https://github.com/MetaMask/metamask-sdk/issues/144#issuecomment-1599074588 resolves.
      // Currently, we can't do view calls or eth_call via metamask provider. 
      const ERC20 = new ethers.Contract(to, ERC20ABI, new ethers.providers.JsonRpcProvider(getRpcByChainId(parseInt(ethereum.chainId))))
      const allowance = await ERC20.allowance(ethereum.selectedAddress, BULK_SENDER_CONTRACT)
      const allowanceEth = ethers.utils.formatEther(allowance.toString())
      setIsApproved(allowanceEth >= totalAmount)
    } catch (error) {
      console.log(error)
    }
  }
  const approve = async () => {
    let approveABI = ["function approve(address spender, uint256 amount)"];
    let iface = new ethers.utils.Interface(approveABI);
    const data = iface.encodeFunctionData("approve", [BULK_SENDER_CONTRACT, ethers.utils.parseEther(totalAmount.toString())])
    const to = basketItems[0].token;
    const transactionParameters = {
      to,
      from: ethereum?.selectedAddress,
      data: data
    };

    try {
      const txHash = await ethereum?.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
      setResponse({
        state: "LOADING",
        tx: txHash
      });
      await observeTx("APPROVE",txHash)
    } catch (e) {
      console.log(e);
    }
  }

  const sendTransaction = async () => {
    let executeABI = ["function execute(address token, uint256 totalAmount, tuple(address to, uint amount)[] orders)"]
    let iface = new ethers.utils.Interface(executeABI);
    const token = basketItems[0].token;
    const to = BULK_SENDER_CONTRACT;
    const items = basketItems.map((o) => { return [o.to, ethers.utils.parseEther(o.amount.toString())] })
    const data = iface.encodeFunctionData("execute", [token, ethers.utils.parseEther(totalAmount.toString()), items])
    const transactionParameters = {
      to,
      from: ethereum?.selectedAddress,
      data: data
    };

    try {
      const txHash = await ethereum?.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
      setResponse({
        state: "LOADING",
        tx: txHash
      });
      await observeTx("EXECUTE",txHash)
    } catch (e) {
      console.log(e);
    }
  };

  const Item = ({ token, value }) => {
    return (
      <View key={uuid.v4()} className="pt-4">
        <FontedText classname="text-white text-xl" type="sb" >Token: {getAddressText(token, 15, 10)}</FontedText>
        {value.map(element => (
          <View key={uuid.v4()} className="pl-8 pt-4 flex-1 flex-row items-center">
            <MaterialIcon className="pr-8" name="circle" size={15} color="#FFFFFF" />
            <View className="ml-4" >
              <FontedText classname="text-white text-base" type="l">To: {getAddressText(element.to, 15, 10)}</FontedText>
              <FontedText classname="text-white text-base pt-2" type="l">Amount: {element.amount}</FontedText>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1" >
      <StatusBar
        animated={true}
        backgroundColor="#27262C"
      />
      <View className="flex-1">
        <LinearGradient
          colors={['#313d5c', '#3d2a54']}
          className="flex-1">
          <View className="items-center  flex-row bg-cardBg pl-4 pr-4 pt-4 pb-4">
            <MaterialIcon name="auto-awesome" size={40} color="#1FC7D4" />
            <FontedText classname="text-white text-base flex-1 ml-2" >Last step</FontedText>
          </View>

          <View className="justify-center items-center  rounded-2xl border-gray-500 border-2 m-4 p-4">
            {connected ?
              (<MaterialIcon name="check-circle" size={60} color="#4CAF50" />) :
              (<Image source={require("../assets/metamask.png")} className="w-14 h-14 self-center " />)
            }

            <FontedText classname="text-white text-lg mt-4 mb-4" type="sb">
              {sdk.getDappMetadata()?.name} ({connected ? 'Connected' : 'Disconnected'})
            </FontedText>
            {connected ? (
              <FontedText classname="text-white text-center text-base opacity-80">
                {account && `Connected account: ${account}`}
              </FontedText>) : (
              <TouchableOpacity onPress={connect}>
                <FontedText classname="text-white text-base bg-primaryColor rounded-2xl p-4 self-center mb-4" type="sb">Connect</FontedText>
              </TouchableOpacity>
            )
            }
          </View>


          <View className="p-4 items-center" >
            <FontedText classname="text-white text-2xl" type="sb"> Basket Items </FontedText>
          </View>

          <FlatList
            className="pr-4 pl-4"
            data={Object.keys(items)}
            renderItem={({ item }) => <Item token={item} value={items[item]} />}
            keyExtractor={item => item}
          />
          <View className="flex-col">
            {response.state != "" && response.state == "LOADING" && (
              <View className=" items-center flex-row rounded-2xl border-gray-500 border-2 m-4 p-4">
                <ActivityIndicator size={40} />
                <View className="p-4 flex-shrink">
                  <FontedText classname="text-white text-base" type="sb">Your transaction is being processed... </FontedText>
                  <TouchableOpacity onPress={() => { Clipboard.setString(response.tx) }}>
                    <FontedText classname="text-white text-base pt-2  flex-1 flex-wrap" type="sb">Tx Hash: {'\n'}{response.tx} </FontedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {response.state != "" && response.state == "SUCCESS" && (
              <View className=" items-center flex-row rounded-2xl border-gray-500 border-2 m-4 p-4">
                <MaterialIcon name="check-circle" size={60} color="#4CAF50" />
                <View className="p-4 flex-shrink">
                  <FontedText classname="text-white text-base" type="sb">Your transaction is being processed... </FontedText>
                  <TouchableOpacity onPress={() => { Clipboard.setString(response.tx) }}>
                    <FontedText classname="text-white text-base pt-2" type="sb">Tx Hash: {'\n'}{response.tx}</FontedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {response.state != "" && response.state == "FAILED" && (
              <View className=" items-center flex-row rounded-2xl border-gray-500 border-2 m-4 p-4">
                <MaterialIcon name="error" size={60} color="#F44336" />
                <View className="p-4 flex-shrink">
                  <FontedText classname="text-white text-base" type="sb">Your transaction is being processed... </FontedText>
                  <TouchableOpacity onPress={() => { Clipboard.setString(response.tx) }}>
                    <FontedText classname="text-white text-base pt-2  flex-1 flex-wrap" type="sb">Tx Hash: {'\n'}{response.tx} </FontedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {isApproved != null ? (
              <TouchableOpacity onPress={isApproved ? sendTransaction : approve}>
                <FontedText classname="text-white text-base bg-primaryColor rounded-2xl p-4 self-center mb-4" type="sb">{isApproved ? "Send" : "Approve"}</FontedText>
              </TouchableOpacity>
            ) : (
              showLoading ? (<ActivityIndicator className="mb-4" size={40} />) : <></>
            )
            }
          </View>
        </LinearGradient >
      </View >
    </SafeAreaView >
  )
}

export default BasketScreen