import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`projekte_hero_seiten\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`bild_id\` integer NOT NULL,
  	FOREIGN KEY (\`bild_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projekte\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projekte_hero_seiten_order_idx\` ON \`projekte_hero_seiten\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projekte_hero_seiten_parent_id_idx\` ON \`projekte_hero_seiten\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projekte_hero_seiten_bild_idx\` ON \`projekte_hero_seiten\` (\`bild_id\`);`)
  await db.run(sql`CREATE TABLE \`projekte_blocks_voll\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`bild_id\` integer NOT NULL,
  	\`bildunterschrift\` text,
  	\`hoch\` integer DEFAULT false,
  	\`block_name\` text,
  	FOREIGN KEY (\`bild_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projekte\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projekte_blocks_voll_order_idx\` ON \`projekte_blocks_voll\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projekte_blocks_voll_parent_id_idx\` ON \`projekte_blocks_voll\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projekte_blocks_voll_path_idx\` ON \`projekte_blocks_voll\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`projekte_blocks_voll_bild_idx\` ON \`projekte_blocks_voll\` (\`bild_id\`);`)
  await db.run(sql`CREATE TABLE \`projekte_blocks_breit\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`bild_id\` integer NOT NULL,
  	\`bildunterschrift\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`bild_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projekte\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projekte_blocks_breit_order_idx\` ON \`projekte_blocks_breit\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projekte_blocks_breit_parent_id_idx\` ON \`projekte_blocks_breit\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projekte_blocks_breit_path_idx\` ON \`projekte_blocks_breit\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`projekte_blocks_breit_bild_idx\` ON \`projekte_blocks_breit\` (\`bild_id\`);`)
  await db.run(sql`CREATE TABLE \`projekte_blocks_duo_bilder\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`bild_id\` integer NOT NULL,
  	FOREIGN KEY (\`bild_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projekte_blocks_duo\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projekte_blocks_duo_bilder_order_idx\` ON \`projekte_blocks_duo_bilder\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projekte_blocks_duo_bilder_parent_id_idx\` ON \`projekte_blocks_duo_bilder\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projekte_blocks_duo_bilder_bild_idx\` ON \`projekte_blocks_duo_bilder\` (\`bild_id\`);`)
  await db.run(sql`CREATE TABLE \`projekte_blocks_duo\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`bildunterschrift\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projekte\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projekte_blocks_duo_order_idx\` ON \`projekte_blocks_duo\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projekte_blocks_duo_parent_id_idx\` ON \`projekte_blocks_duo\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projekte_blocks_duo_path_idx\` ON \`projekte_blocks_duo\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projekte_blocks_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`ueberschrift\` text,
  	\`text\` text NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projekte\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projekte_blocks_text_order_idx\` ON \`projekte_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projekte_blocks_text_parent_id_idx\` ON \`projekte_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projekte_blocks_text_path_idx\` ON \`projekte_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projekte_blocks_zitat\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`zitat\` text NOT NULL,
  	\`quelle\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projekte\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projekte_blocks_zitat_order_idx\` ON \`projekte_blocks_zitat\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projekte_blocks_zitat_parent_id_idx\` ON \`projekte_blocks_zitat\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projekte_blocks_zitat_path_idx\` ON \`projekte_blocks_zitat\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projekte\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`titel\` text NOT NULL,
  	\`titel_klick_farbe\` text,
  	\`kunde\` text,
  	\`kurzbeschreibung\` text NOT NULL,
  	\`cover_id\` integer,
  	\`cover_fokus\` text,
  	\`einleitung\` text,
  	\`aufgabe\` text,
  	\`palette_verbergen\` integer DEFAULT false,
  	\`slug\` text,
  	\`jahr\` text NOT NULL,
  	\`reihenfolge\` numeric DEFAULT 99,
  	\`status\` text DEFAULT 'live' NOT NULL,
  	\`ausgezeichnet\` integer DEFAULT false,
  	\`aktion_label\` text,
  	\`aktion_href\` text,
  	\`welt_papier\` text NOT NULL,
  	\`welt_tinte\` text NOT NULL,
  	\`welt_akzent\` text NOT NULL,
  	\`welt_sekundaer\` text,
  	\`welt_linie\` text,
  	\`welt_stimmung\` text DEFAULT 'hell' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`projekte_cover_idx\` ON \`projekte\` (\`cover_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`projekte_slug_idx\` ON \`projekte\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`projekte_updated_at_idx\` ON \`projekte\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`projekte_created_at_idx\` ON \`projekte\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`projekte_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projekte\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projekte_texts_order_parent\` ON \`projekte_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumbnail_url\` text,
  	\`sizes_thumbnail_width\` numeric,
  	\`sizes_thumbnail_height\` numeric,
  	\`sizes_thumbnail_mime_type\` text,
  	\`sizes_thumbnail_filesize\` numeric,
  	\`sizes_thumbnail_filename\` text,
  	\`sizes_card_url\` text,
  	\`sizes_card_width\` numeric,
  	\`sizes_card_height\` numeric,
  	\`sizes_card_mime_type\` text,
  	\`sizes_card_filesize\` numeric,
  	\`sizes_card_filename\` text,
  	\`sizes_breit_url\` text,
  	\`sizes_breit_width\` numeric,
  	\`sizes_breit_height\` numeric,
  	\`sizes_breit_mime_type\` text,
  	\`sizes_breit_filesize\` numeric,
  	\`sizes_breit_filename\` text,
  	\`sizes_gross_url\` text,
  	\`sizes_gross_width\` numeric,
  	\`sizes_gross_height\` numeric,
  	\`sizes_gross_mime_type\` text,
  	\`sizes_gross_filesize\` numeric,
  	\`sizes_gross_filename\` text,
  	\`sizes_hero_url\` text,
  	\`sizes_hero_width\` numeric,
  	\`sizes_hero_height\` numeric,
  	\`sizes_hero_mime_type\` text,
  	\`sizes_hero_filesize\` numeric,
  	\`sizes_hero_filename\` text,
  	\`sizes_hero2x_url\` text,
  	\`sizes_hero2x_width\` numeric,
  	\`sizes_hero2x_height\` numeric,
  	\`sizes_hero2x_mime_type\` text,
  	\`sizes_hero2x_filesize\` numeric,
  	\`sizes_hero2x_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_card_sizes_card_filename_idx\` ON \`media\` (\`sizes_card_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_breit_sizes_breit_filename_idx\` ON \`media\` (\`sizes_breit_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_gross_sizes_gross_filename_idx\` ON \`media\` (\`sizes_gross_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_hero_sizes_hero_filename_idx\` ON \`media\` (\`sizes_hero_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_hero2x_sizes_hero2x_filename_idx\` ON \`media\` (\`sizes_hero2x_filename\`);`)
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`projekte_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projekte_id\`) REFERENCES \`projekte\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_projekte_id_idx\` ON \`payload_locked_documents_rels\` (\`projekte_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`projekte_hero_seiten\`;`)
  await db.run(sql`DROP TABLE \`projekte_blocks_voll\`;`)
  await db.run(sql`DROP TABLE \`projekte_blocks_breit\`;`)
  await db.run(sql`DROP TABLE \`projekte_blocks_duo_bilder\`;`)
  await db.run(sql`DROP TABLE \`projekte_blocks_duo\`;`)
  await db.run(sql`DROP TABLE \`projekte_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`projekte_blocks_zitat\`;`)
  await db.run(sql`DROP TABLE \`projekte\`;`)
  await db.run(sql`DROP TABLE \`projekte_texts\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
}
