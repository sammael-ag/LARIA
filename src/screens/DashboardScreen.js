import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Krypto-prepojenie na živé dáta
import { useAccount } from 'wagmi';

// Import z našej operačnej pamäte
import { G } from '../styles/styles'; 

const DashboardScreen = ({ navigation }) => {
  
  // Appka si vytiahne tvoju adresu z .env súboru (Majiteľ)
  const OWNER_ADDRESS = process.env.EXPO_PUBLIC_OWNER_ADDRESS;

  // ŽIVÉ DÁTA: Toto vytiahne adresu z pripojenej peňaženky (Reown/Wagmi)
  const { address } = useAccount();
  
  // Ak je peňaženka pripojená, použijeme ju, inak tam necháme "Anonym" pre dekoráciu
  const userAddress = address || "Not Connected";

  // Porovnanie - či si to ty, Sammael (dočasne natvrdo true)
  const isOwner = true; 

  const MenuCard = ({ title, icon, target, description, color = '#AAA' }) => (
    <TouchableOpacity 
      style={[G.card, { padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 15 }]} 
      onPress={() => navigation.navigate(target)}
      activeOpacity={0.7}
    >
      <View style={{
        width: 45, height: 45, backgroundColor: '#000', borderRadius: 8, 
        justifyContent: 'center', alignItems: 'center', marginRight: 15,
        borderWidth: 1, borderColor: '#222'
      }}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[G.mono, { fontSize: 14, fontWeight: 'bold', letterSpacing: 1, color }]}>{title}</Text>
        <Text style={[G.textDim, { marginTop: 2 }]}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={G.bgDashboard}>
      
      {/* DIZAJNÉRSKA LINKA - Horná adresa */}
      <View style={{ pointerEvents: 'none', alignItems: 'center', marginTop: 20, zIndex: 999 }}>
        <Text 
          numberOfLines={1} 
          ellipsizeMode="clip"
          style={{
            fontSize: 8,
            color: '#DDD', 
            letterSpacing: 2,
            width: '100%',
            textAlign: 'center',
            fontFamily: 'monospace'
          }}
        >
          {userAddress}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 25 }}>
        
        {/* HEADER ATELIÉRU */}
        <View style={{ marginTop: 20, marginBottom: 40 }}>
          <Text style={[G.textWhite, { fontSize: 24, fontWeight: 'bold', letterSpacing: 5 }]}>ATELIÉR LARIA</Text>
          <Text style={G.textCyber}>Sammael | Master Mode</Text>
        </View>

        <View>
          {/* ADMIN PANEL - Viditeľný vďaka isOwner = true */}
          {isOwner && (
            <MenuCard 
              title="ADMIN PANEL" 
              icon="⚙️" 
              target="Settings" 
              description="Vstup do centrálneho velína"
              color="#F1C40F" 
            />
          )}

          {/* ARIA ASISTENCIA */}
          <MenuCard 
            title="ARIA ASISTENCIA" 
            icon="🌸" 
            target="Settings" 
            description="Tvoja inkarnovaná sprievodkyňa"
            color="#F0F" 
          />

          {/* MOJA KARTA - Identita */}
          <MenuCard 
            title="MOJA KARTA" 
            icon="🆔" 
            target="Card" 
            description="Digitálna pečať identity"
            color="#FFF"
          />

          {/* SYSTÉMOVÉ NASTAVENIA - Cesta k tvojej novej kalkulačke */}
          <MenuCard 
            title="NASTAVENIA" 
            icon="🛠️" 
            target="Settings" 
            description="Konfigurácia jadra a assetov"
            color="#555"
          />

          <View style={{ marginTop: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#111', paddingBottom: 5 }}>
            <Text style={[G.textDim, { letterSpacing: 2, color: '#444' }]}>MÔJ VIZITKÁR</Text>
          </View>

          {/* LARIA WEB - Vstup do siete */}
          <MenuCard 
            title="LARIA WEB" 
            icon="🌐" 
            target="Web" 
            description="Prehliadka majstrov a artefaktov"
            color="#0FF" 
          />
          
          {/* KONTAKTY - Uložené spojenia */}
          <MenuCard 
            title="KONTAKTY" 
            icon="📇" 
            target="Contacts" 
            description="Uložené sieťové spojenia"
          />
        </View>

        {/* FOOTER - Systémový status */}
        <View style={{ marginTop: 50, alignItems: 'center', marginBottom: 20 }}>
          <Text style={[G.textDim, { fontSize: 10, color: '#222' }]}>Všetky systémy sú nominálne.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;