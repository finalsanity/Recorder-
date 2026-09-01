CREATE TABLE `evidence` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(24) NOT NULL,
	`duration_seconds` int,
	`size_bytes` int,
	`folder_id` varchar(255),
	`onedrive_item_id` varchar(255),
	`onedrive_url` text,
	`upload_status` varchar(24) NOT NULL,
	`metadata_json` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evidence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `folders` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` varchar(160) NOT NULL,
	`parent_id` varchar(255),
	`onedrive_item_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `folders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`microsoft_id` varchar(255) NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_microsoft_id_unique` UNIQUE(`microsoft_id`)
);
--> statement-breakpoint
CREATE INDEX `evidence_user_created_idx` ON `evidence` (`user_id`,`created_at`);