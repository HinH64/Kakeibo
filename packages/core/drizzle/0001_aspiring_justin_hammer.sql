CREATE TABLE "financial_targets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"amount" integer NOT NULL,
	"currency_code" text NOT NULL,
	"target_month" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planned_events" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"amount" integer NOT NULL,
	"currency_code" text NOT NULL,
	"month" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "financial_targets" ADD CONSTRAINT "financial_targets_currency_code_currencies_code_fk" FOREIGN KEY ("currency_code") REFERENCES "public"."currencies"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planned_events" ADD CONSTRAINT "planned_events_currency_code_currencies_code_fk" FOREIGN KEY ("currency_code") REFERENCES "public"."currencies"("code") ON DELETE no action ON UPDATE no action;