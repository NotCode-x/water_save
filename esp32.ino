#include <WiFi.h>
#include <WiFiClient.h>
#include <WiFiServer.h>
#include <WiFiAP.h>
#include <HTTPClient.h>
#include <ESPAsyncWebServer.h>
#include <DHT.h>
#include <Preferences.h>
#include <ArduinoJson.h>  // Librería para manejar JSON en Arduino

//constante de la variable del sensor de temperatura del suelo
const int sensorHumedadSuelo = 34;
int valorHumedadSuelo = 0;  //parametro para almacenar el valor de la variable de la humedad del suelo

int porcentajeHumedad = 0;  // para que mapea los valores obtenidos de la lectura del sensor y los convierte a porcentaje

int pitidos = 32;

//sensor de temperatura y humedad DHT11
#define DHTPIN 4       // Pin D4
#define DHTTYPE DHT11  // DHT 11 (AM2302)

int sensorLluvia = 35;
int valorSensorLluvia = 0;

/*
La biblioteca Preferences en el ESP32 se utiliza para almacenar datos de configuración de manera persistente
 en la memoria flash del microcontrolador. 
Esto significa que los datos guardados utilizando Preferences se conservan incluso después de que el dispositivo se reinicie o pierda energía. 
 Es una alternativa moderna y más flexible al uso de la EEPROM.
*/
Preferences preferences;

const char* ssid = "sUck@x0";         //primera wifi de pruebas ssid=sUck@x0; pwd=Dont@#ck24
const char* password = "Dont@#ck24";  //segunda wifi de pruebas ssid=dOnt-C; pwd=dx@#24pxo

// Set these to your desired credentials.
const char* ssidAP = "WATER-SAVE";
const char* passwordAP = "WSF@abc4";


const char* serverAddress = "192.168.0.29";  // Cambiar por la IP o nombre del servidor Node.js
const int serverPort = 3000;                 // Puerto donde corre tu servidor Node.js

IPAddress ip(192, 168, 1, 17);       // Dirección IP del AP
IPAddress subnet(255, 255, 255, 0);  // Máscara de subred

String currentIp = "";

String macAddress = "";  //mac del dispositivo o esp32


//pines del relé 1
int rele1 = 12;
//pines del relé
int rele2 = 13;

//declaramos las variables tempratura y humedad en modo entero para no tomar decimales a la hora de mostrarlos en pantalla
int humedad_ambiente = 0;
int temperatura_ambiente = 0;

//ESTRUCTURA EL SN( SERIAL NUMBER) PREFIJPO (WTS) + 000000 + FECHA-ACTUAL + NUMERO DEL MES EN ROMANO
//WTS-000000-09-05-2024-V
String SN = "WTS-000000-09-05-2024-V";

//instanciamos o creamos un objeto AsyncWebServer rn rl puerto 80
AsyncWebServer server(80);  //nos crea un servidor local en el esp32

//creamos objeto dht configurando el pin y el tipo de sensor
DHT dht(DHTPIN, DHTTYPE);

//instanciomos un objeto http para hacer solicitudes en red
HTTPClient http;

//variable que controla si se está subiendo configuracion al server
String upConfig = "waiting";
bool preload = false;

//variable para bloquear el riego si es necesario por cualquier causa
bool killProcess = false;

//leds de señal
int ledVerde = 18;
int ledRojo = 19;
int ledAmarillo = 21;


