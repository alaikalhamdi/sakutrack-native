import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';
import { ShareableCardView } from './ShareableCardView';

interface ShareProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ShareProfileModal: React.FC<ShareProfileModalProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { profile } = useData();
  const cardRef = useRef<View>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const publicUrl = `https://sakutrack.app/p/${profile.username || 'student'}`;

  const handleShareStory = async () => {
    try {
      setIsExporting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (cardRef.current) {
        const uri = await captureRef(cardRef.current, {
          format: 'png',
          quality: 1.0,
        });

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share your SakuTrack Student Profile Card',
          });
        }
      }
    } catch {
      // ignore
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(publicUrl);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View
            style={[
              styles.container,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius,
              },
            ]}
          >
            <View style={styles.header}>
              <View>
                <Text
                  style={[
                    styles.title,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.fontStyle === 'mono' ? 'Courier' : undefined,
                    },
                  ]}
                >
                  Share Student Profile 🚀
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  Flex your savings goals & financial health badge
                </Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: theme.colors.surfaceSubtle }]}
              >
                <Ionicons name="close" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
              {/* Shareable Card Target */}
              <View ref={cardRef} collapsable={false} style={styles.cardWrapper}>
                <ShareableCardView />
              </View>

              {/* Public Link Box */}
              <View
                style={[
                  styles.linkBox,
                  {
                    backgroundColor: theme.colors.surfaceSubtle,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={styles.linkInfo}>
                  <Ionicons name="globe-outline" size={16} color={theme.colors.primary} />
                  <Text
                    numberOfLines={1}
                    style={[styles.linkText, { color: theme.colors.text }]}
                  >
                    {publicUrl}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleCopyLink}
                  style={[styles.copyBtn, { backgroundColor: theme.colors.primaryLight }]}
                >
                  <Text style={[styles.copyBtnText, { color: theme.colors.primary }]}>
                    {copiedLink ? 'Copied! ✓' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
              <Button
                title={isExporting ? 'Generating Graphic...' : 'Export & Share to Story 📸'}
                onPress={handleShareStory}
                loading={isExporting}
                size="lg"
              />
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  router.push(`/p/${profile.username || 'student'}` as any);
                }}
                style={styles.previewBtn}
              >
                <Ionicons name="globe-outline" size={16} color={theme.colors.primary} />
                <Text style={[styles.previewBtnText, { color: theme.colors.primary }]}>
                  View Public Web Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '92%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    maxHeight: 520,
  },
  cardWrapper: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 12,
  },
  linkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '600',
  },
  copyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    paddingVertical: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  previewBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
