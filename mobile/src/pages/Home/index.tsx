import React, { useState, useEffect, ChangeEvent } from "react";
import { Feather as Icon } from "@expo/vector-icons";
import { View, Image, StyleSheet, Text, ImageBackground } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import axios from "axios";

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const Home = () => {
  const [ufs, setUfs] = useState<string[]>([]);
  const [selectedUf, setSelectedUF] = useState<string>("");
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const navigation = useNavigation();

  const handleNavigatePoints = () => {
    navigation.navigate("Points", { city: selectedCity, uf: selectedUf });
  };

  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
      )
      .then((response) => {
        const ufs = response.data.map((uf) => uf.sigla);
        setUfs(ufs);
      });
  }, []);

  useEffect(() => {
    if (selectedUf === "0") {
      setCities([]);
      return;
    }
    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then((response) => {
        const cities = response.data.map((city) => city.nome);
        setCities(cities);
      });
  }, [selectedUf]);

  function handleSelectedUF(event: string) {
    setSelectedUF(event);
  }

  function handleSelectedCity(event: string) {
    setSelectedCity(event);
  }

  return (
    <ImageBackground
      source={require("../../assets/home-background.png")}
      style={styles.container}
      imageStyle={{ width: 274, height: 368 }}
    >
      <View style={styles.main}>
        <View>
          <Image source={require("../../assets/logo.png")} />
          <Text style={styles.title}>
            Seu marketplace de coleta de resíduos
          </Text>
          <Text style={styles.description}>
            Ajudamos pessoas a encontratem pontos de coleta de forma eficiente.
          </Text>
        </View>
      </View>

      <View>
        <RNPickerSelect
          onValueChange={handleSelectedUF}
          items={ufs.map((uf) => ({ label: uf, value: uf }))}
        />
        <RNPickerSelect
          onValueChange={handleSelectedCity}
          items={cities.map((city) => ({ label: city, value: city }))}
        />
      </View>

      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleNavigatePoints}>
          <View style={styles.buttonIcon}>
            <Text>
              <Icon name="arrow-right" color="#FFF" size={24} />
            </Text>
          </View>
          <Text style={styles.buttonText}>Entrar</Text>
        </RectButton>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    color: "#322153",
    fontSize: 32,
    fontFamily: "Ubuntu_700Bold",
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: "#6C6C80",
    fontSize: 16,
    marginTop: 16,
    fontFamily: "Roboto_400Regular",
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#34CB79",
    height: 60,
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    flex: 1,
    justifyContent: "center",
    textAlign: "center",
    color: "#FFF",
    fontFamily: "Roboto_500Medium",
    fontSize: 16,
  },
});

export default Home;
