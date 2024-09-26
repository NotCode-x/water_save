
#include <Keypad.h>
#include <SoftwareSerial.h>
#include <Wire.h>               // libreria de comunicacion por I2C
#include <LCD.h>                // libreria para funciones de LCD
#include <LiquidCrystal_I2C.h>  // libreria para LCD por I2C
#include <EEPROM.h>             //biblioteca para almacenar valores en la memoria no volatil del arduino

LiquidCrystal_I2C lcd(0x27, 2, 1, 0, 4, 5, 6, 7);  // DIR, E, RW, RS, D4, D5, D6, D7

// Configurar pines del Keypad
const byte ROWS = 4;  // cuatro filas
const byte COLS = 4;  // cuatro columnas

//matriz de 2 dimensiones para alamcenar las filas y columnas
char keys[ROWS][COLS] = {
  { '1', '2', '3', 'A' },
  { '4', '5', '6', 'B' },
  { '7', '8', '9', 'C' },
  { '*', '0', '#', 'D' }
};

byte rowPins[ROWS] = { 2, 3, 4, 5 };  // Conectar a los pines de fila del Keypad
byte colPins[COLS] = { 6, 7, 8, 9 };  // Conectar a los pines de columna del Keypad

Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

SoftwareSerial espSerial(10, 11);  // RX, TX

//temperatura y humedad que se recibe del esp32
String receivedTemperature = "";
String receivedHumidity = "";
String receivedIp = "";

String valorHorario = "";
char indiceHorario = '0';

//parametros de temperatura y humedad para programar
String tempConfig = "";
String hmdConfig = "";


//estados de los menues

String menu_selected = "";

bool menu_principal = true;
bool menu_opciones = false;
bool menu_parametros = false;
bool menu_horarios = false;
bool menu_upload = false;
bool menu_net = false;
bool menu_ajustar_temp = false;
bool menu_ajustar_hmd = false;
bool controlTH = false;
bool horario = false;


//sensor de agua
int sensorAgua;

//variables de los horarios
// Definición de la estructura para almacenar hora, minutos y segundos
struct Tiempo {
  String hora;
  String minutos;
  String intervalo;  // Intervalo de riego en minutos

  // Constructor que inicializa todos los campos con "0" por defecto
  Tiempo()
    : hora("0"), minutos("0"), intervalo("0") {}
};

// Declaración de cuatro variables de tipo Tiempo para almacenar los tiempos de riego
Tiempo tiempo1;
Tiempo tiempo2;
Tiempo tiempo3;
Tiempo tiempo4;

// Variable para almacenar el tiempo actualmente seleccionado
int tiempoSeleccionado = -1;

// Variable para almacenar la entrada actual del tiempo
String timeInput = "";

int btnUpload = 10;

void setup() {
  Serial.begin(115200);
  pinMode(btnUpload, INPUT);
  lcd.setBacklightPin(3, POSITIVE);  // puerto P3 de PCF8574 como positivo
  lcd.setBacklight(HIGH);            // habilita iluminacion posterior de LCD
  lcd.begin(16, 2);                  // 16 columnas por 2 lineas para LCD 1602A
  lcd.clear();
  pinMode(13, OUTPUT);  // limpia pantalla
  mostrarEstadoClima(receivedTemperature, receivedHumidity);
}


void loop() {

  getTempHum(); //función para obtener los datos del esp32 por puerto serial (temperatura, humedad, ip)
  char key = keypad.getKey(); //variable para almacenar la entrada por teclado
  allOptionsView(key); //funcion donde se procesa cada entrada de teclado según el valor intorducido

  if (digitalRead(btnUpload) == HIGH) { //verifica si se ha pulsado el botón para guardar los datos de control
    digitalWrite(13, HIGH);
    menuUpload();
  } else {
    digitalWrite(13, LOW);
  }
}


void getTempHum() {

  String tempHeader = "tmp:";
  String humHeader = "hmd:";
  String ipHeader = "ip:";

  if (Serial.available() > 0 && menu_principal == true) {
    String data = Serial.readStringUntil('\n');
    //Serial.println(data);
    //procesamos los datos para saber si es temperatura o humedad
    if (data.startsWith(tempHeader)) {                            // Comprobar si los datos comienzan con "temp:"
      receivedTemperature = data.substring(tempHeader.length());  // Extraer la parte que contiene la temperatura
    }
    if (data.startsWith(humHeader)) {
      receivedHumidity = data.substring(humHeader.length());  // Extraer la parte que contiene la humedad
    }

    if (data.startsWith(ipHeader)) {
      receivedIp = data.substring(ipHeader.length());  // Extraer la parte que contiene la ip actual
    }

    mostrarEstadoClima(receivedTemperature, receivedHumidity);
  }
}

void mostrarEstadoClima(String t, String h) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print(t + "*C");
  lcd.print(" ");
  lcd.setCursor(8, 0);
  lcd.print("H:");
  lcd.print(h + "%");
  lcd.setCursor(0, 1);
  lcd.print("CFG(#)");
  lcd.setCursor(8, 1);
  lcd.print("NET(D)");

  //Serial.println("tempR: " + t);
  //Serial.println("hmdR: " + h);
}

