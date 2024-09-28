import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  Button,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";

import {
  Ionicons,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  AntDesign,
  Feather,
  MaterialIcons,
  MaterialCommunityIcons,
  Fontisto,
} from "@expo/vector-icons";

import Slider from "@react-native-community/slider";
import DateTimePicker from "@react-native-community/datetimepicker";

import { defaultConfig } from "./generic";
import { defaultStyles } from "../styles/styles";

import { db } from "../../db/firebase";
import { doc } from "firebase/firestore";

import { updateDeviceControls } from "../functions/dbFunctions";
import { ledOn, ledOff, sendDataToWS, enviarHoraActual } from "../functions/genericFc";

const DeviceControls = ({ route, navigation }) => {
  //capturamos los datos que pasamos por ruta

  const { item } = route.params;

  //parametros de temperatura y humedad que se programan y se suben al dispositvo de forma remota
  const [temperature, setTemperature] = useState(item.temperatura);
  const [humedity, setHumedity] = useState(item.humedad);

  //parametros para seleccionar las horas y los minutos para regar
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  //variable para almacenar cada tiempo seleccionado (4 tiempos)
  const [arrTimes, setTimes] = useState({
    h1: item.h1,
    h2: item.h2,
    h3: item.h3,
    h4: item.h4,
    i1: item.i1,
    i2: item.i2,
    i3: item.i3,
    i4: item.i4,
  });

  const [indexTime, setIndexTime] = useState(0);

  //datos para actualizar o programar el equipo
  const saveData = {
    temperatura: temperature,
    humedad: humedity,
  };

  //funciones para procesar los tiempos seleccionados
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    controlIndexTime(currentDate, indexTime);
    setShowPicker(Platform.OS === "ios");
    //setDate(currentDate);
  };

  const showDatePicker = () => {
    setShowPicker(true);
  };

  function controlIndexTime(val, index) {
    let hora_seleccionada = new Date(val).getHours();
    let mins = new Date(val).getMinutes();
    let hora = `${hora_seleccionada}:${mins}` //+ ":" + mins
    console.log("Index time selected: ",index, hora_seleccionada,':', mins);
    switch (index) {
      case 0:
        setTimes({
          ...arrTimes,
          h1: hora,
        });
      case 1:
        setTimes({
          ...arrTimes,
          h2: hora,
        });
      case 2:
        setTimes({
          ...arrTimes,
          h3: hora,
        });
      case 3:
        setTimes({
          ...arrTimes,
          h4: hora,
        });
      default:
        setShowPicker(false);
    }
    console.log("Tiempos: ", arrTimes);
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        padding: 20,
      }}
    >
      <StatusBar style="auto" />

      <View
        style={{
          width: "100%",
          height: "25%",
          flexDirection: "column",
          justifyContent: "space-around",
          backgroundColor: "#fff",
          borderRadius: 10,
          marginBottom: 10,
        }}
      >
        <View
          style={{
            width: "100%",
            height: "35%",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 25, fontWeight: "bold" }}>
            {item.deviceName}
          </Text>
          <Text style={{ fontSize: 15, fontWeight: "300" }}>{item.area}</Text>
        </View>

        <View
          style={{
            width: "100%",
            height: "60%",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <FontAwesome6
            name="temperature-half"
            size={45}
            color={defaultConfig.colors.temperature}
          />
          <Ionicons
            name="water-outline"
            size={45}
            color={defaultConfig.colors.humedity}
          />
          <Fontisto
            name="day-cloudy"
            size={45}
            color={defaultConfig.colors.cloud}
          />
        </View>
      </View>

      <View
        style={{
          width: "100%",
          height: "20%",
          backgroundColor: "#fff",
          flexDirection: "cloumn",
          justifyContent: "space-around",
          alignItems: "center",
          borderRadius: 10,
          marginBottom: 10,
        }}
      >
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "20%",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: defaultConfig.colors.temperature,
              }}
            >
              {temperature}
            </Text>
            <MaterialCommunityIcons
              name="temperature-celsius"
              size={30}
              color={defaultConfig.colors.temperature}
            />
          </View>
          <Slider
            style={{ width: "75%", height: 40 }}
            minimumValue={0}
            maximumValue={100}
            step={1}
            minimumTrackTintColor={defaultConfig.colors.temperature}
            maximumTrackTintColor="#e1e1e1"
            value={temperature}
            onValueChange={(val) => setTemperature(val)}
          />
        </View>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "20%",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: defaultConfig.colors.humedity,
              }}
            >
              {humedity}
            </Text>
            <MaterialCommunityIcons
              name="percent-outline"
              size={30}
              color={defaultConfig.colors.humedity}
            />
          </View>
          <Slider
            style={{ width: "75%", height: 40 }}
            minimumValue={0}
            maximumValue={100}
            step={1}
            minimumTrackTintColor={defaultConfig.colors.humedity}
            maximumTrackTintColor="#e1e1e1"
            value={humedity}
            onValueChange={(val) => setHumedity(val)}
          />
        </View>
      </View>

      {showPicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={onChange}
        />
      )}

      <View
        style={{
          width: "100%",
          height: 270,
          backgroundColor: "#fff",
          borderRadius: 10,
          padding: 10,
          justifyContent: "space-around",
          marginBottom: 10,
        }}
      >
        <View
          style={{
            width: "100%",
            height: "20%",
            backgroundColor: "#fff",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            borderRadius: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              showDatePicker();
              setIndexTime(0);
            }}
          >
            <Text>{arrTimes.h1} H</Text>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextInput
              placeholder="0"
              keyboardType="number-pad"
              onChangeText={(val) => {
                setTimes({
                  ...arrTimes,
                  i1: parseInt(val),
                });
              }}
            />
            <Text>mins</Text>
          </View>
        </View>

        <View
          style={{
            width: "100%",
            height: "20%",
            backgroundColor: "#fff",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            borderRadius: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              showDatePicker();
              setIndexTime(1);
            }}
          >
            <Text>{arrTimes.h2} H</Text>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextInput
              placeholder="0"
              keyboardType="number-pad"
              onChangeText={(val) => {
                setTimes({
                  ...arrTimes,
                  i2: parseInt(val),
                });
              }}
            />
            <Text>mins</Text>
          </View>
        </View>

        <View
          style={{
            width: "100%",
            height: "20%",
            backgroundColor: "#fff",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            borderRadius: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              showDatePicker();
              setIndexTime(2);
            }}
          >
            <Text>{arrTimes.h3} H</Text>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextInput
              placeholder="0"
              keyboardType="number-pad"
              onChangeText={(val) => {
                setTimes({
                  ...arrTimes,
                  i3: parseInt(val),
                });
              }}
            />
            <Text>mins</Text>
          </View>
        </View>

        <View
          style={{
            width: "100%",
            height: "20%",
            backgroundColor: "#fff",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            borderRadius: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              showDatePicker();
              setIndexTime(3);
            }}
          >
            <Text>{arrTimes.h4} H</Text>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextInput
              placeholder="0"
              keyboardType="number-pad"
              onChangeText={(val) => {
                setTimes({
                  ...arrTimes,
                  i4: parseInt(val),
                });
              }}
            />
            <Text>mins</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={{
          width: "100%",
          height: "10%",
          backgroundColor: defaultConfig.colors.blue,
          alignItems: "center",
          justifyContent: "center",
          padding: 15,
          borderRadius: 10,
        }}
        onPress={async () => {
          //unimos los dos objetos para crear un solo objeto para actualizar los parametros del dispositovo en la nube
          
          /*await ledOn()

          setTimeout(function(){}, 1000);

          await ledOff()

          console.log(arrTimes)

          await sendDataToWS(arrTimes)*/

          enviarHoraActual("192.168.0.25")
          
          /*try {
            let obj = Object.assign(saveData, arrTimes);
            console.log(obj);

            await updateDeviceControls(item.id, 'devices', obj);
            navigation.goBack();
          } catch (e) {
            console.log(e)
            Alert.alert("Error!", "Ha ocurrido un error");
          }*/
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>
          Guardar
        </Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * 
 * <View
        style={{
          width: "100%",
          height: "10%",
          backgroundColor: "#fff",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          borderRadius: 10,
          marginBottom: 10,
        }}
      >
        <TouchableOpacity
          style={{
            width: "50%",
            height: "100%",
            backgroundColor: defaultConfig.colors.blue,
            justifyContent: "center",
            alignItems: "center",
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
          }}
        >
          <FontAwesome6 name="clock" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: "50%",
            height: "100%",
            backgroundColor: defaultConfig.colors.blue,
            justifyContent: "center",
            alignItems: "center",
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
          }}
        >
          <MaterialCommunityIcons
            name="calendar-clock"
            size={30}
            color="black"
          />
        </TouchableOpacity>
      </View>
 * 
 * 
 */

export default DeviceControls;
