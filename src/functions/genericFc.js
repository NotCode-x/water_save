import { Alert } from "react-native";
import * as Network from "expo-network";
import axios from "axios";

//funcion para comunicarnos con todos los water save que hay en la red
export const checkWaterDeviceIp = async () => {
  let ip = await Network.getIpAddressAsync();
  let foundDevices = [];
  const promises = [];

  /**
     * -split nos permite separar los octetos sacando creando un array con cada octeto como elemento del mismo array
       -con slice le indicamos que seleccione todos los elementos del array creado con split excepto el último, en este caso el host
       -con join volvemos a formar un octeto de 3 elementos ya que vamos a recorrer un bucle for para detectar los equipos en red usando http
    **/
  let ipRequest = ip.split(".").slice(0, -1).join(".");

  console.log(ip, " | ", ipRequest);

  //vamos a recorrer todo una red haciendo peticiones http a cada host
  for (let i = 1; i < 254; i++) {

    let url = `http://${ipRequest}.${i}/ip`;
    foundDevices.push(reqEsp32(url))
  }
  //console.log('Local Devices: ',foundDevices)
  return foundDevices;
};

async function reqEsp32(url) {
  try {
    let req = await axios.post(url, {
      headers: {
        //esta consulta o peticion sólo acepta datos con cabecera json
        Accept: "application/json",
      },
      timeout: 10000 /*con timeout especificamos el tiempo máximo que debe durar una peticion */,
    });

    // Verificar si el contenido es JSON
    if (req.headers["content-type"].includes("application/json") && req.status === 200) {
      console.log("JSON Response:", req.status);
      return req.data;
    } else {
      //console.error('Response is not JSON');
      return 0;
    }
  } catch (e) {
    //
  }
}

//funcion para encender el led para testear el esp32
export const ledOn = async (ip) => {
  let req = await axios.get(`http://${ip}/led/on`);

  console.log("solicitud led on enviada");
};

//funcion para apagar el led para testear el esp32
export const ledOff = async (ip) => {
  let req = await axios.get(`http://${ip}/led/off`);

  console.log("solicitud led off enviada");
};

export const sendDataToWS = async (data, ip) => {
  //await enviarHoraActual();
  console.log(ip)
  let convert_milis = 60*1000
  try {
    const response = await axios.post(
      `http://${ip}/set_times`,
      {
        h1: data.h1,
        h2: data.h2,
        h3: data.h3,
        h4: data.h4,
        i1: data.i1,
        i2: data.i2,
        i3: data.i3,
        i4: data.i4,
        t: data.temperatura,
        h: data.humedad
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.status === 200) {
      Alert.alert("Success", "Datos enviados con éxito");
    } else {
      Alert.alert("Error", "Error al enviar los datos");
    }
  } catch (error) {
    console.log(error);
    Alert.alert("Error", "Error de conexión con water save");
  }

  /*try {
    const response = await axios.post('http://192.168.0.28/receive_parameter', {
      parameter: 'valor por post',
    },{
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error sending parameter:', error);
  }*/

  //console.log("sending...", data);
};

export const sendDeviceInfo = async (nombre, area, ip) => {
  //await enviarHoraActual();
  console.log('Enviando info del equipo', nombre, area, ip)
  try {
    const response = await axios.post(
      `http://${ip}/deviceInfo`,
      {
        nombre: nombre,
        area: area
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.status === 200) {
      Alert.alert("Success", "Datos introducidos con éxito");
    } else {
      Alert.alert("Error", "Error al enviar los datos");
    }
  } catch (error) {
    console.log(error);
    Alert.alert("Error", "Error de conexión con water save");
  }
};

export const enviarHoraActual = async (ip) => {

  let fecha = new Date();

  let hora = fecha.getHours().toString().padStart(2, "0");
  let minutos = fecha.getMinutes().toString().padStart(2, "0");
  
  console.log('Tiempo enviado: ',hora, minutos)
  try {
    const response = await axios.post(
      `http://${ip}/current_time`,
      {
        hora: hora,
        minutos: minutos,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.status === 200) {
      Alert.alert("Success", "Hora recibida");
    } else {
      Alert.alert("Error", "Error al configurar el tiempo");
    }
  } catch (error) {
    console.log(error);
    Alert.alert("Error", "Error de conexión con water save");
  }

  console.log("Hora actual: ", hora, " : ", minutos);
};

export const pingLocalDevice = async(ip) => {
  try{
    let req = await axios.get(`http://${ip}/`);

    if(req.status === 200){
      //console.log(req.data)
      return {mac: req.data, r: 1}
    }else{
      return {mac: '00:00:00:00:00:00:', r: 0}
    }
  }catch(e){
    //
  }
}

export const pingTestDevice = async(ip) => {

  console.log("IpTest: ",ip)
  try{
    let req = await axios.post(`http://${ip}/local`);
    if(req.status === 200){
      console.log(req.data)
      return req.data
    }else{
      return {mac: '00:00:00:00:00:00:', r: 0}
    }
  }catch(e){
    return 0
  }
}

//verificar si el equipo local ya se agregó a la lista, esto para que no se dupliquen
export const checkLocalDeviceExist = (arr, mac) => {

  console.log('Mac: ', mac)
  let res = 0
  for(let i=0; i<arr.length; i++){

    if(arr[i].mac == mac){
      res = 1
      Alert.alert('Error!', 'este host ya está registrado.')
      break
    }else{
      continue
    }
  }

  return res
}
