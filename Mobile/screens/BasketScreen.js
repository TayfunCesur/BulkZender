import { View, SafeAreaView, StatusBar, FlatList, Text, TouchableOpacity, Linking } from 'react-native'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import LinearGradient from 'react-native-linear-gradient';
import FontedText from "../components/FontedText"
import BackgroundTimer from 'react-native-background-timer';
import { MetaMaskSDK, ConnectionStatus } from '@metamask/sdk';
import { ethers } from 'ethers';
import uuid from 'react-native-uuid';
const sdk = new MetaMaskSDK({
  openDeeplink: (link) => {
    Linking.openURL(link);
  },
  timer: BackgroundTimer,
  enableDebug: true,
  dappMetadata: {
    url: 'ReactNativeTS2',
    name: 'ReactNativeTS2',
  },
  storage: {
    enabled: true,
  },
});



const BasketScreen = ({ route, navigation }) => {
  const { basketItems } = route.params;
  const [provider, setProvider] = useState();
  const [items, setItems] = useState([])
  const [ethereum] = useState(sdk.getProvider());
  const [response, setResponse] = useState('');
  const [account, setAccount] = useState();
  const [chain, setChain] = useState();
  const [balance, setBalance] = useState();
  const [connected, setConnected] = useState(false);
  const [status, setConnectionStatus] = useState(ConnectionStatus.DISCONNECTED);

  const getAddressText = (text, start, end) => (
    text.substring(0, start) + "..." + text.substring(text.length - end, text.length)
  )

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    })
  }, [])
  useEffect(() => {
    var result = basketItems.reduce(function (map, obj) {
      map[obj.token] = basketItems.filter((x) => x.token == obj.token);
      return map;
    }, {});
    setItems(result)

    if (!ethereum) {
      console.warn('invalid provider state');
      return;
    }
    setProvider(
      new ethers.providers.Web3Provider(
        ethereum,
      ),
    );

    ethereum.on('_initialized', () => {
      console.log(
        `useEffect::ethereum on "_initialized" ethereum.selectedAddress=${ethereum.selectedAddress} ethereum.chainId=${ethereum.chainId}`,
      );
    });

  }, []);
  const connect = async () => {
    try {
      const result = (await ethereum?.request({
        method: 'eth_requestAccounts',
      }));
      console.log('RESULT', result?.[0]);
      setConnected(true);
      setAccount(result?.[0]);
      getBalance().then((res) => (console.log(res)));
    } catch (e) {
      console.log('ERROR', e);
    }
  };

  const Item = ({ token, value }) => {
    return (
      <View key={uuid.v4()} className="pt-4">
        <FontedText classname="text-white text-base" type="sb" >Token: {getAddressText(token, 15, 10)}</FontedText>
        {value.map(element => (
          <View key={uuid.v4()} className="pl-8 pt-4 flex-1">
            <FontedText classname="text-white text-xs" type="l">To: {getAddressText(element.to, 15, 10)}</FontedText>
            <FontedText classname="text-white text-xs pt-2" type="l">Amount: {element.amount}</FontedText>
          </View>
        ))}
      </View>
    );
  };
  const getBalance = async () => {
    try {
      console.log("Before")
      console.log(ethereum.chainId)
      console.log(provider)
      const result = (await ethereum?.request({
        method: 'eth_getBalance',
        "params": [
          ethereum.selectedAddress,
          "latest"
        ],
      }));
      console.log(result)
      return bal;
    } catch (e) {
      console.log("error")
      console.log(e)
    }
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

          <View className="p-4 items-center" >
            <FontedText classname="text-white text-lg" type="sb"> Basket Items </FontedText>
          </View>
          <FlatList
            className="pr-4 pl-4"
            data={Object.keys(items)}
            renderItem={({ item }) => <Item token={item} value={items[item]} />}
            keyExtractor={item => item}
          />
          <TouchableOpacity onPress={connect}>
            <FontedText classname="text-white text-base bg-primaryColor rounded-2xl p-4 self-center mb-4" type="sb">Send</FontedText>
          </TouchableOpacity>
          <FontedText classname="text-white text-base bg-primaryColor rounded-2xl p-4 self-center mb-4" type="sb">{account}</FontedText>
          <FontedText classname="text-white text-base bg-primaryColor rounded-2xl p-4 self-center mb-4" type="sb">{balance}</FontedText>
        </LinearGradient>
      </View>
    </SafeAreaView>
  )
}

export default BasketScreen