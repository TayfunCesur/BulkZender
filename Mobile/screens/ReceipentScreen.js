import { View, SafeAreaView, StatusBar, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Text } from 'react-native'
import React, { useLayoutEffect, useRef } from 'react'
import { useNavigation } from '@react-navigation/native'
import FontedText from '../components/FontedText';
import FontedTextInput from '../components/FontedTextInput';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { addToBasket, onToChanged, onAmountChanged, homeState } from '../reducers/homeSlice'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    interpolate,
    withTiming,
    Easing,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const COORDS = { x: 0, y: 0 };

const ReceipentScreen = ({ route, navigation }) => {

    const buttonRef = useRef(null);
    const basketIconRef = useRef(null);

    const basketIcon = useSharedValue({ ...COORDS });
    const ballCoords = useSharedValue({ ...COORDS });

    const ballOpacity = useSharedValue(0);
    const ballAnimation = useSharedValue(0);

    const ballStyle = useAnimatedStyle(() => {
        const basket = basketIcon.value;
        const ball = ballCoords.value;

        const translateX = Math.round(
            Math.pow(1 - ballAnimation.value, 2) * ball.x +
            2 * (1 - ballAnimation.value) * ballAnimation.value * ball.x +
            Math.pow(ballAnimation.value, 2) * basket.x + 20
        );
        const translateY = Math.round(
            Math.pow(1 - ballAnimation.value, 2) * ball.y +
            2 * (1 - ballAnimation.value) * ballAnimation.value * basket.y - 10 +
            Math.pow(ballAnimation.value, 2) * basket.y - 5
        );

        return {
            opacity: ballOpacity.value,
            transform: [
                { translateX },
                { translateY },
                { scale: interpolate(ballAnimation.value, [0, 1], [1, 0]) },
            ],
        };
    });

    function setBallPosition(y) {
        ballCoords.value = { x: width / 2 - 25, y };
    }
    const dispatch = useDispatch();
    const state = useSelector((state) => {
        return homeState(state);
    });

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false
        })
    }, [])

    const addItemsToBasket = () => {
        dispatch(addToBasket({ to: state.to, token: route.params.tokenAddress, amount: state.amount }))
    }

    return (
        <SafeAreaView className="flex-1" >
            <StatusBar
                animated={true}
                backgroundColor="#27262C"
            />
            <View className="flex-1">
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <LinearGradient
                        colors={['#313d5c', '#3d2a54']}
                        className="flex-1">
                        {/*Header*/}
                        <View className="items-center  flex-row bg-cardBg pl-4 pr-4 pt-4 pb-4">
                            <MaterialIcon name="input" size={40} color="#1FC7D4" />
                            <FontedText classname="text-white text-base flex-1 ml-2" >Please add your receipents</FontedText>
                            <TouchableOpacity
                                className="pr-2"
                                onPress={() => {
                                    navigation.navigate("Basket", { basketItems: state.basketItems })
                                }}
                                ref={basketIconRef}
                                onLayout={() => {
                                    if (
                                        basketIconRef.current &&
                                        !basketIcon.value.x &&
                                        !basketIcon.value.y
                                    )
                                        basketIconRef.current.measure(
                                            (_x, _y, _width, _height, px, py) => {
                                                basketIcon.value = { x: px, y: py };
                                            }
                                        );
                                }}
                            >
                                {state.basketItems.length > 0 && <Icon name="shopping-basket" size={20} color="#1FC7D4" />}
                            </TouchableOpacity>
                        </View>
                        {/*Input Form*/}
                        <View className="flex-1 ">
                            <View className="bg-cardBg rounded-2xl self-center w-3/4 mt-20 pb-4" >
                                <View className="pr-5 pl-5 pt-5 pb-1">
                                    <FontedText classname="text-white text-base" type="b">Transfer</FontedText>
                                    <FontedText classname="text-white text-xs mt-1 opacity-60" type='sb'>Add your transfer to the basket</FontedText>
                                </View>
                                <View
                                    style={{
                                        marginTop: 8,
                                        borderBottomColor: 'white',
                                        opacity: 0.25,
                                        borderBottomWidth: StyleSheet.hairlineWidth,
                                    }}
                                />

                                <View className="pr-5 pl-5 pt-5 pb-1">
                                    <FontedText classname="text-white text-base" type="b">To</FontedText>
                                    <FontedTextInput defaultValue={state.to} onChangeText={newText => { dispatch(onToChanged({ toAddress: newText })); }} multiline={true} numberOfLines={1} keyboardType='default'
                                        classname="text-white bg-inputBg p-2 mt-2 rounded text-right" />
                                    <FontedText classname="text-xs text-red-500 text-right" type="l">{state.toError}</FontedText>
                                </View>


                                <View className="pr-5 pl-5 pb-1">
                                    <FontedText classname="text-white text-base" type="b">Amount</FontedText>
                                    <FontedTextInput defaultValue={state.amount} onChangeText={newText => { dispatch(onAmountChanged({ amount: newText })); }} multiline={true} numberOfLines={1} keyboardType='numeric'
                                        classname="text-white bg-inputBg p-2 mt-2 rounded text-right" />
                                    <FontedText classname="text-xs text-red-500 text-right" type="l">{state.amountError}</FontedText>
                                </View>

                                <TouchableOpacity
                                    ref={buttonRef}
                                    onPress={() => {
                                        addItemsToBasket()
                                        const isNull = state.toError == null && state.amountError == null
                                        const isEmpty = state.toAddress == "" || state.amount == ""
                                        if (!isEmpty && isNull) {
                                            buttonRef.current.measure(
                                                (_x, _y, _width, _height, _px, py) => {
                                                    setBallPosition(py);
                                                    ballOpacity.value = 1;
                                                    ballAnimation.value = withTiming(1, {
                                                        duration: 500,
                                                        easing: Easing.bezier(0.12, 0, 0.39, 0),
                                                    }, () => {
                                                        ballAnimation.value = 0
                                                        ballOpacity.value = 0;
                                                    });
                                                }
                                            );
                                        }
                                    }}
                                >
                                    <FontedText classname="text-white text-base bg-primaryColor rounded-2xl p-4 self-center" type="sb">Add to basket</FontedText>
                                </TouchableOpacity>

                            </View>

                        </View>
                    </LinearGradient>
                </ScrollView>


                <Animated.View style={[styles.basketIconItemBall, ballStyle]} />
            </View>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    basketIconItemBall: {
        position: "absolute",
        height: 40,
        width: 40,
        borderRadius: 20,
        backgroundColor: "white",
    },
});
export default ReceipentScreen