void setup() {
  Serial.begin(115200);

  //inicializamos el sensor
  dht.begin();

  //configurar pines
  pinMode(2, OUTPUT);
  //pinMode(pitidos, OUTPUT);
  pinMode(rele1, OUTPUT);
  pinMode(rele2, OUTPUT);

  //salidas de los leds
  pinMode(ledRojo, OUTPUT);
  pinMode(ledVerde, OUTPUT);
  pinMode(ledAmarillo, OUTPUT);

  preferences.begin("riego", false);      // Inicia la biblioteca Preferences con el namespace "riego"
  preferences.putInt("temperatura", 25);  //declaramos los valores por defecto de la temperatura a 25
  preferences.putInt("humedad", 60);

  // Conectar a la red Wi-Fi
  Serial.print("Conectando a la red Wi-Fi...");

  /*if (!WiFi.softAP(ssidAP, passwordAP)) {
    log_e("Soft AP creation failed.");
    while(1);
  }
  IPAddress myIP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(myIP);
  server.begin();

  Serial.println("Server started");*/

  WiFi.begin(ssid, password);

  // Esperar a que se establezca la conexión
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }

  // Impresión de la dirección IP asignada
  Serial.println("");
  Serial.println("Conexión establecida a la red Wi-Fi");
  Serial.print("Dirección IP: ");
  Serial.println(WiFi.localIP());

  // Obtener la dirección IP local
  IPAddress localIP = WiFi.localIP();
  currentIp = localIP.toString();

  preferences.putString("Ip", localIP.toString());  // variable no volatil donde se almacena la ip del equipo, por defecto es 192.168.0.17

  // Obtener la dirección MAC del ESP32
  uint8_t mac[6];
  WiFi.macAddress(mac);
  for (int i = 0; i < 6; ++i) {
    macAddress += String(mac[i], HEX);
    if (i < 5) {
      macAddress += ":";
    }
  }

  tone(pitidos, 1000);  // Genera un tono de 1000 Hz (1 kHz)
  delay(1000);          // El sonido dura 1 segundo
  noTone(pitidos);      // Apaga el tono
  delay(1000);          // Espera 1 segundo
}



void loop() {

  valorHumedadSuelo = analogRead(sensorHumedadSuelo);  //mapeamos los valores analogicos para se puedan interpretar de forma digital
  // Calibrar el valor leído en el rango de 0 a 100 (porcentaje de humedad)
  porcentajeHumedad = map(valorHumedadSuelo, 4095, 1000, 0, 100);

  preferences.putInt("humedadSuelo", porcentajeHumedad);

  //valores del sensor de lluvia
  valorSensorLluvia = analogRead(sensorLluvia);

  //comprobar si hay lluvia
  if (valorSensorLluvia == 0) {
    preferences.putBool("estadoLluvia", false);
  } else {
    preferences.putBool("estadoLluvia", true);
  }

  //declaramos las variables tempratura y humedad en modo entero para no tomar decimales a la hora de mostrarlos en pantalla
  humedad_ambiente = dht.readHumidity();
  temperatura_ambiente = dht.readTemperature();

  // Leer el valor guardado en cada iteración (o cuando necesites)
  String currentTime = preferences.getString("hora_actual", "not set") + ":" + preferences.getString("minutos_actual", "not set");



  /*Serial.print("Mapeo: ");
  Serial.println(valorHumedadSuelo);
  Serial.print("Humedad suelo: ");
  Serial.print(porcentajeHumedad);
  Serial.println("%");
  Serial.print("Lluvia: ");
  Serial.println(valorSensorLluvia);
  delay(2000);*/

  Serial.print("Humedad suelo: ");
  Serial.println(porcentajeHumedad);

  Serial.print("Lluvia: ");
  Serial.println(valorSensorLluvia);

  preload;

  if (Serial.available() > 0) {

    // Leer la línea de datos recibidos
    String data = Serial.readStringUntil('\n');

    data.trim();  // Eliminar espacios en blanco o caracteres de nueva línea
    // Verificar si el dato recibido es "upload"
    if (data.equals("preload") || preload == true) {
      preload = true;
      getParamsToSerial(data);  //esta funcion procesa los datos que llegan por comunicacion serial desde el arduino uno
      digitalWrite(ledAmarillo, HIGH);
      delay(200);
      digitalWrite(ledAmarillo, LOW);
      delay(200);
      digitalWrite(ledAmarillo, HIGH);
      delay(200);
      digitalWrite(ledAmarillo, LOW);
      delay(200);
    }

    if (data.equals("upload")) {
      sendParamsToUpload();
      tonoCargar();
      digitalWrite(ledAmarillo, HIGH);
      delay(1000);
      digitalWrite(ledAmarillo, LOW);
      delay(1000);
      preload = false;
    }

  } else {
    //sendParamsTHAmbient();
    digitalWrite(ledAmarillo, LOW);
  }

  if (preload == false) {
    delay(100);
    checkNewParamsFromDB();
  }

  //llamamos a la funcion para medir la temperatura y humedad y los imprimimos en pantalla
  medirTemperaturaHumedad(temperatura_ambiente, humedad_ambiente);

  //getParamsToSerial();

  /*server.on("/params", HTTP_GET, [](AsyncWebServerRequest* request) {
    request->send(200, "text/plain", "Enviando parametros programados desde el A-MEGA");
  });*/


  //Dejamos el servidor local a la escucha
  localServer();



  //creamos un objeto server para el wifi
  //WiFiClient client = server.available();*/

  comprobarRiego(currentTime, temperatura_ambiente, porcentajeHumedad, valorSensorLluvia);

  //checkRelays();

  //controlarTH();
}


