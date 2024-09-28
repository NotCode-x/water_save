import React, { useEffect, useState } from "react";

import { useNavigation } from '@react-navigation/native';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import {
  Ionicons,
  FontAwesome,
  FontAwesome5,
  AntDesign,
  Feather,
  MaterialIcons
} from "@expo/vector-icons";
import { defaultConfig } from "./generic";
import { defaultStyles } from "../styles/styles";

import { db } from "../../db/firebase";
import { doc } from "firebase/firestore";

const Ajustes = () => {

  const navigation = useNavigation()

  return (
    <View style={defaultStyles.container}>
      <StatusBar style="auto" backgroundColor={defaultConfig.colors.blue} />
      <View style={defaultStyles.profileBox}>
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "flex-end",
          }}
        >
          <TouchableOpacity>
            <AntDesign
              name="logout"
              size={defaultConfig.sizeIconSmall}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
        <View style={defaultStyles.profileBoxUser}>
          <FontAwesome
            name="user-circle"
            size={defaultConfig.sizeIconBig}
            color="#fff"
          />
          <View>
            <Text style={defaultStyles.textBg}>Joaquín xxxxx xxxxx</Text>
            <Text style={defaultStyles.textBg}>devicexxx@test.net</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={defaultStyles.selectOptions}>
        <AntDesign
          name="user"
          size={defaultConfig.sizeIconOption}
          color="#000"
        />
        <Text style={defaultStyles.textSelect}>Mi perfil </Text>
      </TouchableOpacity>
      <TouchableOpacity style={defaultStyles.selectOptions} onPress={() => {
        navigation.navigate('AddDevice')
      }}>
        <Ionicons name="add" size={defaultConfig.sizeIconOption} color="#000" />
        <Text style={defaultStyles.textSelect}>Añadir nuevo dispositivo </Text>
      </TouchableOpacity>

      <TouchableOpacity style={defaultStyles.selectOptions}>
        <MaterialIcons name="electric-bolt" size={defaultConfig.sizeIconOption} color="#000" />
        <Text style={defaultStyles.textSelect}>Mis dispositivos </Text>
      </TouchableOpacity>

      <TouchableOpacity style={defaultStyles.selectOptions}>
        <AntDesign
          name="google"
          size={defaultConfig.sizeIconOption}
          color="#000"
        />
        <Text style={defaultStyles.textSelect}>Registrarse </Text>
      </TouchableOpacity>

      <TouchableOpacity style={defaultStyles.selectOptions}>
        <Feather name="info" size={defaultConfig.sizeIconOption} color="#000" />
        <Text style={defaultStyles.textSelect}>Acerca de water save </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Ajustes;
