CREATE TABLE `cards` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`meta` text NOT NULL,
	`card` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`days` text DEFAULT '{}' NOT NULL,
	`logs` text DEFAULT '[]' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invites` (
	`id` text PRIMARY KEY NOT NULL,
	`card_id` text NOT NULL,
	`hash` text NOT NULL,
	`mode` text NOT NULL,
	`email` text,
	`expires_at` integer NOT NULL,
	`revoked` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invites_hash_unique` ON `invites` (`hash`);--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`card_id` text NOT NULL,
	`actor` text NOT NULL,
	`key` text NOT NULL,
	`mime` text NOT NULL,
	`created_at` integer NOT NULL
);