//funcion para configurar el esp32 como AP y permitir que el usuario lo conecte a una wifi para administrarlo

/*
void Apconfig() {

  // Configurar el ESP32 como un punto de acceso (AP) con una IP y máscara de subred específicas
  WiFi.softAP(ssidAp, passwordAp);

  //parametros ip local, gateway, mascara de red
  WiFi.softAPConfig(ip, ip, subnet);

  IPAddress IP = WiFi.softAPIP();
  Serial.print("Dirección IP del AP: ");
  Serial.println(IP);

  Serial.println("Punto de acceso creado!");
}*/

void localServer() {

  server.on("/", HTTP_GET, [](AsyncWebServerRequest* request) {
    request->send(200, "text/plain", macAddress);
  });

  server.on("/deviceInfo", HTTP_POST, [](AsyncWebServerRequest* request) {
    //comprobamos si se ha enviado una hora y un nintervalo desde la app
    if (request->hasParam("nombre", true) && request->hasParam("area", true)) {
      String nombre = request->getParam("nombre", true)->value();
      String area = request->getParam("area", true)->value();

      preferences.putString("deviceName", nombre);
      preferences.putString("Area", area);

      Serial.println("Received Parameters:");
      Serial.println("Nombre: " + nombre);
      Serial.println("Area: " + area);

      request->send(200, "text/plain", "Información recibida");
    } else {
      request->send(400, "text/plain", "Ha ocurrido un error.");
    }
  });

  server.on("/local", HTTP_POST, [](AsyncWebServerRequest* request) {
    // Obtener la dirección IP local
    IPAddress localIP = WiFi.localIP();

    //Crear el objeto JSON con los datos a enviar
    StaticJsonDocument<200> doc;
    doc["h1"] = preferences.getString("h1", "not set");
    doc["i1"] = preferences.getString("i1", "not set");
    doc["h2"] = preferences.getString("h2", "not set");
    doc["i2"] = preferences.getString("i2", "not set");
    doc["h3"] = preferences.getString("h3", "not set");
    doc["i3"] = preferences.getString("i3", "not set");
    doc["h4"] = preferences.getString("h4", "not set");
    doc["i4"] = preferences.getString("i4", "not set");
    doc["mac"] = macAddress;
    doc["SN"] = SN;
    doc["deviceName"] = preferences.getString("deviceName", "not set");
    doc["Area"] = preferences.getString("Area", "not set");
    doc["Ip"] = currentIp;
    doc["temperaturaControl"] = preferences.getString("tmpc", "28");
    doc["humedadControl"] = preferences.getString("hmdc", "28");
    doc["temperaturaAmbiente"] = temperatura_ambiente;
    doc["humedadAmbiente"] = humedad_ambiente;
    doc["lluvia"] = preferences.getBool("estadoLluvia", false);
    doc["humedadSuelo"] = preferences.getInt("humedadSuelo", 0);

    // Serializar el JSON a una cadena
    String jsonData;
    serializeJson(doc, jsonData);

    request->send(200, "application/json", jsonData);

    digitalWrite(ledAmarillo, HIGH);
    delay(1000);
    digitalWrite(ledAmarillo, LOW);
    delay(1000);
  });

  server.on("/ip", HTTP_POST, [](AsyncWebServerRequest* request) {
    // Obtener la dirección IP local
    IPAddress localIP = WiFi.localIP();

    //Crear el objeto JSON con los datos a enviar
    StaticJsonDocument<200> doc;
    doc["h1"] = preferences.getString("h1", "not set");
    doc["i1"] = preferences.getString("i1", "not set");
    doc["h2"] = preferences.getString("h2", "not set");
    doc["i2"] = preferences.getString("i2", "not set");
    doc["h3"] = preferences.getString("h3", "not set");
    doc["i3"] = preferences.getString("i3", "not set");
    doc["h4"] = preferences.getString("h4", "not set");
    doc["i4"] = preferences.getString("i4", "not set");
    doc["mac"] = macAddress;
    doc["SN"] = SN;
    doc["deviceName"] = preferences.getString("deviceName", "not defined");
    doc["Area"] = preferences.getString("Area", "not defined");
    doc["Ip"] = currentIp;
    doc["temperaturaControl"] = preferences.getString("tmpc", "28");
    doc["humedadControl"] = preferences.getString("hmdc", "28");
    doc["temperaturaAmbiente"] = temperatura_ambiente;
    doc["humedadAmbiente"] = humedad_ambiente;
    doc["lluvia"] = preferences.getBool("estadoLluvia", false);
    doc["humedadSuelo"] = preferences.getInt("humedadSuelo", 0);

    // Serializar el JSON a una cadena
    String jsonData;
    serializeJson(doc, jsonData);

    request->send(200, "application/json", jsonData);

    digitalWrite(ledAmarillo, HIGH);
    delay(1000);
    digitalWrite(ledAmarillo, LOW);
    delay(1000);
  });

  server.on("/params", HTTP_GET, [](AsyncWebServerRequest* request) {
    request->send(200, "text/plain", "Enviando parametros programados desde el A-MEGA");
  });

  server.on("/led/on", HTTP_GET, ledOn);
  server.on("/led/off", HTTP_GET, ledOff);


  //porcion de coidgo para testear las solicitudes post
  /*server.on("/receive_parameter", HTTP_POST, [](AsyncWebServerRequest *request){
        // Manejar la solicitud POST para recibir el parámetro enviado
        if (request->hasParam("parameter", true)) {
            String parameterValue = request->getParam("parameter", true)->value();
            Serial.print("Parameter received: ");
            Serial.println(parameterValue);
            request->send(200, "text/plain", "Parameter received successfully");
        } else {
            request->send(400, "text/plain", "No parameter received");
        }
    });*/

  server.on("/current_time", HTTP_POST, [](AsyncWebServerRequest* request) {
    //comprobamos si se ha enviado una hora y un nintervalo desde la app
    if (request->hasParam("hora", true) && request->hasParam("minutos", true)) {
      String hora_actual = request->getParam("hora", true)->value();
      String minutos_actual = request->getParam("minutos", true)->value();

      preferences.putString("hora_actual", hora_actual);
      preferences.putString("minutos_actual", minutos_actual);

      Serial.println("Hora actual:");
      Serial.println("Hora: " + hora_actual);
      Serial.println("Minutos: " + minutos_actual);

      request->send(200, "text/plain", "Horas y minutos actualizados");
    } else {
      request->send(400, "text/plain", "Ha ocurrido un error a la hora de enviar los parámetros.");
    }
  });

  server.on("/set_times", HTTP_POST, [](AsyncWebServerRequest* request) {
    //comprobamos si se ha enviado una hora y un nintervalo desde la app
    if (request->hasParam("h1", true) && request->hasParam("i1", true)) {
      String h1 = request->getParam("h1", true)->value();
      String i1 = request->getParam("i1", true)->value();
      String h2 = request->getParam("h2", true)->value();
      String i2 = request->getParam("i2", true)->value();

      String h3 = request->getParam("h3", true)->value();
      String i3 = request->getParam("i3", true)->value();
      String h4 = request->getParam("h4", true)->value();
      String i4 = request->getParam("i4", true)->value();
      String tempNet = request->getParam("t", true)->value();
      String hmdNet = request->getParam("h", true)->value();

      preferences.putString("h1", h1);
      preferences.putString("i1", i1);
      preferences.putString("h2", h2);
      preferences.putString("i2", i2);
      preferences.putString("h3", h3);
      preferences.putString("i3", i3);
      preferences.putString("h4", h4);
      preferences.putString("i4", i4);
      preferences.putString("tmpc", tempNet);  //temperatura de control
      preferences.putString("hmdc", hmdNet);   //humedad de control

      Serial.println("Received Parameters:");
      Serial.println("Hora 1: " + h1);
      Serial.println("Intervalo 1: " + i1);
      Serial.println("Hora 2: " + h2);
      Serial.println("Intervalo 2: " + i2);
      Serial.println("Hora 3: " + h3);
      Serial.println("Intervalo 3: " + i3);
      Serial.println("Hora 4: " + h4);
      Serial.println("Intervalo 4: " + i4);
      Serial.println("Temperatura: " + tempNet);
      Serial.println("Humedad: " + hmdNet);

      request->send(200, "text/plain", "Horas de riego enviados y recibidos.");
    } else {
      request->send(400, "text/plain", "Ha ocurrido un error a la hora de enviar los parámetros.");
    }
  });

  server.begin();
}


