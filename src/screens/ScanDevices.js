import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  Dimensions,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import {
  Ionicons,
  FontAwesome,
  FontAwesome5,
  AntDesign,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { defaultConfig, serverConfig } from "./generic";
import { pingLocalDevice } from "../functions/genericFc";
import { defaultStyles } from "../styles/styles";

//funciones que se ejecutan para procesar los datos de la db
import { reqServer, getAllDevices } from "../functions/dbFunctions";
import { checkWaterDeviceIp, checkLocalDeviceExist } from "../functions/genericFc";

import AsyncStorage from "@react-native-async-storage/async-storage";

import axios, { all } from "axios";

const widthD = Dimensions.get("window").width;
const heightD = Dimensions.get("window").height;

const STORAGE_KEY_LOCAL_DEVICES = '@local_devices';

const ScanDevices = ({ route, navigation }) => {
  const [localDevices, setLocalDevices] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [device, setDevice] = useState( {
    user: '',
    email: '',
    deviceName: '',
    SN: 'not set',
    mac: '00:00:00:00:00:00',
    area: '',
    ip: '0.0.0.0',
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
    netState: 'offline',
    cloud: false
  })

  const selectDevice = (name, value) => setDevice({ ...device, [name]: value });

  //funcion para almacenar los datos localmente en el almacenamiento de la app
  const saveLocalData = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_LOCAL_DEVICES, JSON.stringify([data]));
    } catch (e) {
      console.error('Failed to save data', e);
    }
  };

  //funcion para mostrar, cargar u obtener los datos almacenados en local, 
  //en este caso la lista de equipos registrados
  const loadData = async () => {

    console.log('Cargando equipos locales')
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY_LOCAL_DEVICES);
      if (savedData !== null) {
        setLocalDevices(JSON.parse(savedData));
        console.log(savedData)
      }
    } catch (e) {
      console.error('Failed to load data', e);
    }
  };

  useEffect(() => {
    const init = async() => {
      loadData();
    }

    init()
  }, []);

  return (
    <View style={defaultStyles.container}>
      <StatusBar style="auto" />

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{fontSize: 25, fontWeight: 'bold'}}>Add new local device</Text>
          <View
            style={{
              width: "80%",
              height: heightD / 1.5,
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
              onChangeText={(val) => {
                selectDevice("deviceName", val);
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
              Ip del dispositivo
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
              placeholder="Dirección ip"
              onChangeText={(val) => {
                selectDevice("ip", val);
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
              onChangeText={(val) => {
                selectDevice("area", val);
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
              onPress={async() => {

                let resIp = await pingLocalDevice(device.ip)

                if(resIp.r === 1){
                  selectDevice("mac", resIp.mac);
                  Alert.alert('Success',`${device.ip} | conectado.`)
                  let chechDuplicate = await checkLocalDeviceExist(localDevices, device.mac)

                  if( chechDuplicate === 0){
                    if(device.deviceName != '' && device.area != ''){
                      saveLocalData(device)
                      selectDevice("netState", 'online');
                      Alert.alert('Success',`${device.ip} | registrado localmente.`)
                      setModalVisible(false)
                    }
                  }else{
                    Alert.alert('Error',`${device.mac} | ya está registrado.`)
                  }
                  
                }else{
                  selectDevice("netState", 'offline');
                  Alert.alert('Error',`${device.ip} | no conectado.`)
                }
                //console.log(device);
              }}
            >
              <Text style={{ fontSize: 15, color: "#fff", fontWeight: "bold" }}>
                Añadir
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View
        style={{
          width: "100%",
          padding: 15,
          marginBottom: 15,
          flexDirection: "row",
          justifyContent: "space-between",
          backgroundColor: defaultConfig.colors.blue,
        }}
      >
        <Text style={defaultStyles.textSelect}>
          Local devices{" "}
          <Text style={defaultStyles.textBg}>
            ({localDevices != "" || localDevices != null ? localDevices.length : 0})
          </Text>
        </Text>
        <View
          style={{
            width: "20%",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons
              name="add"
              size={defaultConfig.sizeIconSmall}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={localDevices}
        keyExtractor={(item, index) => index.toString()}
        style={{ width: widthD }}
        contentContainerStyle={{
          width: widthD,
          justifyContent: "center",
          alignItems: "center",
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={defaultStyles.devicesOn}
            onPress={() => {
              navigation.navigate("LocalDeviceControls", { item });
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <MaterialCommunityIcons
                name="watering-can"
                size={defaultConfig.sizeIconOption}
                color={defaultConfig.colors.green}
              />
              <Text style={defaultStyles.textSelect}>{item.area} </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ScanDevices;
