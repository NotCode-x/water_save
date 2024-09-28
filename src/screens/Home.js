import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  Dimensions,
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
import { defaultStyles } from "../styles/styles";

//funciones que se ejecutan para procesar los datos de la db
import { reqServer, getAllDevices, getLocalDevices } from "../functions/dbFunctions";
import { checkWaterDeviceIp } from "../functions/genericFc";

import axios, { all } from "axios";

const widthD = Dimensions.get("window").width;
const heightD = Dimensions.get("window").height;

const Home = ({ route, navigation }) => {
  const [devices, setAllDevices] = useState("");
  const [devicesFounded, setFounded] = useState(0);

  //funcion para escanear equipos en red local
  /*const scanDevices = async () => {

    let found = await checkWaterDeviceIp();

    return found;
  };*/

  useEffect(() => {
    //funcion para ejecutar las funciones principales para esta pantalla

    const loadFunctions = async () => {
      let allDevices = await getLocalDevices();

      console.log(allDevices);
      setAllDevices(allDevices);
    };

    reqServer();
    loadFunctions();
  }, []);

  return (
    <View style={defaultStyles.container}>
      <StatusBar style="auto" />
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
          Online devices{" "}
          <Text style={defaultStyles.textBg}>
            ({devices != "" || devices != null ? devices.length : 0})
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
          <TouchableOpacity onPress={ async() => {
            let found = await checkWaterDeviceIp();

            console.log(found)
            setFounded(found)
          }}>
            <MaterialCommunityIcons
              name="reload"
              size={defaultConfig.sizeIconSmall}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons
              name="add"
              size={defaultConfig.sizeIconSmall}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
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
              navigation.navigate("DeviceControls", { item });
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
            <Text style={defaultStyles.textLocation}>
              Guinea Ecuatorial, Ebibeyin
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default Home;
