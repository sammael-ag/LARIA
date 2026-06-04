// 1. VNÚTORNÝ ATRIBÚT MUSÍ BYŤ ABSOLÚTNE PRVÝM RIADKOM V SÚBORE!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
#[allow(dead_code)] // Týmto umlčíme poriadkumilovný Rust, že buffer_name použijeme neskôr
struct SignalPayload {
    sender_fing: String,
    target_fing: String,
    msg_text: String,
    buffer_name: Option<String>,
}

#[derive(Serialize)]
struct CommandResponse {
    success: bool,
    message: String,
}

// 🌲 1. INICIALIZÁCIA JADRA
#[tauri::command]
fn inicializuj_crystal_core() -> String {
    println!("🌲 [Rust Core]: CrystalCore sa úspešne prebudelo v Lubuntu! Ruky od kódu!");
    "🚀 CrystalCore Natívny Most: AKTÍVNY // BYTES_ALIGNED".to_string()
}

// 🕵️‍♂️ 2. ŠPIÓN V ÉTERI (Pre StatusService.js)
#[tauri::command]
fn ping_crystal_core() -> String {
    println!("🕵️‍♂️ [Rust Core]: StatusService cinkol na jadro. Odpovedám PONG.");
    "pong".to_string()
}

// 📡 3. NATÍVNY IRC MOST (Pre budúci Hyperspeed a šifrovanie v kove)
#[tauri::command]
fn spracuj_native_signal(payload: SignalPayload) -> CommandResponse {
    let clean_sender = payload.sender_fing.replace("0x", "");
    let clean_target = payload.target_fing.replace("0x", "");
    
    println!(
        "📡 [Rust Core - IRC Most]: Zachytený signál! Od: {} -> Pre: {}. Text: {}", 
        clean_sender, clean_target, payload.msg_text
    );

    CommandResponse {
        success: true,
        message: "Signál bezpečne prešiel cez duralový Rust mostík.".to_string(),
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            inicializuj_crystal_core,
            ping_crystal_core,
            spracuj_native_signal
        ])
        .run(tauri::generate_context!())
        .expect("Chyba pri spúšťaní Tauri aplikácie");
}