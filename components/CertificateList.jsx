import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useState, useRef } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Pressable,
  Platform,
} from "react-native";
import AwesomeAlert from "react-native-awesome-alerts";
import { LinearGradient } from "expo-linear-gradient";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import { baseImgURL, baseURL, baseVidUrl } from "../backend/baseData";
import CertificateCard from "./CertificateCard";
import FollowPopup from "./FollowPopup";

const CertificateList = ({ item, user_id, user, onFollowUpdate, singleData = null }) => {
  const [heartActive, setHeartActive] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [count, setCount] = useState(parseInt(item.like_count || 0));
  const [selectedMovie, setSelectedMovie] = useState([]);
  const [visitingPageId, setVisitingPageId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [challenge, setChallenge] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFollowPopup, setShowFollowPopup] = useState(false);
  const [isFollowing, setIsFollowing] = useState(item.is_following || false);
  const [followLoading, setFollowLoading] = useState(false);
  
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const likeScale = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Animation on mount
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Load data
    const fetchData = async () => {
      try {
        if (!user_id || !item.page_id) return;
        
        setIsLoading(true);
        
        // Fetch like status
        const likeResponse = await axios.get(
          `${baseURL}/checkAlreadyLiked.php?challenge_id=${item.challenge_id}&people_data_id=${item.people_data_id}&user_id=${user_id}`
        );
        
        if (likeResponse.status == 200) {
          setHeartActive(likeResponse.data.liked == "yes");
          setVisitingPageId(likeResponse.data.user_pageId);
        }
        
        // Fetch movie data
        const movieResponse = await axios.get(
          `${baseURL}/getOneChallenge.php?id=${item.page_id}&userId=${user_id}`
        );
        
        if (movieResponse.status == 200) {
          setSelectedMovie(movieResponse.data);
        }
        
        // Fetch challenge data
        const challengeResponse = await axios.get(
          `${baseURL}/getChallengeOne.php?challenge_id=${item.challenge_id}&user_id=${user_id}`
        );
        
        if (challengeResponse.status == 200) {
          setChallenge(challengeResponse.data);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user_id, item.page_id]);

  const handleFollowPress = () => {
    setShowFollowPopup(true);
  };

  const toggleFollow = async () => {
    if (!user?.id) return;
    
    setFollowLoading(true);
    try {
      const response = await axios.get(
        `${baseURL}/event-Follow.php?page_id=${item.page_id}&userId=${user.id}`
      );
      
      if (response.status === 200) {
        const newFollowStatus = !isFollowing;
        setIsFollowing(newFollowStatus);
        
        // Update the parent component about the follow status change
        if (onFollowUpdate) {
          onFollowUpdate(item.page_id, newFollowStatus);
        }
        
        Toast.show({
          type: "success",
          text1: newFollowStatus ? "Followed!" : "Unfollowed!",
          text2: newFollowStatus 
            ? `You are now following ${item.page_title}` 
            : `You unfollowed ${item.page_title}`,
        });
      }
    } catch (error) {
      console.error("Error while following:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not update follow status. Please try again.",
      });
    } finally {
      setFollowLoading(false);
      setShowFollowPopup(false);
    }
  };

  const hideAlertFunction = () => {
    setShowAlert(false);
  };
  
  const handleReport = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/report-media.php?challenge_id=${item.challenge_id}&people_data_id=${item.people_data_id}&user_id=${user_id}`
      );

      if (response.status == 200) {
        Toast.show({
          type: "success",
          text1: "Report Submitted",
          text2: "Thank you for your feedback",
        });
      }
    } catch (error) {
      console.error("Error while reporting media:", error.message);
      Toast.show({
        type: "error",
        text1: "Failed to Report",
        text2: "Please try again later",
      });
    }
    setShowAlert(false);
  };
  
  const handleHeart = async () => {
    // Animate heart press
    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(likeScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    try {
      const response = await axios.get(
        `${baseURL}/toggle-like.php?challenge_id=${item.challenge_id}&people_data_id=${item.people_data_id}&user_id=${user_id}&task_id=${item.task_id}&owner=${item.user_id}`
      );

      if (response.status == 200) {
        if (heartActive) {
          setCount(count - 1);
        } else {
          setCount(count + 1);
        }
        setHeartActive(!heartActive);
      }
    } catch (error) {
      console.error("Error while toggling likes:", error.message);
    }
  };
  
  const handleNavigation = () => {
    if (item.complete == "yes") {
      Toast.show({
        type: "info",
        text1: "Challenge Expired",
        text2: "This challenge is no longer available",
      });
    } else {
      navigation.navigate("ChallengeDetails", {
        pageId: item.page_id,
        challenge: challenge,
        selectedMovie: selectedMovie,
      });
    }
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const truncateText = (text, limit) => {
    if (!text) return '';
    if (text?.length <= limit) return text;
    return `${text.slice(0, limit).trim()}...`;
  };

  const pageData = {
    title: item.page_title,
    icon: item.icon,
    type: item.page_type || 'Page'
  };

  return (
    <Animated.View style={[
      styles.cardWrapper,
      {
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
      }
    ]}>
      <View style={styles.card}>
        {/* Card Header - User Info */}
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={styles.userInfoContainer}
            onPress={() => {
              navigation.navigate("OtherUserScreen", {
                user_id: item.user_id,
              });
            }}
          >
            {item.user_image?.length > 0 ? (
              <Image
                style={styles.userAvatar}
                source={{ uri: `${baseImgURL + item.user_image}` }}
              />
            ) : (
              <View style={styles.defaultAvatar}>
                <Text style={styles.avatarText}>
                  {item.first_character || "U"}
                </Text>
              </View>
            )}
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <View style={styles.metadataRow}>
                <Text style={styles.postDate}>{item.date}</Text>
                {/* Status indicators */}
                <View style={styles.statusContainer}>
                  {item.is_now && (
                    <View style={styles.nowBadge}>
                      <MaterialIcons name="location-on" size={10} color="white" />
                      <Text style={styles.nowText}>Now</Text>
                    </View>
                  )}
                  
                  {isFollowing ? (
                    <TouchableOpacity 
                      style={styles.followingBadge}
                      onPress={handleFollowPress}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name="check-circle" size={10} color="white" />
                      <Text style={styles.followingText}>Following</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={styles.followBadge}
                      onPress={handleFollowPress}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name="add-circle-outline" size={10} color="#4ECDC4" />
                      <Text style={styles.followText}>Follow</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setVisible(!visible)}
          >
            <MaterialIcons name="more-vert" size={22} color="#6b7280" />
          </TouchableOpacity>
          
          {visible && (
            <View style={styles.menuDropdown}>
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setVisible(false);
                  setShowAlert(true);
                }}
              >
                <Ionicons name="flag-outline" size={16} color="#ef4444" />
                <Text style={styles.menuItemText}>Report Content</Text>
              </Pressable>
            </View>
          )}
        </View>
        
        {/* Achievement Context */}
        <View style={styles.achievementContainer}>
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.1)', 'rgba(99, 102, 241, 0.05)']}
            style={styles.achievementBanner}
          >
            <MaterialCommunityIcons name="trophy-award" size={16} color="#6366f1" />
            <Text style={styles.achievementText}>
              Completed the <Text style={styles.challengeTitle}>{truncateText(item.challenge_title, 20)}</Text> challenge
            </Text>
          </LinearGradient>
        </View>
        
        {/* Certificate Content Area */}
        <View style={styles.certificateContainer}>
          {item.image2?.length > 0 ? (
            // Use ScrollView only when there are multiple items
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.certificateWrapper}>
                <CertificateCard item={item} />
              </View>
              
              <View style={styles.mediaWrapper}>
                {item.mediaType == "video" ? (
                  <Video
                    source={{ uri: `${baseVidUrl + item.image2}` }}
                    style={styles.videoMedia}
                    resizeMode={ResizeMode.COVER}
                    useNativeControls
                  />
                ) : (
                  <Image
                    style={styles.imageMedia}
                    source={{ uri: `${baseImgURL + item.image2}` }}
                  />
                )}
              </View>
            </ScrollView>
          ) : (
            // When there's only the certificate card, don't use ScrollView
            <View style={styles.certificateSingleContainer}>
              <View style={{width: wp(90)}}>
                <CertificateCard item={item} />
              </View>
            </View>
          )}
        </View>
        
        {/* Page/Challenge Information */}
        <TouchableOpacity
          style={styles.pageContainer}
          onPress={handleNavigation}
        >
          <Image
            source={{ uri: `${baseImgURL + item.icon}` }}
            style={styles.pageIcon}
          />
          
          <View style={styles.pageInfo}>
            <Text style={styles.pageName}>
              {truncateText(item.page_title, 25)}
            </Text>
            <Text style={styles.challengeName}>
              {truncateText(item.challenge_title, 25)}
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Interaction Section */}
        <View style={styles.interactionContainer}>
          <TouchableOpacity
            style={styles.interactionButton}
            onPress={handleHeart}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              {heartActive ? (
                <Ionicons name="heart" size={22} color="#ef4444" />
              ) : (
                <Ionicons name="heart-outline" size={22} color="#6b7280" />
              )}
            </Animated.View>
            <Text style={[
              styles.interactionText,
              heartActive && styles.activeInteractionText
            ]}>
              {count > 0 ? count : ''} {count == 1 ? 'Like' : 'Likes'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.interactionButton}
            onPress={() =>
              navigation.navigate("CommentPeople", {
                user_id: user_id,
                item: item,
              })
            }
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
            <Text style={styles.interactionText}>
              {item.comment_count > 0 ? item.comment_count : ''} {item.comment_count == 1 ? 'Comment' : 'Comments'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Follow Popup */}
      <FollowPopup
        visible={showFollowPopup}
        onClose={() => setShowFollowPopup(false)}
        onConfirm={toggleFollow}
        pageData={pageData}
        isFollowing={isFollowing}
        loading={followLoading}
      />
      
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title="Report Content"
        message="Are you sure you want to report this content? This action cannot be undone."
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="Cancel"
        confirmText="Report"
        confirmButtonColor="#ef4444"
        onCancelPressed={hideAlertFunction}
        onConfirmPressed={handleReport}
        titleStyle={styles.alertTitle}
        messageStyle={styles.alertMessage}
        cancelButtonTextStyle={styles.alertCancelText}
        confirmButtonTextStyle={styles.alertConfirmText}
      />
    </Animated.View>
  );
};

export default CertificateList;

const styles = StyleSheet.create({
  cardWrapper: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    marginHorizontal: wp(1),
    borderRadius: 12,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: hp(5),
    height: hp(5),
    borderRadius: hp(2.5),
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  defaultAvatar: {
    width: hp(5),
    height: hp(5),
    borderRadius: hp(2.5),
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: "raleway-bold",
    color: "white",
    fontSize: hp(1.8),
  },
  userInfo: {
    marginLeft: wp(2.5),
    flex: 1,
  },
  userName: {
    fontSize: hp(1.8),
    fontFamily: "raleway-bold",
    color: "#111827",
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  postDate: {
    fontSize: hp(1.5),
    fontFamily: "raleway",
    color: "#6b7280",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nowBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF5722",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
    shadowColor: "#FF5722",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  nowText: {
    fontFamily: "raleway-bold",
    fontSize: hp(1.1),
    color: "white",
  },
  followingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  followingText: {
    fontFamily: "raleway-bold",
    fontSize: hp(1.1),
    color: "white",
  },
  followBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#4ECDC4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  followText: {
    fontFamily: "raleway-bold",
    fontSize: hp(1.1),
    color: "#4ECDC4",
  },
  menuButton: {
    width: hp(4),
    height: hp(4),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: hp(2),
  },
  menuDropdown: {
    position: "absolute",
    top: hp(6),
    right: wp(4),
    backgroundColor: "white",
    borderRadius: 8,
    padding: wp(2),
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
  },
  menuItemText: {
    marginLeft: wp(2),
    fontSize: hp(1.6),
    fontFamily: "raleway",
    color: "#374151",
  },
  achievementContainer: {
    paddingHorizontal: wp(4),
    marginBottom: hp(1.5),
  },
  achievementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: 8,
  },
  achievementText: {
    marginLeft: wp(2),
    fontSize: hp(1.6),
    fontFamily: "raleway",
    color: "#4b5563",
  },
  challengeTitle: {
    fontFamily: "raleway-bold",
    color: "#6366f1",
  },
  certificateContainer: {
    marginBottom: hp(2),
  },
  scrollContent: {
    paddingHorizontal: wp(4),
  },
  certificateWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
    width: wp(90),
  },
  certificateSingleContainer: {
    paddingHorizontal: wp(4),
    width: '100%',
    alignItems: 'center',
  },
  mediaWrapper: {
    marginLeft: wp(3),
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoMedia: {
    width: wp(60),
    height: wp(60),
    borderRadius: 8,
  },
  imageMedia: {
    width: wp(60),
    height: wp(60),
    borderRadius: 8,
  },
  pageContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
  },
  pageIcon: {
    width: hp(4),
    height: hp(4),
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pageInfo: {
    marginLeft: wp(2),
  },
  pageName: {
    fontSize: hp(1.6),
    fontFamily: "raleway-bold",
    color: "#111827",
  },
  challengeName: {
    fontSize: hp(1.5),
    fontFamily: "raleway",
    color: "#6b7280",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginBottom: hp(1.5),
  },
  interactionContainer: {
    flexDirection: "row",
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  interactionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: wp(6),
  },
  interactionText: {
    marginLeft: wp(1.5),
    fontSize: hp(1.5),
    fontFamily: "raleway",
    color: "#6b7280",
  },
  activeInteractionText: {
    color: "#ef4444",
  },
  alertTitle: {
    fontFamily: "raleway-bold",
    fontSize: hp(2),
    color: "#111827",
  },
  alertMessage: {
    fontFamily: "raleway",
    fontSize: hp(1.7),
    color: "#4b5563",
    textAlign: "center",
  },
  alertCancelText: {
    fontFamily: "raleway-bold",
    fontSize: hp(1.7),
  },
  alertConfirmText: {
    fontFamily: "raleway-bold",
    fontSize: hp(1.7),
  },
});