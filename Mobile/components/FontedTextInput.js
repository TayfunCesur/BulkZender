import { TextInput } from 'react-native'
import React from 'react'

const FontedTextInput = (props) => {
    return (
        <TextInput
            style={{ fontFamily: props.type == "b" ? 'Montserrat-Bold' : props.type == "sb" ? 'Montserrat-SemiBold' : props.type == "r" ? 'Montserrat-Regular' : 'Montserrat-Medium' }}
            className={props.classname}
            defaultValue={props.defaultValue}
            keyboardType={props.keyboardType}
            onChangeText={props.onChangeText}
            multiline={props.multiline}
            numberOfLines={props.numberOfLines}
        />
    )
}

export default FontedTextInput