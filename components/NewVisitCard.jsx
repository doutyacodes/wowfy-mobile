import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { 
  Image, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  Animated,
  Platform
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { baseImgURL } from "../backend/baseData";
import { Ionicons } from "@expo/vector-icons";

const NewVisitCard = ({ selectedMovie, challenge }) => {
  const [completedData, setCompletedData] = useState(false);
  const navigation = useNavigation();
  
  // Animation value for card press feedback
  const scaleAnim = new Animated.Value(1);
  
  // Handle card press animation
  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };
  
  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    // Set completed status
    if (challenge.completed == "true") {
      setCompletedData(true);
    }
  }, [challenge]);
  
  // Handle card press
  const handlePress = () => {
    if (!completedData) {
      navigation.navigate("ChallengeDetails", {
        pageId: challenge.page_id,
        challenge: challenge,
        selectedMovie: selectedMovie,
      });
    }
  };

  // Truncate title text
  const truncatedTitle = challenge.title?.length > 12
    ? challenge.title.slice(0, 12) + "..."
    : challenge.title;

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.cardContainer,
        { transform: [{ scale: scaleAnim }] },
        completedData && styles.completedCard
      ]}>
        <TouchableOpacity
          style={styles.touchableArea}
          onPress={handlePress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.9}
          disabled={completedData}
        >
          <View style={styles.contentWrapper}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: `${baseImgURL + challenge.image}` }}
                style={styles.challengeImage}
                resizeMode="cover"
              />
              
              {/* Completion badge overlay */}
              {completedData && challenge.finished == "true" && (
                <View style={styles.badgeOverlay}>
                  <Image
                    source={require("../assets/images/badge.png")}
                    style={styles.badgeImage}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>
            
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>
                {truncatedTitle}
              </Text>
              
              {/* Completion indicator */}
              {completedData && (
                <View style={styles.completedIndicator}>
                  <Ionicons name="checkmark-circle" size={hp(2)} color="#4CAF50" />
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default NewVisitCard;

const styles = StyleSheet.create({
  container: {
    padding: 5,
    borderRadius: 10,
  },
  cardContainer: {
    flex: 1,
  },
  completedCard: {
    opacity: 0.75,
  },
  touchableArea: {
    flex: 1,
  },
  contentWrapper: {
    padding: 5,
    gap: 10,
  },
  imageContainer: {
    position: 'relative',
  },
  challengeImage: {
    width: wp(28),
    minHeight: wp(28),
    borderRadius: 15,
    borderColor: "lightgray",
    borderWidth: 1,
  },
  badgeOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
  badgeImage: {
    width: wp(8),
    height: wp(8),
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    flex: 1,
  },
  titleText: {
    fontSize: hp(1.9),
    fontFamily: "raleway-semibold",
    textAlign: "center",
    flex: 1,
  },
  completedIndicator: {
    // Optional: add any specific styling for the completion indicator
  },
});