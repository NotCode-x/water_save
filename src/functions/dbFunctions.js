import { db } from "../../db/firebase";
import {
  doc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc
} from "firebase/firestore";

import axios from "axios";

import { serverConfig } from "../screens/generic";

let emailTest = "watersavetest@test.com";

export const reqServer = async () => {
  let url = serverConfig.url + "/app";
  let res = await axios.get(url);

  console.log("Res: ", res);
};

export const addNewDeviceFnc = async (data) => {
  try {
    const docRef = await addDoc(collection(db, "devices"), data);
    console.log("Equipo registrado con ID:", docRef.id);
  } catch (error) {
    console.error("Error al registrar equipo:", error);
  }
};

export const getAllDevices = async () => {
  console.log("Get All devices...");
  let documents = [];
  const q = query(collection(db, "devices"), where("email", "==", emailTest));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    let id = doc.id;
    let data = doc.data();
    data.id = id;
    documents.push(data);
  });

  //console.log(documents);

  return documents;
};

export const updateDeviceControls = async (idDoc, table, data) => {
  // Referencia al documento que quieres actualizar
  const documentRef = doc(db, table, idDoc); // Reemplaza 'nombre_coleccion' con el nombre real de tu colección

  // Actualiza el documento en Firestore
  try {
    await updateDoc(documentRef, data);
    console.log("Parametros del equipo actualizado online.");
  } catch (error) {
    console.error("Error al actualizar el documento:", error);
  }
};

//esta funcion me permite hacer el test con el dispostivo de prueba
export const getLocalDevices = async() =>{

  let res = await axios.post("http://192.168.0.24/local")

  console.log("Local device: ",res)

}
