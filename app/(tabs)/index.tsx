import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from '../../constants/Config';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';

function formatDateLabel(dateStr: string) {
  const msgDate = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(msgDate, today)) return 'Today';
  if (isSameDay(msgDate, yesterday)) return 'Yesterday';

  return msgDate.toLocaleDateString();
}

export default function ChatbotWidget() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hi! I\'m MomWise – your pregnancy assistant 🤰. Ask me about food, pain, or health.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [language, setLanguage] = useState('en');
  const [isChatVisible, setChatVisible] = useState(false);
  const [isTyping, setTyping] = useState(false);
  const [showCallOption, setShowCallOption] = useState(false);
  const [doctorsVisible, setDoctorsVisible] = useState(false);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const handleSend = async (audioBase64?: string) => {
    if (!input.trim() && !audioBase64) {
      console.warn('No input or audio provided.');
      return;
    }
    

    const now = new Date();
    const timestamp = now.toISOString();

    if (input) {
      const userMessage = { sender: 'user', text: input, timestamp };
      setMessages(prev => [...prev, userMessage]);
    } else if (audioBase64) {
      setMessages(prev => [...prev, { sender: 'user', text: '[🎤 Voice message sent]', timestamp }]);
    }
    

    setTyping(true);

    try {
      const res = await axios.post(`${BACKEND_URL}/sendMessage`, {
        message: input,
        language,
        audioBase64: audioBase64 || null
      });

      const botText = res.data.reply;
      const botTimestamp = new Date().toISOString();
      setMessages(prev => [...prev, { sender: 'bot', text: botText, timestamp: botTimestamp }]);
      setShowCallOption(res.data.urgent);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Sorry, I couldn\'t respond. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    }

    setTyping(false);
    setInput('');
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      const file = await fetch(uri!);
      const blob = await file.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        await handleSend(base64Audio);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Failed to stop recording', err);
    } finally {
      setRecording(null);
    }
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    const dateLabel = formatDateLabel(msg.timestamp);
    if (!acc[dateLabel]) acc[dateLabel] = [];
    acc[dateLabel].push(msg);
    return acc;
  }, {} as Record<string, typeof messages>);

  return (
    <View style={{ flex: 1 }}>
      {!isChatVisible && (
        <TouchableOpacity style={styles.fab} onPress={() => setChatVisible(true)}>
          <Ionicons name="chatbubbles" size={24} color="white" />
        </TouchableOpacity>
      )}

      {isChatVisible && (
        <View style={styles.chatContainer}>
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>Language:</Text>
            <View style={styles.pickerContainer}>
  <Picker
    selectedValue={language}
    onValueChange={(val) => setLanguage(val)}
    style={styles.picker}
    itemStyle={styles.pickerItem}
    dropdownIconColor="#000"
    mode="dropdown"
  >
    <Picker.Item label="English" value="en" />
    <Picker.Item label="हिंदी (Hindi)" value="hi" />
    <Picker.Item label="తెలుగు (Telugu)" value="te" />
    <Picker.Item label="தமிழ் (Tamil)" value="ta" />
    <Picker.Item label="ಕನ್ನಡ (Kannada)" value="kn" />
  </Picker>
</View>



          </View>

          <ScrollView style={styles.chatBox}>
            {Object.entries(groupedMessages).map(([date, msgs], i) => (
              <View key={i}>
                <Text style={styles.dateLabel}>{date}</Text>
                {msgs.map((msg, idx) => (
                  <View key={idx} style={{ alignSelf: msg.sender === 'bot' ? 'flex-start' : 'flex-end', marginVertical: 4 }}>
                    <Text style={msg.sender === 'bot' ? styles.bot : styles.user}>{msg.text}</Text>
                    <Text style={styles.timestamp}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
            {isTyping && (
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 5 }}>
                <ActivityIndicator size="small" color="#888" />
                <Text style={{ marginLeft: 6, color: '#888' }}>MomWise is typing...</Text>
              </View>
            )}
          </ScrollView>

          {showCallOption && !doctorsVisible && (
            <TouchableOpacity style={styles.callButton} onPress={() => setDoctorsVisible(true)}>
              <Text style={styles.callButtonText}>⚠️ Call a Doctor</Text>
            </TouchableOpacity>
          )}

          {doctorsVisible && (
            <View style={styles.doctorList}>
              <Text style={styles.doctorHeading}>Available Doctors:</Text>
              <Text style={styles.doctorItem}>Dr. Asha Reddy - 📞 9876543210</Text>
              <Text style={styles.doctorItem}>Dr. Priya Menon - 📞 9876543211</Text>
              <Text style={styles.doctorItem}>Dr. Kavitha Rao - 📞 9876543212</Text>
            </View>
          )}

          {language === 'en' ? (
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TextInput
                value={input}
                onChangeText={setInput}
                style={styles.input}
                placeholder="Ask a question..."
              />
              <Button title="Send" onPress={() => handleSend()} />
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.callButton, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}
              onPress={recording ? stopRecording : startRecording}
            >
              <MaterialIcons name={recording ? 'stop' : 'mic'} size={24} color="white" />
              <Text style={[styles.callButtonText, { marginLeft: 8 }]}>
                {recording ? 'Stop Recording' : 'Speak Now'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={() => setChatVisible(false)}>
            <Ionicons name="close-circle" size={26} color="#999" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 32,
    elevation: 5
  },
  chatContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    height: '90%',
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { height: -2 },
    shadowRadius: 6
  },
  chatBox: {
    flex: 1,
    marginBottom: 10
  },
  bot: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 8
  },
  user: {
    backgroundColor: '#d1fae5',
    padding: 10,
    borderRadius: 8
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
    textAlign: 'right',
    marginRight: 4
  },
  dateLabel: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginVertical: 6
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10
  },
  closeBtn: {
    alignSelf: 'center',
    marginTop: 6
  },
  callButton: {
    backgroundColor: '#dc2626',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 6
  },
  callButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  doctorList: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 10,
    marginTop: 6
  },
  doctorHeading: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6
  },
  doctorItem: {
    paddingVertical: 4
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    width: '50%',           // or set fixed like 250 or 300
    maxWidth: 180,           // prevent overflow
    marginBottom: 4,
  },
  
  picker: {
    color: '#000',
    height: 60,
    width: '100%',
  },
  
  pickerItem: {
    fontSize: 12,
  }

});