//funcion para encender el led
void ledOn(AsyncWebServerRequest* request) {

  digitalWrite(2, HIGH);
  request->send(200, "text/plain", "LED encendido");
}

//funcion para encender el led
void ledOff(AsyncWebServerRequest* request) {

  digitalWrite(2, LOW);
  request->send(200, "text/plain", "LED apagado");
}

void sendTempHum(int t, int h) {
  Serial.print("tmp:" + t);
  Serial.print("hmd:" + h);
  delay(1000);
}

void medirTemperaturaHumedad(int t, int h) {
  // Verifica si alguna lectura falló

  if (isnan(t) || isnan(h)) {
    Serial.println("Error al leer el sensor DHT!");
    delay(200);
    return;
  }

  Serial.println("tmp:" + String(t));
  delay(300);
  Serial.println("hmd:" + String(h));
  delay(300);
  Serial.println("ip:" + currentIp);
  delay(300);
}

//funcion para capturar los parametros programados por serial desde el arduino uno o mega
void getParamsToSerial(String data) {
  String h1 = "h1:";
  String i1 = "i1:";
  String h2 = "h2:";
  String i2 = "i2:";
  String h3 = "h3:";
  String i3 = "i3:";
  String h4 = "h4:";
  String i4 = "i4:";
  String tmpc = "tmpc:";
  String hmdc = "hmdc:";
  String up = "upload";

  Serial.println("Res ARDM: " + data);
  //procesamos los datos para saber si es temperatura o humedad
  if (data.startsWith("preload")) {
    //Serial.print("Received temperature: ");
    //Serial.println(receivedTemperature);

  } else if (data.startsWith(h1)) {
    preferences.putString("h1", data.substring(h1.length()));

    //Serial.print("Received temperature: ");
    //Serial.println(receivedTemperature);

  } else if (data.startsWith(i1)) {
    preferences.putString("i1", data.substring(i1.length()));

  } else if (data.startsWith(h2)) {
    preferences.putString("h2", data.substring(h2.length()));

  } else if (data.startsWith(i2)) {
    preferences.putString("i2", data.substring(i2.length()));

  } else if (data.startsWith(h3)) {
    preferences.putString("h3", data.substring(h3.length()));

  } else if (data.startsWith(i3)) {
    preferences.putString("i3", data.substring(i3.length()));

  } else if (data.startsWith(h4)) {
    preferences.putString("h4", data.substring(h4.length()));

  } else if (data.startsWith(i4)) {
    preferences.putString("i4", data.substring(i4.length()));

  } else if (data.startsWith(tmpc)) {
    preferences.putString("tmpc", data.substring(tmpc.length()));  //temperatura de control
  } else if (data.startsWith(hmdc)) {
    preferences.putString("hmdc", data.substring(hmdc.length()));  //humedad de control
  } else if (data.startsWith(up)) {
    upConfig = up;
    //Serial.print("Received temperature: ");
    //Serial.println(receivedTemperature);

  } else {
    Serial.println("No hay datos...");
    //upload = "";
  }
  delay(200);
}

