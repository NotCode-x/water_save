import React, { useEffect, useState } from "react";

import { useNavigation } from "@react-navigation/native";

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Dimensions
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


const widthD = Dimensions.get('window').width
const heightD = Dimensions.get('window').height


const AddDevice = ({route, navigation}) => {

  const [device, setDevice] = useState( {
    user: '',
    email: '',
    deviceName: '',
    SN: '',
    mac: '',
    area: '',
    temperatura: 0,
    humedad: 0,
    temperaturaActual: 0,
    humedadActual: 0,
    h1: 0,
    h2: 0,
    h3: 0,
    h4: 0,
    i1: 0,
    i2: 0,
    i3: 0,
    i4: 0,
    netState: 'online',
    cloud: true
  })

  const selectDevice = (name, value) => setDevice({ ...device, [name]: value });

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <StatusBar style="auto" />
      <View
        style={{
          width: "80%",
          height: heightD/1.5,
          alignItems: "center",
          justifyContent: "space-around",
          backgroundColor: "#fff",
          paddingTop: 20,
          paddingBottom: 20,
          borderRadius: 10,
        }}
      >
        <Text
          style={{
            width: "100%",
            paddingLeft: 10,
            textAlign: "left",
            fontSize: 17,
            fontWeight: "300",
          }}
        >
          Nombre
        </Text>
        <TextInput
          style={{
            width: "90%",
            borderWidth: 1,
            height: 50,
            borderRadius: 10,
            paddingLeft: 5,
            borderColor: defaultConfig.colors.gray,
          }}
          placeholder="Nombre del equipo"

          onChangeText={ (val) => {
            selectDevice('deviceName',val)
          }}
        />

        <Text
          style={{
            width: "100%",
            paddingLeft: 10,
            textAlign: "left",
            fontSize: 17,
            fontWeight: "300",
          }}
        >
          ID o SN
        </Text>
        <TextInput
          style={{
            width: "90%",
            borderWidth: 1,
            height: 50,
            borderRadius: 10,
            paddingLeft: 5,
            borderColor: defaultConfig.colors.gray,
          }}
          placeholder="ID o número de serie"
          onChangeText={ (val) => {
            selectDevice('SN',val)
          }}
        />
        <Text
          style={{
            width: "100%",
            paddingLeft: 10,
            textAlign: "left",
            fontSize: 17,
            fontWeight: "300",
          }}
        >
          MAC del dispositivo
        </Text>
        <TextInput
          style={{
            width: "90%",
            borderWidth: 1,
            height: 50,
            borderRadius: 10,
            paddingLeft: 5,
            borderColor: defaultConfig.colors.gray,
          }}
          placeholder="Dirección mac"
          onChangeText={ (val) => {
            selectDevice('mac',val)
          }}
        />

        <Text
          style={{
            width: "100%",
            paddingLeft: 10,
            textAlign: "left",
            fontSize: 17,
            fontWeight: "300",
          }}
        >
          Área o zona de instalación
        </Text>

        <TextInput
          style={{
            width: "90%",
            borderWidth: 1,
            height: 50,
            borderRadius: 10,
            paddingLeft: 5,
            borderColor: defaultConfig.colors.gray,
          }}
          placeholder="Zona del equipo"
          onChangeText={ (val) => {
            selectDevice('area',val)
          }}
        />
        <TouchableOpacity
          style={{
            width: "40%",
            padding: 15,
            backgroundColor: defaultConfig.colors.blue,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
          }}

          onPress={ () => {

            addNewDeviceFnc(device)
            console.log(device)

            navigation.goBack()
          }}
        >
          <Text style={{ fontSize: 15, color: "#fff", fontWeight: "bold" }}>
            Añadir
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddDevice;