void menuOpciones() {
  lcd.clear();
  char key = keypad.getKey();
  lcd.setCursor(0, 0);
  lcd.print("1.CONFIG(T/H)");
  lcd.setCursor(0, 1);
  lcd.print("2.HORARIOS");
}

void menuNetInfo() {
  lcd.clear();
  char key = keypad.getKey();
  lcd.setCursor(0, 0);
  lcd.print(receivedIp);
  lcd.setCursor(0, 1);
  lcd.print("Salir(*)");
}

void menuParametros() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("#2 para Temp.");
  lcd.setCursor(0, 1);
  lcd.print("#5 para Hmd.");
}

void menuHorarios() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("1.H:M:I, 2.H:M:I");
  lcd.setCursor(0, 1);
  lcd.print("3.H:M:I, 4.H:M:I");
}

void menuUpload() {
  lcd.clear();
  lcd.setCursor(0, 0);
  if (tempConfig != "" || hmdConfig != "") {
    lcd.print("Cargando...");
    sendAllParams();
    delay(10000);
    resetMenus();
  } else {
    lcd.print("Error (T/H)!!!");
    lcd.setCursor(0, 1);
    lcd.print("Sin parametros!");
    delay(5000);
    resetMenus();
  }
  //menu_upload = true;
}

void menuAjustarTemperatura(String t) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Temperatura------");
  lcd.setCursor(6, 1);
  lcd.print(t);
}

void menuAjustarHumedad(String h) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Humedad-----");
  lcd.setCursor(6, 1);
  lcd.print(h);
}

void updateTemp() {
}

void horarioActual(char i) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Horario(" + String(i) + ")");
  lcd.setCursor(0, 1);
  lcd.print("HHMMII: ...");
}

void tiempoIntroducido(char i, String val) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Horario(" + String(i) + ")");
  lcd.setCursor(0, 1);
  lcd.print("HHMMII: " + val);

  // Si se han ingresado 6 caracteres (HHMMII)
  if (val.length() == 6) {
    // Extraer la hora, los minutos y el intervalo de la cadena
    int hora = val.substring(0, 2).toInt();
    int minutos = val.substring(2, 4).toInt();
    int intervalo = val.substring(4, 6).toInt();

    //estos parametros nos permiten tener los minutos y el intervalo con el prefijo 08, 09, etc
    String horaC = val.substring(0, 2);
    String minutosC = val.substring(2, 4);
    String intervaloC = val.substring(4, 6);


    /*Serial.println(hora);
    Serial.println(minutos);
    Serial.println(intervalo);
    Serial.println(String(i));*/

    // Asegurarse de que los valores estén en el rango correcto
    //usamos los parametros sin el sufijoC para comparar los rangos de valores del tiempo seleccionado
    if (hora >= 0 && hora < 24 && minutos >= 0 && minutos < 60 && intervalo > 0) {
      // Asignar los valores a la estructura en el índice seleccionado
      switch (i) {
        case '1':
          tiempo1.hora = horaC;
          tiempo1.minutos = minutosC;
          tiempo1.intervalo = intervaloC;
          break;
        case '2':
          tiempo2.hora = horaC;
          tiempo2.minutos = minutosC;
          tiempo2.intervalo = intervaloC;
          break;
        case '3':
          tiempo3.hora = horaC;
          tiempo3.minutos = minutosC;
          tiempo3.intervalo = intervaloC;
          break;
        case '4':
          tiempo4.hora = horaC;
          tiempo4.minutos = minutosC;
          tiempo4.intervalo = intervaloC;
          break;
      }

      // Reiniciar la selección de tiempo y limpiar la entrada
      valorHorario = "";
      indiceHorario = '0';
      resetMenus();

    } else {
      // Reiniciar la entrada
      indiceHorario = '0';
      formatHMIError(val);
      delay(100);
      resetMenus();
    }
  }

  //Serial.println(tiempo1.hora);
}

void resetMenus() {
  menu_principal = true;
  menu_opciones = false;
  menu_parametros = false;
  menu_horarios = false;
  menu_ajustar_temp = false;
  menu_ajustar_hmd = false;
  menu_net = false;
  menu_selected == "";
  valorHorario = "";
  mostrarEstadoClima(receivedTemperature, receivedHumidity);
}

void sendAllParams() {

  String h1 = String(tiempo1.hora) + ":" + String(tiempo1.minutos);
  String i1 = String(tiempo1.intervalo);
  String h2 = String(tiempo2.hora) + ":" + String(tiempo2.minutos);
  String i2 = String(tiempo2.intervalo);
  String h3 = String(tiempo3.hora) + ":" + String(tiempo3.minutos);
  String i3 = String(tiempo3.intervalo);
  String h4 = String(tiempo4.hora) + ":" + String(tiempo4.minutos);
  String i4 = String(tiempo4.intervalo);

  Serial.println("preload");
  delay(50);
  Serial.println("tmpc:" + tempConfig);
  delay(50);
  Serial.println("hmdc:" + hmdConfig);
  delay(50);
  Serial.println("h1:" + h1);
  delay(50);
  Serial.println("i1:" + i1);
  delay(50);
  Serial.println("h2:" + h2);
  delay(50);
  Serial.println("i2:" + i2);
  delay(50);
  Serial.println("h3:" + h3);
  delay(50);
  Serial.println("i3:" + i3);
  delay(50);
  Serial.println("h4:" + h4);
  delay(50);
  Serial.println("i4:" + i4);
  delay(50);
  Serial.println("upload");
  delay(50);
}