//funcion para cargar la temperatura ty humedad ambientales en tiempo real
void sendParamsTHAmbient() {

  //Crear el objeto JSON con los datos a enviar
  StaticJsonDocument<200> doc;
  doc["h1"] = preferences.getString("h1", "not set");
  doc["i1"] = preferences.getString("i1", "not set");
  doc["h2"] = preferences.getString("h2", "not set");
  doc["i2"] = preferences.getString("i2", "not set");
  doc["h3"] = preferences.getString("h3", "not set");
  doc["i3"] = preferences.getString("i3", "not set");
  doc["h4"] = preferences.getString("h4", "not set");
  doc["i4"] = preferences.getString("i4", "not set");
  doc["mac"] = macAddress;
  doc["SN"] = SN;
  doc["deviceName"] = preferences.getString("deviceName", "not defined");
  doc["Area"] = preferences.getString("Area", "not defined");
  doc["Ip"] = preferences.getString("Ip", "192.168.0.17");
  doc["temperaturaControl"] = preferences.getString("tmpc", "28");
  doc["humedadControl"] = preferences.getString("hmdc", "28");
  doc["temperaturaAmbiente"] = temperatura_ambiente;
  doc["humedadAmbiente"] = humedad_ambiente;
  doc["lluvia"] = preferences.getBool("estadoLluvia", false);
  doc["humedadSuelo"] = preferences.getInt("humedadSuelo", 0);

  //Serial.print("Enviando params al server");

  // Serializar el JSON a una cadena
  String jsonData;
  serializeJson(doc, jsonData);

  // Configurar la solicitud HTTP POST
  HTTPClient http;
  http.begin("http://" + String(serverAddress) + ":" + serverPort + "/params");  // URL de la ruta POST en el servidor Node.js
  http.addHeader("Content-Type", "application/json");                            // Encabezado para indicar JSON en el cuerpo de la solicitud

  // Quitar caracteres no deseados como \r si es necesario, para que en el servidor no aparezca los valores de las claves del json con \r al final
  jsonData.replace("\r", "");

  // Realizar la solicitud POST
  int httpResponseCode = http.POST(jsonData);

  // Verificar el código de respuesta
  if (httpResponseCode > 0) {
    Serial.print("Respuesta del servidor: ");
    Serial.println(http.getString());
  } else {
    /*Serial.print("Error en la solicitud HTTP: ");
    Serial.println(httpResponseCode);*/
  }

  delay(2000);

  // Finalizar la solicitud
  http.end();
}

