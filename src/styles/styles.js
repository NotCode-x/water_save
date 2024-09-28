import { StyleSheet, Dimensions } from "react-native";
import { defaultConfig } from "../screens/generic";

const widthD = Dimensions.get('window').width
const heightD = Dimensions.get('window').height

export let defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  selectOptions: {
    width: "90%",
    height: '10%',
    flexDirection: "row",
    padding: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10
  },

  devicesOn: {
    width: widthD - 30,
    height: 'auto',
    padding: 20,
    justifyContent: "space-around",
    alignItems: "flex-start",
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10
  },

  textLocation:{
    fontSize: 14,
    color: defaultConfig.colors.gray
  },

  textSelect:{
    fontSize: 16,
    marginLeft: 10
  },

  textBg:{
    fontSize: 16,
    marginLeft: 10,
    color: '#fff',
    fontWeight: 'bold'
  },

  profileBox: {
    width: '100%',
    height: '20%',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: defaultConfig.colors.blue
  },
  profileBoxUser:{
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  }
});
