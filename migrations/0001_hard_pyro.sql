CREATE TABLE "feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"source_app" text DEFAULT 'plan' NOT NULL,
	"environment" text DEFAULT 'development' NOT NULL,
	"type" text DEFAULT 'OTHER' NOT NULL,
	"message" text NOT NULL,
	"screen_path" text DEFAULT '/' NOT NULL,
	"screen_label" text DEFAULT 'Plan' NOT NULL,
	"url" text DEFAULT '' NOT NULL,
	"user_agent" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"admin_response" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;