//funcion para subir la nueva configuracion al servidor en la nube
void sendParamsToUpload() {

  //Crear el objeto JSON con los datos a enviar
  StaticJsonDocument<200> doc;
  doc["h1"] = preferences.getString("h1", "not set");
  doc["i1"] = preferences.getString("i1", "not set");
  doc["h2"] = preferences.getString("h2", "not set");
  doc["i2"] = preferences.getString("i2", "not set");
  doc["h3"] = preferences.getString("h3", "not set");
  doc["i3"] = preferences.getString("i3", "not set");
  doc["h4"] = preferences.getString("h4", "not set");
  doc["i4"] = preferences.getString("i4", "not set");
  doc["mac"] = macAddress;
  doc["SN"] = SN;
  doc["deviceName"] = preferences.getString("deviceName", "not defined");
  doc["Area"] = preferences.getString("Area", "not defined");
  doc["Ip"] = preferences.getString("Ip", "192.168.0.17");
  doc["temperaturaControl"] = preferences.getString("tmpc", "28");
  doc["humedadControl"] = preferences.getString("hmdc", "28");
  doc["temperaturaAmbiente"] = temperatura_ambiente;
  doc["humedadAmbiente"] = humedad_ambiente;
  doc["lluvia"] = preferences.getBool("estadoLluvia", false);
  doc["humedadSuelo"] = preferences.getInt("humedadSuelo", 0);

  //Serial.print("Enviando params al server");

  // Serializar el JSON a una cadena
  String jsonData;
  serializeJson(doc, jsonData);

  // Configurar la solicitud HTTP POST
  HTTPClient http;
  http.begin("http://" + String(serverAddress) + ":" + serverPort + "/params");  // URL de la ruta POST en el servidor Node.js
  http.addHeader("Content-Type", "application/json");                            // Encabezado para indicar JSON en el cuerpo de la solicitud

  // Quitar caracteres no deseados como \r si es necesario, para que en el servidor no aparezca los valores de las claves del json con \r al final
  jsonData.replace("\r", "");

  // Realizar la solicitud POST
  int httpResponseCode = http.POST(jsonData);

  // Verificar el código de respuesta
  if (httpResponseCode > 0) {
    //Serial.print("Respuesta del servidor: ");
    //Serial.println(http.getString());
  } else {
    /*Serial.print("Error en la solicitud HTTP: ");
    Serial.println(httpResponseCode);*/
  }

  delay(1000);

  // Finalizar la solicitud
  http.end();
}

