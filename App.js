// In App.js in a new project

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

//styles default
import { defaultConfig } from "./src/screens/generic";

import MenuPrincipal from "./src/MenuPrincipal";
import AddDevice from "./src/screens/AddDevice";
import DeviceControls from "./src/screens/DeviceControls";
import LocalDeviceControls from "./src/screens/LocalDeviceControls";
import ScanModal from "./src/screens/ScanModal";

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="MenuPrincipal"
          component={MenuPrincipal}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="AddDevice"
          component={AddDevice}
          options={{
            title: "Nuevo dispositivo",
            headerTintColor: "#fff",
            headerStyle: {
              backgroundColor: defaultConfig.colors.blue,
            },
          }}
        />

        <Stack.Screen
          name="ScanModal"
          component={ScanModal}
          options={{
            title: "Local devices",
            headerTintColor: "#fff",
            headerStyle: {
              backgroundColor: defaultConfig.colors.blue,
            },
          }}
        />

        <Stack.Screen
          name="DeviceControls"
          component={DeviceControls}
          options={{
            title: "WAN control room",
            headerTintColor: "#fff",
            headerStyle: {
              backgroundColor: defaultConfig.colors.blue,
            },
          }}
        />

        <Stack.Screen
          name="LocalDeviceControls"
          component={LocalDeviceControls}
          options={{
            title: "LAN control room",
            headerTintColor: "#fff",
            headerStyle: {
              backgroundColor: defaultConfig.colors.blue,
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
