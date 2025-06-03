import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { baseImgURL } from '../backend/baseData';

const FollowPopup = ({ 
  visible, 
  onClose, 
  onConfirm, 
  pageData, 
  isFollowing, 
  loading = false 
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.pageInfo}>
              <Image
                source={{ uri: `${baseImgURL + pageData?.icon}` }}
                style={styles.pageIcon}
              />
              <View style={styles.pageTextContainer}>
                <Text style={styles.pageTitle} numberOfLines={2}>
                  {pageData?.title || 'Page'}
                </Text>
                <Text style={styles.pageType}>
                  {pageData?.type || 'Page'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Action Section */}
          <View style={styles.actionSection}>
            <MaterialIcons 
              name={isFollowing ? "person-remove" : "person-add"} 
              size={hp(6)} 
              color={isFollowing ? "#FF6B6B" : "#4ECDC4"} 
            />
            
            <Text style={styles.actionTitle}>
              {isFollowing ? 'Unfollow Page?' : 'Follow Page?'}
            </Text>
            
            <Text style={styles.actionDescription}>
              {isFollowing 
                ? `You will stop seeing posts and updates from ${pageData?.title} in your buzz wall.`
                : `You will see posts, challenges, and updates from ${pageData?.title} in your buzz wall.`
              }
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.confirmButton,
                { backgroundColor: isFollowing ? "#FF6B6B" : "#4ECDC4" }
              ]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons 
                    name={isFollowing ? "person-remove" : "person-add"} 
                    size={18} 
                    color="white" 
                  />
                  <Text style={styles.confirmButtonText}>
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8),
  },
  popup: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: wp(85),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pageIcon: {
    width: hp(6),
    height: hp(6),
    borderRadius: hp(3),
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  pageTextContainer: {
    marginLeft: wp(3),
    flex: 1,
  },
  pageTitle: {
    fontFamily: 'raleway-bold',
    fontSize: hp(2.2),
    color: '#333',
    lineHeight: hp(2.6),
  },
  pageType: {
    fontFamily: 'raleway',
    fontSize: hp(1.6),
    color: '#666',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  actionSection: {
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
  },
  actionTitle: {
    fontFamily: 'raleway-bold',
    fontSize: hp(2.4),
    color: '#333',
    marginTop: hp(1.5),
    marginBottom: hp(1),
  },
  actionDescription: {
    fontFamily: 'raleway',
    fontSize: hp(1.7),
    color: '#666',
    textAlign: 'center',
    lineHeight: hp(2.2),
    paddingHorizontal: wp(2),
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingBottom: hp(2.5),
    gap: wp(3),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: hp(1.8),
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: 'raleway-bold',
    fontSize: hp(1.8),
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: hp(1.8),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  confirmButtonText: {
    fontFamily: 'raleway-bold',
    fontSize: hp(1.8),
    color: 'white',
  },
});

export default FollowPopup;