void formatHMIError(String val) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Format Error!");
  lcd.setCursor(0, 1);
  lcd.print("HHMMII: " + val);
}

void checkRain() {
  sensorAgua = analogRead(A0);

  Serial.println("Lluvia: ");
  Serial.println(sensorAgua);

  delay(2000);
}

void allOptionsView(char key) {
  delay(100);
  if (key == '#' && menu_opciones == false) {
    lcd.clear();
    menu_principal = false;
    menu_opciones = true;
    menu_parametros = false;
    menu_horarios = false;
    menu_ajustar_temp = false;
    menu_ajustar_hmd = false;
    menu_selected == "";
    valorHorario = "";
    horario = false;
    menuOpciones();
  } else if (key == '*' && menu_principal == false) {
    lcd.clear();
    menu_principal = true;
    menu_opciones = false;
    menu_parametros = false;
    menu_horarios = false;
    menu_ajustar_temp = false;
    menu_ajustar_hmd = false;
    menu_selected == "";
    valorHorario = "";
    horario = false;
    mostrarEstadoClima(receivedTemperature, receivedHumidity);

    //abrimos el menu para escoger el parametro a modificar
  } else if (key == 'D' && menu_net == false && menu_opciones == false) {
    lcd.clear();
    menu_principal = false;
    menu_opciones = false;
    menu_parametros = false;
    menu_horarios = false;
    menu_ajustar_temp = false;
    menu_ajustar_hmd = false;
    menu_selected == "";
    valorHorario = "";
    horario = false;
    menuNetInfo();

    //abrimos el menu para escoger el parametro a modificar
  } else if (key == '1' && menu_opciones == true && menu_parametros == false && menu_horarios == false) {
    lcd.clear();
    menu_principal = false;
    menu_opciones = false;
    menu_parametros = true;
    menu_horarios = false;
    menu_ajustar_temp = false;
    menu_ajustar_hmd = false;
    menu_selected == "";
    valorHorario = "";
    horario = false;
    menuParametros();

    //abrimos el menu para ajustar la temperatura
  } else if (key == '2' && menu_parametros == true && menu_ajustar_temp == false && menu_selected == "") {
    lcd.clear();
    menu_selected = "menu_ajustar_temp";
    menu_parametros = true;
    menu_ajustar_temp = true;
    menu_ajustar_hmd = false;
    tempConfig = "";
    menuAjustarTemperatura(tempConfig);

    //introducimos la temperatura que enviaremos
  } else if (key && menu_parametros == true && menu_ajustar_temp == true && menu_selected == "menu_ajustar_temp") {

    tempConfig = tempConfig + String(key);

    if (tempConfig.length() == 2) {
      menu_selected = "";
    }
    //menu_ajustar_hmd = false;
    menuAjustarTemperatura(tempConfig);

    //abrimos el menu para modificar la humedad
  } else if (key == '5' && menu_parametros == true && menu_ajustar_hmd == false && menu_selected == "") {
    lcd.clear();
    menu_selected = "menu_ajustar_hmd";
    menu_parametros = true;
    menu_ajustar_temp = false;
    menu_ajustar_hmd = true;
    hmdConfig = "";
    menuAjustarHumedad(hmdConfig);

    //introducimos la humedad a modificar
  } else if (key && menu_parametros == true && menu_ajustar_hmd == true && menu_selected == "menu_ajustar_hmd") {
    hmdConfig = hmdConfig + String(key);

    if (hmdConfig.length() == 2) {
      menu_selected = "";
    }
    menu_ajustar_temp = false;
    menuAjustarHumedad(hmdConfig);


  } else if (key == '2' && menu_opciones == true && menu_horarios == false && menu_parametros == false) {
    lcd.clear();
    menu_principal = false;
    menu_opciones = false;
    menu_parametros = false;
    menu_horarios = true;
    menuHorarios();
  } else if (key && menu_horarios == true && horario == false) {

    //sólo lee caracteres numéricos
    if (key >= '0' && key <= '9') {
      horario = true;
      indiceHorario = key;
      horarioActual(key);
    }

    //si se está introduciendo un horario, que se muestre
  } else if (key && menu_horarios == true && horario == true) {

    // Leer la hora, los minutos y el intervalo del teclado.sólo lee caracteres numéricos
    if (key >= '0' && key <= '9') {
      valorHorario = valorHorario + String(key);
      tiempoIntroducido(indiceHorario, valorHorario);
    }

    //si pulsamos A en el menu principal, cargamos los parametros a la nube, el esp32 y a la app movil
  } else if (key == 'A') {

    /*Serial.println(key);
    menuUpload();
    menu_principal = false;
    key = '*';*/
  }
}
