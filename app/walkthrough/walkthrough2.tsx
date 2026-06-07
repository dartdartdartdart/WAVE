import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
  
  import { router } from "expo-router";

  import {
  Roboto_400Regular,
  Roboto_700Bold,
  useFonts,
} from "@expo-google-fonts/roboto";



  
  export default function Walkthrough() {

    const[fontsLoaded] = useFonts({
        Roboto_700Bold,
        Roboto_400Regular,
        });
        if(!fontsLoaded){  
            return null;
        }

    return (
      <View style={styles.container}>
  
        <View style={styles.header_container}>
          <Text style={styles.header_title}>
            WELCOME TO
          </Text>
  
          <Text style={styles.wave}>
            W.A.V.E
          </Text>
        </View>
  
        <View style={styles.logoPlaceholder}>
  <Image
    source={require("../../assets/images/collaboration.png")}
    style={styles.logoImage}
    resizeMode="contain"
  />
</View>
  
        <View style={styles.bottom_container}>
  
          <Text style={styles.bottom_title_text}>
          Smart Route Analysis
          </Text>
  
          <Text style={styles.bottom_description}>
          W.A.V.E. compares water depth with your vehicle’s 
          limits to find the safest possible route.
          </Text>
  
        </View>
  
        <TouchableOpacity
  style={styles.button}
  onPress={() => router.push("/walkthrough/walkthrough3")}
>
  <Text style={styles.buttonText}>
    NEXT
  </Text>
</TouchableOpacity>

<View style={styles.navigationRow}>

  <TouchableOpacity
    onPress={() => router.back()}
  >
    <Text style={styles.navText}>
      Prev
    </Text>
  </TouchableOpacity>

  <View style={styles.paginationContainer}>
    <View style={styles.dot} />
    <View style={styles.activeDot} />
    <View style={styles.dot} />
  </View>

  <TouchableOpacity
    onPress={() => router.push("/walkthrough/walkthrough3")}
  >
    <Text style={styles.navText}>
      Next
    </Text>
  </TouchableOpacity>

</View>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F5F1EA",
      alignItems: "center",
    },
  
    header_container: {
      marginTop: 50,
      alignItems: "center",
    },
  
    bottom_container: {
      marginTop: 30,
      alignItems: "center",
      paddingHorizontal: 30,
    },
  
    bottom_title_text: {
      fontSize: 34,
      fontFamily: "Roboto_700Bold",
      color: "#2F2F2F",
      marginBottom: 15,
      textAlign: "center",
    },
  
    bottom_description: {
      fontSize: 14,
      textAlign: "center",
      color: "#555",
      lineHeight: 28,
      fontFamily: "Roboto_400Regular",
    },
  
    header_title: {
      fontSize: 38,
      fontFamily: "Roboto_700Bold",
      color: "#000",
      lineHeight: 45,
    },
  
    wave: {
      fontSize: 44,
      fontWeight: "800",
      color: "#000",
      lineHeight: 45,
    },
    logoImage: {
        width: "100%",
        height: "100%",
      },
    button: {
      backgroundColor: "#22bcde",
      paddingVertical: 16,
      paddingHorizontal: 80,
      borderRadius: 12,
      marginTop: 5,
    },
  
    buttonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
    },
  
    logoPlaceholder: {
        marginTop: 50,
        width: 280,
        height: 250,
      
        justifyContent: "center",
        alignItems: "center",
      },
  
    logoText: {
      fontSize: 20,
      fontWeight: "600",
      color: "#2F4A3E",
    },
    paginationContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#D3D3D3",
      marginHorizontal: 4,
    },
    
    activeDot: {
      width: 30,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#1E2947",
      marginHorizontal: 4,
    },
    
    navigationRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "85%",
      marginTop: 25,
    },
    
    navText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FF6B81",
    },
    
    disabledText: {
      color: "#CFCFCF",
    },
  });