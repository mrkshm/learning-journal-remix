CREATE TABLE `entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text DEFAULT 'work',
	`title` text NOT NULL,
	`description` text,
	`date` text DEFAULT 'datetime("now")' NOT NULL
);
