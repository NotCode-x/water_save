import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {Ionicons, FontAwesome, FontAwesome5, AntDesign } from '@expo/vector-icons';

import { defaultConfig } from './screens/generic';

import Home from './screens/Home';
import Ajustes from './screens/Ajustes';
import ScanDevices from './screens/ScanDevices';
import TestScreen from './screens/TestScreen';

const Tab = createBottomTabNavigator();

function MenuPrincipal({route, navigation}) {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Test" component={TestScreen} options={{
        headerTitleStyle:{
          color: '#fff'
        },
        headerStyle:{
          backgroundColor: defaultConfig.colors.blue,
        },
        headerShown: false,
        tabBarIcon: () => {
          return <AntDesign name="home" size={24} color="black" />
        }
      }}/>
      <Tab.Screen name="Ajustes" component={Ajustes} options={{
        headerShown: false,
        tabBarIcon: () => {
          return <AntDesign name="setting" size={24} color="black" />
        }
      }} />
    </Tab.Navigator>
  );
}


export default MenuPrincipal