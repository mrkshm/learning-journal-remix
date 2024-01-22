CREATE TABLE `entries` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text DEFAULT 'work',
	`title` text NOT NULL,
	`description` text,
	`date` text DEFAULT 'datetime("now")' NOT NULL
);
