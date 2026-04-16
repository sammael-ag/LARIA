import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const IrcScreen = () => {
  const [messages, setMessages] = useState([
    { id: 1, user: 'SYS', text: 'Šifrované spojenie nadviazané...' },
    { id: 2, user: 'Aria', text: 'Som v systéme, Sammael.' },
  ]);

  return (
    <View style={UI.container}>
      {/* Záhlavie kanála */}
      <View style={UI.header}>
        <Text style={UI.headerTitle}>#LARIA_MAIN_CHANNEL</Text>
        <Text style={UI.headerSub}>Status: Encrypted | Users: 2</Text>
      </View>

      {/* Okno so správami */}
      <ScrollView style={UI.chatBox}>
        {messages.map((m) => (
          <View key={m.id} style={UI.messageRow}>
            <Text style={UI.userPrefix}>[{m.user}]:</Text>
            <Text style={UI.messageText}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Vstupný riadok - Príkazový riadok */}
      <View style={UI.inputArea}>
        <Text style={UI.prompt}>{'>'}</Text>
        <TextInput 
          style={UI.input}
          placeholder="Zadaj príkaz alebo správu..."
          placeholderTextColor="#333"
        />
        <TouchableOpacity style={UI.sendBtn}>
          <Text style={UI.sendText}>ODOSLAŤ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const UI = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 40,
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    backgroundColor: '#050505',
  },
  headerTitle: {
    color: '#0F0', // Klasická terminálová zelená
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  headerSub: {
    color: '#444',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  chatBox: {
    flex: 1,
    padding: 15,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  userPrefix: {
    color: '#FFF',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginRight: 10,
  },
  messageText: {
    color: '#AAA',
    fontFamily: 'monospace',
    flex: 1,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#080808',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  prompt: {
    color: '#0F0',
    marginRight: 10,
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    color: '#0F0',
    fontFamily: 'monospace',
    height: 40,
  },
  sendBtn: {
    marginLeft: 10,
    padding: 8,
  },
  sendText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  }
});

export default IrcScreen;