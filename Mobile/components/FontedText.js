import { Text } from 'react-native'
import React from 'react'

const FontedText = (props) => {
    return (
        <Text  style={{ fontFamily: props.type == "b" ? 'Montserrat-Bold' : props.type == "sb" ? 'Montserrat-SemiBold' : props.type == "r" ? 'Montserrat-Regular' : 'Montserrat-Medium' }} className={props.classname}>
            {props.children}
        </Text>
    )
}

export default FontedText