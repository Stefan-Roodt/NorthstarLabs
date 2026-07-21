UPDATE `tutors`
SET `listing_tier`='listed', `listing_monthly_cents`=0
WHERE `listing_tier` IN ('listed','featured','spotlight');
--> statement-breakpoint
CREATE TRIGGER `tutors_free_listing_default`
AFTER INSERT ON `tutors`
WHEN NEW.`listing_tier`='listed' AND NEW.`listing_monthly_cents`=14900
BEGIN
  UPDATE `tutors` SET `listing_monthly_cents`=0 WHERE `id`=NEW.`id`;
END;
