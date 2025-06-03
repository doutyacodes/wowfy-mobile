import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import React from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { baseImgURL } from "../backend/baseData";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const TaskHomeCard = ({ item }) => {
  const navigation = useNavigation();
  const formattedDate = moment(item.start_date).fromNow();
  
  // Determine the status based on task properties
  const isPending = item.pending_task == "yes" || 
                    item.frequency == "food" || 
                    item.frequency == "experience";
  
  const statusValue = isPending ? "Continue" : "Pending";
  const statusColor = isPending ? "#4f46e5" : "#9ca3af"; // Indigo for active, gray for pending
  
  // Determine badge color based on task type/frequency
  const getBadgeColor = () => {
    if (item.frequency == "food") return ["#10b981", "#059669"]; // Green
    if (item.frequency == "experience") return ["#8b5cf6", "#7c3aed"]; // Purple
    if (item.frequency == "bootcamp") return ["#ef4444", "#dc2626"]; // Red
    if (item.frequency == "challenges") return ["#f59e0b", "#d97706"]; // Amber
    return ["#3b82f6", "#2563eb"]; // Default blue
  };

  const handleDetails = () => {
    if (statusValue == "Continue") {
      if (item.frequency == "food" || item.frequency == "experience") {
        navigation.navigate("FoodLocation", {
          challenge: {
            challenge_id: item.challenge_id,
            page_id: item.page_id,
            title: item.challenge_title,
            description: item.description,
            entry_points: item.entry_points,
            reward_points: item.reward_points,
          },
          type: item.frequency,
        });
      } else {
        console.log("item",item)
        navigation.navigate("ChallengesList", {
          challenge: item.challenge,
          selectedMovie: item.selectedMovie,
        });
      }
    }
  };

  // Returns appropriate icon based on task type
  const getTypeIcon = () => {
    if (item.frequency == "food") return "restaurant-outline";
    if (item.frequency == "experience") return "glasses-outline";
    if (item.frequency == "bootcamp") return "fitness-outline";
    if (item.frequency == "challenges") return "trophy-outline";
    return "checkmark-circle-outline";
  };

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        statusValue == "Continue" && styles.availableCard
      ]}
      onPress={handleDetails}
      activeOpacity={0.9}
      disabled={statusValue !== "Continue"}
    >
      {/* Card Header with Event Brand */}
      <View style={styles.cardHeader}>
        <View style={styles.brandContainer}>
          <Image
            source={{ uri: `${baseImgURL + item.selectedMovie.image}` }}
            style={[
              styles.brandImage,
              { opacity: statusValue == "Continue" ? 1 : 0.5 }
            ]}
          />
          <View>
            <Text style={styles.brandName}>{item.selectedMovie.title}</Text>
            <Text style={styles.timestamp}>{formattedDate}</Text>
          </View>
        </View>
        
        {/* Status Badge */}
        <LinearGradient
          colors={getBadgeColor()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.badgeContainer}
        >
          <Ionicons name={getTypeIcon()} size={hp(1.5)} color="white" />
          <Text style={styles.badgeText}>
            {item.frequency == "food" ? "Food" : 
             item.frequency == "experience" ? "Experience" :
             item.frequency == "bootcamp" ? "Bootcamp" :
             item.frequency == "challenges" ? "Challenge" : "Task"}
          </Text>
        </LinearGradient>
      </View>

      {/* Task Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: `${baseImgURL + item.image}` }}
          style={[
            styles.taskImage,
            { opacity: statusValue == "Continue" ? 1 : 0.5 }
          ]}
          resizeMode="cover"
        />
        
        {/* Task Status Overlay */}
        {statusValue !== "Continue" ? (
          <View style={styles.statusOverlay}>
            <Ionicons name="lock-closed" size={hp(3)} color="white" />
            <Text style={styles.statusOverlayText}>Pending</Text>
          </View>
        ) : (
          <View style={styles.continueOverlay}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={hp(2.5)} color="white" />
            </View>
            <Text style={styles.continueOverlayText}>Tap to Continue</Text>
          </View>
        )}
        
        {/* Pulsing indicator for available tasks */}
        {statusValue == "Continue" && (
          <View style={styles.pulseContainer}>
            <View style={[styles.pulseRing, styles.pulseRing1]} />
            <View style={[styles.pulseRing, styles.pulseRing2]} />
            <View style={styles.pulseCenter} />
          </View>
        )}
      </View>

      {/* Task Details */}
      <View style={styles.detailsContainer}>
        <View>
          <Text style={styles.taskName} numberOfLines={1}>
            {item.task_name}
          </Text>
          <Text style={styles.challengeTitle} numberOfLines={1}>
            {item.challenge_title}
          </Text>
        </View>

        {/* Task Metadata */}
        <View style={styles.metadataContainer}>
          <View style={styles.metadataItem}>
            <Ionicons name="ticket-outline" size={hp(1.8)} color="#6b7280" />
            <Text style={styles.metadataLabel}>Entry</Text>
            <Text style={styles.metadataValue}>
              {item.entry_points == 0 ? "Free" : `${item.entry_points} pts`}
            </Text>
          </View>
          
          <View style={styles.metadataDivider} />
          
          <View style={styles.metadataItem}>
            <Ionicons name="star-outline" size={hp(1.8)} color="#6b7280" />
            <Text style={styles.metadataLabel}>Reward</Text>
            <Text style={styles.metadataValue}>
              {item.reward_points == 0 ? "None" : `${item.reward_points} pts`}
            </Text>
          </View>
          
          <View style={styles.metadataDivider} />
          
          <View style={styles.metadataItem}>
            <Ionicons 
              name={statusValue == "Continue" ? "checkmark-circle" : "time-outline"} 
              size={hp(1.8)} 
              color={statusColor} 
            />
            <Text style={[styles.metadataLabel, { color: statusColor }]}>Status</Text>
            <Text style={[
              styles.metadataValue, 
              { 
                color: statusColor, 
                fontWeight: '600',
                textTransform: statusValue == "Continue" ? 'uppercase' : 'none'
              }
            ]}>
              {statusValue == "Continue" ? "Ready" : "Locked"}
            </Text>
          </View>
        </View>
      </View>
      
      {statusValue == "Continue" ? (
        <LinearGradient
          colors={['#4f46e5', '#4338ca']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.continueButton}
        >
          <Ionicons name="play-circle" size={hp(2)} color="white" />
          <Text style={styles.continueButtonText}>Continue Task</Text>
          <Ionicons name="arrow-forward" size={hp(1.8)} color="white" />
        </LinearGradient>
      ) : (
        <View style={styles.lockedButton}>
          <Ionicons name="lock-closed" size={hp(1.8)} color="#9ca3af" />
          <Text style={styles.lockedButtonText}>Task Locked</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: hp(1),
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  availableCard: {
    borderColor: "#4f46e5",
    borderWidth: 2,
    shadowColor: "#4f46e5",
    shadowOpacity: 0.2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2.5),
  },
  brandImage: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  brandName: {
    fontSize: hp(1.6),
    fontFamily: "raleway-bold",
    color: "#1f2937",
  },
  timestamp: {
    fontSize: hp(1.3),
    fontFamily: "raleway",
    color: "#9ca3af",
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: hp(2),
    gap: wp(1),
  },
  badgeText: {
    color: "white",
    fontSize: hp(1.3),
    fontFamily: "raleway-semibold",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: hp(18),
  },
  taskImage: {
    width: "100%",
    height: "100%",
  },
  statusOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    gap: hp(1),
  },
  statusOverlayText: {
    color: "white",
    fontSize: hp(2),
    fontFamily: "raleway-bold",
  },
  continueOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(79, 70, 229, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    gap: hp(1),
  },
  playButton: {
    backgroundColor: "rgba(79, 70, 229, 0.9)",
    borderRadius: wp(8),
    width: wp(16),
    height: wp(16),
    justifyContent: "center",
    alignItems: "center",
  },
  continueOverlayText: {
    color: "white",
    fontSize: hp(1.8),
    fontFamily: "raleway-bold",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pulseContainer: {
    position: "absolute",
    top: hp(1),
    right: wp(3),
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    borderRadius: wp(3),
    borderWidth: 2,
    borderColor: "#4f46e5",
  },
  pulseRing1: {
    width: wp(6),
    height: wp(6),
    opacity: 0.6,
  },
  pulseRing2: {
    width: wp(4),
    height: wp(4),
    opacity: 0.8,
  },
  pulseCenter: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: "#4f46e5",
  },
  detailsContainer: {
    padding: wp(4),
  },
  taskName: {
    fontSize: hp(2),
    fontFamily: "raleway-bold",
    color: "#111827",
    marginBottom: hp(0.3),
  },
  challengeTitle: {
    fontSize: hp(1.5),
    fontFamily: "raleway-semibold",
    color: "#4b5563",
    marginBottom: hp(1.5),
  },
  metadataContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp(1),
    paddingTop: hp(1.5),
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  metadataItem: {
    alignItems: "center",
    flex: 1,
  },
  metadataDivider: {
    width: 1,
    height: hp(4),
    backgroundColor: "#f3f4f6",
  },
  metadataLabel: {
    fontSize: hp(1.3),
    fontFamily: "raleway",
    color: "#6b7280",
    marginTop: hp(0.3),
  },
  metadataValue: {
    fontSize: hp(1.4),
    fontFamily: "raleway-semibold",
    color: "#374151",
    marginTop: hp(0.3),
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(1.5),
    gap: wp(2),
  },
  continueButtonText: {
    color: "white",
    fontSize: hp(1.6),
    fontFamily: "raleway-bold",
  },
  lockedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(1.5),
    backgroundColor: "#f9fafb",
    gap: wp(2),
  },
  lockedButtonText: {
    color: "#9ca3af",
    fontSize: hp(1.6),
    fontFamily: "raleway-bold",
  },
});

export default TaskHomeCard;