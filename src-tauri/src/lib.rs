use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: r#"
                CREATE TABLE mangas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    source TEXT NOT NULL,
                    metadata TEXT NOT NULL,
                    createdAt TEXT NOT NULL,
                    updatedAt TEXT NOT NULL
                );

                CREATE TABLE downloaded_chapters (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    mangaId INTEGER NOT NULL,
                    chapter INTEGER NOT NULL,
                    path TEXT NOT NULL,
                    lastDownloadedAt TEXT NOT NULL,
                    createdAt TEXT NOT NULL,
                    FOREIGN KEY(mangaId) REFERENCES mangas(id)
                );

                CREATE INDEX mangas_title_index ON mangas (title);
                CREATE INDEX mangas_source_index ON mangas (source);
                CREATE INDEX mangas_title_source_index ON mangas (title, source);

                CREATE INDEX downloaded_chapters_mangaId_index ON downloaded_chapters (mangaId);
                CREATE INDEX downloaded_chapters_mangaId_and_chapter_index ON downloaded_chapters (mangaId, chapter);
            "#,
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().add_migrations("sqlite:database.bin", migrations).build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