//funcion para capturar los datos actualizados en la nube
void checkNewParamsFromDB() {

  //Crear el objeto JSON con los datos a enviar
  StaticJsonDocument<200> doc;
  doc["mac"] = macAddress;
  doc["SN"] = SN;
  //Serial.print("Enviando params al server");

  // Serializar el JSON a una cadena
  String jsonData;
  serializeJson(doc, jsonData);

  // Configurar la solicitud HTTP POST
  HTTPClient http;
  http.begin("http://" + String(serverAddress) + ":" + serverPort + "/cloud");  // URL de la ruta POST en el servidor Node.js
  http.addHeader("Content-Type", "application/json");                           // Encabezado para indicar JSON en el cuerpo de la solicitud

  // Quitar caracteres no deseados como \r si es necesario, para que en el servidor no aparezca los valores de las claves del json con \r al final
  jsonData.replace("\r", "");

  // Realizar la solicitud POST
  int httpResponseCode = http.POST(jsonData);

  // Verificar el código de respuesta
  if (httpResponseCode > 0) {
    String resPOST = http.getString();
    //Serial.print("Datos actualizados del servidor: ");
    //Serial.println(resPOST);

    //Procesar el json para que sea legible en el esp32
    DynamicJsonDocument docRes(1024);
    deserializeJson(docRes, resPOST);

    // Extraer los valores del json
    if (docRes.is<JsonArray>()) {
      for (JsonObject data : docRes.as<JsonArray>()) {
        String name = data["deviceName"];
        String area = data["area"];
        String h1 = data["h1"];
        String i1 = data["i1"];
        String h2 = data["h2"];
        String i2 = data["i2"];
        String h3 = data["h3"];
        String i3 = data["i3"];
        String h4 = data["h4"];
        String i4 = data["i4"];
        String tmpc = data["temperaturaControl"];
        String hmdc = data["humedadControl"];

        //valores que el esp32 recibe del servidor en la nube
        preferences.putString("h1", h1);
        preferences.putString("i1", i1);
        preferences.putString("h2", h2);
        preferences.putString("i2", i2);
        preferences.putString("h3", h3);
        preferences.putString("i3", i3);
        preferences.putString("h4", h4);
        preferences.putString("i4", i4);
        preferences.putString("tmpc", tmpc);
        preferences.putString("hmdc", hmdc);
        // Use the extracted values as needed
        //Serial.println("Device Name: " + name);
        //Serial.println("Device Area: " + area);
      }
    } else {
      //Serial.println("Error in response");
    }
  } else {
    /*Serial.print("Error en la solicitud HTTP: ");
    Serial.println(httpResponseCode);*/
  }

  delay(1000);

  // Finalizar la solicitud
  http.end();
}

