import { View, Image, SafeAreaView, StatusBar, TouchableOpacity, Text } from 'react-native'
import React, { useLayoutEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import FontedText from '../components/FontedText';
import FontedTextInput from '../components/FontedTextInput';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { onTokenChanged, homeState } from '../reducers/homeSlice'


const HomeScreen = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const state = useSelector((state) => {
        return homeState(state);
    });

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false
        })
    }, [])

    return (
        <SafeAreaView className="flex-1" >
            <StatusBar
                animated={true}
                backgroundColor="#27262C"
            />

            <LinearGradient
                colors={['#313d5c', '#3d2a54']}
                className="flex-1">
                <View className="items-center flex-row bg-toolbar pr-4">
                    <View className="flex-row flex-1 items-start mt-4 mb-4 ml-2  " >
                        <Image source={require("../assets/wave.png")} className="w-10 h-10 self-center " />
                        <View className="ml-2 mr-2">
                            <FontedText classname="text-white text-base">Welcome to BulkTransfer!</FontedText>
                            <FontedText classname="text-white opacity-60 text-s">You can send your token to any amount of user in one TX!</FontedText>
                        </View>
                    </View>

                </View>
                <View className="flex-1 mt-[40%] ">
                    <View className="bg-cardBg rounded-2xl self-center w-3/4 pb-4" >
                        <View className="pr-5 pl-5 pt-5 pb-1">
                            <FontedText classname="text-white text-base" type="b">Token</FontedText>
                            <FontedText classname="text-xs pt-1 pb-2 text-white opacity-75 " type="l">Please enter the token you want to send!</FontedText>
                            <FontedTextInput multiline={true} numberOfLines={1} keyboardType='default' defaultValue={state.token} onChangeText={newText => { dispatch(onTokenChanged({ tokenAddress: newText })); }}
                                classname="text-white bg-inputBg p-2 mt-2 rounded text-right" />
                            <FontedText classname="text-xs text-red-500 text-right" type="l">{state.tokenError}</FontedText>
                        </View>

                    </View>
                </View>
                <TouchableOpacity onPress={() => {
                    if (state.token == "" && state.tokenError == null) {
                        dispatch(onTokenChanged({ tokenError: "Can't be empty" }));
                    } else if (state.tokenError == null) {
                        dispatch(onTokenChanged({ tokenAddress: state.token }));
                        navigation.navigate("Receipent", { tokenAddress: state.token })
                    }
                }} className="mb-8 mr-4 self-end">
                    <FontedText classname="text-white text-base bg-primaryColor rounded-2xl pt-4 pb-4 pl-8 pr-8" type="sb">Next</FontedText>
                </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>

    )
}

export default HomeScreen