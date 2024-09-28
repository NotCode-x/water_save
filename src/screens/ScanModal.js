import React, { useEffect, useState } from "react";

import { useNavigation } from "@react-navigation/native";

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Dimensions,
} from "react-native";
import {
  Ionicons,
  FontAwesome,
  FontAwesome5,
  AntDesign,
  Feather,
  MaterialIcons,
} from "@expo/vector-icons";
import { defaultConfig } from "./generic";
import { defaultStyles } from "../styles/styles";

import { addNewDeviceFnc } from "../functions/dbFunctions";

const widthD = Dimensions.get("window").width;
const heightD = Dimensions.get("window").height;

const ScanModal = ({ route, navigation }) => {

    const {devices} = route.params

    useEffect(() => {
        const load = async() => {
            console.log(devices)
        }

        load()
    }, [])
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <StatusBar style="auto" />
      <Text>params</Text>
    </View>
  );
};

export default ScanModal;