//funcion que controla el riego según los parámetros introducidos
void comprobarRiego(String hr, int tmp, int hmd, int lluvia) {

  killProcess;

  preferences.begin("riego", true);  // Abrir el espacio de nombres en modo RO
  String h1 = preferences.getString("h1", "not set");
  String h2 = preferences.getString("h2", "not set");
  String h3 = preferences.getString("h3", "not set");
  String h4 = preferences.getString("h4", "not set");
  String i1 = preferences.getString("i1", "not set");
  String i2 = preferences.getString("i2", "not set");
  String i3 = preferences.getString("i3", "not set");
  String i4 = preferences.getString("i4", "not set");
  String tmpControl = preferences.getString("tmpc", "not set");
  String hmdControl = preferences.getString("hmdc", "not set");

  //Serial.println("Hora: " + hr + " | " + h1);

  if (killProcess == false) {

    if (lluvia == 0) {
      digitalWrite(ledRojo, LOW);
      digitalWrite(ledVerde, HIGH);
      tone(pitidos, 2000);
      //comprobar la temperatura

      if (tmp >= tmpControl.toInt() || hmd <= hmdControl.toInt()) {
        encenderRiego(3000);
      }

      if (hmd <= hmdControl.toInt() && tmp < tmpControl.toInt()) {
        if (hr == h1) {
          /*
          digitalWrite(2, HIGH);
          delay(i1.toInt() * 60000);
          digitalWrite(2, LOW);
          */

          encenderRiego(3000);
        }

        if (hr == h2) {
          /*
      digitalWrite(2, HIGH);
      delay(i2.toInt() / 11 * 60000);
      digitalWrite(2, LOW);*/

          encenderRiego(3000);
        }

        if (hr == h3) {
          /*
      digitalWrite(2, HIGH);
      delay(i3.toInt() / 12 * 60000);
      digitalWrite(2, LOW);*/

          encenderRiego(3000);
        }

        if (hr == h4) {
          /*
      digitalWrite(2, HIGH);
      delay(i4.toInt() / 14 * 60000);
      digitalWrite(2, LOW);*/

          encenderRiego(3000);
        }
      }
      noTone(pitidos);
      digitalWrite(ledVerde, LOW);
    } else {
      digitalWrite(ledRojo, HIGH);
    }
  }
}

//funcion de prueba para modificar los parametros de temperatura y humedad
void controlarTH() {
  if (Serial.available()) {
    char key = Serial.read();
    Serial.print("Tecla recibida: ");
    Serial.println(key);

    if (key == 'A') {
      Serial.print("Sumando la temperatura");
    }

    if (key == 'B') {
      Serial.print("Restando la temperatura");
    }

    if (key == 'C') {
      Serial.print("Sumando la humedad");
    }

    if (key == 'D') {
      Serial.print("Restando la humedad");
    }
  }
}

void mediarHumedadSuelo() {
  //
}


//funcion para probar si los relés funcionan
void checkRelays() {
  digitalWrite(rele1, HIGH);
  delay(5000);
  digitalWrite(rele1, LOW);
}

void encenderRiego(int retardo) {
  digitalWrite(rele1, HIGH);
  delay(retardo);
  digitalWrite(rele1, LOW);
  delay(retardo);
}

void tonoCargar() {
  tone(pitidos, 200);
  delay(1000);
  noTone(pitidos);
  delay(500);
  tone(pitidos, 200);
  delay(500);
  noTone(pitidos);
  delay(500);
  tone(pitidos, 200);
  delay(500);
  noTone(pitidos);
  delay(1000);
}
