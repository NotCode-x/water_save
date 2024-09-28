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
  Modal,
  Dimensions,
  ScrollView,
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

import { defaultConfig, serverConfig } from "./generic";
import { defaultStyles } from "../styles/styles";

import { db } from "../../db/firebase";
import { doc } from "firebase/firestore";

import { updateDeviceControls } from "../functions/dbFunctions";
import {
  ledOn,
  ledOff,
  sendDataToWS,
  pingTestDevice,
  sendDeviceInfo,
  enviarHoraActual,
} from "../functions/genericFc";

const widthD = Dimensions.get("window").width;
const heightD = Dimensions.get("window").height;

const TestScreen = ({ route, navigation }) => {
  //capturamos los datos que pasamos por ruta

  const [item, setDeviceToLocal] = useState({
    h1: "not set",
    h2: "not set",
    h3: "not set",
    h4: "not set",
    i1: 0,
    i2: 0,
    i3: 0,
    i4: 0,
    Area: "not set",
    deviceName: "not set",
  });

  //parametros de temperatura y humedad que se programan y se suben al dispositvo de forma remota
  const [temperature, setTemperature] = useState(0);
  const [humedity, setHumedity] = useState(0);

  //parametros para seleccionar las horas y los minutos para regar
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  //variable para almacenar cada tiempo seleccionado (4 tiempos)
  const [arrTimes, setTimes] = useState({
    h1: item.h1,
    h2: item.h2,
    h3: item.h3,
    h4: item.h4,
    i1: 1,
    i2: 1,
    i3: 1,
    i4: 1,
    Area: item.Area,
    deviceName: item.deviceName,
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
    //Obtenemos las hora , los minutos y formateamos cada parte para que tenga al menos 2 dígitos
    let hora_seleccionada = new Date(val)
      .getHours()
      .toString()
      .padStart(2, "0");
    let mins = new Date(val).getMinutes().toString().padStart(2, "0");
    console.log("mins: ", mins);
    let hora = hora_seleccionada + ":" + mins;
    console.log("Index time selected: ", index, hora_seleccionada, ":", mins);
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

  const init = async () => {
    let res = await pingTestDevice(serverConfig.ipTest);
    setDeviceToLocal(res);
    setTimes(res);

    console.log("ufc: ", res);

    //setInterval( function(){console.log("te vuelvo a llamar en...")}, 3000)
  };

  useEffect(() => {
    /*
    // Llama a la función fetchData cada 5 segundos (10000 ms)
    const intervalId = setInterval(function () {
      init();
    }, 10000);
    // Limpia el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);*/

    init();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <StatusBar style="auto" backgroundColor={defaultConfig.colors.blue} />

      <>
        {item == 0 ? (
          <View
            style={{
              width: widthD,
              backgroundColor: "#fff",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={async () => {
                await init();
              }}
              style={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>Error al obtener datos!</Text>
              <AntDesign name="reload1" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Modal
              animationType="slide"
              transparent={false}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                  Editar nombre y área
                </Text>
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
                    Nombre del equipo
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
                    defaultValue={arrTimes.deviceName}
                    onChangeText={(val) => {
                      setTimes({
                        ...arrTimes,
                        deviceName: val,
                      });
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
                    defaultValue={arrTimes.Area}
                    onChangeText={(val) => {
                      setTimes({
                        ...arrTimes,
                        Area: val,
                      });
                    }}
                  />
                  <TouchableOpacity
                    style={{
                      width: "40%",
                      padding: 15,
                      backgroundColor: defaultConfig.colors.gray,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 10,
                    }}
                    onPress={() => {
                      sendDeviceInfo(
                        arrTimes.deviceName,
                        arrTimes.Area,
                        serverConfig.ipTest
                      );
                      setModalVisible(!modalVisible);
                      console.log(arrTimes);
                    }}
                  >
                    <MaterialIcons name="edit" size={30} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

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

            <ScrollView
              contentContainerStyle={{
                width: widthD,
                height: heightD,
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: "6%",
                  padding: 9,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  backgroundColor: defaultConfig.colors.blue,
                }}
              >
                <Text
                  style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}
                >
                  Water Save
                </Text>
                <View
                  style={{
                    width: "30%",
                    height: "100%",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: defaultConfig.colors.blue,
                  }}
                >
                  <TouchableOpacity
                    onPress={async () => {
                      await enviarHoraActual(serverConfig.ipTest);
                    }}
                  >
                    <AntDesign name="clockcircle" size={24} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      await init();
                    }}
                  >
                    <AntDesign name="reload1" size={24} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      //unimos los dos objetos para crear un solo objeto para actualizar los parametros del dispositovo en la nube

                      //await ledOn(item.ip)

                      //await ledOff(item.ip)

                      let obj = Object.assign(saveData, arrTimes);
                      console.log(item.Ip);

                      sendDataToWS(obj, item.Ip);
                    }}
                  >
                    <AntDesign name="save" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{
                    width: "100%",
                    height: '100%',
                    padding: 15
                  }}>
                <View
                  style={{
                    width: "100%",
                    height: "20%",
                    flexDirection: "column",
                    justifyContent: "space-around",
                    backgroundColor: "#fff",
                    borderRadius: 10,
                    marginBottom: 10,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      width: "100%",
                      height: "auto",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => setModalVisible(!modalVisible)}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "600",
                          marginRight: 5,
                        }}
                      >
                        {item.deviceName}
                        <Text style={{ fontSize: 10, color: "#c2c2c2" }}>
                          ( {arrTimes.deviceName} )
                        </Text>
                      </Text>
                      <MaterialIcons name="edit" size={16} color="#c2c2c2" />
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: "300" }}>
                      {item.Area}{" "}
                      <Text style={{ fontSize: 10, color: "#c2c2c2" }}>
                        ( {arrTimes.Area} )
                      </Text>
                    </Text>
                  </TouchableOpacity>

                  <View
                    style={{
                      width: "100%",
                      height: "auto",
                      flexDirection: "row",
                      justifyContent: "space-around",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: "25%",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "flex-end",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
                          color: defaultConfig.colors.temperature,
                        }}
                      >
                        {item == "" ? "x" : item.temperaturaAmbiente}
                      </Text>

                      <FontAwesome6
                        name="temperature-half"
                        size={30}
                        color={defaultConfig.colors.temperature}
                      />
                      <MaterialCommunityIcons
                        name="temperature-celsius"
                        size={20}
                        color={defaultConfig.colors.temperature}
                      />
                    </View>
                    <View
                      style={{
                        width: "25%",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "flex-end",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
                          color: defaultConfig.colors.humedity,
                        }}
                      >
                        {item == "" ? "x" : item.humedadAmbiente}
                      </Text>
                      <Ionicons
                        name="water-outline"
                        size={30}
                        color={defaultConfig.colors.humedity}
                      />
                      <MaterialCommunityIcons
                        name="percent-outline"
                        size={20}
                        color={defaultConfig.colors.humedity}
                      />
                    </View>
                    <View
                      style={{
                        width: "25%",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "flex-end",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
                          color: "#000",
                        }}
                      >
                        {item == "" ? "x" : item.humedadSuelo} %
                      </Text>
                      {item == "" ? (
                        <MaterialCommunityIcons
                          name="watering-can-outline"
                          size={30}
                          color="#000"
                        />
                      ) : item.humedadSuelo < parseInt(item.humedadControl) ? (
                        <MaterialCommunityIcons
                          name="watering-can-outline"
                          size={30}
                          color="#000"
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name="watering-can"
                          size={30}
                          color="#d9ab11"
                        />
                      )}
                    </View>
                    <View>
                      {item == "" ? (
                        <Ionicons
                          name="rainy-outline"
                          size={30}
                          color={defaultConfig.colors.cloud}
                        />
                      ) : item.lluvia == false ? (
                        <Ionicons
                          name="rainy-outline"
                          size={30}
                          color={defaultConfig.colors.cloud}
                        />
                      ) : (
                        <Ionicons
                          name="rainy"
                          size={30}
                          color={defaultConfig.colors.cloud}
                        />
                      )}
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    width: "100%",
                    height: "25%",
                    backgroundColor: "#fff",
                    flexDirection: "cloumn",
                    justifyContent: "space-around",
                    alignItems: "center",
                    borderRadius: 10,
                    marginBottom: 10,
                    padding: 10,
                  }}
                >
                  <View
                    style={{
                      width: "100%",
                      flexDirection: "column",
                      justifyContent: "space-around",
                      alignItems: "flex-end",
                    }}
                  >
                    <Text
                      style={{
                        backgroundColor: defaultConfig.colors.temperature,
                        width: "20%",
                        textAlign: "center",
                        borderRadius: 10,
                        color: "#fff",
                      }}
                    >
                      {item.temperaturaControl}
                    </Text>
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
                  </View>
                  <View
                    style={{
                      width: "100%",
                      flexDirection: "column",
                      justifyContent: "space-around",
                      alignItems: "flex-end",
                    }}
                  >
                    <Text
                      style={{
                        backgroundColor: defaultConfig.colors.humedity,
                        width: "20%",
                        textAlign: "center",
                        borderRadius: 10,
                        color: "#fff",
                      }}
                    >
                      {item.humedadControl}
                    </Text>
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
                </View>

                <View
                  style={{
                    width: "100%",
                    height: heightD / 3.5,
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
                      <Text>
                        {arrTimes.h1}{" "}
                        <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                          H
                        </Text>
                      </Text>
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
                        defaultValue={arrTimes.i1}
                        onChangeText={(val) => {
                          setTimes({
                            ...arrTimes,
                            i1: parseInt(val),
                          });
                        }}
                      />
                      <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                        {" "}
                        mins
                      </Text>
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
                      <Text>
                        {arrTimes.h2}{" "}
                        <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                          H
                        </Text>
                      </Text>
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
                        defaultValue={arrTimes.i2}
                        onChangeText={(val) => {
                          setTimes({
                            ...arrTimes,
                            i2: parseInt(val),
                          });
                        }}
                      />
                      <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                        {" "}
                        mins
                      </Text>
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
                      <Text>
                        {arrTimes.h3}{" "}
                        <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                          H
                        </Text>
                      </Text>
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
                        defaultValue={arrTimes.i3}
                        onChangeText={(val) => {
                          setTimes({
                            ...arrTimes,
                            i3: parseInt(val),
                          });
                        }}
                      />
                      <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                        {" "}
                        mins
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={{
                    width: "100%",
                    height: "auto",
                    backgroundColor: defaultConfig.colors.blue,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 12,
                    borderRadius: 10,
                  }}
                  onPress={async () => {
                    //unimos los dos objetos para crear un solo objeto para actualizar los parametros del dispositovo en la nube

                    //await ledOn(item.ip)

                    //await ledOff(item.ip)

                    let obj = Object.assign(saveData, arrTimes);
                    console.log(obj);

                    sendDataToWS(obj, item.Ip);

                    init();

                    /*try {
            
            console.log(obj);
            await updateDeviceControls(item.id, 'devices', obj);
            navigation.goBack();
          } catch (e) {
            console.log(e)
            Alert.alert("Error!", "Ha ocurrido un error");
          }*/
                  }}
                >
                  <Text
                    style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}
                  >
                    Guardar
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </>
        )}
      </>
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
            <Text style={{fontWeight: 'bold', fontSize: 12}}> mins</Text>
          </View>
        </View>
 * 
 * 
 */

export default TestScreen;
